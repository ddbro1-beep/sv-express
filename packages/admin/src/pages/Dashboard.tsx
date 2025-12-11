import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { leadsApi, Lead } from '../api/leads';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadLeads();
  }, [filter]);

  const loadLeads = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await leadsApi.getLeads(params);
      setLeads(response.data.leads);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки заявок');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      new: 'Новая',
      contacted: 'В работе',
      converted: 'Конвертирована',
      lost: 'Потеряна',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await leadsApi.updateLead(leadId, { status: newStatus });
      loadLeads(); // Перезагрузить список
    } catch (err) {
      alert('Ошибка обновления статуса');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SV Express Admin</h1>
            <p className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName} ({user?.email})
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Фильтр по статусу</h2>
          <div className="flex gap-2">
            {['all', 'new', 'contacted', 'converted', 'lost'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Все' : status === 'new' ? 'Новые' : status === 'contacted' ? 'В работе' : status === 'converted' ? 'Конвертированы' : 'Потеряны'}
              </button>
            ))}
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Заявки {leads.length > 0 && `(${leads.length})`}
            </h2>
          </div>

          {error && (
            <div className="p-6 bg-red-50 border-b border-red-200 text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              Загрузка...
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Заявок нет
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Маршрут</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Вес</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{lead.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lead.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lead.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {lead.origin_country?.code} → {lead.destination_country?.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {lead.weight_estimate_kg ? `${lead.weight_estimate_kg} кг` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(lead.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          value={lead.status}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="new">Новая</option>
                          <option value="contacted">В работе</option>
                          <option value="converted">Конвертирована</option>
                          <option value="lost">Потеряна</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
