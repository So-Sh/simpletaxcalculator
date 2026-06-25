// components/blog/DataTable.tsx

interface DataTableColumn {
  label: string
  align?: 'left' | 'right'
}

interface DataTableProps {
  columns?: DataTableColumn[]
  rows?: (string | number)[][]
  caption?: string
  highlightFirstRow?: boolean
  data?: string // Add this new prop
}

export function DataTable({ 
  columns: initialColumns, 
  rows: initialRows, 
  caption, 
  highlightFirstRow = false,
  data 
}: DataTableProps) {
  
  let columns = initialColumns || []
  let rows = initialRows || []

  // If data string is provided, parse it securely
  if (data) {
    try {
      const parsed = JSON.parse(data)
      columns = parsed.columns || []
      rows = parsed.rows || []
    } catch (e) {
      console.error("Failed to parse DataTable JSON data", e)
    }
  }

  // Safety guard: if nothing loaded, don't crash the page
  if (!columns.length || !rows.length) {
    return (
      <div className="p-4 border border-dashed border-red-500 rounded text-xs text-red-500 bg-red-50/50">
        Table failed to load. Check JSON syntax.
      </div>
    )
  }

  return (
    <div className="not-prose my-6">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`py-2.5 px-4 text-xs font-semibold text-muted uppercase tracking-wider
                    ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-border last:border-0
                  ${i % 2 === 0 ? 'bg-surface' : 'bg-bg/60'}
                  ${highlightFirstRow && i === 0 ? 'bg-accent/5' : ''}`}
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`py-2.5 px-4 font-mono text-body
                      ${columns[j]?.align === 'right' ? 'text-right' : 'text-left font-sans font-medium'}
                      ${highlightFirstRow && i === 0 ? 'font-semibold text-primary' : ''}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <p className="text-xs text-muted mt-2 px-1">{caption}</p>
      )}
    </div>
  )
}