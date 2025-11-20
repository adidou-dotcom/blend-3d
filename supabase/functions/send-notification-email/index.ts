import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  type: "NEW_ORDER" | "ORDER_READY" | "ORDER_DELIVERED";
  to: string;
  data: {
    restaurantName?: string;
    dishName?: string;
    internalReference?: string;
    dishOrderId?: string;
    city?: string;
    country?: string;
    demoUrl?: string;
    dashboardUrl?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: NotificationEmailRequest = await req.json();

    let subject = "";
    let html = "";

    switch (type) {
      case "NEW_ORDER":
        subject = `New Menublend demo dish order – ${data.restaurantName}`;
        html = `
          <h1>New Demo Dish Order</h1>
          <p>A new demo dish order has been submitted!</p>
          <h2>Order Details:</h2>
          <ul>
            <li><strong>Restaurant:</strong> ${data.restaurantName}</li>
            <li><strong>Location:</strong> ${data.city || "N/A"}, ${data.country || "N/A"}</li>
            <li><strong>Dish Name:</strong> ${data.dishName}</li>
            <li><strong>Reference:</strong> ${data.internalReference}</li>
          </ul>
          <p>
            <a href="${data.dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              View Order in Admin Dashboard
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            This is an automated notification from Menublend.
          </p>
        `;
        break;

      case "ORDER_READY":
        subject = "Your Menublend demo dish is ready for review";
        html = `
          <h1>Your Demo Dish is Ready!</h1>
          <p>Great news! Your demo dish <strong>${data.dishName}</strong> has been processed and is ready for review.</p>
          <p>
            <a href="${data.dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              View Your Dish
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            If you have any questions or feedback, please don't hesitate to contact us.
          </p>
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>The Menublend Team
          </p>
        `;
        break;

      case "ORDER_DELIVERED":
        subject = "Your Menublend 3D/AR demo is live!";
        html = `
          <h1>Your 3D/AR Demo is Live! 🎉</h1>
          <p>Your demo dish <strong>${data.dishName}</strong> is now live and ready to share!</p>
          <h2>Your Public Demo Page:</h2>
          <p>
            <a href="${data.demoUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              View Public Demo
            </a>
          </p>
          <p>You can share this link with anyone. Guests can view your dish in 3D/AR directly from their browser - no app download needed!</p>
          <h3>Next Steps:</h3>
          <ul>
            <li>Test the demo on your mobile device</li>
            <li>Share the link on your social media</li>
            <li>Add a QR code to your physical menu (available in your dashboard)</li>
            <li>Embed it on your website</li>
          </ul>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            Questions? We're here to help.<br>
            Best regards,<br>The Menublend Team
          </p>
        `;
        break;

      default:
        throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "Menublend <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
