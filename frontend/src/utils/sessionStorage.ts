// Session storage utilities for cross-tab session management

export const SESSION_KEYS = {
  LAST_ACTIVITY: 'lastActivity',
  SESSION_WARNING: 'sessionWarning',
  SESSION_TIMEOUT: 'sessionTimeout'
} as const

export class SessionStorageManager {
  private static instance: SessionStorageManager
  private listeners: Map<string, Set<(value: string | null) => void>> = new Map()

  private constructor() {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this))
  }

  static getInstance(): SessionStorageManager {
    if (!SessionStorageManager.instance) {
      SessionStorageManager.instance = new SessionStorageManager()
    }
    return SessionStorageManager.instance
  }

  private handleStorageChange(event: StorageEvent) {
    if (!event.key) return
    
    const listeners = this.listeners.get(event.key)
    if (listeners) {
      listeners.forEach(callback => callback(event.newValue))
    }
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value)
    // Notify listeners in current tab
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(callback => callback(value))
    }
  }

  getItem(key: string): string | null {
    return localStorage.getItem(key)
  }

  removeItem(key: string): void {
    localStorage.removeItem(key)
    // Notify listeners in current tab
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(callback => callback(null))
    }
  }

  subscribe(key: string, callback: (value: string | null) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    
    const listeners = this.listeners.get(key)!
    listeners.add(callback)

    // Return unsubscribe function
    return () => {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.listeners.delete(key)
      }
    }
  }

  // Session-specific methods
  updateLastActivity(): void {
    this.setItem(SESSION_KEYS.LAST_ACTIVITY, Date.now().toString())
  }

  getLastActivity(): number | null {
    const lastActivity = this.getItem(SESSION_KEYS.LAST_ACTIVITY)
    return lastActivity ? parseInt(lastActivity) : null
  }

  clearSession(): void {
    Object.values(SESSION_KEYS).forEach(key => {
      this.removeItem(key)
    })
  }

  isSessionExpired(timeoutDuration: number): boolean {
    const lastActivity = this.getLastActivity()
    if (!lastActivity) return false
    
    return Date.now() - lastActivity >= timeoutDuration
  }

  getRemainingTime(timeoutDuration: number): number {
    const lastActivity = this.getLastActivity()
    if (!lastActivity) return timeoutDuration
    
    const elapsed = Date.now() - lastActivity
    return Math.max(0, timeoutDuration - elapsed)
  }
}

export const sessionStorage = SessionStorageManager.getInstance()