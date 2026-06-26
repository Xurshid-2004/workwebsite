'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FormErrorSummary } from '@/components/ui/FormErrorSummary';
import { useCreateJob } from '@/hooks/useCreateJob';
import { StepProgress } from './StepProgress';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2SalaryDescription } from './Step2SalaryDescription';
import { Step3ContactLocation } from './Step3ContactLocation';
import { Step4Preview } from './Step4Preview';

const stepVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export function CreateJobWizard() {
  const router = useRouter();
  const {
    form,
    errors,
    step,
    stepMeta,
    isSubmitting,
    updateField,
    updateFields,
    goNext,
    goBack,
    goToStep,
    submit,
  } = useCreateJob();

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <header className="bg-white border-b border-[var(--color-border)] px-4 sm:px-6 py-4 sticky top-0 z-20">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--color-secondary)] truncate">
                Post a Job
              </h1>
              <p className="text-xs text-[var(--color-muted)]">
                Step {stepMeta.current} of {stepMeta.total} · {stepMeta.label}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[var(--color-muted)] hover:bg-gray-200 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <StepProgress currentStep={step} onStepClick={goToStep} />
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto pb-32">
        <div className="max-w-lg mx-auto">
          <div className="card p-5 sm:p-6">
            <FormErrorSummary errors={errors} className="mb-4" />
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <Step1BasicInfo form={form} errors={errors} onChange={updateField} />
                )}
                {step === 2 && (
                  <Step2SalaryDescription form={form} errors={errors} onChange={updateField} />
                )}
                {step === 3 && (
                  <Step3ContactLocation
                    form={form}
                    errors={errors}
                    onChange={updateField}
                    onChangeFields={updateFields}
                  />
                )}
                {step === 4 && <Step4Preview form={form} errors={errors} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-[var(--color-border)] z-30 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto flex gap-3">
          {!stepMeta.isFirst ? (
            <Button variant="outline" className="flex-1" onClick={goBack} disabled={isSubmitting}>
              Back
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}

          {stepMeta.isLast ? (
            <Button
              variant="accent"
              className="flex-[2]"
              onClick={submit}
              isLoading={isSubmitting}
            >
              Post Job
            </Button>
          ) : (
            <Button variant="accent" className="flex-[2]" onClick={goNext}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
