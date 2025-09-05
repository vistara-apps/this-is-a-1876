import { loadStripe } from '@stripe/stripe-js'
import config from '../config'

// Initialize Stripe
let stripePromise = null

if (config.stripe.publishableKey) {
  stripePromise = loadStripe(config.stripe.publishableKey)
}

// Stripe service for Legal Shield
export class StripeService {
  constructor() {
    this.stripePromise = stripePromise
  }

  // Check if Stripe is configured
  isConfigured() {
    return this.stripePromise !== null
  }

  // Get Stripe instance
  async getStripe() {
    if (!this.stripePromise) {
      throw new Error('Stripe not configured')
    }
    return await this.stripePromise
  }

  // Create checkout session for subscription
  async createCheckoutSession(priceId, userId, successUrl, cancelUrl) {
    try {
      // In a real app, this would call your backend API
      // For now, we'll simulate the process
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl,
          cancelUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      const stripe = await this.getStripe()
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw error
      }

    } catch (error) {
      console.error('Stripe checkout error:', error)
      throw new Error('Failed to start checkout process')
    }
  }

  // Handle subscription upgrade (mock implementation)
  async upgradeSubscription(userId, planId) {
    try {
      // In a real app, this would integrate with your backend
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful upgrade
      return {
        success: true,
        subscriptionId: `sub_${Date.now()}`,
        planId,
        status: 'active'
      }

    } catch (error) {
      console.error('Subscription upgrade error:', error)
      throw new Error('Failed to upgrade subscription')
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      // In a real app, this would call your backend API
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      return await response.json()

    } catch (error) {
      console.error('Subscription cancellation error:', error)
      throw new Error('Failed to cancel subscription')
    }
  }

  // Get subscription status
  async getSubscriptionStatus(userId) {
    try {
      // In a real app, this would call your backend API
      const response = await fetch(`/api/subscription-status/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      return await response.json()

    } catch (error) {
      console.error('Subscription status error:', error)
      // Return default free status on error
      return {
        status: 'free',
        planId: 'free',
        currentPeriodEnd: null
      }
    }
  }

  // Create payment method setup intent
  async createSetupIntent(userId) {
    try {
      const response = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create setup intent')
      }

      return await response.json()

    } catch (error) {
      console.error('Setup intent error:', error)
      throw new Error('Failed to setup payment method')
    }
  }

  // Confirm payment method
  async confirmPaymentMethod(paymentMethodId, setupIntentClientSecret) {
    try {
      const stripe = await this.getStripe()
      
      const { error, setupIntent } = await stripe.confirmCardSetup(
        setupIntentClientSecret,
        {
          payment_method: paymentMethodId
        }
      )

      if (error) {
        throw error
      }

      return setupIntent

    } catch (error) {
      console.error('Payment method confirmation error:', error)
      throw new Error('Failed to confirm payment method')
    }
  }

  // Get pricing information
  getPricingInfo() {
    return {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: null,
        features: [
          '5-minute recording limit',
          '3 AI scripts per month',
          'Basic rights cards',
          'State law summaries'
        ]
      },
      premium: {
        id: 'premium',
        name: 'Premium',
        price: 4.99,
        interval: 'month',
        priceId: config.plans.premium.priceId,
        features: [
          'Unlimited recording time',
          'Unlimited AI scripts',
          'Video recording',
          'Cloud backup & sync',
          'Priority support',
          'Offline access'
        ]
      }
    }
  }

  // Format price for display
  formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }
}

// Create singleton instance
export const stripeService = new StripeService()

export default stripeService
