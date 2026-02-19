import { cn } from '@/lib/utils';
import { Check, Circle, Clock } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

/**
 * Enhanced Stepper Component - matches IT Helpdesk Ticket Progress UI
 * Features: Icon-based indicators, animated active state, color-coded status
 */
export function Stepper({ steps, currentStep }: StepperProps) {
  const getStepIcon = (stepId: number) => {
    if (stepId < currentStep) {
      return <Check className="h-6 w-6 text-white" />;
    } else if (stepId === currentStep) {
      return <Clock className="h-5 w-5 text-white animate-pulse" />;
    } else {
      return <Circle className="h-5 w-5 text-gray-400 dark:text-gray-600" />;
    }
  };

  const getStepColor = (stepId: number) => {
    if (stepId < currentStep) {
      return 'border-green-500 bg-green-500';
    } else if (stepId === currentStep) {
      return 'border-blue-500 bg-blue-500';
    } else {
      return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
    }
  };

  const getTextColor = (stepId: number) => {
    if (stepId <= currentStep) {
      return 'text-brand-navy dark:text-gray-100';
    } else {
      return 'text-brand-slate dark:text-gray-400';
    }
  };

  const getLineColor = (stepId: number) => {
    if (stepId < currentStep) {
      return 'bg-green-500';
    } else {
      return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  return (
    <nav aria-label="Progress">
      <div className="flex justify-between items-start">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="absolute top-[22px] left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 bg-gray-200 dark:bg-gray-700 pointer-events-none">
                <div
                  className={cn(
                    'h-full w-full transition-all duration-500',
                    getLineColor(step.id)
                  )}
                />
              </div>
            )}

            {/* Step Circle with Icon */}
            <div
              className={cn(
                'rounded-full border-2 p-2 z-10 transition-all duration-300 shadow-sm',
                getStepColor(step.id)
              )}
              aria-current={step.id === currentStep ? 'step' : undefined}
            >
              {getStepIcon(step.id)}
            </div>

            {/* Step Label */}
            <div className="mt-3 text-center max-w-[120px]">
              <p
                className={cn(
                  'text-xs font-semibold',
                  getTextColor(step.id)
                )}
              >
                {step.title}
              </p>
              <p className="text-[10px] text-brand-slate dark:text-gray-500 mt-1">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
