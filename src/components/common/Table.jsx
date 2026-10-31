import React from 'react';

const Table = ({
  columns = [],
  data = [],
  keyExtractor = (item, index) => item._id || item.id || index,
  isLoading = false,
  emptyMessage = 'No records found',
  onRowClick,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-solar-border bg-white shadow-card ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-solar-border bg-slate-50/80 text-solar-text-muted text-[11px] uppercase tracking-wider font-semibold">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-solar-border text-solar-text">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-solar-text-muted">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-6 h-6 border-2 border-solar-secondary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-solar-text-muted text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`py-3.5 px-4 text-xs font-normal align-middle ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(item, rowIdx) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
