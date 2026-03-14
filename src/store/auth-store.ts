import { create } from 'zustand'
import { onAuthStateChanged, getRedirectResult, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthStore {
  user: User | null
  loading: boolean
  isAuthLoading: boolean
  geminiApiKey: string | null
  isHydrated: boolean
  isApiKeyModalOpen: boolean
  setUser: (user: User | null) => void
  setGeminiApiKey: (key: string | null) => void
  setIsHydrated: (hydrated: boolean) => void
  setIsApiKeyModalOpen: (open: boolean) => void
  setIsAuthLoading: (loading: boolean) => void
  initialize: () => () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  isAuthLoading: true,
  geminiApiKey: null,
  isHydrated: false,
  isApiKeyModalOpen: false,
  setUser: (user) => set({ user }),
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  setIsHydrated: (hydrated) => set({ isHydrated: hydrated }),
  setIsApiKeyModalOpen: (open) => set({ isApiKeyModalOpen: open }),
  setIsAuthLoading: (loading) => set({ isAuthLoading: loading, loading }),
  initialize: () => {
    let initialCheckDone = false
    const redirectPromise = getRedirectResult(auth).catch(() => null)

    return onAuthStateChanged(auth, async (user) => {
      set({ user })
      
      if (!initialCheckDone) {
        initialCheckDone = true
        try {
          const result = await redirectPromise
          if (result?.user) {
            set({ user: result.user })
            user = result.user
          }
        } finally {
          set({ isAuthLoading: false, loading: false })
        }
      } else {
        set({ isAuthLoading: false, loading: false })
      }

      if (!user) {
        set({ isHydrated: false, geminiApiKey: null })
      }
    })
  },
}))
