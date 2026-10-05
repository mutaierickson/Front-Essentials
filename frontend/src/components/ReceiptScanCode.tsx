import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { code128Path } from '@/lib/code128'

export function ReceiptScanCode({ code }: { code: string }) {
  const [qr, setQr] = useState('')
  const barcode = code128Path(code)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(code, {
      width: 168,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' }
    }).then((url) => {
      if (!cancelled) setQr(url)
    }).catch(() => {
      if (!cancelled) setQr('')
    })
    return () => { cancelled = true }
  }, [code])

  return (
    <div className="mt-6 pt-4 border-t border-dashed border-slate-300 text-center receipt-scan">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Scan for returns</p>
      <p className="font-mono text-lg font-bold tracking-[0.22em] text-slate-800">{code}</p>
      <svg
        className="w-full max-w-[260px] h-14 mx-auto mt-3"
        viewBox={`0 0 ${barcode.width} 60`}
        role="img"
        aria-label={code}
      >
        <rect width={barcode.width} height="60" fill="#fff" />
        <path d={barcode.d} fill="#0f172a" />
      </svg>
      {qr && <img src={qr} alt={`QR ${code}`} className="w-28 h-28 mx-auto mt-3 bg-white" />}
      <p className="text-[10px] text-slate-500 mt-2">Keep this receipt. Staff will scan this code for complaints or returns.</p>
    </div>
  )
}
