import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
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
  editData?: any; // Financial Line data for editing
  isEditMode?: boolean;
}

const STEPS = [
  { id: 1, title: 'Form', description: 'Basic & Revenue Details' },
  { id: 2, title: 'Funding', description: 'PO Allocation' },
  { id: 3, title: 'Planned / Expected Revenue', description: 'Monthly Planning' },
  { id: 4, title: 'Payment Milestone', description: 'Milestone Setup' },
];

export function CreateFLForm({ open, onOpenChange, onSuccess, defaultProjectId, editData, isEditMode = false }: CreateFLFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Partial<FLStep1Data>>({ contractType: 'T&M' });
  const [step2Data, setStep2Data] = useState<Partial<FLStep2Data>>({ funding: [], totalFunding: 0 });
  const [step3Data, setStep3Data] = useState<Partial<FLStep3Data>>({ revenuePlanning: [], totalPlannedRevenue: 0 });
  const [step4Data, setStep4Data] = useState<Partial<FLStep4Data>>({ paymentMilestones: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fixed stepper configuration - determined at initialization and locked after first Next click
  const [showPaymentMilestones, setShowPaymentMilestones] = useState(false);
  const [isStepperLocked, setIsStepperLocked] = useState(false);

  const { createFL, updateFL } = useFinancialLineStore();
  const { toast } = useToast();

  // Populate form data when editing
  useEffect(() => {
    if (open && isEditMode && editData) {
      // Helper function to convert ISO date string to YYYY-MM-DD format
      const formatDateForInput = (isoString: string | Date): string => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setStep1Data({
        projectId: editData.projectId?._id || editData.projectId,
        flName: editData.flName,
        contractType: editData.contractType,
        locationType: editData.locationType,
        executionEntity: editData.executionEntity,
        currency: editData.currency,
        timesheetApprover: editData.timesheetApprover,
        scheduleStart: formatDateForInput(editData.scheduleStart),
        scheduleFinish: formatDateForInput(editData.scheduleFinish),
        billingRate: editData.billingRate,
        rateUom: editData.rateUom,
        effort: editData.effort,
        effortUom: editData.effortUom,
        revenueAmount: editData.revenueAmount,
        expectedRevenue: editData.expectedRevenue,
      });
      setStep2Data({
        funding: editData.funding || [],
        totalFunding: editData.totalFunding || 0,
      });
      setStep3Data({
        revenuePlanning: editData.revenuePlanning || [],
        totalPlannedRevenue: editData.totalPlannedRevenue || 0,
      });
      setStep4Data({
        paymentMilestones: editData.paymentMilestones || [],
      });
      setShowPaymentMilestones(editData.contractType !== 'T&M');
      setIsStepperLocked(true);
    }
  }, [open, isEditMode, editData]);

  // Initialize/update stepper configuration based on contract type
  useEffect(() => {
    if (open && !isStepperLocked) {
      // Determine if Payment Milestones step should be shown (hide for T&M)
      const currentContractType = step1Data.contractType || 'T&M';
      const shouldShowMilestones = currentContractType !== 'T&M';
      setShowPaymentMilestones(shouldShowMilestones);
    }
  }, [open, step1Data.contractType, isStepperLocked]);

  const maxStep = showPaymentMilestones ? 4 : 3;
  
  // Filter steps based on contract type decision
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
    setStep1Data({ contractType: 'T&M' });
    setStep2Data({ funding: [], totalFunding: 0 });
    setStep3Data({ revenuePlanning: [], totalPlannedRevenue: 0 });
    setStep4Data({ paymentMilestones: [] });
    setShowPaymentMilestones(false);
    setIsStepperLocked(false);
    onOpenChange(false);
  };

  const handleComplete = () => {
    console.log('CreateFLForm - handleComplete called for step:', currentStep);
    console.log('CreateFLForm - showPaymentMilestones:', showPaymentMilestones);
    console.log('CreateFLForm - step4Data:', step4Data);
    
    // For T&M contracts (no Step 4), currentStep will be 3
    // We need to trigger Step 3's next button to collect the data
    if (currentStep === 3 && !showPaymentMilestones) {
      console.log('CreateFLForm - T&M contract, triggering step3-next button');
      const button = document.getElementById('step3-next');
      if (button) {
        button.click(); // This will call FLStep3Planning's handleNext which passes data to handleCompleteSubmit
        return;
      }
    }
    
    // Trigger the hidden complete button in step 4
    const button = document.getElementById('step4-complete');
    console.log('CreateFLForm - step4-complete button found:', !!button);
    if (button) {
      button.click();
    } else {
      // Fallback - should not reach here for properly configured steps
      console.log('CreateFLForm - No step button found, calling handleCompleteSubmit directly');
      handleCompleteSubmit();
    }
  };

  const handleCompleteSubmit = async (finalStep3Data?: Partial<FLStep3Data>, finalStep4Data?: Partial<FLStep4Data>) => {
    console.log('CreateFLForm - handleCompleteSubmit called');
    console.log('CreateFLForm - step1Data:', step1Data);
    console.log('CreateFLForm - step2Data:', step2Data);
    console.log('CreateFLForm - step3Data (state):', step3Data);
    console.log('CreateFLForm - finalStep3Data (param):', finalStep3Data);
    console.log('CreateFLForm - step4Data (state):', step4Data);
    console.log('CreateFLForm - finalStep4Data (param):', finalStep4Data);
    
    // Use passed step data if available (to avoid state timing issues), otherwise use state
    const step3ToUse = finalStep3Data || step3Data;
    const step4ToUse = finalStep4Data || step4Data;
    console.log('CreateFLForm - step3ToUse:', step3ToUse);
    console.log('CreateFLForm - step4ToUse:', step4ToUse);
    
    // Generate FL No only for create mode
    const flNo = isEditMode ? editData.flNo : `FL-${format(new Date(), 'yyyy')}-${Math.floor(1000 + Math.random() * 9000)}`;
    console.log('CreateFLForm - FL No:', flNo);

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
        revenuePlanning: step3ToUse.revenuePlanning!,
        totalPlannedRevenue: step3ToUse.totalPlannedRevenue!,
        // For T&M contracts, payment milestones are empty
        paymentMilestones: showPaymentMilestones ? step4ToUse.paymentMilestones! : [],
        status: 'Draft',
    };

    try {
      setIsSubmitting(true);
      
      console.log('CreateFLForm - Final FL data to submit:', flData);

      if (isEditMode) {
        await updateFL(editData._id, flData);
        toast({
          title: 'Success',
          description: 'Financial Line updated successfully',
        });
      } else {
        await createFL(flData);
        toast({
          title: 'Success',
          description: 'Financial Line created successfully',
        });
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('CreateFLForm - Error:', error);
      
      // Extract detailed error message
      let errorMessage = isEditMode ? 'Failed to update Financial Line' : 'Failed to create Financial Line';
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
        {/* Fixed Header with Stepper */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-6 pb-4">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-xl font-semibold text-brand-navy dark:text-gray-100">
                {isEditMode ? 'Edit' : 'Create'} Financial Line (FL)
              </SheetTitle>
            </SheetHeader>
          </div>
            
          {/* Enhanced Stepper */}
          <div className="px-6 pb-6">
            <Stepper steps={visibleSteps} currentStep={currentStep} />
          </div>
        </div>

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
              {currentStep === 1 && (
                <FLStep1Form
                  data={step1Data}
                  step2Data={step2Data}
                  onDataChange={setStep1Data}
                  onNext={() => {
                    // Lock stepper configuration when moving from step 1 to step 2
                    setIsStepperLocked(true);
                    setCurrentStep(2);
                  }}
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
                  onNext={(data) => {
                    // Always save step3Data first
                    if (data) {
                      setStep3Data(data);
                    }
                    
                    if (showPaymentMilestones) {
                      setCurrentStep(4);
                    } else {
                      handleCompleteSubmit(data);
                    }
                  }}
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
                  onComplete={(data) => handleCompleteSubmit(undefined, data)}
                />
              )}
          </div>
        </div>

        {/* Navigation Buttons - Sticky at bottom */}
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
