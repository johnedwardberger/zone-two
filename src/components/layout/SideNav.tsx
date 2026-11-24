import { NavLink } from 'react-router'
import { Settings } from 'lucide-react'
import { Logo } from '../Logo'
import { NAV_ITEMS } from './navItems'
import { NavBadge } from './NavBadge'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors',
    isActive ? 'bg-primary-soft text-ink' : 'text-muted hover:bg-hairline/60 hover:text-ink',
  ].join(' ')

/** Desktop navigation (≥ 1024px). */
export function SideNav() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-hairline bg-surface px-4 py-6 desk:flex">
      <NavLink to="/discover" className="mb-8 px-3" aria-label="Zone Two home">
        <Logo className="h-8" />
      </NavLink>
      <nav aria-label="Main" className="flex flex-1 flex-col">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, primary, badge }) => (
            <li key={to}>
              {primary ? (
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    [
                      'my-2 flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold text-white shadow-card transition-colors',
                      'bg-primary-strong hover:bg-primary-pressed',
                      isActive ? 'ring-4 ring-primary-soft' : '',
                    ].join(' ')
                  }
                >
                  <Icon className="size-5" strokeWidth={2.5} aria-hidden />
                  {label} an activity
                </NavLink>
              ) : (
                <NavLink to={to} className={linkClass}>
                  <Icon className="size-5" aria-hidden />
                  {label}
                  {badge && <NavBadge className="ml-auto" />}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
        <ul className="mt-auto">
          <li>
            <NavLink to="/settings" className={linkClass}>
              <Settings className="size-5" aria-hidden />
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
      <p className="mt-4 px-4 text-xs text-muted">Demo · all profiles are fictional</p>
    </aside>
  )
}
