import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Stepper } from '@/components/ui/stepper';
import { Step1BasicDetailsForm } from './Step1BasicDetailsForm';
import { Step2FundingDetailsForm } from './Step2FundingDetailsForm';
import { Step3RevenuePlanningForm } from './Step3RevenuePlanningForm';
import { Step4PaymentMilestonesForm } from './Step4PaymentMilestonesForm';
import { useFinancialLineStore } from '@/store/financialLineStore';
import { useToast } from '@/hooks/use-toast';
import type {
  FLBasicDetails,
  FLFundingDetails,
  FLRevenuePlanning,
  FLPaymentMilestones,
  FinancialLineFormData,
} from '@/types/financialLine';

interface CreateFLWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultProjectId?: string;
}

// Step definitions for FL wizard
const ALL_STEPS = [
  { id: 1, title: 'Basic Details', description: 'FL information' },
  { id: 2, title: 'Funding', description: 'PO and rates' },
  { id: 3, title: 'Revenue Planning', description: 'Monthly breakdown' },
  { id: 4, title: 'Milestones', description: 'Payment schedule' },
];

export function CreateFLWizard({ open, onOpenChange, onSuccess, defaultProjectId }: CreateFLWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FinancialLineFormData>>({ contractType: 'T&M' });
  const [showPaymentMilestones, setShowPaymentMilestones] = useState(false);
  const [isStepperLocked, setIsStepperLocked] = useState(false);
  const { createFL } = useFinancialLineStore();
  const { toast } = useToast();

  // Initialize/update stepper configuration based on contract type
  useEffect(() => {
    if (open && !isStepperLocked) {
      const currentContractType = formData.contractType || 'T&M';
      const shouldShowMilestones = currentContractType !== 'T&M';
      setShowPaymentMilestones(shouldShowMilestones);
    }
  }, [open, formData.contractType, isStepperLocked]);

  // Filter steps based on contract type
  const steps = ALL_STEPS.filter(step => 
    showPaymentMilestones ? true : step.id !== 4
  );

  // Set default project ID when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && defaultProjectId) {
      setFormData((prev) => ({ ...prev, projectId: defaultProjectId }));
    }
    onOpenChange(isOpen);
  };

  const handleStep1Next = (data: FLBasicDetails) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Lock stepper configuration when moving from step 1 to step 2
    setIsStepperLocked(true);
    setCurrentStep(2);
  };

  const handleStep2Next = (data: FLFundingDetails) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStep3Next = async (data: FLRevenuePlanning) => {
    setFormData((prev) => ({ ...prev, ...data }));
    
    // If T&M (no milestones), submit immediately
    if (!showPaymentMilestones) {
      const completeData: FinancialLineFormData = {
        ...formData,
        ...data,
        paymentMilestones: [],
        status: 'Draft',
      } as FinancialLineFormData;

      try {
        await createFL(completeData);
        toast({
          title: 'Success',
          description: 'Financial line created successfully',
        });
        onSuccess?.();
        handleClose();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } else {
      // Fixed Bid - proceed to milestones step
      setCurrentStep(4);
    }
  };

  const handleStep4Submit = async (data: FLPaymentMilestones) => {
    const completeData: FinancialLineFormData = {
      ...formData,
      ...data,
      status: 'Draft',
    } as FinancialLineFormData;

    try {
      await createFL(completeData);
      toast({
        title: 'Success',
        description: 'Financial line created successfully',
      });
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({ contractType: 'T&M' });
    setShowPaymentMilestones(false);
    setIsStepperLocked(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col h-full overflow-hidden w-full sm:max-w-3xl p-0" side="right">
        {/* Fixed Header with Stepper */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-6 pb-4">
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold text-brand-navy dark:text-gray-100">
                Create Financial Line
              </SheetTitle>
              <SheetDescription className="text-sm text-brand-slate dark:text-gray-400">
                Follow the steps to create a new financial line with revenue planning and milestones.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Stepper */}
          <div className="px-6 pb-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>
        </div>

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentStep === 1 && (
              <Step1BasicDetailsForm
                defaultValues={formData}
                onNext={handleStep1Next}
                onCancel={handleClose}
              />
            )}

            {currentStep === 2 && (
              <Step2FundingDetailsForm
                defaultValues={formData}
                onNext={handleStep2Next}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <Step3RevenuePlanningForm
                scheduleStart={formData.scheduleStart || ''}
                scheduleEnd={formData.scheduleEnd || ''}
                unitRate={formData.unitRate || 0}
                fundingValue={formData.fundingValue || 0}
                defaultValues={formData}
                onNext={handleStep3Next}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && showPaymentMilestones && (
              <Step4PaymentMilestonesForm
                fundingValue={formData.fundingValue || 0}
                defaultValues={formData}
                onSubmit={handleStep4Submit}
                onBack={() => setCurrentStep(3)}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
