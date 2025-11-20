/**
 * Pricing configuration - Single source of truth for Menublend pricing
 */

export const PRICING = {
  DEMO_DISH: {
    PRICE: 99,
    CURRENCY: 'USD',
    DISPLAY: '$99',
    DESCRIPTION: 'Single 3D/AR demo dish',
    FEATURES: [
      'Photorealistic 3D model from your photos',
      'AR-ready viewer (web-based, no app needed)',
      'QR code for easy sharing',
      'Public shareable demo page',
      '5-7 business days turnaround',
      'Full ownership of 3D assets',
    ],
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
