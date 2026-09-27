import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { uploadAPI } from '../services/api'
import { useAuth } from './AuthContext'

const DatasetContext = createContext(null)

export function DatasetProvider({ children }) {
  const { user } = useAuth()
  const [batches, setBatches] = useState([])
  const [activeBatchId, setActiveBatchId] = useState(() => localStorage.getItem('active_batch_id'))
  const [loading, setLoading] = useState(false)

  const refreshBatches = useCallback(async () => {
    if (!user) {
      setBatches([])
      setActiveBatchId(null)
      return
    }
    setLoading(true)
    try {
      const { data } = await uploadAPI.getBatches()
      const fetchedBatches = data.data?.batches || []
      
      setBatches(fetchedBatches)
      const completedBatches = fetchedBatches.filter(b => b.status === 'completed')

      // Initialize activeBatchId if missing or invalid
      const currentActive = localStorage.getItem('active_batch_id')
      if (completedBatches.length > 0) {
        const stillExists = completedBatches.find(b => b.batch_id === currentActive)
        if (!stillExists) {
          const newest = completedBatches[0].batch_id
          setActiveBatchId(newest)
          localStorage.setItem('active_batch_id', newest)
        }
      } else {
        setActiveBatchId(null)
        localStorage.removeItem('active_batch_id')
      }
    } catch (error) {
      console.error('Failed to fetch batches', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshBatches()
  }, [refreshBatches])

  const handleSetActiveBatchId = (id) => {
    setActiveBatchId(id)
    if (id) {
      localStorage.setItem('active_batch_id', id)
    } else {
      localStorage.removeItem('active_batch_id')
    }
  }

  const activeBatch = batches.find(b => b.batch_id === activeBatchId && b.status === 'completed')
  const completedBatches = batches.filter(b => b.status === 'completed')

  return (
    <DatasetContext.Provider value={{
      batches,
      completedBatches,
      activeBatchId,
      activeBatch,
      setActiveBatchId: handleSetActiveBatchId,
      loading,
      refreshBatches
    }}>
      {children}
    </DatasetContext.Provider>
  )
}

export const useDataset = () => {
  const ctx = useContext(DatasetContext)
  if (!ctx) throw new Error('useDataset must be used inside DatasetProvider')
  return ctx
}
