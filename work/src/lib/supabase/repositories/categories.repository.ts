import type { Category } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { mapCategoryRow } from '@/lib/supabase/mappers';
import type { CategoryRow, JobRow } from '@/lib/supabase/database.types';

export const supabaseCategoriesRepository = {
  async list(): Promise<Category[]> {
    const supabase = getSupabaseClient();
    const [{ data: categories, error: catError }, { data: jobs, error: jobError }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('jobs').select('*').eq('status', 'active'),
    ]);
    if (catError) throw catError;
    if (jobError) throw jobError;

    const counts = new Map<string, number>();
    const jobRows = (jobs ?? []) as Pick<JobRow, 'category_id'>[];
    jobRows.forEach((j) => {
      counts.set(j.category_id, (counts.get(j.category_id) ?? 0) + 1);
    });

    const categoryRows = (categories ?? []) as CategoryRow[];
    return categoryRows.map((c) => mapCategoryRow(c, counts.get(c.id) ?? 0));
  },

  async getById(id: string): Promise<Category | undefined> {
    const { data, error } = await getSupabaseClient().from('categories').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapCategoryRow(data as CategoryRow) : undefined;
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    const { data, error } = await getSupabaseClient().from('categories').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data ? mapCategoryRow(data as CategoryRow) : undefined;
  },

  async create(input: { id: string; name: string; slug: string; icon: string }): Promise<Category> {
    const { data, error } = await getSupabaseClient()
      .from('categories')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return mapCategoryRow(data as CategoryRow);
  },

  async update(
    id: string,
    input: Partial<{ name: string; slug: string; icon: string }>
  ): Promise<Category> {
    const { data, error } = await getSupabaseClient()
      .from('categories')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapCategoryRow(data as CategoryRow);
  },

  async remove(id: string): Promise<void> {
    const { error } = await getSupabaseClient().from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};
