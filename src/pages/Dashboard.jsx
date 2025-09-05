import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, FileText, Mic, MessageSquare, AlertTriangle, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { useApp } from '../context/AppContext'

export default function Dashboard() {
  const { user, recordings } = useApp()

  const quickActions = [
    {
      title: 'Know Your Rights',
      description: 'Quick access to essential rights information',
      icon: Shield,
      path: '/rights',
      color: 'text-primary'
    },
    {
      title: 'Start Recording',
      description: 'One-tap incident documentation',
      icon: Mic,
      path: '/record',
      color: 'text-destructive'
    },
    {
      title: 'AI Assistant',
      description: 'Get personalized scripts and guidance',
      icon: MessageSquare,
      path: '/ai',
      color: 'text-accent'
    },
    {
      title: 'State Laws',
      description: 'Local legal information for your area',
      icon: FileText,
      path: '/laws',
      color: 'text-success'
    }
  ]

  const stats = [
    { label: 'Recordings', value: recordings.length, icon: Mic },
    { label: 'Rights Cards', value: '12', icon: Shield },
    { label: 'State Laws', value: '48', icon: FileText }
  ]

  return (
    <div className="space-y-6 py-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-display text-textPrimary">Welcome to Legal Shield</h1>
        <p className="text-body text-textSecondary max-w-md mx-auto">
          Know your rights, stay protected, and document interactions with confidence.
        </p>
      </div>

      {/* Subscription Alert */}
      {user.subscriptionStatus === 'free' && (
        <Alert variant="info" title="Free Tier Active">
          <div className="space-y-2">
            <p>You're using the free version with basic features.</p>
            <Button variant="accent" size="sm" asChild>
              <Link to="/profile">Upgrade to Premium</Link>
            </Button>
          </div>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="text-center">
            <CardContent className="p-4">
              <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-heading text-textPrimary">{value}</div>
              <div className="text-caption">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-heading text-textPrimary">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map(({ title, description, icon: Icon, path, color }) => (
            <Link key={title} to={path}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${color}`} />
                    <div>
                      <CardTitle className="text-base">{title}</CardTitle>
                      <CardDescription className="text-sm">{description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recordings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-heading text-textPrimary">Recent Recordings</h2>
          <div className="space-y-2">
            {recordings.slice(0, 3).map((recording) => (
              <Card key={recording.recordId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-textPrimary">
                        {new Date(recording.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-caption">Duration: {recording.duration}</p>
                    </div>
                    <Mic className="h-5 w-5 text-textSecondary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/profile">View All Recordings</Link>
          </Button>
        </div>
      )}

      {/* Emergency Notice */}
      <Alert variant="warning" title="Important Notice">
        <div className="space-y-2">
          <p>This app provides general legal information and should not replace professional legal advice.</p>
          <p className="text-sm">In emergencies, always call 911 or your local emergency number.</p>
        </div>
      </Alert>
    </div>
  )
}