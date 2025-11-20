/**
 * Pricing configuration - Single source of truth for Menublend pricing
 */

export const PRICING = {
  SINGLE: {
    id: 'pri_01jd8xample1', // Replace with actual Paddle price ID
    dishes: 1,
    price: 99,
    currency: 'USD',
    display: '$99',
    description: 'Single 3D/AR dish',
    perDish: 99,
  },
  PACKS: [
    {
      id: 'pri_01jd8xample5', // Replace with actual Paddle price ID
      dishes: 5,
      price: 449,
      currency: 'USD',
      display: '$449',
      perDish: 89.80,
      savings: '10%',
    },
    {
      id: 'pri_01jd8xample10', // Replace with actual Paddle price ID
      dishes: 10,
      price: 849,
      currency: 'USD',
      display: '$849',
      perDish: 84.90,
      savings: '14%',
    },
    {
      id: 'pri_01jd8xample15', // Replace with actual Paddle price ID
      dishes: 15,
      price: 1199,
      currency: 'USD',
      display: '$1,199',
      perDish: 79.93,
      savings: '19%',
    },
    {
      id: 'pri_01jd8xample20', // Replace with actual Paddle price ID
      dishes: 20,
      price: 1499,
      currency: 'USD',
      display: '$1,499',
      perDish: 74.95,
      savings: '24%',
    },
    {
      id: 'pri_01jd8xample30', // Replace with actual Paddle price ID
      dishes: 30,
      price: 1999,
      currency: 'USD',
      display: '$1,999',
      perDish: 66.63,
      savings: '33%',
    },
  ],
  HOSTING: {
    BASIC: {
      id: 'pri_01jd8xamplebasic', // Replace with actual Paddle price ID
      name: 'Basic Hosting',
      monthly: 39,
      currency: 'USD',
      display: '$39/mo',
      dishLimit: 10,
      trialDays: 30,
      features: [
        'Up to 10 3D dishes hosted',
        'Unlimited public views',
        'Basic analytics',
        'Email support',
      ],
    },
    PRO: {
      id: 'pri_01jd8xamplepro', // Replace with actual Paddle price ID
      name: 'Pro Hosting',
      monthly: 69,
      currency: 'USD',
      display: '$69/mo',
      dishLimit: 30,
      trialDays: 30,
      features: [
        'Up to 30 3D dishes hosted',
        'Unlimited public views',
        'Advanced analytics',
        'Priority email support',
        'Custom branding options',
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
