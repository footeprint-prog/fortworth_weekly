import type { UserState } from '../types'

const STORAGE_KEY = 'fortworth-rental-dashboard:v1'

export const emptyUserState: UserState = { version: 1, leads: {} }

export function loadUserState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyUserState
    const parsed = JSON.parse(raw) as UserState
    if (parsed.version !== 1 || typeof parsed.leads !== 'object') return emptyUserState
    return parsed
  } catch {
    return emptyUserState
  }
}

export function saveUserState(state: UserState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
