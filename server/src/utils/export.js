export async function sendXlsx(res, data, sheetName, filename) {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  return res.send(buf)
}

const escapeCsv = (value) => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function sendCsv(res, data, filename, columns) {
  const headers = columns && columns.length ? columns : Object.keys(data[0] || {})
  const rows = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => escapeCsv(row[h])).join(',')),
  ]
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  return res.send(rows.join('\r\n'))
}