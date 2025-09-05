import config from '../config'

// Geolocation service for Legal Shield
export class GeolocationService {
  constructor() {
    this.isSupported = 'geolocation' in navigator
    this.watchId = null
  }

  // Check if geolocation is supported and enabled
  isAvailable() {
    return this.isSupported && config.features.geolocation
  }

  // Get current position
  async getCurrentPosition(options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Geolocation not available')
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    const finalOptions = { ...defaultOptions, ...options }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            address: null // Will be populated by reverse geocoding
          }
          resolve(location)
        },
        (error) => {
          let errorMessage = 'Location access denied'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
            default:
              errorMessage = 'Unknown location error'
              break
          }
          
          reject(new Error(errorMessage))
        },
        finalOptions
      )
    })
  }

  // Watch position changes
  watchPosition(callback, errorCallback, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Geolocation not available')
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    }

    const finalOptions = { ...defaultOptions, ...options }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          address: null
        }
        callback(location)
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error)
        }
      },
      finalOptions
    )

    return this.watchId
  }

  // Stop watching position
  clearWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  // Reverse geocoding - convert coordinates to address
  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free geocoding service (in production, you might want to use Google Maps API)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      )

      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }

      const data = await response.json()
      
      return {
        address: data.locality || data.city || 'Unknown location',
        city: data.city || data.locality,
        state: data.principalSubdivision,
        country: data.countryName,
        postalCode: data.postcode,
        fullAddress: data.locality ? 
          `${data.locality}, ${data.principalSubdivision}, ${data.countryName}` :
          'Unknown location'
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      return {
        address: 'Unknown location',
        city: null,
        state: null,
        country: null,
        postalCode: null,
        fullAddress: 'Unknown location'
      }
    }
  }

  // Get location with address
  async getCurrentLocationWithAddress(options = {}) {
    try {
      const position = await this.getCurrentPosition(options)
      const address = await this.reverseGeocode(position.latitude, position.longitude)
      
      return {
        ...position,
        ...address
      }
    } catch (error) {
      throw error
    }
  }

  // Check if user is in a specific state (for state-specific rights)
  async getUserState() {
    try {
      const location = await this.getCurrentLocationWithAddress()
      return location.state || null
    } catch (error) {
      console.error('Failed to get user state:', error)
      return null
    }
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return distance
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  // Find nearby legal resources (mock implementation)
  async findNearbyLegalResources(latitude, longitude, radius = 10) {
    try {
      // In a real app, this would query a database of legal resources
      // For now, we'll return mock data
      const mockResources = [
        {
          id: 'legal-aid-1',
          name: 'Legal Aid Society',
          type: 'Legal Aid',
          address: '123 Justice St, City, State',
          phone: '(555) 123-4567',
          distance: 2.5,
          services: ['Criminal Defense', 'Civil Rights', 'Immigration']
        },
        {
          id: 'public-defender-1',
          name: 'Public Defender Office',
          type: 'Public Defender',
          address: '456 Court Ave, City, State',
          phone: '(555) 987-6543',
          distance: 4.2,
          services: ['Criminal Defense', 'Appeals']
        },
        {
          id: 'aclu-1',
          name: 'ACLU Local Chapter',
          type: 'Civil Rights Organization',
          address: '789 Liberty Blvd, City, State',
          phone: '(555) 456-7890',
          distance: 6.8,
          services: ['Civil Rights', 'Police Misconduct', 'Constitutional Law']
        }
      ]

      // Filter by radius and sort by distance
      return mockResources
        .filter(resource => resource.distance <= radius)
        .sort((a, b) => a.distance - b.distance)

    } catch (error) {
      console.error('Failed to find nearby legal resources:', error)
      return []
    }
  }

  // Get emergency contacts based on location
  async getEmergencyContacts(latitude, longitude) {
    try {
      const address = await this.reverseGeocode(latitude, longitude)
      
      // Return location-specific emergency contacts
      return {
        emergency: '911',
        police: '911',
        legalAid: '(555) LEGAL-AID',
        civilRights: '(555) CIVIL-RIGHTS',
        localBar: '(555) BAR-ASSOC',
        state: address.state,
        city: address.city
      }
    } catch (error) {
      console.error('Failed to get emergency contacts:', error)
      return {
        emergency: '911',
        police: '911',
        legalAid: '(555) LEGAL-AID',
        civilRights: '(555) CIVIL-RIGHTS',
        localBar: '(555) BAR-ASSOC',
        state: null,
        city: null
      }
    }
  }

  // Request permission for location access
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Geolocation not supported')
    }

    try {
      // Try to get position to trigger permission request
      await this.getCurrentPosition({ timeout: 5000 })
      return 'granted'
    } catch (error) {
      if (error.message.includes('denied')) {
        return 'denied'
      }
      return 'error'
    }
  }

  // Check current permission status
  async getPermissionStatus() {
    if (!this.isSupported) {
      return 'unsupported'
    }

    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        return permission.state // 'granted', 'denied', or 'prompt'
      } catch (error) {
        console.error('Failed to check permission status:', error)
      }
    }

    // Fallback: try to get position
    try {
      await this.getCurrentPosition({ timeout: 1000 })
      return 'granted'
    } catch (error) {
      if (error.message.includes('denied')) {
        return 'denied'
      }
      return 'prompt'
    }
  }
}

// Create singleton instance
export const geolocationService = new GeolocationService()

export default geolocationService
