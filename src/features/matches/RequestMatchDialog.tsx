import { useState } from 'react'
import { Send } from 'lucide-react'
import type { Athlete } from '../../types'
import { Button, Field, Modal, TextArea } from '../../components/ui'
import { useAppStore } from '../../store/store'

/** Optional-note match request dialog (note max 140 chars). */
export function RequestMatchDialog({
  athlete,
  open,
  onClose,
}: {
  athlete: Athlete
  open: boolean
  onClose: () => void
}) {
  const send = useAppStore((s) => s.sendMatchRequest)
  const [note, setNote] = useState('')
  return (
    <Modal open={open} onClose={onClose} title={`Request to match with ${athlete.firstName}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(athlete.id, note)
          setNote('')
          onClose()
        }}
      >
        <p className="mb-4 text-muted">
          You both sent each other a Pulse. Send a request, and if {athlete.firstName} accepts, you
          can chat and plan a workout date.
        </p>
        <Field label="Add a note (optional)" hint={`${note.length}/140`}>
          {(p) => (
            <TextArea
              {...p}
              rows={3}
              maxLength={140}
              placeholder={`e.g. Easy miles this weekend?`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          )}
        </Field>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Send className="size-4" aria-hidden /> Send request
          </Button>
        </div>
      </form>
    </Modal>
  )
}
