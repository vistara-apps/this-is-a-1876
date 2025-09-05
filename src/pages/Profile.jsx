import React, { useState } from 'react'
import { User, Settings, CreditCard, Shield, FileText, Mic, Download, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Alert from '../components/ui/Alert'
import { useApp } from '../context/AppContext'

export default function Profile() {
  const { user, recordings, upgradeSubscription, setLanguage, setUserState } = useApp()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const handleUpgrade = () => {
    // In a real app, this would integrate with Stripe
    upgradeSubscription()
    setShowUpgradeModal(false)
  }

  const stats = [
    { label: 'Recordings', value: recordings.length, icon: Mic },
    { label: 'Scripts Generated', value: '5', icon: FileText },
    { label: 'Rights Cards Viewed', value: '12', icon: Shield },
    { label: 'Days Active', value: '30', icon: Star }
  ]

  const premiumFeatures = [
    'Unlimited recording time',
    'Advanced AI script generation',
    'Video recording capability',
    'Cloud backup and sync',
    'Priority customer support',
    'Offline access to all content'
  ]

  return (
    <div className="space-y-6 py-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle>Legal Shield User</CardTitle>
              <CardDescription>
                {user.email || 'Anonymous User'} • {user.state}
              </CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.subscriptionStatus === 'premium' 
                    ? 'bg-accent text-white' 
                    : 'bg-gray-100 text-textSecondary'
                }`}>
                  {user.subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
                </span>
                <span className="text-caption">
                  Language: {user.preferredLanguage === 'es' ? 'Español' : 'English'}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Subscription Status */}
      {user.subscriptionStatus === 'free' && (
        <Alert variant="info" title="Upgrade to Premium">
          <div className="space-y-3">
            <p>Unlock advanced features and unlimited access to all Legal Shield tools.</p>
            <Button 
              variant="accent" 
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade Now - $4.99/month
            </Button>
          </div>
        </Alert>
      )}

      {/* Usage Stats */}
      <div className="space-y-4">
        <h2 className="text-heading text-textPrimary">Your Activity</h2>
        <div className="grid grid-cols-2 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-heading text-textPrimary">{value}</div>
                <div className="text-caption">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Recordings */}
      {recordings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-heading text-textPrimary">Your Recordings</h2>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
          
          <div className="space-y-2">
            {recordings.slice(0, 5).map((recording) => (
              <Card key={recording.recordId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-textPrimary">
                        {new Date(recording.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-caption">
                        Duration: {recording.duration} • Audio Recording
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {recordings.length > 5 && (
            <p className="text-caption text-center">
              And {recordings.length - 5} more recordings...
            </p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-heading text-textPrimary">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          <Button variant="secondary" className="justify-start">
            <FileText className="h-5 w-5 mr-3" />
            Export All Data
          </Button>
          <Button variant="secondary" className="justify-start">
            <Shield className="h-5 w-5 mr-3" />
            Share App with Friends
          </Button>
          <Button variant="secondary" className="justify-start">
            <Settings className="h-5 w-5 mr-3" />
            Help & Support
          </Button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Premium"
      >
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-textPrimary">$4.99</div>
            <div className="text-caption">per month</div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-textPrimary">Premium Features:</h3>
            <ul className="space-y-2">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center text-body text-textSecondary">
                  <span className="w-2 h-2 bg-success rounded-full mr-3"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <Button variant="accent" className="w-full" onClick={handleUpgrade}>
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setShowUpgradeModal(false)}>
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-textSecondary text-center">
            Cancel anytime. No hidden fees. 7-day free trial.
          </p>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Settings"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-body font-medium text-textPrimary mb-2">
              Language
            </label>
            <div className="space-y-2">
              <Button
                variant={user.preferredLanguage === 'en' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
              <Button
                variant={user.preferredLanguage === 'es' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setLanguage('es')}
              >
                Español
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-body font-medium text-textPrimary mb-2">
              Your State
            </label>
            <select
              value={user.state}
              onChange={(e) => setUserState(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              <option value="IL">Illinois</option>
            </select>
          </div>

          <Button 
            variant="default" 
            className="w-full"
            onClick={() => setShowSettingsModal(false)}
          >
            Save Settings
          </Button>
        </div>
      </Modal>
    </div>
  )
}