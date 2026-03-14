import { create } from 'zustand'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthStore {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  initialize: () => () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  initialize: () => {
    return onAuthStateChanged(auth, (user) => {
      set({ user, loading: false })
    })
  },
}))
