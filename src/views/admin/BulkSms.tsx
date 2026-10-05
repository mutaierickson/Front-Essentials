import React from 'react'
import { useBulkSmsController } from '@/controllers/useBulkSmsController'
import { SmsBalanceCard } from './SmsBalanceCard'
import { SmsComposeCard } from './SmsComposeCard'
import { SmsAddCustomerCard, SmsCustomerTable } from './SmsCustomersPanel'
import { SmsCampaignsCard } from './SmsCampaignsCard'

export default function BulkSms() {
  const sms = useBulkSmsController()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Bulk SMS</h2>
          <p className="text-slate-500 mt-1">Send new offers to saved customers and extra numbers.</p>
        </div>
        <SmsBalanceCard status={sms.status} unitsNeeded={sms.unitsNeeded} refreshing={sms.refreshing} onRefresh={sms.refreshBalance} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <SmsComposeCard
          title={sms.title}
          onTitle={sms.setTitle}
          message={sms.message}
          onMessage={sms.setMessage}
          extraPhones={sms.extraPhones}
          onExtraPhones={sms.setExtraPhones}
          sendAll={sms.sendAll}
          onSendAll={sms.setSendAll}
          customerCount={sms.customers.length}
          smsCount={sms.smsCount}
          estimated={sms.estimated}
          sending={sms.sending}
          loading={sms.loading}
          onSend={sms.sendSms}
        />
        <SmsAddCustomerCard
          newName={sms.newName}
          onNewName={sms.setNewName}
          newPhone={sms.newPhone}
          onNewPhone={sms.setNewPhone}
          onAdd={sms.addCustomer}
        />
      </div>

      <SmsCustomerTable
        loading={sms.loading}
        customers={sms.customers}
        sendAll={sms.sendAll}
        selected={sms.selected}
        onToggle={sms.toggleCustomer}
        onRemove={sms.removeCustomer}
      />
      <SmsCampaignsCard campaigns={sms.campaigns} />
    </div>
  )
}
