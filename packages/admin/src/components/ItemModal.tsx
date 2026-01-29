import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Timeline from './Timeline';
import { Lead } from '../api/leads';
import { Order, OrderItem, ordersApi } from '../api/orders';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lead' | 'order';
  item: Lead | Order | null;
  onStatusChange: (newStatus: string) => void;
  onSave: (updates: Partial<Lead> | Partial<Order>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  statusOptions: { value: string; label: string }[];
}

const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  onStatusChange,
  onSave,
  onDelete,
  statusOptions,
}) => {
  const [editedData, setEditedData] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset edited data when item changes
  useEffect(() => {
    if (item) {
      setEditedData({});
      setHasChanges(false);
    }
  }, [item?.id]);

  // Memoize the escape handler to prevent unnecessary re-renders
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEsc]);

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
    return (item as unknown as Record<string, unknown>)[key] ?? defaultValue;
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
      toast.success('Изменения сохранены');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemsChange = (items: OrderItem[]) => {
    handleFieldChange('items', items);
  };

  const handleDelete = async () => {
    if (!item || !onDelete) return;
    if (!window.confirm(`Удалить ${type === 'lead' ? 'заявку' : 'заказ'}? Это действие необратимо.`)) return;

    setIsDeleting(true);
    try {
      await onDelete(item.id);
      toast.success(`${type === 'lead' ? 'Заявка' : 'Заказ'} удалён`);
      onClose();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Ошибка удаления');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Full screen on mobile, centered on larger screens */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col sm:m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg flex-shrink-0">
              {isLead ? '📋' : '📦'}
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {isLead ? 'Заявка' : 'Заказ'} #{item.id.slice(0, 8)}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Создано: {formatDate(item.created_at)}
              </p>
            </div>
          </div>

          {/* Mobile-friendly action buttons */}
          <div className="flex items-center gap-2">
            {/* Delete Button - Icon only on mobile */}
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="min-h-[44px] min-w-[44px] px-3 sm:px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 active:bg-red-300 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                aria-label="Удалить"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">{isDeleting ? 'Удаление...' : 'Удалить'}</span>
              </button>
            )}
            {/* PDF Button for Orders */}
            {!isLead && (
              <button
                onClick={async () => {
                  try {
                    await ordersApi.openOrderPdf(item.id);
                  } catch (error) {
                    console.error('Error opening PDF:', error);
                    toast.error('Ошибка открытия PDF. Разрешите всплывающие окна для этого сайта.');
                  }
                }}
                className="min-h-[44px] min-w-[44px] px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                aria-label="Скачать таможенную декларацию в формате PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 transition-colors touch-manipulation"
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            )}
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Stack on mobile, side-by-side on larger screens */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
          {/* Left Panel - Editable Data */}
          <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 lg:border-r border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-sm">
                📋
              </span>
              Данные
              {hasChanges && <span className="text-xs text-orange-500">(есть изменения)</span>}
            </h3>

            {/* Status Selector */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                Статус
              </label>
              <select
                value={item.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                    label="Адрес (доп.)"
                    value={getValue('sender_address2', '') as string}
                    onChange={(val) => handleFieldChange('sender_address2', val)}
                    placeholder="Квартира, этаж, подъезд..."
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
                    <label className="block text-xs font-medium text-gray-500 mb-2">Способ забора</label>
                    <select
                      value={getValue('collection_method', 'self') as string}
                      onChange={(e) => handleFieldChange('collection_method', e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 touch-manipulation"
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
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Время забора</label>
                    <select
                      value={getValue('collection_time', '') as string}
                      onChange={(e) => handleFieldChange('collection_time', e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 touch-manipulation"
                    >
                      <option value="">Не указано</option>
                      <option value="morning">Утро (09:00-12:00)</option>
                      <option value="afternoon">День (12:00-18:00)</option>
                    </select>
                  </div>
                </FieldGroup>

                <FieldGroup title="Содержимое">
                  <OrderItemsEditor
                    items={(getValue('items', []) as OrderItem[]) || []}
                    onChange={handleItemsChange}
                  />
                </FieldGroup>

                <FieldGroup title="Оплата">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Способ оплаты</label>
                    <select
                      value={getValue('payment_method', '') as string}
                      onChange={(e) => handleFieldChange('payment_method', e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 touch-manipulation"
                    >
                      <option value="">Не указан</option>
                      <option value="cash">Наличные</option>
                      <option value="card">Карта</option>
                      <option value="transfer">Перевод</option>
                    </select>
                  </div>
                </FieldGroup>

                <FieldGroup title="Опции">
                  <div className="space-y-3">
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

          {/* Right Panel - Timeline - Full width on mobile, sidebar on larger screens */}
          <div className="w-full lg:w-80 flex-shrink-0 lg:overflow-y-auto p-4 sm:p-6 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200">
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
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3">
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
      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
    />
  </div>
);

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer min-h-[44px] touch-manipulation">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <span className="text-base text-gray-700">{label}</span>
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
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start bg-gray-50 p-3 rounded-lg">
          <div className="flex-1">
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(idx, 'description', e.target.value)}
              placeholder="Описание"
              className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg touch-manipulation"
            />
          </div>
          <div className="flex gap-2">
            <div className="w-20">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                placeholder="Кол-во"
                className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg touch-manipulation"
                min="1"
              />
            </div>
            <div className="w-24">
              <input
                type="number"
                value={item.price}
                onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                placeholder="Цена"
                className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg touch-manipulation"
                min="0"
                step="0.01"
              />
            </div>
            <button
              onClick={() => removeItem(idx)}
              className="min-h-[44px] min-w-[44px] p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center justify-center touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full min-h-[48px] py-3 text-base text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 active:bg-blue-100 touch-manipulation"
      >
        + Добавить товар
      </button>
    </div>
  );
};

export default ItemModal;
