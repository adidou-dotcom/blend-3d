/**
 * Pricing configuration - Single source of truth for Menublend pricing
 */

export const PRICING = {
  SINGLE: {
    id: 'pri_01jd8xample1', // TODO: Replace with actual Paddle price ID
    paddlePriceId: 'pri_01jd8xample1', // TODO: Replace with actual Paddle price ID
    dishes: 1,
    price: 99,
    currency: 'USD',
    display: '$99',
    description: 'Single 3D/AR demo dish',
    perDish: 99,
  },
  PACKS: [
    {
      id: 'pri_01jd8xample5', // TODO: Replace with actual Paddle price ID
      paddlePriceId: 'pri_01jd8xample5', // TODO: Replace with actual Paddle price ID
      dishes: 5,
      price: 449,
      currency: 'USD',
      display: '$449',
      perDish: 89.80,
      savings: '10% off',
    },
    {
      id: 'pri_01jd8xample10', // TODO: Replace with actual Paddle price ID
      paddlePriceId: 'pri_01jd8xample10', // TODO: Replace with actual Paddle price ID
      dishes: 10,
      price: 799,
      currency: 'USD',
      display: '$799',
      perDish: 79.90,
      savings: '19% off',
    },
    {
      id: 'pri_01jd8xample15', // TODO: Replace with actual Paddle price ID
      paddlePriceId: 'pri_01jd8xample15', // TODO: Replace with actual Paddle price ID
      dishes: 15,
      price: 1125,
      currency: 'USD',
      display: '$1,125',
      perDish: 75.00,
      savings: '24% off',
    },
    {
      id: 'pri_01jd8xample20', // TODO: Replace with actual Paddle price ID
      paddlePriceId: 'pri_01jd8xample20', // TODO: Replace with actual Paddle price ID
      dishes: 20,
      price: 1399,
      currency: 'USD',
      display: '$1,399',
      perDish: 69.95,
      savings: '29% off',
    },
    {
      id: 'pri_01jd8xample30', // TODO: Replace with actual Paddle price ID
      paddlePriceId: 'pri_01jd8xample30', // TODO: Replace with actual Paddle price ID
      dishes: 30,
      price: 1899,
      currency: 'USD',
      display: '$1,899',
      perDish: 63.30,
      savings: '36% off',
    },
  ],
  HOSTING: {
    BASIC: {
      id: 'pri_01jd8xamplebasic', // TODO: Replace with actual Paddle price ID
      paddlePriceId: 'pri_01jd8xamplebasic', // TODO: Replace with actual Paddle price ID
      name: 'Basic Hosting',
      monthly: 29,
      currency: 'USD',
      display: '$29/mo',
      dishLimit: 10,
      trialDays: 30,
      features: [
        'Up to 10 active hosted dishes',
        'Unlimited public views',
        'Basic analytics',
        'Email support',
        '30-day free trial',
      ],
    },
    PRO: {
      id: 'pri_01jd8xamplepro', // TODO: Replace with actual Paddle price ID
      paddlePriceId: 'pri_01jd8xamplepro', // TODO: Replace with actual Paddle price ID
      name: 'Pro Hosting',
      monthly: 59,
      currency: 'USD',
      display: '$59/mo',
      dishLimit: 30,
      trialDays: 30,
      features: [
        'Up to 30 active hosted dishes',
        'Unlimited public views',
        'Advanced analytics',
        'Priority email support',
        'Custom branding options',
        '30-day free trial',
      ],
    },
  },
} as const;

export const MIN_PHOTOS = 8;
export const MAX_PHOTOS = 20;

export const PHOTO_UPLOAD_TIPS = [
  'Take photos from multiple angles (top-down, side, 45° angles)',
  'Ensure good, even lighting without harsh shadows',
  'Use a neutral background when possible',
  'Capture close-ups of textures and garnishes',
  'Include the full dish in frame without cropping',
];
