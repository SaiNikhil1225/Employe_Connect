import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FLStep1Form } from './FLStep1Form';
import { FLStep2Funding } from './FLStep2Funding';
import { FLStep3Planning } from './FLStep3Planning';
import { FLStep4Milestones } from './FLStep4Milestones';
import { useFinancialLineStore } from '@/store/financialLineStore';
import { useToast } from '@/hooks/use-toast';
import type { FLStep1Data, FLStep2Data, FLStep3Data, FLStep4Data, FinancialLineFormData } from '@/types/financialLine';
import { format } from 'date-fns';

interface CreateFLFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultProjectId?: string;
}

const STEPS = [
  { id: 1, label: 'Form', description: 'Basic & Revenue Details' },
  { id: 2, label: 'Funding', description: 'PO Allocation' },
  { id: 3, label: 'Planned / Expected Revenue', description: 'Monthly Planning' },
  { id: 4, label: 'Payment Milestone', description: 'Milestone Setup' },
];

export function CreateFLForm({ open, onOpenChange, onSuccess, defaultProjectId }: CreateFLFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Partial<FLStep1Data>>({});
  const [step2Data, setStep2Data] = useState<Partial<FLStep2Data>>({ funding: [], totalFunding: 0 });
  const [step3Data, setStep3Data] = useState<Partial<FLStep3Data>>({ revenuePlanning: [], totalPlannedRevenue: 0 });
  const [step4Data, setStep4Data] = useState<Partial<FLStep4Data>>({ paymentMilestones: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createFL } = useFinancialLineStore();
  const { toast } = useToast();

  // Determine if Payment Milestones step should be shown (hide for T&M)
  const showPaymentMilestones = step1Data.contractType !== 'T&M';
  const maxStep = showPaymentMilestones ? 4 : 3;
  
  // Filter steps based on contract type
  const visibleSteps = STEPS.filter(step => 
    showPaymentMilestones ? true : step.id !== 4
  );

  const handleNext = () => {
    // Trigger the hidden button click in each step component for validation
    console.log('CreateFLForm - handleNext called, currentStep:', currentStep);
    const button = document.getElementById(`step${currentStep}-next`);
    console.log('CreateFLForm - Button found:', button);
    if (button) {
      button.click();
    }
  };

  const handleBack = () => {
    const button = document.getElementById(`step${currentStep}-back`);
    if (button) {
      button.click();
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setStep1Data({});
    setStep2Data({ funding: [], totalFunding: 0 });
    setStep3Data({ revenuePlanning: [], totalPlannedRevenue: 0 });
    setStep4Data({ paymentMilestones: [] });
    onOpenChange(false);
  };

  const handleComplete = () => {
    console.log('CreateFLForm - handleComplete called for step:', currentStep);
    console.log('CreateFLForm - showPaymentMilestones:', showPaymentMilestones);
    console.log('CreateFLForm - step4Data:', step4Data);
    
    // Trigger the hidden complete button in step 4
    const button = document.getElementById('step4-complete');
    console.log('CreateFLForm - step4-complete button found:', !!button);
    if (button) {
      button.click();
    } else {
      // If no step 4 (T&M contract), call handleCompleteSubmit directly
      console.log('CreateFLForm - No step 4 button, calling handleCompleteSubmit directly');
      handleCompleteSubmit();
    }
  };

  const handleCompleteSubmit = async () => {
    console.log('CreateFLForm - handleCompleteSubmit called');
    console.log('CreateFLForm - step1Data:', step1Data);
    console.log('CreateFLForm - step2Data:', step2Data);
    console.log('CreateFLForm - step3Data:', step3Data);
    console.log('CreateFLForm - step4Data:', step4Data);
    
    try {
      setIsSubmitting(true);

      // Generate FL No
      const flNo = `FL-${format(new Date(), 'yyyy')}-${Math.floor(1000 + Math.random() * 9000)}`;
      console.log('CreateFLForm - Generated flNo:', flNo);

      // Calculate effort from funding units (sum of all fundingUnits)
      const calculatedEffort = step2Data.funding?.reduce((sum, f) => sum + (f.fundingUnits || 0), 0) || 0;
      console.log('CreateFLForm - Calculated effort from funding:', calculatedEffort);

      const flData: FinancialLineFormData = {
        flNo,
        projectId: step1Data.projectId!,
        flName: step1Data.flName!,
        contractType: step1Data.contractType!,
        locationType: step1Data.locationType!,
        executionEntity: step1Data.executionEntity!,
        currency: step1Data.currency!,
        timesheetApprover: step1Data.timesheetApprover!,
        scheduleStart: step1Data.scheduleStart!,
        scheduleFinish: step1Data.scheduleFinish!,
        billingRate: step1Data.billingRate!,
        rateUom: step1Data.rateUom!,
        effort: calculatedEffort > 0 ? calculatedEffort : step1Data.effort!,
        effortUom: step1Data.effortUom!,
        revenueAmount: step1Data.revenueAmount!,
        expectedRevenue: step1Data.expectedRevenue!,
        funding: step2Data.funding!,
        totalFunding: step2Data.totalFunding!,
        revenuePlanning: step3Data.revenuePlanning!,
        totalPlannedRevenue: step3Data.totalPlannedRevenue!,
        // For T&M contracts, payment milestones are empty
        paymentMilestones: showPaymentMilestones ? step4Data.paymentMilestones! : [],
        status: 'Draft',
      };

      console.log('CreateFLForm - Final FL data to submit:', flData);

      await createFL(flData);

      toast({
        title: 'Success',
        description: 'Financial Line created successfully',
      });

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('CreateFLForm - Error creating FL:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create Financial Line';
      if (error instanceof Error) {
        console.error('CreateFLForm - Error message:', error.message);
      }
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('CreateFLForm - Response status:', axiosError.response?.status);
        console.error('CreateFLForm - Response data:', JSON.stringify(axiosError.response?.data, null, 2));
        console.error('CreateFLForm - Request data:', JSON.stringify(flData, null, 2));
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-7xl flex flex-col h-full p-0">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl">Create Financial Line (FL)</SheetTitle>
              
              {/* Stepper */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  {visibleSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                            currentStep >= step.id
                              ? 'bg-brand-green border-brand-green text-white'
                              : 'bg-white border-gray-300 text-gray-500'
                          }`}
                        >
                          {step.id}
                        </div>
                        <div className="mt-2 text-center">
                          <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-brand-green' : 'text-gray-500'}`}>
                            {step.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                        </div>
                      </div>
                      {index < visibleSteps.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-2 mb-14 ${currentStep > step.id ? 'bg-brand-green' : 'bg-gray-300'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </SheetHeader>

            {/* Step Content */}
            <div className="py-6 pb-6">
              {currentStep === 1 && (
                <FLStep1Form
                  data={step1Data}
                  step2Data={step2Data}
                  onDataChange={setStep1Data}
                  onNext={() => setCurrentStep(2)}
                  defaultProjectId={defaultProjectId}
                />
              )}
              {currentStep === 2 && (
                <FLStep2Funding
                  data={step2Data}
                  step1Data={step1Data as FLStep1Data}
                  onDataChange={setStep2Data}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <FLStep3Planning
                  data={step3Data}
                  step1Data={step1Data as FLStep1Data}
                  step2Data={step2Data as FLStep2Data}
                  onDataChange={setStep3Data}
                  onNext={showPaymentMilestones ? () => setCurrentStep(4) : handleCompleteSubmit}
                  onBack={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 4 && showPaymentMilestones && (
                <FLStep4Milestones
                  data={step4Data}
                  step1Data={step1Data as FLStep1Data}
                  step2Data={step2Data as FLStep2Data}
                  onDataChange={setStep4Data}
                  onBack={() => setCurrentStep(3)}
                  onComplete={handleCompleteSubmit}
                />
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Sticky at bottom within drawer */}
        <div className="border-t border-gray-200 bg-white p-4 flex items-center justify-between shadow-lg">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentStep < maxStep && (
              <Button onClick={handleNext} className="bg-brand-green hover:bg-brand-green-dark">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {currentStep === maxStep && (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-brand-green hover:bg-brand-green-dark"
              >
                {isSubmitting ? 'Saving...' : 'Complete'}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
