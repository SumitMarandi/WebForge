import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/utils/supabase'
import { sessionStorage } from '@/utils/sessionStorage'

interface UseSessionTimeoutOptions {
    timeoutDuration?: number // in milliseconds
    warningDuration?: number // show warning before logout (in milliseconds)
    onWarning?: () => void
    onTimeout?: () => void
}

export const useSessionTimeout = ({
    timeoutDuration = 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    warningDuration = 30 * 60 * 1000, // 30 minutes warning
    onWarning,
    onTimeout
}: UseSessionTimeoutOptions = {}) => {
    const timeoutRef = useRef<NodeJS.Timeout>()
    const warningTimeoutRef = useRef<NodeJS.Timeout>()
    const lastActivityRef = useRef<number>(Date.now())

    const logout = useCallback(async () => {
        try {
            await supabase.auth.signOut()
            sessionStorage.clearSession()
            onTimeout?.()
        } catch (error) {
            console.error('Error during logout:', error)
        }
    }, [onTimeout])

    const showWarning = useCallback(() => {
        onWarning?.()
    }, [onWarning])

    const resetTimeout = useCallback(() => {
        const now = Date.now()
        lastActivityRef.current = now
        sessionStorage.updateLastActivity()

        // Clear existing timeouts
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current)
        }

        // Set warning timeout (show warning before actual logout)
        warningTimeoutRef.current = setTimeout(() => {
            showWarning()
        }, timeoutDuration - warningDuration)

        // Set logout timeout
        timeoutRef.current = setTimeout(() => {
            logout()
        }, timeoutDuration)
    }, [timeoutDuration, warningDuration, logout, showWarning])

    const checkExistingSession = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) return

        if (sessionStorage.isSessionExpired(timeoutDuration)) {
            // Session has expired, logout immediately
            await logout()
            return
        }

        const remainingTime = sessionStorage.getRemainingTime(timeoutDuration)
        const warningTime = remainingTime - warningDuration

        if (warningTime > 0) {
            // Set warning timeout for remaining time
            warningTimeoutRef.current = setTimeout(() => {
                showWarning()
            }, warningTime)
        } else if (remainingTime > 0) {
            // Show warning immediately if we're in warning period
            showWarning()
        }

        // Set logout timeout for remaining time
        if (remainingTime > 0) {
            timeoutRef.current = setTimeout(() => {
                logout()
            }, remainingTime)
        }
    }, [timeoutDuration, warningDuration, logout, showWarning])

    useEffect(() => {
        // Check existing session on mount
        checkExistingSession()

        // Activity events to track
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ]

        // Throttle activity tracking to avoid excessive updates
        let throttleTimeout: NodeJS.Timeout
        const handleActivity = () => {
            if (throttleTimeout) return

            throttleTimeout = setTimeout(() => {
                resetTimeout()
                throttleTimeout = null as any
            }, 1000) // Throttle to once per second
        }

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, handleActivity, true)
        })

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                resetTimeout()
            } else if (event === 'SIGNED_OUT') {
                // Clear timeouts when user signs out
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
                sessionStorage.clearSession()
            }
        })

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true)
            })

            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
            if (throttleTimeout) clearTimeout(throttleTimeout)

            subscription.unsubscribe()
        }
    }, [resetTimeout, checkExistingSession])

    return {
        resetTimeout,
        logout
    }
}