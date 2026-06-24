'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { Ban, ShieldCheck } from 'lucide-react';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { adminService } from '@/services/admin.service';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { Skeleton } from '@/components/ui/LoadingState';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const usersQuery = useAsyncQuery(() => adminService.listUsers(), [], []);

  const toggleBlock = useCallback(
    async (userId: string, blocked: boolean) => {
      try {
        await adminService.setUserBlocked(userId, blocked);
        toast.success(blocked ? 'User blocked' : 'User unblocked');
        usersQuery.refetch();
      } catch {
        toast.error('Could not update user');
      }
    },
    [usersQuery]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Users</h2>
        <p className="text-sm text-slate-400 mt-1">View accounts and block suspicious users</p>
      </div>

      <QueryErrorBanner message={usersQuery.error} onRetry={usersQuery.refetch} />

      {usersQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-slate-900" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {usersQuery.data.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-4"
            >
              <UserAvatar src={user.avatarUrl} alt={user.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white">{user.name}</h3>
                  <span
                    className={cn(
                      'text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md',
                      user.role === 'admin'
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-slate-800 text-slate-300'
                    )}
                  >
                    {user.role}
                  </span>
                  {user.blocked && (
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md bg-red-500/10 text-red-300">
                      Blocked
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 truncate">{user.email}</p>
              </div>

              {user.role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => toggleBlock(user.id, !user.blocked)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    user.blocked
                      ? 'text-emerald-300 hover:bg-emerald-500/10'
                      : 'text-red-300 hover:bg-red-500/10'
                  )}
                >
                  {user.blocked ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Unblock
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      Block
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
