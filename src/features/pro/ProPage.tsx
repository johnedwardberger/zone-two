import { useState } from 'react'
import { ArrowLeft, Check, Crown, Eye, Lock, Plane, Rocket, Undo2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAppStore } from '../../store/store'
import { Button, Card, FictionalNote, Modal, Page } from '../../components/ui'
import { Photo } from '../../components/Photo'

const FEATURES = [
  {
    icon: Eye,
    title: 'See who gave you Kudos',
    body: 'Skip the guessing and see everyone who liked your sessions.',
  },
  {
    icon: Undo2,
    title: 'Unlimited undo',
    body: 'Swiped too fast after a long run? Take back as many as you like.',
  },
  {
    icon: Rocket,
    title: 'Boost your activity',
    body: 'Put your latest session at the top of nearby decks for 30 minutes.',
  },
  {
    icon: Plane,
    title: 'Travel mode',
    body: 'Racing somewhere new? Swipe in that city before you arrive.',
  },
]

const PLANS = [
  { id: 'monthly', name: 'Monthly', price: '$14.99', per: '/month', note: 'Cancel anytime' },
  {
    id: 'annual',
    name: 'Annual',
    price: '$89.99',
    per: '/year',
    note: 'Just $7.50/month · save 50%',
    best: true,
  },
]

/** Mock premium upsell. Non-functional: nothing is purchased or unlocked. */
export function ProPage() {
  const navigate = useNavigate()
  const athletes = useAppStore((s) => s.athletes)
  const [modal, setModal] = useState(false)
  const preview = athletes.slice(0, 8)

  return (
    <Page>
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" aria-hidden /> Back
      </Button>

      <section className="overflow-hidden rounded-card bg-celebrate-deep p-6 text-white shadow-lift sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
          <Crown className="size-4" aria-hidden /> Zone Two Pro
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none font-bold uppercase">
          Train smarter. Match faster.
        </h1>
        <p className="mt-3 max-w-md text-white/90">
          More ways to find your training partner, and maybe more.
        </p>
      </section>

      <Card className="mt-6 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-bold uppercase">People who gave you Kudos</h2>
        <p className="mb-4 text-sm text-muted">Pro shows you who they are. Here’s a preview.</p>
        <ul
          className="grid grid-cols-4 gap-3"
          aria-label="Blurred preview of people who gave you Kudos"
        >
          {preview.map((a) => (
            <li
              key={a.id}
              className="relative aspect-square overflow-hidden rounded-2xl bg-hairline"
            >
              <Photo src={a.photos[0]} alt="" className="size-full scale-110 blur-md" />
              <span className="absolute inset-0 flex items-center justify-center">
                <Lock className="size-5 text-white drop-shadow" aria-hidden />
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Card as="li" key={f.title} className="p-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
              <f.icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.body}</p>
          </Card>
        ))}
      </ul>

      <h2 className="mt-10 mb-4 font-display text-3xl font-bold uppercase">Choose a plan</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <Card
            as="li"
            key={p.id}
            className={`relative flex flex-col p-6 ${p.best ? 'ring-2 ring-primary-strong' : ''}`}
          >
            {p.best && (
              <span className="absolute -top-3 left-6 rounded-full bg-primary-strong px-3 py-1 text-xs font-bold text-white">
                Best value
              </span>
            )}
            <h3 className="font-semibold">{p.name}</h3>
            <p className="mt-2 font-display text-5xl font-bold">
              {p.price}
              <span className="ml-1 text-lg text-muted">{p.per}</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Check className="size-4" aria-hidden /> {p.note}
            </p>
            <Button
              className="mt-5"
              variant={p.best ? 'primary' : 'secondary'}
              onClick={() => setModal(true)}
            >
              Upgrade
            </Button>
          </Card>
        ))}
      </ul>
      <p className="mt-4 text-center text-xs text-muted">
        Mock pricing for the demo. No payment is ever taken.
      </p>
      <FictionalNote className="my-6 text-center" />

      <Modal open={modal} onClose={() => setModal(false)} title="Just a demo">
        <p className="text-muted">
          Payments aren’t part of this demo. Nothing has been charged or unlocked.
        </p>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setModal(false)}>Got it</Button>
        </div>
      </Modal>
    </Page>
  )
}
