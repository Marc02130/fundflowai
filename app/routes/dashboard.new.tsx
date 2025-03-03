import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '~/lib/supabase';
import WizardContainer from '~/components/grant-wizard/WizardContainer';
import OrganizationOpportunityStep from '~/components/grant-wizard/OrganizationOpportunityStep';
import GrantTypeBasicInfoStep from '~/components/grant-wizard/GrantTypeBasicInfoStep';
import OptionalSectionsStep from '~/components/grant-wizard/OptionalSectionsStep';

interface WizardData {
  organizationId?: string;
  opportunityId?: string;
  title?: string;
  description?: string;
  grantTypeId?: string;
  resubmission?: boolean;
  selectedSections?: string[];
}

export default function NewGrantApplication() {
  const navigate = useNavigate();
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: WizardData) => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Create the grant application
      const { data: application, error: applicationError } = await supabase
        .from('grant_applications')
        .insert({
          user_profiles_id: user.id,
          title: data.title,
          status: 'in-progress',
          grant_type_id: data.grantTypeId,
          resubmission: data.resubmission,
          grant_opportunity_id: data.opportunityId,
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

      // Navigate to the application view
      navigate(`/dashboard/applications/${application.id}`);
    } catch (err) {
      console.error('Error creating application:', err);
      setError('Failed to create application');
    }
  };

  const steps = useMemo(() => [
    {
      title: 'Organization & Opportunity',
      component: (
        <OrganizationOpportunityStep
          onNext={(data) => {
            return new Promise<void>((resolve) => {
              setWizardData((prev) => {
                const newData = {
                  ...prev,
                  organizationId: data.organizationId,
                  opportunityId: data.opportunityId,
                };
                resolve();
                return newData;
              });
            });
          }}
        />
      ),
    },
    {
      title: 'Grant Type & Basic Info',
      component: (
        <GrantTypeBasicInfoStep
          organizationId={wizardData.organizationId || ''}
          onNext={(data) => {
            setWizardData((prev) => ({
              ...prev,
              title: data.title,
              description: data.description,
              grantTypeId: data.grantTypeId,
              resubmission: data.resubmission,
            }));
          }}
        />
      ),
    },
    {
      title: 'Optional Sections',
      component: (
        <OptionalSectionsStep
          grantId={wizardData.grantTypeId || ''}
          onNext={(data) => {
            setWizardData((prev) => ({
              ...prev,
              selectedSections: data.selectedSections,
            }));
          }}
        />
      ),
    },
  ], []);

  // Create refs to hold the current values
  const organizationIdRef = useMemo(() => ({
    current: wizardData.organizationId || ''
  }), [wizardData.organizationId]);

  const grantTypeIdRef = useMemo(() => ({
    current: wizardData.grantTypeId || ''
  }), [wizardData.grantTypeId]);

  // Update refs when wizardData changes
  useEffect(() => {
    organizationIdRef.current = wizardData.organizationId || '';
    grantTypeIdRef.current = wizardData.grantTypeId || '';
  }, [wizardData]);

  // Update the steps to use refs
  useEffect(() => {
    const grantTypeStep = steps[1].component as any;
    if (grantTypeStep) {
      grantTypeStep.props.organizationId = organizationIdRef.current;
    }

    const optionalSectionsStep = steps[2].component as any;
    if (optionalSectionsStep) {
      optionalSectionsStep.props.grantId = grantTypeIdRef.current;
    }
  }, [steps, wizardData]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      {error ? (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <WizardContainer steps={steps} onComplete={handleComplete} />
      )}
    </div>
  );
} 