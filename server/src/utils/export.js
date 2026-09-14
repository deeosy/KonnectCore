// Export helpers — generate downloadable spreadsheet (XLSX) and CSV files
// from JSON data. Used by report and data-export endpoints.

// Converts JSON data into an Excel workbook buffer and streams it as an
// attachment. Dynamically imports the 'xlsx' library so it is only loaded
// when an export is actually requested.
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

// RFC-4180-style CSV escaping: values containing commas, double-quotes, or
// newlines are wrapped in double-quotes and internal quotes are doubled.
const escapeCsv = (value) => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

// Streams a CSV file as an attachment. The header row is built from the
// `columns` array when provided; otherwise it falls back to the keys of the
// first data row. When `data` is empty and `columns` is supplied, only the
// header row is sent so the file still has a meaningful structure.
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