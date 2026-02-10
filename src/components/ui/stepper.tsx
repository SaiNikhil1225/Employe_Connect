import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              'relative',
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''
            )}
          >
            {step.id < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-1 w-full bg-brand-green" />
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-green shadow-md">
                  <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  <span className="sr-only">{step.title}</span>
                </div>
              </>
            ) : step.id === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-1 w-full bg-brand-light-gray" />
                </div>
                <div
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-green bg-white shadow-md"
                  aria-current="step"
                >
                  <span className="text-brand-green font-bold text-sm" aria-hidden="true">
                    {step.id}
                  </span>
                  <span className="sr-only">{step.title}</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-1 w-full bg-brand-light-gray" />
                </div>
                <div className="group relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-light-gray bg-white">
                  <span className="text-brand-slate text-sm font-medium" aria-hidden="true">
                    {step.id}
                  </span>
                  <span className="sr-only">{step.title}</span>
                </div>
              </>
            )}
            <div className="mt-3">
              <span
                className={cn(
                  'text-sm font-semibold block',
                  step.id === currentStep
                    ? 'text-brand-green'
                    : step.id < currentStep
                    ? 'text-brand-navy'
                    : 'text-brand-slate'
                )}
              >
                {step.title}
              </span>
              <p className="text-xs text-brand-slate mt-0.5">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
