import localforage from 'localforage'
import config from '../config'

// Configure localforage
localforage.config({
  name: 'LegalShield',
  version: 1.0,
  storeName: 'legal_shield_data',
  description: 'Legal Shield app data storage'
})

// Storage service for Legal Shield
export class StorageService {
  constructor() {
    this.storage = localforage
  }

  // User data management
  async saveUser(userData) {
    try {
      await this.storage.setItem(config.storage.user, userData)
      return userData
    } catch (error) {
      console.error('Failed to save user data:', error)
      throw new Error('Failed to save user data')
    }
  }

  async getUser() {
    try {
      return await this.storage.getItem(config.storage.user)
    } catch (error) {
      console.error('Failed to get user data:', error)
      return null
    }
  }

  async updateUser(updates) {
    try {
      const currentUser = await this.getUser()
      if (!currentUser) {
        throw new Error('No user data found')
      }
      
      const updatedUser = { ...currentUser, ...updates }
      await this.storage.setItem(config.storage.user, updatedUser)
      return updatedUser
    } catch (error) {
      console.error('Failed to update user data:', error)
      throw error
    }
  }

  // Recording management
  async saveRecording(recording) {
    try {
      const recordings = await this.getRecordings()
      const updatedRecordings = [recording, ...recordings]
      
      // Keep only the last 100 recordings to manage storage
      const limitedRecordings = updatedRecordings.slice(0, 100)
      
      await this.storage.setItem(config.storage.recordings, limitedRecordings)
      return recording
    } catch (error) {
      console.error('Failed to save recording:', error)
      throw new Error('Failed to save recording')
    }
  }

  async getRecordings() {
    try {
      const recordings = await this.storage.getItem(config.storage.recordings)
      return recordings || []
    } catch (error) {
      console.error('Failed to get recordings:', error)
      return []
    }
  }

  async deleteRecording(recordId) {
    try {
      const recordings = await this.getRecordings()
      const filteredRecordings = recordings.filter(r => r.recordId !== recordId)
      await this.storage.setItem(config.storage.recordings, filteredRecordings)
      return true
    } catch (error) {
      console.error('Failed to delete recording:', error)
      throw new Error('Failed to delete recording')
    }
  }

  async updateRecording(recordId, updates) {
    try {
      const recordings = await this.getRecordings()
      const updatedRecordings = recordings.map(recording => 
        recording.recordId === recordId 
          ? { ...recording, ...updates }
          : recording
      )
      
      await this.storage.setItem(config.storage.recordings, updatedRecordings)
      return updatedRecordings.find(r => r.recordId === recordId)
    } catch (error) {
      console.error('Failed to update recording:', error)
      throw new Error('Failed to update recording')
    }
  }

  // Script management
  async saveScript(script) {
    try {
      const scripts = await this.getScripts()
      const updatedScripts = [script, ...scripts]
      
      // Keep only the last 50 scripts
      const limitedScripts = updatedScripts.slice(0, 50)
      
      await this.storage.setItem(config.storage.scripts, limitedScripts)
      return script
    } catch (error) {
      console.error('Failed to save script:', error)
      throw new Error('Failed to save script')
    }
  }

  async getScripts() {
    try {
      const scripts = await this.storage.getItem(config.storage.scripts)
      return scripts || []
    } catch (error) {
      console.error('Failed to get scripts:', error)
      return []
    }
  }

  async deleteScript(scriptId) {
    try {
      const scripts = await this.getScripts()
      const filteredScripts = scripts.filter(s => s.scriptId !== scriptId)
      await this.storage.setItem(config.storage.scripts, filteredScripts)
      return true
    } catch (error) {
      console.error('Failed to delete script:', error)
      throw new Error('Failed to delete script')
    }
  }

  // Settings management
  async saveSettings(settings) {
    try {
      await this.storage.setItem(config.storage.settings, settings)
      return settings
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw new Error('Failed to save settings')
    }
  }

