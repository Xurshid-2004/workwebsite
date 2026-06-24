'use client';

import type { CreateJobStep } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const STEPS: { id: CreateJobStep; label: string }[] = [
  { id: 1, label: 'Basics' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Location' },
  { id: 4, label: 'Publish' },
];

interface StepProgressProps {
  currentStep: CreateJobStep;
  onStepClick?: (step: CreateJobStep) => void;
}

export function StepProgress({ currentStep, onStepClick }: StepProgressProps) {
  return (
    <nav aria-label="Create job progress" className="w-full">
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, index) => {
          const isComplete = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = Boolean(onStepClick) && step.id <= currentStep;

          return (
            <li key={step.id} className="flex flex-1 items-center min-w-0">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 w-full min-w-0 group',
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-colors shrink-0',
                    isComplete &&
                      'bg-[var(--color-success)] border-[var(--color-success)] text-white',
                    isCurrent &&
                      'bg-[var(--color-primary)] border-[var(--color-primary)] text-white',
                    !isComplete &&
                      !isCurrent &&
                      'bg-white border-[var(--color-border)] text-[var(--color-muted)]'
                  )}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : step.id}
                </span>
                <span
                  className={cn(
                    'text-[10px] sm:text-xs font-medium truncate w-full text-center',
                    isCurrent ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
                  )}
                >
                  {step.label}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-0.5 sm:mx-1 rounded-full min-w-[8px]',
                    step.id < currentStep ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
