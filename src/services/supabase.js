import { createClient } from '@supabase/supabase-js'
import config from '../config'

// Initialize Supabase client
let supabase = null

if (config.supabase.url && config.supabase.anonKey) {
  supabase = createClient(config.supabase.url, config.supabase.anonKey)
}

// Database service for Legal Shield
export class DatabaseService {
  constructor() {
    this.client = supabase
  }

  // Check if Supabase is configured
  isConfigured() {
    return this.client !== null
  }

  // User Management
  async createUser(userData) {
    if (!this.client) throw new Error('Database not configured')
    
    const { data, error } = await this.client
      .from('users')
      .insert([{
        user_id: userData.userId,
        email: userData.email,
        subscription_status: userData.subscriptionStatus || 'free',
        preferred_language: userData.preferredLanguage || 'en',
        state: userData.state || 'CA',
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async updateUser(userId, updates) {
    if (!this.client) throw new Error('Database not configured')
    
    const { data, error } = await this.client
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  }

  async getUser(userId) {
    if (!this.client) throw new Error('Database not configured')
    
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Recording Management
  async saveRecording(recording) {
    if (!this.client) throw new Error('Database not configured')
    
    const { data, error } = await this.client
      .from('interaction_records')
      .insert([{
        record_id: recording.recordId,
        user_id: recording.userId,
        timestamp: recording.timestamp,
        duration: recording.duration,
        audio_file_path: recording.audioFilePath,
        video_file_path: recording.videoFilePath,
        location: recording.location,
        notes: recording.notes,
        shared_status: recording.sharedStatus
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async getUserRecordings(userId, limit = 50) {
    if (!this.client) throw new Error('Database not configured')
    
    const { data, error } = await this.client
      .from('interaction_records')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  async deleteRecording(recordId, userId) {
    if (!this.client) throw new Error('Database not configured')
    
    const { error } = await this.client
      .from('interaction_records')
      .delete()
      .eq('record_id', recordId)
      .eq('user_id', userId)
    
    if (error) throw error
  }

  // Script Management
  async saveScript(script) {
    if (!this.client) throw new Error('Database not configured')
    
    const { data, error } = await this.client
      .from('generated_scripts')
      .insert([{
        script_id: script.scriptId,
        user_id: script.userId,
        scenario: script.scenario,
        language: script.language,
        script_content: script.scriptContent,
        timestamp: script.timestamp
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async getUserScripts(userId, limit = 50) {
    if (!this.client) throw new Error('Database not configured')
    
    const { data, error } = await this.client
      .from('generated_scripts')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  // Rights Cards Management
  async getRightsCards(state = null, language = 'en') {
    if (!this.client) throw new Error('Database not configured')
    
    let query = this.client
      .from('rights_cards')
      .select('*')
      .eq('language', language)
    
    if (state) {
      query = query.eq('state', state)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  }

  // File Upload (for recordings)
  async uploadFile(bucket, path, file) {
    if (!this.client) throw new Error('Database not configured')
    
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  }

  async getFileUrl(bucket, path) {
    if (!this.client) throw new Error('Database not configured')
    
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  // Usage Tracking (for subscription limits)
  async trackScriptGeneration(userId) {
    if (!this.client) throw new Error('Database not configured')
    
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    
    const { data, error } = await this.client
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        month: currentMonth,
        scripts_generated: 1
      }, {
        onConflict: 'user_id,month',
        ignoreDuplicates: false
      })
    
    if (error) throw error
    return data
  }

  async getMonthlyUsage(userId) {
    if (!this.client) throw new Error('Database not configured')
    
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    const { data, error } = await this.client
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data || { scripts_generated: 0 }
  }
}

// Create singleton instance
export const db = new DatabaseService()

export default supabase
