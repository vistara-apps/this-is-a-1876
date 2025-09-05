// Application configuration
export const config = {
  // API Keys
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Legal Shield',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  },
  
  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    geolocation: import.meta.env.VITE_ENABLE_GEOLOCATION === 'true',
    videoRecording: import.meta.env.VITE_ENABLE_VIDEO_RECORDING === 'true',
  },
  
  // Subscription Plans
  plans: {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      features: {
        recordingTimeLimit: 300, // 5 minutes
        scriptsPerMonth: 3,
        rightsCards: true,
        stateLaws: true,
        audioRecording: true,
        videoRecording: false,
        cloudBackup: false,
        prioritySupport: false,
      }
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 4.99,
      priceId: 'price_premium_monthly', // Stripe price ID
      features: {
        recordingTimeLimit: -1, // Unlimited
        scriptsPerMonth: -1, // Unlimited
        rightsCards: true,
        stateLaws: true,
        audioRecording: true,
        videoRecording: true,
        cloudBackup: true,
        prioritySupport: true,
      }
    }
  },
  
  // API Endpoints
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  },
  
  // Storage Keys
  storage: {
    user: 'legal_shield_user',
    recordings: 'legal_shield_recordings',
    scripts: 'legal_shield_scripts',
    settings: 'legal_shield_settings',
  }
}

// Validation
export const validateConfig = () => {
  const errors = []
  
  if (config.app.environment === 'production') {
    if (!config.openai.apiKey) errors.push('OpenAI API key is required')
    if (!config.supabase.url) errors.push('Supabase URL is required')
    if (!config.supabase.anonKey) errors.push('Supabase anon key is required')
    if (!config.stripe.publishableKey) errors.push('Stripe publishable key is required')
  }
  
  return errors
}

export default config
