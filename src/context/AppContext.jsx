import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext()

const initialState = {
  user: {
    userId: 'user-001',
    email: null,
    subscriptionStatus: 'free', // free, premium
    preferredLanguage: 'en',
    state: 'CA'
  },
  isRecording: false,
  recordings: [],
  generatedScripts: [],
  isLoading: false,
  error: null
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
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
    case 'ADD_RECORDING':
      return {
        ...state,
        recordings: [action.payload, ...state.recordings]
      }
    case 'ADD_SCRIPT':
      return {
        ...state,
        generatedScripts: [action.payload, ...state.generatedScripts]
      }
    case 'UPGRADE_SUBSCRIPTION':
      return {
        ...state,
        user: { ...state.user, subscriptionStatus: 'premium' }
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    // Simulate initial loading
    dispatch({ type: 'SET_LOADING', payload: true })
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false })
    }, 1000)
  }, [])

  const value = {
    ...state,
    dispatch,
    // Helper functions
    setUserState: (state) => dispatch({ type: 'SET_USER_STATE', payload: state }),
    setLanguage: (lang) => dispatch({ type: 'SET_LANGUAGE', payload: lang }),
    startRecording: () => dispatch({ type: 'START_RECORDING' }),
    stopRecording: () => dispatch({ type: 'STOP_RECORDING' }),
    addRecording: (recording) => dispatch({ type: 'ADD_RECORDING', payload: recording }),
    addScript: (script) => dispatch({ type: 'ADD_SCRIPT', payload: script }),
    upgradeSubscription: () => dispatch({ type: 'UPGRADE_SUBSCRIPTION' }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading })
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