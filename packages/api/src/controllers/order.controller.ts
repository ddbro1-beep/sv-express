import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import supabase from '../config/database';
import { AppError } from '../middleware/error.middleware';

// Create order (public endpoint from landing page)
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      // Sender
      sender_email,
      sender_phone,
      sender_name,
      sender_country,
      sender_city,
      sender_address,
      sender_address2,
      sender_postcode,
      // Recipient
      recipient_name,
      recipient_phone,
      recipient_country,
      recipient_region,
      recipient_city,
      recipient_street,
      recipient_house,
      recipient_apartment,
      recipient_postcode,
      delivery_service,
      // Parcel
      parcel_weight,
      parcel_length,
      parcel_width,
      parcel_height,
      // Items
      items,
      // Collection
      collection_method,
      collection_date,
      collection_time,
      // Payment
      payment_method,
      // Agreements
      agree_terms,
      agree_overweight,
      agree_insurance,
    } = req.body;

    console.log('[ORDER] Creating new order from:', sender_email);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        sender_email,
        sender_phone,
        sender_name,
        sender_country,
        sender_city,
        sender_address,
        sender_address2,
        sender_postcode,
        recipient_name,
        recipient_phone,
        recipient_country,
        recipient_region,
        recipient_city,
        recipient_street,
        recipient_house,
        recipient_apartment,
        recipient_postcode,
        recipient_delivery_service: delivery_service,
        weight_kg: parseFloat(parcel_weight) || null,
        length_cm: parseInt(parcel_length) || null,
        width_cm: parseInt(parcel_width) || null,
        height_cm: parseInt(parcel_height) || null,
        items: items || [],
        collection_method,
        collection_date: collection_date || null,
        collection_time,
        payment_method,
        agree_terms: agree_terms === 'on' || agree_terms === true,
        agree_overweight: agree_overweight === 'on' || agree_overweight === true,
        agree_insurance: agree_insurance === 'on' || agree_insurance === true,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.log('[ORDER] Error creating order:', error.message);
      throw new AppError(error.message, 500);
    }

    console.log('[ORDER] Order created successfully:', data.id);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin)
export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new AppError(error.message, 500);

    res.json({
      success: true,
      data: {
        orders: data,
        total: count || 0,
        page: Number(page),
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single order (admin)
export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError('Order not found', 404);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Update order (admin)
export const updateOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'status',
      'sender_email', 'sender_phone', 'sender_name', 'sender_country',
      'sender_city', 'sender_address', 'sender_address2', 'sender_postcode',
      'recipient_name', 'recipient_phone', 'recipient_country', 'recipient_region',
      'recipient_city', 'recipient_street', 'recipient_house', 'recipient_apartment',
      'recipient_postcode', 'recipient_delivery_service',
      'weight_kg', 'length_cm', 'width_cm', 'height_cm',
      'items', 'collection_method', 'collection_date', 'collection_time',
      'payment_method', 'agree_terms', 'agree_overweight', 'agree_insurance',
    ];

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    // Copy allowed fields from request body
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Generate PDF for order (admin)
export const getOrderPdf = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Get order data
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError('Order not found', 404);

    // Generate simple HTML for PDF (client can print or use browser PDF)
    const html = generateOrderHtml(order);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

// Helper function to generate printable HTML
function generateOrderHtml(order: Record<string, unknown>): string {
  const items = (order.items as Array<{description: string; quantity: number; price: number}>) || [];
  const itemsHtml = items.map((item, idx) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${idx + 1}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.description || '-'}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity || 1}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.price || 0} €</td>
    </tr>
  `).join('');

  const totalValue = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Declaration - ${order.id}</title>
  <style>
    * { box-sizing: border-box; font-family: Arial, sans-serif; }
    body { margin: 0; padding: 20px; font-size: 14px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .header h1 { margin: 0 0 5px; font-size: 24px; }
    .header p { margin: 0; color: #666; }
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; padding: 5px 10px; background: #f5f5f5; border-left: 4px solid #333; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .field { margin-bottom: 8px; }
    .field-label { font-weight: bold; color: #555; font-size: 12px; }
    .field-value { margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #f5f5f5; border: 1px solid #ddd; padding: 8px; text-align: left; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
    .order-id { font-family: monospace; font-size: 12px; color: #888; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; cursor: pointer; background: #333; color: white; border: none; border-radius: 5px;">
      Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <h1>SV EXPRESS</h1>
    <p>Customs Declaration / Таможенная декларация</p>
    <p class="order-id">Order ID: ${order.id}</p>
  </div>

  <div class="grid">
    <div class="section">
      <div class="section-title">Sender / Отправитель</div>
      <div class="field">
        <div class="field-label">Name / Имя</div>
        <div class="field-value">${order.sender_name || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${order.sender_email || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Phone / Телефон</div>
        <div class="field-value">${order.sender_phone || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Address / Адрес</div>
        <div class="field-value">
          ${order.sender_address || ''}${order.sender_address2 ? ', ' + order.sender_address2 : ''}<br>
          ${order.sender_postcode || ''} ${order.sender_city || ''}<br>
          ${order.sender_country || ''}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Recipient / Получатель</div>
      <div class="field">
        <div class="field-label">Name / Имя</div>
        <div class="field-value">${order.recipient_name || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Phone / Телефон</div>
        <div class="field-value">${order.recipient_phone || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Address / Адрес</div>
        <div class="field-value">
          ${order.recipient_street || ''} ${order.recipient_house || ''}${order.recipient_apartment ? ', кв. ' + order.recipient_apartment : ''}<br>
          ${order.recipient_postcode || ''} ${order.recipient_city || ''}<br>
          ${order.recipient_region ? order.recipient_region + ', ' : ''}${order.recipient_country || ''}
        </div>
      </div>
      <div class="field">
        <div class="field-label">Delivery Service / Служба доставки</div>
        <div class="field-value">${order.recipient_delivery_service || '-'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Parcel / Посылка</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Weight / Вес</div>
        <div class="field-value">${order.weight_kg || '-'} kg</div>
      </div>
      <div class="field">
        <div class="field-label">Dimensions / Размеры (L × W × H)</div>
        <div class="field-value">${order.length_cm || '-'} × ${order.width_cm || '-'} × ${order.height_cm || '-'} cm</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Contents / Содержимое</div>
    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>Description / Описание</th>
          <th style="width: 80px; text-align: center;">Qty / Кол-во</th>
          <th style="width: 100px; text-align: right;">Value / Цена</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml || '<tr><td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: center;">No items / Нет товаров</td></tr>'}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Total / Итого:</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${totalValue.toFixed(2)} €</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Collection / Забор посылки</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Method / Способ</div>
        <div class="field-value">${order.collection_method === 'courier' ? 'Courier pickup / Курьер' : 'Self-delivery to warehouse / Самостоятельно'}</div>
      </div>
      ${order.collection_method === 'courier' ? `
      <div class="field">
        <div class="field-label">Date & Time / Дата и время</div>
        <div class="field-value">${order.collection_date || '-'} ${order.collection_time === 'morning' ? '09:00-12:00' : '12:00-18:00'}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="footer">
    <p>Created / Создано: ${new Date(order.created_at as string).toLocaleString('ru-RU')}</p>
    <p>SV EXPRESS | info.svexpress@gmail.com | +33 753 54 04 36</p>
  </div>
</body>
</html>
  `;
}

export default { createOrder, getOrders, getOrder, updateOrder, getOrderPdf };
