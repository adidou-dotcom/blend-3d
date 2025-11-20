/**
 * Paddle checkout integration service
 * Handles one-time purchases and subscription checkouts via Paddle.js
 */

interface PaddleCheckoutOptions {
  priceId: string;
  customerEmail?: string;
  successUrl?: string;
  quantity?: number;
  customData?: Record<string, any>;
}

declare global {
  interface Window {
    Paddle?: any;
  }
}

/**
 * Initialize Paddle.js
 * Call this once when the app loads, or before first checkout
 */
export const initializePaddle = (environment: 'sandbox' | 'production' = 'sandbox') => {
  return new Promise<void>((resolve, reject) => {
    if (window.Paddle) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    
    script.onload = () => {
      if (window.Paddle) {
        // Initialize with your Paddle client token
        // Replace with your actual client token from Paddle dashboard
        const clientToken = environment === 'sandbox' 
          ? 'test_...' // Your sandbox client token
          : 'live_...'; // Your production client token
        
        window.Paddle.Environment.set(environment);
        window.Paddle.Initialize({
          token: clientToken,
        });
        resolve();
      } else {
        reject(new Error('Paddle failed to load'));
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load Paddle script'));
    document.head.appendChild(script);
  });
};

/**
 * Open Paddle checkout for one-time purchase (single dish or pack)
 */
export const openCheckout = async (options: PaddleCheckoutOptions): Promise<void> => {
  try {
    await initializePaddle('sandbox'); // Change to 'production' when live
    
    if (!window.Paddle) {
      throw new Error('Paddle not initialized');
    }

    const checkoutOptions: any = {
      items: [
        {
          priceId: options.priceId,
          quantity: options.quantity || 1,
        },
      ],
    };

    if (options.customerEmail) {
      checkoutOptions.customer = {
        email: options.customerEmail,
      };
    }

    if (options.successUrl) {
      checkoutOptions.successUrl = options.successUrl;
    }

    if (options.customData) {
      checkoutOptions.customData = options.customData;
    }

    window.Paddle.Checkout.open(checkoutOptions);
  } catch (error) {
    console.error('Paddle checkout error:', error);
    throw error;
  }
};

/**
 * Open Paddle checkout for subscription (hosting plan)
 */
export const openSubscriptionCheckout = async (
  options: PaddleCheckoutOptions
): Promise<void> => {
  try {
    await initializePaddle('sandbox'); // Change to 'production' when live
    
    if (!window.Paddle) {
      throw new Error('Paddle not initialized');
    }

    const checkoutOptions: any = {
      items: [
        {
          priceId: options.priceId,
          quantity: 1,
        },
      ],
    };

    if (options.customerEmail) {
      checkoutOptions.customer = {
        email: options.customerEmail,
      };
    }

    if (options.successUrl) {
      checkoutOptions.successUrl = options.successUrl;
    }

    if (options.customData) {
      checkoutOptions.customData = options.customData;
    }

    window.Paddle.Checkout.open(checkoutOptions);
  } catch (error) {
    console.error('Paddle subscription checkout error:', error);
    throw error;
  }
};

/**
 * Get Paddle customer portal URL for managing subscriptions
 */
export const getCustomerPortalUrl = (): string => {
  // This would typically be generated server-side with proper authentication
  // For now, return a placeholder
  return 'https://vendors.paddle.com/subscriptions/customers/manage';
};