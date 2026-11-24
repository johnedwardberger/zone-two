import { Plus, Settings, SquarePen } from 'lucide-react'
import { Link } from 'react-router'
import { useDerived } from '../../store/hooks'
import { activitiesOf } from '../../store/selectors'
import { ButtonLink, Card, Page } from '../../components/ui'
import { ActivityItem, ProfileHeader, TrainingSnapshot } from './ProfileView'

export function ProfilePage() {
  const core = useDerived((s) => s)
  const me = core.me!
  const activities = activitiesOf(core, 'me')

  return (
    <Page wide>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-xl font-bold tracking-wide text-muted uppercase">
          Your profile
        </p>
        <Link
          to="/settings"
          className="flex size-11 items-center justify-center rounded-full text-muted hover:bg-hairline/60 hover:text-ink desk:hidden"
          aria-label="Settings"
        >
          <Settings className="size-6" aria-hidden />
        </Link>
      </div>
      <ProfileHeader
        athlete={me}
        units={core.units}
        actions={
          <ButtonLink to="/profile/edit" variant="secondary">
            <SquarePen className="size-4" aria-hidden /> Edit profile
          </ButtonLink>
        }
      />
      <div className="mt-8 space-y-6">
        <TrainingSnapshot activities={activities} units={core.units} />
        <section aria-labelledby="my-acts">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="my-acts" className="font-display text-2xl font-bold uppercase">
              Your activities
            </h2>
            {activities.length > 0 && (
              <ButtonLink to="/post" size="sm">
                <Plus className="size-4" aria-hidden /> Post
              </ButtonLink>
            )}
          </div>
          {activities.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="font-semibold">No activities yet</p>
              <p className="mt-1 text-muted">
                Post a session so your matches can see what you’ve been up to.
              </p>
              <ButtonLink to="/post" className="mt-5">
                <Plus className="size-4" aria-hidden /> Post your first activity
              </ButtonLink>
            </Card>
          ) : (
            <ul className="grid gap-4 desk:grid-cols-2">
              {activities.map((a) => (
                <li key={a.id}>
                  <ActivityItem activity={a} units={core.units} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <div className="h-6" />
    </Page>
  )
}
