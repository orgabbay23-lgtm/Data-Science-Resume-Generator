import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuthStore } from '../../store/auth-store'
import { Button } from './button'
import { Input } from './input'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export const ApiKeyModal = () => {
  const { user, isHydrated, geminiApiKey, setGeminiApiKey, isApiKeyModalOpen, setIsApiKeyModalOpen } = useAuthStore()
  const [inputValue, setInputValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize input value with current key if updating
  useEffect(() => {
    if (isApiKeyModalOpen && geminiApiKey) {
      setInputValue(geminiApiKey)
    } else if (!isApiKeyModalOpen) {
      setInputValue('')
    }
  }, [isApiKeyModalOpen, geminiApiKey])

  const isOpen = (user && isHydrated && !geminiApiKey) || isApiKeyModalOpen

  const handleSave = async () => {
    if (inputValue.trim() && user) {
      setIsSaving(true)
      try {
        const newKey = inputValue.trim()
        
        // Update local state
        setGeminiApiKey(newKey)
        setIsApiKeyModalOpen(false)
        
        // Update Firestore immediately just to be safe, though useCloudSync also handles it
        const docRef = doc(db, 'users', user.uid)
        await setDoc(docRef, { geminiApiKey: newKey }, { merge: true })
        
      } catch (error) {
        console.error('Failed to save API key:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleCancel = () => {
    if (geminiApiKey) {
      setIsApiKeyModalOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-2">הגדרת מפתח AI אישי</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              כדי להשתמש ב-AI, אנא הזן מפתח Gemini אישי. זהו מפתח חינמי שמאפשר לך להשתמש במודלים של גוגל ישירות מהחשבון שלך ולשמור על אבטחת המידע שלך (BYOK).
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 mb-6">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
                <span className="bg-cyan-100 text-cyan-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">ℹ</span>
                איך משיגים מפתח? (זה בחינם)
              </h3>
              <ol className="space-y-2.5 text-sm text-slate-600">
                <li className="flex gap-2 items-start">
                  <span className="font-medium text-slate-400 mt-0.5">1.</span>
                  <span>
                    לחץ על הקישור לאתר <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-cyan-600 font-medium hover:underline">Google AI Studio</a>.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="font-medium text-slate-400 mt-0.5">2.</span>
                  <span>התחבר עם חשבון הגוגל שלך.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="font-medium text-slate-400 mt-0.5">3.</span>
                  <span>לחץ על הכפתור הכחול <strong className="font-medium text-slate-700">Create API key</strong>.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="font-medium text-slate-400 mt-0.5">4.</span>
                  <span>העתק את המפתח שנוצר והדבק אותו כאן למטה.</span>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="הדבק את המפתח כאן..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleSave} 
                  className="flex-1" 
                  size="lg" 
                  disabled={!inputValue.trim() || isSaving}
                >
                  {isSaving ? 'שומר...' : 'שמור מפתח והמשך'}
                </Button>
                
                {!!geminiApiKey && (
                  <Button 
                    variant="secondary"
                    onClick={handleCancel} 
                    className="flex-none" 
                    size="lg"
                    disabled={isSaving}
                  >
                    ביטול
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}