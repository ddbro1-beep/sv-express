import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import KanbanBoard, { KanbanColumn } from '../components/KanbanBoard';
import ItemModal from '../components/ItemModal';
import { ordersApi, Order } from '../api/orders';

const ORDER_COLUMNS: KanbanColumn[] = [
  { key: 'new', label: 'Новые', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { key: 'processing', label: 'В обработке', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { key: 'shipped', label: 'Отправлены', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { key: 'delivered', label: 'Доставлены', color: 'text-green-700', bgColor: 'bg-green-100' },
  { key: 'cancelled', label: 'Отменены', color: 'text-red-700', bgColor: 'bg-red-100' },
];

const ORDER_STATUS_OPTIONS = [
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

// Status badge configuration
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Новый' },
  processing: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'В обработке' },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Отправлен' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Доставлен' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Отменён' },
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await ordersApi.getOrders();
      setOrders(response.data.orders);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки заказов';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateOrder(orderId, { status: newStatus });
      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      // Update selected order if it's the one being changed
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success('Статус обновлён');
    } catch (err) {
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleItemClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSave = async (updates: Partial<Order>) => {
    if (!selectedOrder) return;
    await ordersApi.updateOrder(selectedOrder.id, updates);
    // Update local state
    const updatedOrder = { ...selectedOrder, ...updates };
    setOrders(orders.map(order =>
      order.id === selectedOrder.id ? updatedOrder : order
    ));
    setSelectedOrder(updatedOrder);
  };

  const handleDelete = async (id: string) => {
    await ordersApi.deleteOrder(id);
    // Remove from local state
    setOrders(orders.filter(order => order.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const calculateTotalValue = (items?: Array<{ price?: number; quantity?: number }>) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  const renderOrderCard = (order: Order) => {
    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
    const totalValue = calculateTotalValue(order.items);

    return (
      <div className="space-y-3">
        {/* Header Row: Status + Price + Insurance */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
          <div className="flex items-center gap-2">
            {order.agree_insurance && (
              <span className="text-base" title="Страховка">
                🛡️
              </span>
            )}
            {totalValue > 0 && (
              <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                {totalValue.toFixed(0)}€
              </span>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div>
          <p className="font-semibold text-gray-900 text-base truncate">
            {order.sender_name || 'Без имени'}
          </p>
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {order.sender_email || order.sender_phone || '—'}
          </p>
        </div>

        {/* Route Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{order.sender_country || '?'}</span>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="font-medium truncate">{order.recipient_country || '?'}</span>
          {order.weight_kg && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{order.weight_kg} кг</span>
            </>
          )}
        </div>

        {/* Footer: Date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(order.created_at)}
          </div>
          {order.items && order.items.length > 0 && (
            <span className="text-xs text-gray-400">
              {order.items.length} {order.items.length === 1 ? 'товар' : order.items.length < 5 ? 'товара' : 'товаров'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Заказы</h1>
        <p className="text-sm sm:text-base text-gray-600">Заказы с декларациями с лендинга</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <KanbanBoard
        items={orders}
        columns={ORDER_COLUMNS}
        getItemStatus={(order) => order.status}
        onStatusChange={handleStatusChange}
        onItemClick={handleItemClick}
        renderCard={renderOrderCard}
        isLoading={isLoading}
      />

      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type="order"
        item={selectedOrder}
        onStatusChange={(newStatus) => {
          if (selectedOrder) {
            handleStatusChange(selectedOrder.id, newStatus);
          }
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        statusOptions={ORDER_STATUS_OPTIONS}
      />
    </Layout>
  );
};

export default Orders;
