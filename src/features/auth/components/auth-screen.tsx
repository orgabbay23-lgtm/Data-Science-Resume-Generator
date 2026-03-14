import { useState } from 'react'
import { motion } from 'motion/react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { auth, googleProvider } from '../../../lib/firebase'
import { useToast } from '../../../components/ui/toast-context'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Checkbox } from '../../../components/ui/checkbox'

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { pushToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
      await setPersistence(auth, persistenceType)

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
        pushToast({
          tone: 'success',
          title: 'התחברת בהצלחה',
          message: 'ברוכים השבים למערכת קורות החיים.',
        })
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
        pushToast({
          tone: 'success',
          title: 'החשבון נוצר בהצלחה',
          message: 'ברוכים הבאים למערכת קורות החיים.',
        })
      }
    } catch (error: unknown) {
      const err = error as { message?: string, code?: string };
      pushToast({
        tone: 'error',
        title: 'שגיאה',
        message: err.message || 'אירעה שגיאה בתהליך ההתחברות.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
      await setPersistence(auth, persistenceType)
      await signInWithPopup(auth, googleProvider)
      pushToast({
        tone: 'success',
        title: 'התחברת בהצלחה',
        message: 'התחברת באמצעות חשבון Google.',
      })
    } catch (error: unknown) {
      const err = error as { message?: string, code?: string };
      if (err.code !== 'auth/popup-closed-by-user') {
        pushToast({
          tone: 'error',
          title: 'שגיאה בהתחברות',
          message: err.message || 'אירעה שגיאה בהתחברות עם Google.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="zen-shell min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="glass-panel rounded-[38px] px-6 py-10 sm:px-10 shadow-xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              {isLogin ? 'התחברות למערכת' : 'יצירת חשבון חדש'}
            </h1>
            <p className="text-slate-500">
              {isLogin
                ? 'הזן את פרטיך כדי להמשיך לבניית קורות החיים.'
                : 'הירשם עכשיו ותוכל לשמור ולערוך את קורות החיים שלך מכל מקום.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="pt-2">
              <Checkbox
                label="זכור אותי"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'טוען...' : isLogin ? 'היכנס' : 'צור חשבון'}
              </Button>
            </div>
          </form>

          <div className="mt-6 mb-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">או</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="secondary" 
            className="w-full bg-white hover:bg-slate-50 text-slate-700 border-slate-200 h-12 border" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleIcon />
            התחבר עם Google
          </Button>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? 'אין לך חשבון? ' : 'כבר יש לך חשבון? '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-cyan-600 hover:text-cyan-700 underline underline-offset-4"
                disabled={isLoading}
              >
                {isLogin ? 'הירשם כאן' : 'התחבר כאן'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