  async getSettings() {
    try {
      const settings = await this.storage.getItem(config.storage.settings)
      return settings || {
        notifications: true,
        autoBackup: false,
        recordingQuality: 'medium',
        theme: 'light'
      }
    } catch (error) {
      console.error('Failed to get settings:', error)
      return {
        notifications: true,
        autoBackup: false,
        recordingQuality: 'medium',
        theme: 'light'
      }
    }
  }

  // Cache management for offline functionality
  async cacheRightsCards(cards) {
    try {
      await this.storage.setItem('cached_rights_cards', {
        data: cards,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      })
    } catch (error) {
      console.error('Failed to cache rights cards:', error)
    }
  }

  async getCachedRightsCards() {
    try {
      const cached = await this.storage.getItem('cached_rights_cards')
      if (!cached || Date.now() > cached.expires) {
        return null
      }
      return cached.data
    } catch (error) {
      console.error('Failed to get cached rights cards:', error)
      return null
    }
  }

  async cacheStateLaws(laws) {
    try {
      await this.storage.setItem('cached_state_laws', {
        data: laws,
        timestamp: Date.now(),
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      })
    } catch (error) {
      console.error('Failed to cache state laws:', error)
    }
  }

  async getCachedStateLaws() {
    try {
      const cached = await this.storage.getItem('cached_state_laws')
      if (!cached || Date.now() > cached.expires) {
        return null
      }
      return cached.data
    } catch (error) {
      console.error('Failed to get cached state laws:', error)
      return null
    }
  }

  // Usage tracking for subscription limits
  async trackUsage(type, data = {}) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      const usageKey = `usage_${currentMonth}`
      
      const currentUsage = await this.storage.getItem(usageKey) || {
        month: currentMonth,
        scriptsGenerated: 0,
        recordingTime: 0,
        lastUpdated: Date.now()
      }

      switch (type) {
        case 'script':
          currentUsage.scriptsGenerated += 1
          break
        case 'recording':
          currentUsage.recordingTime += data.duration || 0
          break
      }

      currentUsage.lastUpdated = Date.now()
      await this.storage.setItem(usageKey, currentUsage)
      
      return currentUsage
    } catch (error) {
      console.error('Failed to track usage:', error)
      return null
    }
  }

  async getCurrentUsage() {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const usageKey = `usage_${currentMonth}`
      
      const usage = await this.storage.getItem(usageKey)
      return usage || {
        month: currentMonth,
        scriptsGenerated: 0,
        recordingTime: 0,
        lastUpdated: Date.now()
      }
    } catch (error) {
      console.error('Failed to get current usage:', error)
      return {
        month: new Date().toISOString().slice(0, 7),
        scriptsGenerated: 0,
        recordingTime: 0,
        lastUpdated: Date.now()
      }
    }
  }

  // Cleanup old data
  async cleanup() {
    try {
      // Remove usage data older than 12 months
      const keys = await this.storage.keys()
      const currentDate = new Date()
      const twelveMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1)
      
      for (const key of keys) {
        if (key.startsWith('usage_')) {
          const month = key.replace('usage_', '')
          const monthDate = new Date(month + '-01')
          
          if (monthDate < twelveMonthsAgo) {
            await this.storage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old data:', error)
    }
  }

  // Clear all data (for logout/reset)
  async clearAll() {
    try {
      await this.storage.clear()
    } catch (error) {
      console.error('Failed to clear all data:', error)
      throw new Error('Failed to clear data')
    }
  }

  // Export data for backup
  async exportData() {
    try {
      const data = {
        user: await this.getUser(),
        recordings: await this.getRecordings(),
        scripts: await this.getScripts(),
        settings: await this.getSettings(),
        usage: await this.getCurrentUsage(),
        exportDate: new Date().toISOString()
      }
      
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      throw new Error('Failed to export data')
    }
  }

  // Import data from backup
  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.user) await this.saveUser(data.user)
      if (data.recordings) await this.storage.setItem(config.storage.recordings, data.recordings)
      if (data.scripts) await this.storage.setItem(config.storage.scripts, data.scripts)
      if (data.settings) await this.saveSettings(data.settings)
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      throw new Error('Failed to import data')
    }
  }
}

// Create singleton instance
export const storageService = new StorageService()

export default storageService
