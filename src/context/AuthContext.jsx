import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function initSession() {
      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError
        if (!isMounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (err) {
        if (!isMounted) return
        setError(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user,
    loading,
    error,
    signInWithEmail: async ({ email, password }) => {
      setError(null)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        setError(signInError)
        throw signInError
      }
      return data
    },
    signUpWithEmail: async ({ email, password, fullName }) => {
      setError(null)
      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      if (signUpError) {
        setError(signUpError)
        throw signUpError
      }
      return data
    },
    signInWithGoogle: async () => {
      setError(null)
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })
      if (oauthError) {
        setError(oauthError)
        throw oauthError
      }
      return data
    },
    signOut: async () => {
      setError(null)
      if (typeof window !== 'undefined' && window.ritQuranAudio) {
        try {
          window.ritQuranAudio.pause()
        } catch {
          // ignore
        }
        window.ritQuranAudio = null
      }
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        setError(signOutError)
        throw signOutError
      }
    },
    resetPasswordForEmail: async (email) => {
      setError(null)
      const redirectTo = `${window.location.origin}/auth/update-password`
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (resetError) {
        setError(resetError)
        throw resetError
      }
      return data
    },
    updatePassword: async (password) => {
      setError(null)
      const { data, error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError)
        throw updateError
      }
      return data
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
