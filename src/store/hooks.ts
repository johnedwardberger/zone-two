import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore, type AppState } from './store'

/** The persisted data slices selectors work from (stable while unchanged). */
export type Core = Pick<
  AppState,
  | 'me'
  | 'athletes'
  | 'activities'
  | 'filters'
  | 'swipes'
  | 'kudosGiven'
  | 'kudosReceived'
  | 'requests'
  | 'matches'
  | 'messages'
  | 'hidden'
  | 'blocked'
  | 'feedKudos'
  | 'notifications'
  | 'units'
>

const pickCore = (s: AppState): Core => ({
  me: s.me,
  athletes: s.athletes,
  activities: s.activities,
  filters: s.filters,
  swipes: s.swipes,
  kudosGiven: s.kudosGiven,
  kudosReceived: s.kudosReceived,
  requests: s.requests,
  matches: s.matches,
  messages: s.messages,
  hidden: s.hidden,
  blocked: s.blocked,
  feedKudos: s.feedKudos,
  notifications: s.notifications,
  units: s.units,
})

export function useCore(): Core {
  return useAppStore(useShallow(pickCore))
}

/** Memoized derived data from a selector over the core slices. */
export function useDerived<T>(selector: (s: Core) => T): T {
  const core = useCore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => selector(core), [core])
}
