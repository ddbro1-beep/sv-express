import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import KanbanBoard, { KanbanColumn } from '../components/KanbanBoard';
import ListView from '../components/ListView';
import ViewToggle from '../components/ViewToggle';
import ItemModal from '../components/ItemModal';
import { leadsApi, Lead } from '../api/leads';

const LEAD_COLUMNS: KanbanColumn[] = [
  { key: 'new', label: 'Новые', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { key: 'contacted', label: 'В работе', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { key: 'converted', label: 'Конвертированы', color: 'text-green-700', bgColor: 'bg-green-100' },
  { key: 'lost', label: 'Потеряны', color: 'text-red-700', bgColor: 'bg-red-100' },
];

const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'Новая' },
  { value: 'contacted', label: 'В работе' },
  { value: 'converted', label: 'Конвертирована' },
  { value: 'lost', label: 'Потеряна' },
];

// Status badge configuration
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Новая' },
  contacted: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'В работе' },
  converted: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Конвертирована' },
  lost: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Потеряна' },
};

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'kanban' | 'list'>(() => {
    const saved = localStorage.getItem('leads-view');
    return (saved === 'kanban' || saved === 'list') ? saved : 'list';
  });

  useEffect(() => {
    loadLeads();
  }, []);

  // Open lead from URL parameter (?lead=ID)
  useEffect(() => {
    const leadId = searchParams.get('lead');
    if (leadId && leads.length > 0) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setSelectedLead(lead);
        setIsModalOpen(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [leads, searchParams]);

  const loadLeads = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await leadsApi.getLeads();
      setLeads(response.data.leads);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки заявок';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await leadsApi.updateLead(leadId, { status: newStatus });
      // Update local state
      setLeads(leads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      // Update selected lead if it's the one being changed
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
      toast.success('Статус обновлён');
    } catch (err) {
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleItemClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleSave = async (updates: Partial<Lead>) => {
    if (!selectedLead) return;
    await leadsApi.updateLead(selectedLead.id, updates);
    // Update local state
    const updatedLead = { ...selectedLead, ...updates };
    setLeads(leads.map(lead =>
      lead.id === selectedLead.id ? updatedLead : lead
    ));
    setSelectedLead(updatedLead);
  };

  const handleDelete = async (id: string) => {
    await leadsApi.deleteLead(id);
    // Remove from local state
    setLeads(leads.filter(lead => lead.id !== id));
  };

  const handleViewChange = (newView: 'kanban' | 'list') => {
    setView(newView);
    localStorage.setItem('leads-view', newView);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Country code to flag emoji
  const getCountryFlag = (code?: string) => {
    if (!code) return '🌍';
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const renderLeadCard = (lead: Lead) => {
    const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;

    return (
      <div className="space-y-3">
        {/* Header Row: Status Badge + Date */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(lead.created_at)}
          </span>
        </div>

        {/* Name */}
        <div>
          <p className="font-semibold text-gray-900 text-base truncate">
            {lead.name || 'Без имени'}
          </p>
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {lead.phone || lead.email || '—'}
          </p>
        </div>

        {/* Route & Weight Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">{getCountryFlag(lead.origin_country?.code)}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="text-xl">{getCountryFlag(lead.destination_country?.code)}</span>
          </div>
          {lead.weight_estimate_kg && (
            <span className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded">
              ~{lead.weight_estimate_kg} кг
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Заявки</h1>
          <p className="text-sm sm:text-base text-gray-600">Заявки на расчёт стоимости с лендинга</p>
        </div>
        <ViewToggle view={view} onChange={handleViewChange} />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {view === 'kanban' ? (
        <KanbanBoard
          items={leads}
          columns={LEAD_COLUMNS}
          getItemStatus={(lead) => lead.status}
          onStatusChange={handleStatusChange}
          onItemClick={handleItemClick}
          renderCard={renderLeadCard}
          isLoading={isLoading}
        />
      ) : (
        <ListView
          items={leads}
          columns={[
            {
              key: 'status',
              label: 'Статус',
              width: 'w-40',
              render: (lead) => {
                const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                    {statusConfig.label}
                  </span>
                );
              },
            },
            {
              key: 'contact',
              label: 'Контакт',
              render: (lead) => (
                <div>
                  <p className="font-medium text-gray-900">{lead.name || 'Без имени'}</p>
                  <p className="text-xs text-gray-500">{lead.phone || lead.email || '—'}</p>
                </div>
              ),
            },
            {
              key: 'route',
              label: 'Маршрут',
              width: 'w-48',
              render: (lead) => (
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getCountryFlag(lead.origin_country?.code)}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-xl">{getCountryFlag(lead.destination_country?.code)}</span>
                </div>
              ),
            },
            {
              key: 'weight',
              label: 'Вес',
              width: 'w-24',
              render: (lead) => (
                <span className="text-gray-900">
                  {lead.weight_estimate_kg ? `~${lead.weight_estimate_kg} кг` : '—'}
                </span>
              ),
            },
            {
              key: 'date',
              label: 'Дата',
              width: 'w-32',
              render: (lead) => (
                <span className="text-gray-500">{formatDate(lead.created_at)}</span>
              ),
            },
          ]}
          onItemClick={handleItemClick}
          getItemKey={(lead) => lead.id}
          isLoading={isLoading}
        />
      )}

      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type="lead"
        item={selectedLead}
        onStatusChange={(newStatus) => {
          if (selectedLead) {
            handleStatusChange(selectedLead.id, newStatus);
          }
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        statusOptions={LEAD_STATUS_OPTIONS}
      />
    </Layout>
  );
};

export default Dashboard;
