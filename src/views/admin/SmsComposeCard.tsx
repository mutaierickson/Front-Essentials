import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Megaphone, Send } from 'lucide-react'

type Props = {
  title: string
  onTitle: (value: string) => void
  message: string
  onMessage: (value: string) => void
  extraPhones: string
  onExtraPhones: (value: string) => void
  sendAll: boolean
  onSendAll: (value: boolean) => void
  customerCount: number
  smsCount: number
  estimated: number
  sending: boolean
  loading: boolean
  onSend: () => void
}

export function SmsComposeCard({
  title, onTitle, message, onMessage, extraPhones, onExtraPhones,
  sendAll, onSendAll, customerCount, smsCount, estimated, sending, loading, onSend
}: Props) {
  return (
    <Card className="lg:col-span-3 border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-slate-400" /> Compose offer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Campaign title</Label>
          <Input value={title} onChange={e => onTitle(e.target.value)} className="bg-white border-slate-200" />
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <textarea
            value={message}
            onChange={e => onMessage(e.target.value.slice(0, 480))}
            rows={5}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
          />
          <p className="text-xs text-slate-500">{message.length}/480 characters · {smsCount} SMS unit{smsCount === 1 ? '' : 's'} each</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={sendAll} onChange={e => onSendAll(e.target.checked)} />
          Send to all saved customers ({customerCount})
        </label>
        <div className="space-y-2">
          <Label>Extra numbers (optional)</Label>
          <textarea
            value={extraPhones}
            onChange={e => onExtraPhones(e.target.value)}
            rows={3}
            placeholder="07XX XXX XXX, 07XX XXX XXX"
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
          />
        </div>
        <Button className="bg-slate-800 text-white hover:bg-slate-700 w-full sm:w-auto" onClick={onSend} disabled={sending || loading}>
          <Send className="w-4 h-4 mr-2" />
          {sending ? 'Sending…' : `Send to ${estimated || 0} number${estimated === 1 ? '' : 's'}`}
        </Button>
      </CardContent>
    </Card>
  )
}
