import { NavLink } from 'react-router'
import { NAV_ITEMS } from './navItems'
import { NavBadge } from './NavBadge'

/** Mobile/tablet navigation (< 1024px). */
export function BottomTabBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface/95 backdrop-blur desk:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-xl items-end justify-around px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, primary, badge }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary-strong' : 'text-muted hover:text-ink',
                ].join(' ')
              }
            >
              {({ isActive }) =>
                primary ? (
                  <>
                    <span
                      className={[
                        '-mt-5 flex size-14 items-center justify-center rounded-full text-white shadow-lift transition-transform',
                        'bg-primary-strong active:scale-95 active:bg-primary-pressed',
                        isActive ? 'ring-4 ring-primary-soft' : '',
                      ].join(' ')}
                    >
                      <Icon className="size-7" strokeWidth={2.5} aria-hidden />
                    </span>
                    <span>{label}</span>
                  </>
                ) : (
                  <>
                    <span className="relative">
                      <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} aria-hidden />
                      {badge && <NavBadge className="absolute -top-1.5 -right-2.5" />}
                    </span>
                    <span>{label}</span>
                  </>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
