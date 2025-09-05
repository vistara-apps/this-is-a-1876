import React, { useState } from 'react'
import { Mic, MicOff, Square, Play, Pause, Share2, Download, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Alert from '../components/ui/Alert'
import { useRecording } from '../hooks/useRecording'
import { useApp } from '../context/AppContext'

export default function Recorder() {
  const { recordings } = useApp()
  const { isRecording, recordingTime, error, startRecording, stopRecording } = useRecording()
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedRecording, setSelectedRecording] = useState(null)

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleShare = (recording) => {
    setSelectedRecording(recording)
    setShowShareModal(true)
  }

  const handleDownload = (recording) => {
    if (recording.audioFilePath) {
      const link = document.createElement('a')
      link.href = recording.audioFilePath
      link.download = `recording-${new Date(recording.timestamp).toISOString()}.webm`
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Recording Interface */}
      <div className="relative">
        {/* Status Bar */}
        <div className="bg-surface border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isRecording && (
                <div className="w-2 h-2 bg-destructive rounded-full recording-indicator"></div>
              )}
              <span className="text-body font-medium text-textPrimary">
                {isRecording ? 'Recording...' : 'Ready to Record'}
              </span>
            </div>
            <div className="text-heading font-mono text-textPrimary">
              {recordingTime}
            </div>
          </div>
        </div>

        {/* Main Recording Area */}
        <div className="px-4 py-8 text-center space-y-6">
          {error && (
            <Alert variant="danger" title="Recording Error">
              {error}
            </Alert>
          )}

          {/* Record Button */}
          <div className="flex justify-center">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              className="h-24 w-24 rounded-full shadow-lg"
              onClick={handleRecordToggle}
            >
              {isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <h2 className="text-heading text-textPrimary">
              {isRecording ? 'Recording in Progress' : 'Tap to Start Recording'}
            </h2>
            <p className="text-body text-textSecondary max-w-md mx-auto">
              {isRecording 
                ? 'Documenting your interaction. Keep your phone safe and accessible.'
                : 'One-tap recording for police interactions. Audio will be saved automatically.'
              }
            </p>
          </div>

          {isRecording && (
            <Alert variant="warning" title="Recording Active">
              <ul className="text-sm space-y-1 mt-2">
                <li>• Keep your device secure</li>
                <li>• Announce you are recording if safe to do so</li>
                <li>• Do not obstruct the officers</li>
                <li>• Recording will save automatically when stopped</li>
              </ul>
            </Alert>
          )}
        </div>
      </div>

      {/* Recording History */}
      {recordings.length > 0 && (
        <div className="px-4 pb-4 space-y-4">
          <h3 className="text-heading text-textPrimary">Recent Recordings</h3>
          <div className="space-y-3">
            {recordings.slice(0, 5).map((recording) => (
              <Card key={recording.recordId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-textPrimary">
                        {new Date(recording.timestamp).toLocaleString()}
                      </p>
                      <p className="text-caption">
                        Duration: {recording.duration} • Audio only
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare(recording)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(recording)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Recording"
      >
        <div className="space-y-4">
          <p className="text-body text-textSecondary">
            Share this recording with trusted contacts or legal representatives.
          </p>
          
          <div className="space-y-2">
            <Button variant="default" className="w-full">
              Email Recording
            </Button>
            <Button variant="secondary" className="w-full">
              Copy Link
            </Button>
            <Button variant="ghost" className="w-full">
              Save to Cloud
            </Button>
          </div>

          <Alert variant="info">
            <p className="text-sm">
              Recordings are stored locally on your device. Consider backing up important recordings to secure cloud storage.
            </p>
          </Alert>
        </div>
      </Modal>
    </div>
  )
}