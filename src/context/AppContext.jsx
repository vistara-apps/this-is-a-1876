import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { storageService } from '../services/storage'
import { geolocationService } from '../services/geolocation'
import { v4 as uuidv4 } from 'uuid'

const AppContext = createContext()

const initialState = {
  user: {
    userId: uuidv4(),
    email: null,
    subscriptionStatus: 'free', // free, premium
    preferredLanguage: 'en',
    state: 'CA'
  },
  isRecording: false,
  recordings: [],
  generatedScripts: [],
  isLoading: false,
  error: null,
  isOnline: navigator.onLine,
  usage: {
    scriptsGenerated: 0,
    recordingTime: 0
  }
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    case 'SET_USER_STATE':
      return {
        ...state,
        user: { ...state.user, state: action.payload }
      }
    case 'SET_LANGUAGE':
      return {
        ...state,
        user: { ...state.user, preferredLanguage: action.payload }
      }
    case 'START_RECORDING':
      return { ...state, isRecording: true }
    case 'STOP_RECORDING':
      return { ...state, isRecording: false }
    case 'SET_RECORDINGS':
      return { ...state, recordings: action.payload }
    case 'ADD_RECORDING':
      return {
        ...state,
        recordings: [action.payload, ...state.recordings]
      }
    case 'UPDATE_RECORDING':
      return {
        ...state,
        recordings: state.recordings.map(recording =>
          recording.recordId === action.payload.recordId
            ? { ...recording, ...action.payload.updates }
            : recording
        )
      }
    case 'DELETE_RECORDING':
      return {
        ...state,
        recordings: state.recordings.filter(recording => recording.recordId !== action.payload)
      }
    case 'SET_SCRIPTS':
      return { ...state, generatedScripts: action.payload }
    case 'ADD_SCRIPT':
      return {
        ...state,
        generatedScripts: [action.payload, ...state.generatedScripts]
      }
    case 'DELETE_SCRIPT':
      return {
        ...state,
        generatedScripts: state.generatedScripts.filter(script => script.scriptId !== action.payload)
      }
    case 'UPGRADE_SUBSCRIPTION':
      return {
        ...state,
        user: { ...state.user, subscriptionStatus: 'premium' }
      }
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload }
    case 'SET_USAGE':
      return { ...state, usage: action.payload }
    case 'INITIALIZE_APP':
      return { ...state, ...action.payload, isLoading: false }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize app with stored data
  useEffect(() => {
    const initializeApp = async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        // Load user data
        const storedUser = await storageService.getUser()
        if (storedUser) {
          dispatch({ type: 'SET_USER', payload: storedUser })
        } else {
          // Create new user and save
          const newUser = { ...initialState.user }
          await storageService.saveUser(newUser)
          dispatch({ type: 'SET_USER', payload: newUser })
        }

        // Load recordings
        const recordings = await storageService.getRecordings()
        dispatch({ type: 'SET_RECORDINGS', payload: recordings })

        // Load scripts
        const scripts = await storageService.getScripts()
        dispatch({ type: 'SET_SCRIPTS', payload: scripts })

        // Load usage data
        const usage = await storageService.getCurrentUsage()
        dispatch({ type: 'SET_USAGE', payload: usage })

        // Try to get user's current state from location
        if (geolocationService.isAvailable()) {
          try {
            const userState = await geolocationService.getUserState()
            if (userState && (!storedUser || storedUser.state !== userState)) {
              const updatedUser = { ...storedUser || initialState.user, state: userState }
              await storageService.updateUser(updatedUser)
              dispatch({ type: 'UPDATE_USER', payload: { state: userState } })
            }
          } catch (error) {
            console.warn('Could not get user location:', error)
          }
        }

      } catch (error) {
        console.error('Failed to initialize app:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load app data' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initializeApp()
  }, [])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true })
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Periodic cleanup of old data
  useEffect(() => {
    const cleanup = async () => {
      try {
        await storageService.cleanup()
      } catch (error) {
        console.error('Cleanup failed:', error)
      }
    }

    // Run cleanup once per day
    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const value = {
    ...state,
    dispatch,
    // Helper functions
    setUserState: async (newState) => {
      dispatch({ type: 'SET_USER_STATE', payload: newState })
      try {
        await storageService.updateUser({ state: newState })
      } catch (error) {
        console.error('Failed to save user state:', error)
      }
    },
    setLanguage: async (lang) => {
      dispatch({ type: 'SET_LANGUAGE', payload: lang })
      try {
        await storageService.updateUser({ preferredLanguage: lang })
      } catch (error) {
        console.error('Failed to save language preference:', error)
      }
    },
    updateUser: async (updates) => {
      dispatch({ type: 'UPDATE_USER', payload: updates })
      try {
        await storageService.updateUser(updates)
      } catch (error) {
        console.error('Failed to update user:', error)
      }
    },
    startRecording: () => dispatch({ type: 'START_RECORDING' }),
    stopRecording: () => dispatch({ type: 'STOP_RECORDING' }),
    addRecording: (recording) => dispatch({ type: 'ADD_RECORDING', payload: recording }),
    updateRecording: async (recordId, updates) => {
      dispatch({ type: 'UPDATE_RECORDING', payload: { recordId, updates } })
      try {
        await storageService.updateRecording(recordId, updates)
      } catch (error) {
        console.error('Failed to update recording:', error)
      }
    },
    deleteRecording: async (recordId) => {
      dispatch({ type: 'DELETE_RECORDING', payload: recordId })
      try {
        await storageService.deleteRecording(recordId)
      } catch (error) {
        console.error('Failed to delete recording:', error)
      }
    },
    addScript: (script) => dispatch({ type: 'ADD_SCRIPT', payload: script }),
    deleteScript: async (scriptId) => {
      dispatch({ type: 'DELETE_SCRIPT', payload: scriptId })
      try {
        await storageService.deleteScript(scriptId)
      } catch (error) {
        console.error('Failed to delete script:', error)
      }
    },
    upgradeSubscription: async () => {
      dispatch({ type: 'UPGRADE_SUBSCRIPTION' })
      try {
        await storageService.updateUser({ subscriptionStatus: 'premium' })
      } catch (error) {
        console.error('Failed to save subscription status:', error)
      }
    },
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    // Data export/import
    exportData: async () => {
      try {
        return await storageService.exportData()
      } catch (error) {
        console.error('Failed to export data:', error)
        throw error
      }
    },
    importData: async (jsonData) => {
      try {
        await storageService.importData(jsonData)
        // Reload app data
        const user = await storageService.getUser()
        const recordings = await storageService.getRecordings()
        const scripts = await storageService.getScripts()
        const usage = await storageService.getCurrentUsage()
        
        dispatch({ type: 'SET_USER', payload: user })
        dispatch({ type: 'SET_RECORDINGS', payload: recordings })
        dispatch({ type: 'SET_SCRIPTS', payload: scripts })
        dispatch({ type: 'SET_USAGE', payload: usage })
      } catch (error) {
        console.error('Failed to import data:', error)
        throw error
      }
    },
    clearAllData: async () => {
      try {
        await storageService.clearAll()
        // Reset to initial state
        dispatch({ type: 'INITIALIZE_APP', payload: initialState })
      } catch (error) {
        console.error('Failed to clear data:', error)
        throw error
      }
    }
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
