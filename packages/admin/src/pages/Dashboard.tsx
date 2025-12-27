import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import KanbanBoard, { KanbanColumn } from '../components/KanbanBoard';
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

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

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
    } catch (err) {
      alert('Ошибка обновления статуса');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const renderLeadCard = (lead: Lead) => (
    <div className="space-y-1">
      <p className="font-medium text-gray-900 text-sm truncate">
        {lead.name || 'Без имени'}
      </p>
      <p className="text-xs text-gray-500 truncate">
        {lead.email || lead.phone || '—'}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {lead.origin_country?.code || '?'} → {lead.destination_country?.code || '?'}
        </span>
        <span>
          {lead.weight_estimate_kg ? `${lead.weight_estimate_kg} кг` : ''}
        </span>
      </div>
      <p className="text-xs text-gray-400">
        {formatDate(lead.created_at)}
      </p>
    </div>
  );

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Заявки</h1>
        <p className="text-gray-600">Заявки на расчёт стоимости с лендинга</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <KanbanBoard
        items={leads}
        columns={LEAD_COLUMNS}
        getItemStatus={(lead) => lead.status}
        onStatusChange={handleStatusChange}
        onItemClick={handleItemClick}
        renderCard={renderLeadCard}
        isLoading={isLoading}
      />

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
        statusOptions={LEAD_STATUS_OPTIONS}
      />
    </Layout>
  );
};

export default Dashboard;
