import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paddle-signature",
};

interface PaddleWebhookEvent {
  event_type: string;
  data: any;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse webhook payload
    const payload: PaddleWebhookEvent = await req.json();
    console.log("Paddle webhook received:", payload.event_type);

    // TODO: Verify Paddle signature in production
    // const signature = req.headers.get("paddle-signature");
    // if (!verifyPaddleSignature(signature, payload)) {
    //   return new Response("Invalid signature", { status: 401 });
    // }

    switch (payload.event_type) {
      case "transaction.completed":
      case "transaction.paid": {
        // Handle one-time purchase (dish or pack)
        const transaction = payload.data;
        const customData = transaction.custom_data || {};
        
        console.log("Transaction paid:", transaction.id);
        console.log("Custom data:", customData);

        // Handle credits purchase
        if (customData.userId && customData.dishesCount) {
          const dishesCount = parseInt(customData.dishesCount);
          
          // Get current credits
          const { data: profileData, error: fetchError } = await supabase
            .from("restaurant_profiles")
            .select("pack_dishes_remaining, pack_dishes_total")
            .eq("user_id", customData.userId)
            .single();

          if (fetchError) {
            console.error("Error fetching profile:", fetchError);
          } else {
            const currentRemaining = profileData?.pack_dishes_remaining || 0;
            const currentTotal = profileData?.pack_dishes_total || 0;

            // Increment credits
            const { error: updateError } = await supabase
              .from("restaurant_profiles")
              .update({
                pack_dishes_remaining: currentRemaining + dishesCount,
                pack_dishes_total: currentTotal + dishesCount,
                pack_purchased_at: new Date().toISOString(),
              })
              .eq("user_id", customData.userId);

            if (updateError) {
              console.error("Error updating credits:", updateError);
            } else {
              console.log(`Added ${dishesCount} credits to user ${customData.userId}`);
            }
          }
        }

        // Update payment record if exists
        if (customData.dishOrderId) {
          const { error: paymentError } = await supabase
            .from("payment_records")
            .update({ status: "PAID" })
            .eq("provider_payment_id", transaction.id);

          if (paymentError) {
            console.error("Error updating payment:", paymentError);
          }
        }

        break;
      }

      case "subscription.created":
      case "subscription.activated": {
        // Handle subscription activation (hosting trial start)
        const subscription = payload.data;
        const customData = subscription.custom_data || {};
        
        console.log("Subscription activated:", subscription.id);

        if (customData.userId) {
          const trialEndsAt = subscription.scheduled_change?.effective_at || 
                             new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          const { error } = await supabase
            .from("subscription_records")
            .upsert({
              user_id: customData.userId,
              paddle_subscription_id: subscription.id,
              plan: customData.plan || "BASIC",
              status: subscription.status === "trialing" ? "TRIALING" : "ACTIVE",
              current_period_end: subscription.current_billing_period?.ends_at,
              trial_ends_at: subscription.status === "trialing" ? trialEndsAt : null,
            }, {
              onConflict: "paddle_subscription_id",
            });

          if (error) {
            console.error("Error upserting subscription:", error);
          }
        }

        break;
      }

      case "subscription.updated": {
        // Handle subscription updates (plan change, renewal, etc.)
        const subscription = payload.data;
        
        console.log("Subscription updated:", subscription.id);

        const { error } = await supabase
          .from("subscription_records")
          .update({
            plan: subscription.items[0]?.price?.description?.includes("Pro") ? "PRO" : "BASIC",
            status: subscription.status === "trialing" ? "TRIALING" : 
                   subscription.status === "active" ? "ACTIVE" : 
                   subscription.status === "canceled" ? "CANCELED" : 
                   subscription.status === "paused" ? "PAUSED" : "ACTIVE",
            current_period_end: subscription.current_billing_period?.ends_at,
          })
          .eq("paddle_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription:", error);
        }

        break;
      }

      case "subscription.canceled":
      case "subscription.paused": {
        // Handle subscription cancellation or pause
        const subscription = payload.data;
        
        console.log("Subscription canceled/paused:", subscription.id);

        const { error } = await supabase
          .from("subscription_records")
          .update({
            status: payload.event_type === "subscription.canceled" ? "CANCELED" : "PAUSED",
          })
          .eq("paddle_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription status:", error);
        }

        break;
      }

      default:
        console.log("Unhandled event type:", payload.event_type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});