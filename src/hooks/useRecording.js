import { useState, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { storageService } from '../services/storage'
import { geolocationService } from '../services/geolocation'
import config from '../config'
import { v4 as uuidv4 } from 'uuid'

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState(null)
  const [recordingMode, setRecordingMode] = useState('audio') // 'audio' or 'video'
  
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const chunksRef = useRef([])
  const startTimeRef = useRef(null)
  
  const { addRecording, user } = useApp()

  const startRecording = useCallback(async (mode = 'audio') => {
    try {
      setError(null)
      setRecordingMode(mode)
      
      // Check subscription limits for free users
      if (user.subscriptionStatus === 'free') {
        const usage = await storageService.getCurrentUsage()
        const limit = config.plans.free.features.recordingTimeLimit
        
        if (limit > 0 && usage.recordingTime >= limit) {
          throw new Error(`Free tier recording limit reached (${Math.floor(limit/60)} minutes per month). Upgrade to Premium for unlimited recording.`)
        }
      }

      // Check if video recording is allowed
      if (mode === 'video') {
        const canRecordVideo = user.subscriptionStatus === 'premium' || config.features.videoRecording
        if (!canRecordVideo) {
          throw new Error('Video recording requires Premium subscription.')
        }
      }
      
      // Request media permissions
      const constraints = {
        audio: true,
        video: mode === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera for documenting interactions
        } : false
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      streamRef.current = stream
      chunksRef.current = []
      startTimeRef.current = Date.now()
      
      // Determine MIME type based on mode and browser support
      let mimeType = mode === 'video' ? 'video/webm;codecs=vp9,opus' : 'audio/webm;codecs=opus'
      
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = mode === 'video' ? 'video/webm' : 'audio/webm'
      }
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      
      mediaRecorderRef.current = mediaRecorder
      
      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const actualDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        
        // Get location if available
        let location = null
        try {
          if (geolocationService.isAvailable()) {
            location = await geolocationService.getCurrentLocationWithAddress()
          }
        } catch (locationError) {
          console.warn('Could not get location:', locationError)
        }
        
        // Create recording object
        const recording = {
          recordId: uuidv4(),
          userId: user.userId,
          timestamp: new Date().toISOString(),
          duration: actualDuration,
          audioFilePath: mode === 'audio' ? url : null,
          videoFilePath: mode === 'video' ? url : null,
          location: location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.fullAddress
          } : null,
          notes: '',
          sharedStatus: false,
          recordingMode: mode,
          fileSize: blob.size,
          mimeType
        }
        
        // Save to local storage
        await storageService.saveRecording(recording)
        
        // Track usage
        await storageService.trackUsage('recording', { duration: actualDuration })
        
        // Add to app context
        addRecording(recording)
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        
        setRecordingTime(0)
        setRecordingMode('audio')
      }
      
      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      
      // Start timer
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setRecordingTime(elapsed)
        
        // Check free tier time limit during recording
        if (user.subscriptionStatus === 'free') {
          const limit = config.plans.free.features.recordingTimeLimit
          if (limit > 0 && elapsed >= limit) {
            stopRecording()
            setError(`Free tier recording limit reached (${Math.floor(limit/60)} minutes). Recording stopped automatically.`)
          }
        }
      }, 1000)
      
    } catch (err) {
      console.error('Error starting recording:', err)
      let errorMessage = 'Unable to start recording. Please check permissions.'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone access denied. Please allow permissions and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found. Please check your device.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Recording not supported on this device/browser.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    }
  }, [addRecording, user])

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

  // Check if video recording is available
  const canRecordVideo = useCallback(() => {
    return user.subscriptionStatus === 'premium' && config.features.videoRecording
  }, [user.subscriptionStatus])

  // Get remaining recording time for free users
  const getRemainingTime = useCallback(async () => {
    if (user.subscriptionStatus !== 'free') {
      return -1 // Unlimited
    }
    
    const usage = await storageService.getCurrentUsage()
    const limit = config.plans.free.features.recordingTimeLimit
    return Math.max(0, limit - usage.recordingTime)
  }, [user.subscriptionStatus])

  // Delete a recording
  const deleteRecording = useCallback(async (recordId) => {
    try {
      await storageService.deleteRecording(recordId)
      return true
    } catch (error) {
      console.error('Failed to delete recording:', error)
      throw error
    }
  }, [])

  // Update recording notes
  const updateRecordingNotes = useCallback(async (recordId, notes) => {
    try {
      await storageService.updateRecording(recordId, { notes })
      return true
    } catch (error) {
      console.error('Failed to update recording notes:', error)
      throw error
    }
  }, [])

  // Share recording (generate shareable summary)
  const generateShareableSummary = useCallback((recording) => {
    const summary = {
      timestamp: new Date(recording.timestamp).toLocaleString(),
      duration: formatTime(recording.duration),
      location: recording.location?.address || 'Location not available',
      type: recording.recordingMode === 'video' ? 'Video Recording' : 'Audio Recording',
      notes: recording.notes || 'No notes added',
      recordingId: recording.recordId
    }

    const summaryText = `Legal Shield Interaction Summary

Date/Time: ${summary.timestamp}
Duration: ${summary.duration}
Location: ${summary.location}
Type: ${summary.type}
Notes: ${summary.notes}

Recording ID: ${summary.recordingId}

This recording was created using Legal Shield app for documentation purposes.`

    return {
      summary,
      text: summaryText
    }
  }, [])

  return {
    isRecording,
    recordingTime: formatTime(recordingTime),
    recordingMode,
    error,
    startRecording,
    stopRecording,
    canRecordVideo,
    getRemainingTime,
    deleteRecording,
    updateRecordingNotes,
    generateShareableSummary
  }
}
