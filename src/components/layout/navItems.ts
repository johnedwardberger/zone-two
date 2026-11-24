import { Compass, MessageCircle, Newspaper, Plus, UserRound, type LucideIcon } from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** The center "Post" tab is visually emphasized. */
  primary?: boolean
  /** Show the unread-notifications badge. */
  badge?: boolean
}

/** Single source of truth for both the mobile tab bar and the desktop sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/feed', label: 'Feed', icon: Newspaper },
  { to: '/post', label: 'Post', icon: Plus, primary: true },
  { to: '/matches', label: 'Matches', icon: MessageCircle, badge: true },
  { to: '/profile', label: 'Profile', icon: UserRound },
]
