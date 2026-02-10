import React from 'react';

interface ListViewColumn<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  width?: string; // Tailwind class like 'w-48', 'w-32', etc.
}

interface ListViewProps<T> {
  items: T[];
  columns: ListViewColumn<T>[];
  onItemClick: (item: T) => void;
  getItemKey: (item: T) => string;
  isLoading?: boolean;
}

function ListView<T>({ items, columns, onItemClick, getItemKey, isLoading }: ListViewProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Пусто</h3>
        <p className="text-gray-500">Здесь пока нет элементов</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr
                key={getItemKey(item)}
                onClick={() => onItemClick(item)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${column.width || ''}`}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {items.map((item) => (
          <div
            key={getItemKey(item)}
            onClick={() => onItemClick(item)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100 touch-manipulation"
          >
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key}>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                    {column.label}
                  </div>
                  <div className="text-sm text-gray-900">
                    {column.render(item)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListView;
