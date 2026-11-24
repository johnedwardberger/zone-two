import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { BottomTabBar } from './BottomTabBar'
import { SideNav } from './SideNav'

/** Layout for every in-app page: sidebar on desktop, bottom tab bar below 1024px. */
export function AppShell() {
  const mainRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()

  // Move focus to the new page's content on navigation so keyboard and
  // screen-reader users land in the right place.
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          mainRef.current?.focus()
        }}
        className="sr-only z-50 rounded-lg bg-surface px-4 py-2 shadow-card focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SideNav />
      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="min-w-0 flex-1 pb-28 outline-none desk:pb-0"
      >
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
