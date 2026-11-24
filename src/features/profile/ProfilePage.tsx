import { Link } from 'react-router'
import { Settings } from 'lucide-react'
import { PlaceholderPage } from '../../components/PlaceholderPage'

export function ProfilePage() {
  return (
    <PlaceholderPage
      title="Profile"
      phase={6}
      action={
        <Link
          to="/settings"
          className="flex size-11 items-center justify-center rounded-full text-muted hover:bg-hairline/60 hover:text-ink desk:hidden"
          aria-label="Settings"
        >
          <Settings className="size-6" aria-hidden />
        </Link>
      }
    />
  )
}
