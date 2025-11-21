/**
 * Pricing configuration - Single source of truth for Menublend pricing
 */

export const PRICING = {
  SINGLE: {
    id: "pro_01kakd9xj6x3jyktaxxpnwck0x", // TODO: Replace with actual Paddle price ID
    paddlePriceId: "pri_01kaken0hrbdcpeb2yjsw3r87k", // TODO: Replace with actual Paddle price ID
    dishes: 1,
    price: 99,
    currency: "USD",
    display: "$99",
    description: "Single 3D/AR demo dish",
    perDish: 99,
  },
  PACKS: [
    {
      id: "pro_01kakdbh6y645ds2zkk8857gt8", // TODO: Replace with actual Paddle price ID
      paddlePriceId: "pri_01kakf6bcsxe7rv52r2p6vvw72", // TODO: Replace with actual Paddle price ID
      dishes: 5,
      price: 449,
      currency: "USD",
      display: "$449",
      perDish: 89.8,
      savings: "10% off",
    },
    {
      id: "pro_01kakdcrp8gwzfredjc5bm5gp1", // TODO: Replace with actual Paddle price ID
      paddlePriceId: "pri_01kakf7t621375t2m9ha8hd7gs", // TODO: Replace with actual Paddle price ID
      dishes: 10,
      price: 799,
      currency: "USD",
      display: "$799",
      perDish: 79.9,
      savings: "19% off",
    },
    {
      id: "pro_01kakdddvmw4w01nbkd93dj7bp", // TODO: Replace with actual Paddle price ID
      paddlePriceId: "pri_01kakf92gext4m3j2pjn0fm9bb", // TODO: Replace with actual Paddle price ID
      dishes: 15,
      price: 1125,
      currency: "USD",
      display: "$1,125",
      perDish: 75.0,
      savings: "24% off",
    },
    {
      id: "pro_01kakde68c02d5ys7xyedvqqcg", // TODO: Replace with actual Paddle price ID
      paddlePriceId: "pri_01kakfaspjnjrk2a7c17cc2ksk", // TODO: Replace with actual Paddle price ID
      dishes: 20,
      price: 1399,
      currency: "USD",
      display: "$1,399",
      perDish: 69.95,
      savings: "29% off",
    },
    {
      id: "pro_01kakdexggwek09h0ez9sz3266", // TODO: Replace with actual Paddle price ID
      paddlePriceId: "pri_01kakfbsfpv2dmzstjw80v10zs", // TODO: Replace with actual Paddle price ID
      dishes: 30,
      price: 1899,
      currency: "USD",
      display: "$1,899",
      perDish: 63.3,
      savings: "36% off",
    },
  ],
  HOSTING: {
    BASIC: {
      id: "pro_01kakdrwzcmrbqgjyqtm7k0zeq", // TODO: Replace with actual Paddle price ID
      paddlePriceId: "pri_01kakmqzrejqrwbxrca3ccfdz5", // TODO: Replace with actual Paddle price ID
      name: "Basic Hosting",
      monthly: 29,
      currency: "USD",
      display: "$29/mo",
      dishLimit: 10,
      trialDays: 30,
      features: [
        "Up to 10 active hosted dishes",
        "Unlimited public views",
        "Basic analytics",
        "Email support",
        "30-day free trial",
      ],
    },
    PRO: {
      id: "pro_01kakdt12bvtypq8qpbez295kb", // TODO: Replace with actual Paddle price ID
      paddlePriceId: "pri_01kakmsehzfyd0sdnyzez35k5j", // TODO: Replace with actual Paddle price ID
      name: "Pro Hosting",
      monthly: 59,
      currency: "USD",
      display: "$59/mo",
      dishLimit: 30,
      trialDays: 30,
      features: [
        "Up to 30 active hosted dishes",
        "Unlimited public views",
        "Advanced analytics",
        "Priority email support",
        "Custom branding options",
        "30-day free trial",
      ],
    },
  },
} as const;

export const MIN_PHOTOS = 8;
export const MAX_PHOTOS = 20;

export const PHOTO_UPLOAD_TIPS = [
  "Take photos from multiple angles (top-down, side, 45° angles)",
  "Ensure good, even lighting without harsh shadows",
  "Use a neutral background when possible",
  "Capture close-ups of textures and garnishes",
  "Include the full dish in frame without cropping",
];
