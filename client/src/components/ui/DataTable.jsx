import { useMemo } from 'react'
import EmptyState from './EmptyState'

export default function DataTable({
  columns = [],
  data = [],
  emptyTitle = 'No records',
  emptyDescription = 'No data available yet.',
  onRowClick,
}) {
  const rows = useMemo(() => data, [data])

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-subtle/50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr
                  key={row._id || rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors hover:bg-primary-50/30 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${rowIdx % 2 === 1 ? 'bg-subtle/20' : ''}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="whitespace-nowrap px-5 py-3.5 text-sm text-dark">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
