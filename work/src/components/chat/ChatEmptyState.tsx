'use client';

import { MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ChatEmptyStateProps {
  variant?: 'list' | 'detail';
}

export function ChatEmptyState({ variant = 'list' }: ChatEmptyStateProps) {
  if (variant === 'detail') {
    return null;
  }

  return (
    <EmptyState
      icon={MessageCircle}
      title="No messages yet"
      description="Start a conversation by contacting an employer from a job listing."
      action={
        <Link href="/search">
          <Button>Browse jobs</Button>
        </Link>
      }
    />
  );
}
