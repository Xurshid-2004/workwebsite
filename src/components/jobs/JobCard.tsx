'use client';

import React from 'react';
import type { JobListItem } from '@/types';
import { Bookmark, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { appToast } from '@/lib/feedback/toast';

export interface JobCardProps {
  job: JobListItem;
  index?: number;
  featured?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function JobCard({ job, index = 0, featured }: JobCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isSaved = isFavorite(job.id);
  const showFeatured = featured ?? job.isFeatured;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const newState = await toggleFavorite(job.id);
      appToast.favoriteToggled(newState);
    } catch (err) {
      appToast.error(err, 'Could not update favorites');
    }
  };

  return (
    <Link href={`/job/${job.id}`} className="block">
      <motion.article
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'card card-hover p-4 sm:p-5 relative overflow-hidden',
          showFeatured &&
            'border-[var(--color-primary)]/20 bg-gradient-to-br from-white to-[var(--color-primary-light)]/30'
        )}
      >
        {showFeatured && (
          <span className="absolute top-4 right-14 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent-light)] px-2 py-0.5 rounded-md">
            Featured
          </span>
        )}

        <div className="flex justify-between items-start gap-3 mb-3.5">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-[var(--color-border)] shrink-0 relative">
              <Image
                src={job.logo}
                alt=""
                width={32}
                height={32}
                className="object-contain"
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--color-secondary)] text-base sm:text-lg truncate">
                {job.title}
              </h3>
              <p className="text-[var(--color-muted)] text-sm truncate">{job.company}</p>
            </div>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0',
              isSaved
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'bg-gray-50 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
            )}
            onClick={handleSave}
            aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)] mb-3.5">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            {job.location}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
          <span className="font-semibold text-[var(--color-success)]">{job.salary}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
          <span className="inline-flex items-center gap-1 text-xs">
            <Clock className="w-3.5 h-3.5" />
            {job.postedAt}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-50 rounded-lg text-xs font-medium text-[var(--color-muted)] border border-[var(--color-border)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.article>
    </Link>
  );
}
