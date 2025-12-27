import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import supabase from '../config/database';
import { AppError } from '../middleware/error.middleware';

// Создать заявку (публичный endpoint для лендинга)
export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone, originCountryId, destinationCountryId, weightEstimateKg, shipmentType, message } = req.body;

    const { data, error } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone,
        origin_country_id: originCountryId,
        destination_country_id: destinationCountryId,
        weight_estimate_kg: weightEstimateKg,
        shipment_type: shipmentType,
        message,
        status: 'new',
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Получить все заявки (админ)
export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('leads')
      .select(`
        *,
        origin_country:countries!leads_origin_country_id_fkey(id, name_en, name_ru, code),
        destination_country:countries!leads_destination_country_id_fkey(id, name_en, name_ru, code),
        assigned_admin:users!leads_assigned_to_admin_id_fkey(id, first_name, last_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
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
        leads: data,
        total: count || 0,
        page: Number(page),
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Получить одну заявку (админ)
export const getLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        origin_country:countries!leads_origin_country_id_fkey(id, name_en, name_ru, code),
        destination_country:countries!leads_destination_country_id_fkey(id, name_en, name_ru, code),
        assigned_admin:users!leads_assigned_to_admin_id_fkey(id, first_name, last_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw new AppError('Lead not found', 404);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Обновить заявку (админ)
export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'status', 'name', 'email', 'phone',
      'origin_country_id', 'destination_country_id',
      'weight_estimate_kg', 'shipment_type', 'message',
      'assigned_to_admin_id',
    ];

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    // Copy allowed fields from request body
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Auto-set contacted_at when status changes to contacted
    if (req.body.status === 'contacted' && !updates.contacted_at) {
      updates.contacted_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('leads')
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

export default { createLead, getLeads, getLead, updateLead };
