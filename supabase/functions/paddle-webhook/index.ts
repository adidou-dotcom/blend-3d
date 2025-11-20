import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paddle-signature",
};

interface PaddleWebhookEvent {
  event_type: string;
  data: any;
}

const verifyPaddleSignature = async (paddleSignature: string | null, rawBody: string): Promise<boolean> => {
  if (!paddleSignature) {
    console.error("No Paddle signature provided");
    return false;
  }

  const webhookSecret = Deno.env.get("PADDLE_NOTIFICATION_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("PADDLE_NOTIFICATION_WEBHOOK_SECRET not configured");
    return false;
  }

  try {
    // Paddle signature format: ts=<timestamp>;h1=<signature>
    const parts = paddleSignature.split(";");
    const timestamp = parts.find((p: string) => p.startsWith("ts="))?.split("=")[1];
    const receivedSignature = parts.find((p: string) => p.startsWith("h1="))?.split("=")[1];

    if (!timestamp || !receivedSignature) {
      console.error("Invalid signature format");
      return false;
    }

    // Create the signed payload: timestamp + : + raw body
    const signedPayload = `${timestamp}:${rawBody}`;
    
    // Calculate HMAC using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const hmacSignature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );
    
    const expectedSignature = Array.from(new Uint8Array(hmacSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = expectedSignature === receivedSignature;
    if (!isValid) {
      console.error("Signature verification failed");
    }
    
    return isValid;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get raw body for signature verification
    const rawBody = await req.text();
    const payload: PaddleWebhookEvent = JSON.parse(rawBody);
    
    console.log("Paddle webhook received:", payload.event_type);

    // Verify Paddle signature
    const signature = req.headers.get("paddle-signature");
    const isValidSignature = await verifyPaddleSignature(signature, rawBody);
    if (!isValidSignature) {
      console.error("Invalid Paddle signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), { 
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    switch (payload.event_type) {
      case "transaction.completed":
      case "transaction.paid": {
        // Handle one-time purchase (dish or pack)
        const transaction = payload.data;
        const customData = transaction.custom_data || {};
        
        console.log("Transaction paid:", transaction.id);
        console.log("Custom data:", customData);

        // Prevent duplicate processing by checking if transaction already processed
        const { data: existingPayment, error: checkError } = await supabase
          .from("payment_records")
          .select("id")
          .eq("provider_payment_id", transaction.id)
          .eq("status", "PAID")
          .maybeSingle();

        if (checkError) {
          console.error("Error checking existing payment:", checkError);
        }

        if (existingPayment) {
          console.log("Transaction already processed, skipping duplicate:", transaction.id);
          break;
        }

        // Handle credits purchase
        if (customData.userId && customData.dishesCount) {
          const dishesCount = parseInt(customData.dishesCount);
          
          if (isNaN(dishesCount) || dishesCount <= 0) {
            console.error("Invalid dishesCount:", customData.dishesCount);
            break;
          }

          // Get current credits
          const { data: profileData, error: fetchError } = await supabase
            .from("restaurant_profiles")
            .select("pack_dishes_remaining, pack_dishes_total")
            .eq("user_id", customData.userId)
            .single();

          if (fetchError) {
            console.error("Error fetching profile:", fetchError);
            break;
          }

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
            console.log(`Added ${dishesCount} credits to user ${customData.userId}. New total: ${currentRemaining + dishesCount}`);
          }
        }

        // Update payment record if exists
        if (customData.dishOrderId) {
          const { error: paymentError } = await supabase
            .from("payment_records")
            .update({ 
              status: "PAID",
              provider_payment_id: transaction.id 
            })
            .eq("dish_order_id", customData.dishOrderId);

          if (paymentError) {
            console.error("Error updating payment:", paymentError);
          } else {
            console.log("Payment record updated for dish order:", customData.dishOrderId);
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