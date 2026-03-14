import { useState } from 'react'
import { motion } from 'motion/react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { auth } from '../../../lib/firebase'
import { useToast } from '../../../components/ui/toast-context'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Checkbox } from '../../../components/ui/checkbox'

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
    } catch (error: any) {
      pushToast({
        tone: 'error',
        title: 'שגיאה',
        message: error.message || 'אירעה שגיאה בתהליך ההתחברות.',
      })
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
