import { useState, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState(null)
  
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const chunksRef = useRef([])
  
  const { addRecording, user } = useApp()

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      // Request media permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false // Start with audio only for simplicity
      })
      
      streamRef.current = stream
      chunksRef.current = []
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      
      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        
        // Create recording object
        const recording = {
          recordId: `rec-${Date.now()}`,
          userId: user.userId,
          timestamp: new Date().toISOString(),
          duration: recordingTime,
          audioFilePath: url,
          videoFilePath: null,
          location: null, // Could add geolocation
          notes: '',
          sharedStatus: false
        }
        
        addRecording(recording)
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        
        setRecordingTime(0)
      }
      
      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Unable to access microphone. Please check permissions.')
    }
  }, [addRecording, user.userId, recordingTime])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Clear timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRecording])

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    isRecording,
    recordingTime: formatTime(recordingTime),
    error,
    startRecording,
    stopRecording
  }
}