import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportReportPdf(data: any[], title: string, filename: string) {
  if (!data?.length) return
  const doc = new jsPDF()
  const img = new Image()
  img.src = '/logo.png'
  try {
    doc.addImage(img, 'PNG', 14, 10, 120, 60)
  } catch {
    // logo is optional
  }

  doc.setFontSize(18)
  doc.text(title, 14, 85)
  doc.setFontSize(11)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 93)

  const keys = Object.keys(data[0])
  autoTable(doc, {
    head: [keys.map(k => k.replace(/_/g, ' ').toUpperCase())],
    body: data.map(row => keys.map(k => {
      const val = row[k]
      if (typeof val === 'number' && /revenue|sales|amount|cogs|profit/.test(k)) {
        return `Ksh ${Number(val || 0).toFixed(2)}`
      }
      return val
    })),
    startY: 100,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] }
  })
  doc.save(`${filename}.pdf`)
}
