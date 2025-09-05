import React, { useState } from 'react'
import { MessageSquare, Loader2, Copy, Download, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { useAI } from '../hooks/useAI'
import { useApp } from '../context/AppContext'

const scenarios = [
  {
    id: 'traffic-stop',
    title: 'Traffic Stop',
    description: 'Pulled over by police',
    icon: '🚗'
  },
  {
    id: 'questioning',
    title: 'Police Questioning',
    description: 'Being questioned by officers',
    icon: '❓'
  },
  {
    id: 'search-request',
    title: 'Search Request',
    description: 'Police want to search you/property',
    icon: '🔍'
  },
  {
    id: 'arrest',
    title: 'Arrest Situation',
    description: 'Being arrested or detained',
    icon: '🚨'
  }
]

export default function AIAssistant() {
  const { user, generatedScripts } = useApp()
  const { generateScript, isGenerating, error } = useAI()
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [activeScript, setActiveScript] = useState(null)

  const handleGenerateScript = async (scenario) => {
    try {
      setSelectedScenario(scenario)
      const script = await generateScript(scenario.id, user.preferredLanguage)
      setActiveScript(script)
    } catch (err) {
      console.error('Failed to generate script:', err)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      alert('Script copied to clipboard!')
    })
  }

  const downloadScript = (script) => {
    const blob = new Blob([script.scriptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `legal-script-${script.scenario}-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-display text-textPrimary">AI Assistant</h1>
        <p className="text-body text-textSecondary">
          Get personalized scripts and guidance for police interactions
        </p>
      </div>

      {/* Language Indicator */}
      <div className="flex items-center justify-center space-x-2 text-caption">
        <Globe className="h-4 w-4" />
        <span>Generating in {user.preferredLanguage === 'es' ? 'Spanish' : 'English'}</span>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" title="Generation Error">
          {error}
        </Alert>
      )}

      {/* Premium Notice */}
      {user.subscriptionStatus === 'free' && (
        <Alert variant="info" title="Premium Feature">
          <p>AI script generation is available with premium subscription. You can generate 3 free scripts per month.</p>
        </Alert>
      )}

      {/* Scenario Selection */}
      <div className="space-y-4">
        <h2 className="text-heading text-textPrimary">Choose Your Situation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((scenario) => (
            <Card 
              key={scenario.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleGenerateScript(scenario)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{scenario.icon}</div>
                  <div>
                    <CardTitle className="text-base">{scenario.title}</CardTitle>
                    <p className="text-caption">{scenario.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-heading text-textPrimary mb-2">Generating Script...</h3>
            <p className="text-body text-textSecondary">
              Creating personalized guidance for your situation
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generated Script */}
      {activeScript && !isGenerating && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                {scenarios.find(s => s.id === activeScript.scenario)?.title} Script
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(activeScript.scriptContent)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadScript(activeScript)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-body text-textPrimary bg-gray-50 p-4 rounded-lg">
                {activeScript.scriptContent}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Scripts */}
      {generatedScripts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-heading text-textPrimary">Recent Scripts</h2>
          <div className="space-y-3">
            {generatedScripts.slice(0, 3).map((script) => (
              <Card 
                key={script.scriptId}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveScript(script)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-textPrimary">
                        {scenarios.find(s => s.id === script.scenario)?.title || 'Unknown Scenario'}
                      </p>
                      <p className="text-caption">
                        {new Date(script.timestamp).toLocaleDateString()} • {script.language === 'es' ? 'Spanish' : 'English'}
                      </p>
                    </div>
                    <MessageSquare className="h-5 w-5 text-textSecondary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <Alert variant="warning" title="Important Disclaimer">
        <p className="text-sm">
          These scripts provide general guidance and should not replace professional legal advice. 
          Every situation is unique. When in doubt, exercise your right to remain silent and request an attorney.
        </p>
      </Alert>
    </div>
  )
}