import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '@/contexts/AuthContext'
import { Customer, deleteCustomer, listCustomers, saveCustomer } from '@/models/customerModel'
import { getSmsStatus, listCampaigns, remainingFrom, sendBulkSms, SmsCampaign, SmsStatus, unconfiguredStatus } from '@/models/smsModel'

const OFFER_TEMPLATE = 'Hello from Essentials by Ed. New offer in store today — come through and check it out.'

export function useBulkSmsController() {
  const { profile } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([])
  const [status, setStatus] = useState<SmsStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sending, setSending] = useState(false)
  const [title, setTitle] = useState('New offer')
  const [message, setMessage] = useState(OFFER_TEMPLATE)
  const [extraPhones, setExtraPhones] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [sendAll, setSendAll] = useState(true)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const load = async () => {
    try {
      const [nextCustomers, nextCampaigns] = await Promise.all([listCustomers(), listCampaigns()])
      setCustomers(nextCustomers)
      setCampaigns(nextCampaigns)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
    getSmsStatus().then(setStatus).catch(() => setStatus(unconfiguredStatus))
  }

  const refreshBalance = async () => {
    setRefreshing(true)
    try {
      setStatus(await getSmsStatus())
    } catch {
      setStatus(unconfiguredStatus)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const timer = setInterval(() => { refreshBalance() }, 60_000)
    return () => clearInterval(timer)
  }, [])

  const smsCount = message.length <= 160 ? 1 : message.length <= 320 ? 2 : 3
  const selectedCount = sendAll ? customers.length : selected.length
  const extraCount = extraPhones.split(/[\s,;]+/).filter(Boolean).length
  const estimated = selectedCount + extraCount
  const unitsNeeded = (estimated || 0) * smsCount
  const remainingLabel = remainingFrom(status)

  const toggleCustomer = (id: number) => {
    setSendAll(false)
    setSelected(prev => prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id])
  }

  const addCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await saveCustomer(newName, newPhone, profile?.id)
      setNewName('')
      setNewPhone('')
      await load()
      await Swal.fire({ icon: 'success', title: 'Customer saved', timer: 1200, showConfirmButton: false })
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Could not save', text: error.message, confirmButtonColor: '#1e293b' })
    }
  }

  const removeCustomer = async (customer: Customer) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Remove this number?',
      text: customer.phone,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Remove'
    })
    if (!result.isConfirmed) return
    await deleteCustomer(customer.id, profile?.id)
    setSelected(prev => prev.filter(id => id !== customer.id))
    await load()
  }

  const sendSms = async () => {
    if (!message.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Message required', confirmButtonColor: '#1e293b' })
      return
    }
    if (remainingLabel != null && unitsNeeded > remainingLabel) {
      await Swal.fire({
        icon: 'warning',
        title: 'Not enough SMS remaining',
        text: `This send needs about ${unitsNeeded} units. Your account shows ${remainingLabel} remaining.`,
        confirmButtonColor: '#1e293b'
      })
      return
    }
    const result = await Swal.fire({
      icon: 'question',
      title: 'Send this offer?',
      html: `<p>${estimated || 'the selected'} recipient${estimated === 1 ? '' : 's'} will get this SMS.</p><p class="text-sm mt-2">${message.replace(/</g, '&lt;')}</p>`,
      showCancelButton: true,
      confirmButtonColor: '#1e293b',
      confirmButtonText: 'Send SMS'
    })
    if (!result.isConfirmed) return
    setSending(true)
    try {
      const sent = await sendBulkSms({
        title,
        message,
        send_all: sendAll,
        customer_ids: sendAll ? [] : selected,
        extra_phones: extraPhones,
        user_id: profile?.id
      })
      await load()
      if (sent.remaining != null) {
        const remaining = sent.remaining
        setStatus(prev => prev
          ? { ...prev, remaining, balance: remaining, error: undefined }
          : { configured: true, remaining, balance: remaining, shortcode: null })
      }
      await Swal.fire({
        icon: sent.failed_count && !sent.sent_count ? 'error' : sent.failed_count ? 'warning' : 'success',
        title: sent.failed_count && !sent.sent_count ? 'SMS not sent' : 'Offer sent',
        text: `${sent.sent_count} delivered · ${sent.failed_count} failed${sent.remaining != null ? ` · ${sent.remaining} SMS remaining` : ''}${sent.invalid?.length ? `. Skipped: ${sent.invalid.join(', ')}` : ''}`,
        confirmButtonColor: '#1e293b'
      })
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Could not send SMS', text: error.message, confirmButtonColor: '#1e293b' })
    } finally {
      setSending(false)
    }
  }

  return {
    customers, campaigns, status, loading, refreshing, sending,
    title, setTitle, message, setMessage, extraPhones, setExtraPhones,
    selected, sendAll, setSendAll, newName, setNewName, newPhone, setNewPhone,
    smsCount, estimated, unitsNeeded,
    refreshBalance, toggleCustomer, addCustomer, removeCustomer, sendSms
  }
}
