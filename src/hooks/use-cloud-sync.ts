import { useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthStore } from '../store/auth-store'
import { useResumeStore } from '../store/resume-store'

export const useCloudSync = () => {
  const user = useAuthStore((state) => state.user)
  const geminiApiKey = useAuthStore((state) => state.geminiApiKey)
  const setGeminiApiKey = useAuthStore((state) => state.setGeminiApiKey)
  const setIsHydrated = useAuthStore((state) => state.setIsHydrated)
  const data = useResumeStore((state) => state.data)
  const replaceResumeData = useResumeStore((state) => state.replaceResumeData)
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const isInitialLoad = useRef(true)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch data on login
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const cloudData = docSnap.data().resumeData
          const apiKey = docSnap.data().geminiApiKey
          if (cloudData) {
            replaceResumeData(cloudData)
          }
          if (apiKey) {
            setGeminiApiKey(apiKey)
          }
        }
      } catch (error) {
        console.error('Failed to fetch resume data from cloud', error)
      } finally {
        isInitialLoad.current = false
        setIsHydrated(true)
      }
    }

    fetchData()
  }, [user, replaceResumeData, setGeminiApiKey, setIsHydrated])

  // Debounced auto-save
  useEffect(() => {
    if (!user || isInitialLoad.current) return

    setSyncStatus('saving')

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', user.uid)
        await setDoc(docRef, { resumeData: data, geminiApiKey }, { merge: true })
        setSyncStatus('saved')
        setTimeout(() => setSyncStatus('idle'), 2000)
      } catch (error) {
        console.error('Failed to save resume data to cloud', error)
        setSyncStatus('error')
      }
    }, 2000) // 2s debounce

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }
    }
  }, [user, data, geminiApiKey])

  return { syncStatus }
}
