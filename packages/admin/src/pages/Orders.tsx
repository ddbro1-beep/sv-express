import React, { useEffect, useState } from 'react';
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
    } catch (err) {
      alert('Ошибка обновления статуса');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const calculateTotalValue = (items?: Array<{ price?: number; quantity?: number }>) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  const renderOrderCard = (order: Order) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-900 text-sm truncate">
          {order.sender_name || 'Без имени'}
        </p>
        {order.agree_insurance && (
          <span className="text-xs px-1 py-0.5 bg-orange-100 text-orange-700 rounded">
            🛡
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 truncate">
        {order.sender_email || order.sender_phone || '—'}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {order.sender_country || '?'} → {order.recipient_country || '?'}
        </span>
        <span>
          {order.weight_kg ? `${order.weight_kg} кг` : ''}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">
          {formatDate(order.created_at)}
        </span>
        <span className="text-green-600 font-medium">
          {calculateTotalValue(order.items).toFixed(0)}€
        </span>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        <p className="text-gray-600">Заказы с декларациями с лендинга</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
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
        statusOptions={ORDER_STATUS_OPTIONS}
      />
    </Layout>
  );
};

export default Orders;
