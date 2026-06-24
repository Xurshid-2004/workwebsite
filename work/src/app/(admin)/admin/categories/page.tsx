'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { adminService } from '@/services/admin.service';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { Skeleton } from '@/components/ui/LoadingState';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminCategoriesPage() {
  const categoriesQuery = useAsyncQuery(() => adminService.listCategories(), [], []);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Briefcase');

  const createCategory = useCallback(async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    try {
      await adminService.createCategory({ name, slug, icon });
      toast.success('Category created');
      setName('');
      setSlug('');
      setIcon('Briefcase');
      categoriesQuery.refetch();
    } catch {
      toast.error('Could not create category');
    }
  }, [name, slug, icon, categoriesQuery]);

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await adminService.deleteCategory(id);
        toast.success('Category deleted');
        categoriesQuery.refetch();
      } catch {
        toast.error('Could not delete category');
      }
    },
    [categoriesQuery]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Categories</h2>
        <p className="text-sm text-slate-400 mt-1">Manage job categories</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <Input label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
        <div className="flex items-end">
          <Button onClick={() => void createCategory()} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add category
          </Button>
        </div>
      </div>

      <QueryErrorBanner message={categoriesQuery.error} onRetry={categoriesQuery.refetch} />

      {categoriesQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-slate-900" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {categoriesQuery.data.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-white">{category.name}</p>
                <p className="text-xs text-slate-500">
                  {category.slug} · {category.icon} · {category.jobCount} jobs
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  aria-label="Edit category"
                  disabled
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void deleteCategory(category.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                  aria-label="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
