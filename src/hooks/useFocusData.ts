import { useState, useEffect } from 'react'
import { mockDataService, withMockFallback, MockAmbientSound, MockAmbienceMode } from '../services/mockDataService'

export function useAmbientSounds() {
  const [sounds, setSounds] = useState<MockAmbientSound[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSounds = async () => {
    try {
      setLoading(true)
      const mockSounds = mockDataService.getMockAmbientSounds()
      
      // Use mock data directly since tables are not expected to exist yet
      const response = mockSounds
      
      setSounds(response)
      setError(null)
    } catch (err) {
      console.error('Error fetching ambient sounds:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch ambient sounds')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSounds()
  }, [])

  return {
    sounds,
    loading,
    error,
    refetch: fetchSounds
  }
}

export function useAmbienceModes() {
  const [modes, setModes] = useState<MockAmbienceMode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModes = async () => {
    try {
      setLoading(true)
      const mockModes = mockDataService.getMockAmbienceModes()
      
      // Use mock data directly since tables are not expected to exist yet
      const response = mockModes
      
      setModes(response)
      setError(null)
    } catch (err) {
      console.error('Error fetching ambience modes:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch ambience modes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModes()
  }, [])

  return {
    modes,
    loading,
    error,
    refetch: fetchModes
  }
}