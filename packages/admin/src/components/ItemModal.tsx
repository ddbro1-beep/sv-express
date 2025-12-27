import React, { useEffect, useState } from 'react';
import Timeline from './Timeline';
import { Lead } from '../api/leads';
import { Order, OrderItem } from '../api/orders';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lead' | 'order';
  item: Lead | Order | null;
  onStatusChange: (newStatus: string) => void;
  onSave: (updates: Partial<Lead> | Partial<Order>) => Promise<void>;
  statusOptions: { value: string; label: string }[];
}

const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  onStatusChange,
  onSave,
  statusOptions,
}) => {
  const [editedData, setEditedData] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset edited data when item changes
  useEffect(() => {
    if (item) {
      setEditedData({});
      setHasChanges(false);
    }
  }, [item?.id]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const isLead = type === 'lead';
  const lead = isLead ? (item as Lead) : null;
  const order = !isLead ? (item as Order) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getValue = (key: string, defaultValue: unknown = '') => {
    if (key in editedData) {
      return editedData[key];
    }
    return (item as Record<string, unknown>)[key] ?? defaultValue;
  };

  const handleFieldChange = (key: string, value: unknown) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      await onSave(editedData);
      setEditedData({});
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemsChange = (items: OrderItem[]) => {
    handleFieldChange('items', items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {isLead ? '📋' : '📦'}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isLead ? 'Заявка' : 'Заказ'} #{item.id.slice(0, 8)}
              </h2>
              <p className="text-sm text-gray-500">
                Создано: {formatDate(item.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* PDF Button for Orders */}
            {!isLead && (
              <button
                onClick={() => {
                  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                  const token = localStorage.getItem('sv-admin-token');
                  window.open(`${baseUrl}/orders/${item.id}/pdf?token=${token}`, '_blank');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Декларация PDF
              </button>
            )}
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Editable Data */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-xs">
                📋
              </span>
              Данные
              {hasChanges && <span className="text-xs text-orange-500">(есть изменения)</span>}
            </h3>

            {/* Status Selector */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Статус
              </label>
              <select
                value={item.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lead Fields */}
            {isLead && lead && (
              <div className="space-y-4">
                <FieldGroup title="Контактная информация">
                  <EditableField
                    label="Имя"
                    value={getValue('name', '') as string}
                    onChange={(val) => handleFieldChange('name', val)}
                  />
                  <EditableField
                    label="Email"
                    value={getValue('email', '') as string}
                    onChange={(val) => handleFieldChange('email', val)}
                    type="email"
                  />
                  <EditableField
                    label="Телефон"
                    value={getValue('phone', '') as string}
                    onChange={(val) => handleFieldChange('phone', val)}
                    type="tel"
                  />
                </FieldGroup>

                <FieldGroup title="Маршрут">
                  <EditableField
                    label="Откуда (код страны)"
                    value={lead.origin_country?.code || ''}
                    onChange={(val) => handleFieldChange('origin_country_code', val)}
                    placeholder="FR, DE, RU..."
                  />
                  <EditableField
                    label="Куда (код страны)"
                    value={lead.destination_country?.code || ''}
                    onChange={(val) => handleFieldChange('destination_country_code', val)}
                    placeholder="FR, DE, RU..."
                  />
                </FieldGroup>

                <FieldGroup title="Посылка">
                  <EditableField
                    label="Вес (кг)"
                    value={getValue('weight_estimate_kg', '') as string}
                    onChange={(val) => handleFieldChange('weight_estimate_kg', val ? parseFloat(val) : null)}
                    type="number"
                  />
                  <EditableField
                    label="Тип"
                    value={getValue('shipment_type', '') as string}
                    onChange={(val) => handleFieldChange('shipment_type', val)}
                    placeholder="documents, parcel..."
                  />
                </FieldGroup>

                <FieldGroup title="Сообщение">
                  <textarea
                    value={getValue('message', '') as string}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Сообщение от клиента..."
                  />
                </FieldGroup>
              </div>
            )}

            {/* Order Fields */}
            {!isLead && order && (
              <div className="space-y-4">
                <FieldGroup title="Отправитель">
                  <EditableField
                    label="Имя"
                    value={getValue('sender_name', '') as string}
                    onChange={(val) => handleFieldChange('sender_name', val)}
                  />
                  <EditableField
                    label="Email"
                    value={getValue('sender_email', '') as string}
                    onChange={(val) => handleFieldChange('sender_email', val)}
                    type="email"
                  />
                  <EditableField
                    label="Телефон"
                    value={getValue('sender_phone', '') as string}
                    onChange={(val) => handleFieldChange('sender_phone', val)}
                    type="tel"
                  />
                  <EditableField
                    label="Страна"
                    value={getValue('sender_country', '') as string}
                    onChange={(val) => handleFieldChange('sender_country', val)}
                  />
                  <EditableField
                    label="Город"
                    value={getValue('sender_city', '') as string}
                    onChange={(val) => handleFieldChange('sender_city', val)}
                  />
                  <EditableField
                    label="Адрес"
                    value={getValue('sender_address', '') as string}
                    onChange={(val) => handleFieldChange('sender_address', val)}
                  />
                  <EditableField
                    label="Индекс"
                    value={getValue('sender_postcode', '') as string}
                    onChange={(val) => handleFieldChange('sender_postcode', val)}
                  />
                </FieldGroup>

                <FieldGroup title="Получатель">
                  <EditableField
                    label="Имя"
                    value={getValue('recipient_name', '') as string}
                    onChange={(val) => handleFieldChange('recipient_name', val)}
                  />
                  <EditableField
                    label="Телефон"
                    value={getValue('recipient_phone', '') as string}
                    onChange={(val) => handleFieldChange('recipient_phone', val)}
                    type="tel"
                  />
                  <EditableField
                    label="Страна"
                    value={getValue('recipient_country', '') as string}
                    onChange={(val) => handleFieldChange('recipient_country', val)}
                  />
                  <EditableField
                    label="Регион"
                    value={getValue('recipient_region', '') as string}
                    onChange={(val) => handleFieldChange('recipient_region', val)}
                  />
                  <EditableField
                    label="Город"
                    value={getValue('recipient_city', '') as string}
                    onChange={(val) => handleFieldChange('recipient_city', val)}
                  />
                  <EditableField
                    label="Улица"
                    value={getValue('recipient_street', '') as string}
                    onChange={(val) => handleFieldChange('recipient_street', val)}
                  />
                  <EditableField
                    label="Дом"
                    value={getValue('recipient_house', '') as string}
                    onChange={(val) => handleFieldChange('recipient_house', val)}
                  />
                  <EditableField
                    label="Квартира"
                    value={getValue('recipient_apartment', '') as string}
                    onChange={(val) => handleFieldChange('recipient_apartment', val)}
                  />
                  <EditableField
                    label="Индекс"
                    value={getValue('recipient_postcode', '') as string}
                    onChange={(val) => handleFieldChange('recipient_postcode', val)}
                  />
                  <EditableField
                    label="Служба доставки"
                    value={getValue('recipient_delivery_service', '') as string}
                    onChange={(val) => handleFieldChange('recipient_delivery_service', val)}
                  />
                </FieldGroup>

                <FieldGroup title="Посылка">
                  <EditableField
                    label="Вес (кг)"
                    value={getValue('weight_kg', '') as string}
                    onChange={(val) => handleFieldChange('weight_kg', val ? parseFloat(val) : null)}
                    type="number"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <EditableField
                      label="Длина (см)"
                      value={getValue('length_cm', '') as string}
                      onChange={(val) => handleFieldChange('length_cm', val ? parseFloat(val) : null)}
                      type="number"
                    />
                    <EditableField
                      label="Ширина (см)"
                      value={getValue('width_cm', '') as string}
                      onChange={(val) => handleFieldChange('width_cm', val ? parseFloat(val) : null)}
                      type="number"
                    />
                    <EditableField
                      label="Высота (см)"
                      value={getValue('height_cm', '') as string}
                      onChange={(val) => handleFieldChange('height_cm', val ? parseFloat(val) : null)}
                      type="number"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Способ забора</label>
                    <select
                      value={getValue('collection_method', 'self') as string}
                      onChange={(e) => handleFieldChange('collection_method', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="self">Самостоятельно</option>
                      <option value="courier">Курьер</option>
                    </select>
                  </div>
                  <EditableField
                    label="Дата забора"
                    value={getValue('collection_date', '') as string}
                    onChange={(val) => handleFieldChange('collection_date', val)}
                    type="date"
                  />
                </FieldGroup>

                <FieldGroup title="Содержимое">
                  <OrderItemsEditor
                    items={(getValue('items', []) as OrderItem[]) || []}
                    onChange={handleItemsChange}
                  />
                </FieldGroup>

                <FieldGroup title="Опции">
                  <div className="space-y-2">
                    <CheckboxField
                      label="Оферта принята"
                      checked={getValue('agree_terms', false) as boolean}
                      onChange={(val) => handleFieldChange('agree_terms', val)}
                    />
                    <CheckboxField
                      label="Согласие на доплату за вес"
                      checked={getValue('agree_overweight', false) as boolean}
                      onChange={(val) => handleFieldChange('agree_overweight', val)}
                    />
                    <CheckboxField
                      label="Страховка"
                      checked={getValue('agree_insurance', false) as boolean}
                      onChange={(val) => handleFieldChange('agree_insurance', val)}
                    />
                  </div>
                </FieldGroup>
              </div>
            )}
          </div>

          {/* Right Panel - Timeline */}
          <div className="w-80 flex-shrink-0 overflow-y-auto p-6 bg-gray-50">
            <Timeline
              entityType={type}
              entityId={item.id}
              createdAt={item.created_at}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const FieldGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">{title}</h4>
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
      {children}
    </div>
  </div>
);

interface EditableFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date';
  placeholder?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

interface OrderItemsEditorProps {
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
}

const OrderItemsEditor: React.FC<OrderItemsEditorProps> = ({ items, onChange }) => {
  const addItem = () => {
    onChange([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start bg-gray-50 p-2 rounded">
          <div className="flex-1">
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(idx, 'description', e.target.value)}
              placeholder="Описание"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div className="w-16">
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
              placeholder="Кол-во"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              min="1"
            />
          </div>
          <div className="w-20">
            <input
              type="number"
              value={item.price}
              onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
              placeholder="Цена"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              min="0"
              step="0.01"
            />
          </div>
          <button
            onClick={() => removeItem(idx)}
            className="p-1 text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50"
      >
        + Добавить товар
      </button>
    </div>
  );
};

export default ItemModal;
