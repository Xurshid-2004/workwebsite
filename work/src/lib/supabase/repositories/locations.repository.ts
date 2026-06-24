import type { LocationRecord } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { LocationRow } from '@/lib/supabase/database.types';

function mapLocationRow(row: LocationRow): LocationRecord {
  return {
    id: row.id,
    label: row.label,
    slug: row.slug,
    isActive: row.is_active,
  };
}

export const supabaseLocationsRepository = {
  async list(): Promise<LocationRecord[]> {
    const { data, error } = await getSupabaseClient()
      .from('locations')
      .select('*')
      .order('label');
    if (error) throw error;
    return ((data ?? []) as LocationRow[]).map(mapLocationRow);
  },

  async create(label: string): Promise<LocationRecord> {
    const slug = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const { data, error } = await getSupabaseClient()
      .from('locations')
      .insert({ id: `loc-${Date.now()}`, label: label.trim(), slug, is_active: true })
      .select()
      .single();
    if (error) throw error;
    return mapLocationRow(data as LocationRow);
  },

  async update(
    id: string,
    patch: Partial<Pick<LocationRecord, 'label' | 'isActive'>>
  ): Promise<LocationRecord> {
    const row: Partial<LocationRow> = {};
    if (patch.label !== undefined) {
      row.label = patch.label;
      row.slug = patch.label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (patch.isActive !== undefined) row.is_active = patch.isActive;

    const { data, error } = await getSupabaseClient()
      .from('locations')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapLocationRow(data as LocationRow);
  },

  async remove(id: string): Promise<void> {
    const { error } = await getSupabaseClient().from('locations').delete().eq('id', id);
    if (error) throw error;
  },
};
