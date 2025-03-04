import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  grantId?: string;
}

export default function NewGrantApplication() {
  const navigate = useNavigate();
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [error, setError] = useState<string | null>(null);

  const handleComplete = useCallback(async (data: WizardData) => {
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
  }, [navigate]);

  const handleOrganizationOpportunityNext = useCallback(async (data: any) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        // First get the grant_id for the selected opportunity
        const { data: opportunityData, error: opportunityError } = await supabase
          .from('grant_opportunities')
          .select('grant_id')
          .eq('id', data.opportunityId)
          .single();

        if (opportunityError) {
          console.error('Error fetching opportunity:', opportunityError);
          reject(opportunityError);
          return;
        }

        setWizardData((prev) => {
          const newData = {
            ...prev,
            organizationId: data.organizationId,
            opportunityId: data.opportunityId,
            grantId: opportunityData.grant_id
          };
          resolve();
          return newData;
        });
      } catch (err) {
        console.error('Error in onNext:', err);
        reject(err);
      }
    });
  }, []);

  const handleGrantTypeBasicInfoNext = useCallback((data: any) => {
    return new Promise<void>((resolve) => {
      setWizardData((prev) => {
        const newData = {
          ...prev,
          title: data.title,
          description: data.description,
          grantTypeId: data.grantTypeId,
          resubmission: data.resubmission,
        };
        resolve();
        return newData;
      });
    });
  }, []);

  const handleOptionalSectionsNext = useCallback((data: any) => {
    return new Promise<void>((resolve) => {
      setWizardData((prev) => {
        const newData = {
          ...prev,
          selectedSections: data.selectedSections,
        };
        resolve();
        return newData;
      });
    });
  }, []);

  const steps = useMemo(() => [
    {
      title: 'Organization & Opportunity',
      component: (
        <OrganizationOpportunityStep
          onNext={handleOrganizationOpportunityNext}
        />
      ),
    },
    {
      title: 'Grant Type & Basic Info',
      component: (
        <GrantTypeBasicInfoStep
          organizationId={wizardData.organizationId || ''}
          onNext={handleGrantTypeBasicInfoNext}
        />
      ),
    },
    {
      title: 'Optional Sections',
      component: (
        <OptionalSectionsStep
          grantId={wizardData.grantId || ''}
          onNext={handleOptionalSectionsNext}
        />
      ),
    },
  ], [wizardData.organizationId, wizardData.grantId, handleOrganizationOpportunityNext, handleGrantTypeBasicInfoNext, handleOptionalSectionsNext]);

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