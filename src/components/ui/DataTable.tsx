import type { ReactNode } from 'react';

export interface DataColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  caption?: string;
  compact?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  compact = false,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded border border-border bg-surface ${className}`}>
      <table className="w-full border-collapse text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border bg-subtle text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`${compact ? 'px-2.5 py-2' : 'px-3.5 py-2.5'} ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, idx) => (
            <tr key={rowKey(row, idx)} className="hover:bg-subtle/50">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2.5'} ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  }`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

