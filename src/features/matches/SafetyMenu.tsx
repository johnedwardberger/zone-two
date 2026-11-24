import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Ban, Flag, MoreHorizontal, UserMinus } from 'lucide-react'
import type { Athlete } from '../../types'
import { Button, ChoiceGroup, Field, Modal, TextArea } from '../../components/ui'
import { useAppStore } from '../../store/store'

const REASONS = [
  'Fake profile or impersonation',
  'Inappropriate photos',
  'Harassment or inappropriate messages',
  'Safety concern',
  'Spam or scam',
  'Something else',
] as const

type Dialog = 'menu' | 'unmatch' | 'block' | 'report' | 'reported' | null

/** Unmatch / Block / Report, each with confirmation. */
export function SafetyMenu({ athlete, matched }: { athlete: Athlete; matched: boolean }) {
  const navigate = useNavigate()
  const unmatch = useAppStore((s) => s.unmatch)
  const block = useAppStore((s) => s.block)
  const report = useAppStore((s) => s.report)
  const toast = useAppStore((s) => s.toast)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [reason, setReason] = useState<string[]>([])
  const [details, setDetails] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const name = athlete.firstName

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="!size-10 !p-0"
        onClick={() => setDialog('menu')}
        aria-label={`Safety options for ${name}`}
        aria-haspopup="dialog"
      >
        <MoreHorizontal className="size-5" aria-hidden />
      </Button>

      <Modal open={dialog === 'menu'} onClose={() => setDialog(null)} title={`${name}`}>
        <div className="flex flex-col gap-2">
          {matched && (
            <Button
              variant="secondary"
              className="!justify-start"
              onClick={() => setDialog('unmatch')}
            >
              <UserMinus className="size-4" aria-hidden /> Unmatch
            </Button>
          )}
          <Button variant="secondary" className="!justify-start" onClick={() => setDialog('block')}>
            <Ban className="size-4" aria-hidden /> Block
          </Button>
          <Button variant="danger" className="!justify-start" onClick={() => setDialog('report')}>
            <Flag className="size-4" aria-hidden /> Report
          </Button>
        </div>
      </Modal>

      <Modal open={dialog === 'unmatch'} onClose={() => setDialog(null)} title={`Unmatch ${name}?`}>
        <p className="text-muted">Your chat will be deleted and you won’t see each other again.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDialog(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              unmatch(athlete.id)
              setDialog(null)
              toast(`You unmatched ${name}.`)
              navigate('/matches')
            }}
          >
            Unmatch
          </Button>
        </div>
      </Modal>

      <Modal open={dialog === 'block'} onClose={() => setDialog(null)} title={`Block ${name}?`}>
        <p className="text-muted">
          {name} will be removed everywhere: Discover, Matches, chat and your feed. They won’t be
          told.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDialog(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              block(athlete.id)
              setDialog(null)
              toast(`${name} is blocked.`)
              navigate('/discover')
            }}
          >
            Block
          </Button>
        </div>
      </Modal>

      <Modal open={dialog === 'report'} onClose={() => setDialog(null)} title={`Report ${name}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!reason.length) {
              setReasonError('Choose a reason.')
              return
            }
            report(athlete.id, reason[0], details.trim() || undefined)
            setDetails('')
            setReason([])
            setDialog('reported')
          }}
        >
          <ChoiceGroup
            legend="What’s wrong?"
            options={REASONS.map((r) => ({ value: r, label: r }))}
            value={reason}
            onChange={(v) => {
              setReason(v)
              setReasonError(null)
            }}
            error={reasonError}
          />
          <Field label="Details (optional)" className="mt-5">
            {(p) => (
              <TextArea
                {...p}
                rows={3}
                maxLength={500}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            )}
          </Field>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button type="submit">Send report</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={dialog === 'reported'}
        onClose={() => setDialog(null)}
        title="Thanks for telling us"
      >
        <p className="text-muted">
          In the real app, our safety team would review this. (This is a demo, so nothing is sent.)
          Do you also want to block {name}?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDialog(null)}>
            Not now
          </Button>
          <Button
            onClick={() => {
              block(athlete.id)
              setDialog(null)
              toast(`${name} is blocked.`)
              navigate('/discover')
            }}
          >
            Block {name}
          </Button>
        </div>
      </Modal>
    </>
  )
}
