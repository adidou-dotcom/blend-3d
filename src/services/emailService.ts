import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_NOTIFICATION_EMAIL || "admin@menublend.com";
const SITE_URL = window.location.origin;

interface SendEmailParams {
  type: "NEW_ORDER" | "ORDER_READY" | "ORDER_DELIVERED";
  to: string;
  data: {
    restaurantName?: string;
    dishName?: string;
    internalReference?: string;
    dishOrderId?: string;
    city?: string;
    country?: string;
  };
}

export const sendNotificationEmail = async (params: SendEmailParams) => {
  try {
    const { type, to, data } = params;
    
    // Construct URLs
    const dashboardUrl = data.dishOrderId 
      ? `${SITE_URL}/admin/dishes/${data.dishOrderId}`
      : `${SITE_URL}/admin`;
    
    const demoUrl = data.dishOrderId
      ? `${SITE_URL}/demo/dish/${data.dishOrderId}`
      : "";

    const { data: result, error } = await supabase.functions.invoke(
      "send-notification-email",
      {
        body: {
          type,
          to,
          data: {
            ...data,
            dashboardUrl,
            demoUrl,
          },
        },
      }
    );

    if (error) {
      console.error("Error sending email:", error);
      // Don't throw - emails should fail gracefully
      return { success: false, error };
    }

    console.log("Email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Exception sending email:", error);
    // Don't throw - emails should fail gracefully
    return { success: false, error };
  }
};

export const notifyAdminNewOrder = async (orderData: {
  restaurantName: string;
  dishName: string;
  internalReference: string;
  dishOrderId: string;
  city?: string;
  country?: string;
}) => {
  return sendNotificationEmail({
    type: "NEW_ORDER",
    to: ADMIN_EMAIL,
    data: orderData,
  });
};

export const notifyRestaurantOrderReady = async (
  email: string,
  orderData: {
    dishName: string;
    dishOrderId: string;
  }
) => {
  return sendNotificationEmail({
    type: "ORDER_READY",
    to: email,
    data: orderData,
  });
};

export const notifyRestaurantOrderDelivered = async (
  email: string,
  orderData: {
    dishName: string;
    dishOrderId: string;
  }
) => {
  return sendNotificationEmail({
    type: "ORDER_DELIVERED",
    to: email,
    data: orderData,
  });
};
