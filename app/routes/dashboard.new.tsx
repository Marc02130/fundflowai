import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '~/lib/supabase';
import WizardContainer, { WIZARD_STATE_KEY } from '~/components/grant-wizard/WizardContainer';
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
  searchTerm?: string;
  amount_requested?: number;
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
          description: data.description,
          status: 'in-progress',
          grant_type_id: data.grantTypeId,
          resubmission: data.resubmission,
          grant_opportunity_id: data.opportunityId,
          amount_requested: data.amount_requested
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

      // Fetch all sections (both required and optional) for the grant
      const { data: allSections, error: sectionsError } = await supabase
        .from('grant_sections')
        .select('id, flow_order, optional')
        .eq('grant_id', data.grantId)
        .order('flow_order');

      if (sectionsError) throw sectionsError;

      // Filter sections to include all required sections and selected optional sections
      const sectionsToCreate = allSections
        .filter(section => !section.optional || (data.selectedSections || []).includes(section.id))
        .map(section => ({
          grant_application_id: application.id,
          grant_section_id: section.id,
          flow_order: section.flow_order,
          is_completed: false
        }));

      // Create grant application sections
      const { error: createSectionsError } = await supabase
        .from('grant_application_section')
        .insert(sectionsToCreate);

      if (createSectionsError) throw createSectionsError;

      // Navigate to the application view
      navigate(`/dashboard/applications/${application.id}`);
    } catch (err) {
      console.error('Error creating application:', err);
      setError('Failed to create application');
    }
  }, [navigate]);

  const handleOrganizationOpportunityNext = useCallback(async (data: {
    organizationId: string;
    opportunityId: string;
    searchTerm: string;
  }) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.log('Fetching grant_id for opportunity:', data.opportunityId);
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

        console.log('Got grant_id:', opportunityData.grant_id);

        // Save all the data including grant_id
        setWizardData((prev) => {
          const newData = {
            ...prev,
            organizationId: data.organizationId,
            opportunityId: data.opportunityId,
            searchTerm: data.searchTerm,
            grantId: opportunityData.grant_id
          };

          // Also save to localStorage immediately
          const savedState = localStorage.getItem(WIZARD_STATE_KEY);
          const savedData = savedState ? JSON.parse(savedState) : {};
          localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify({
            ...savedData,
            data: {
              ...savedData.data,
              ...newData
            }
          }));

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
          amount_requested: data.amount_requested
        };

        // Save to localStorage immediately
        const savedState = localStorage.getItem(WIZARD_STATE_KEY);
        const savedData = savedState ? JSON.parse(savedState) : {};
        localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify({
          ...savedData,
          data: {
            ...savedData.data,
            ...newData
          }
        }));

        resolve();
        return newData;
      });
    });
  }, []);

  const handleOptionalSectionsNext = useCallback((data: { selectedSections: string[] }) => {
    return new Promise<void>((resolve) => {
      setWizardData((prev) => {
        const newData = {
          ...prev,
          selectedSections: data.selectedSections
        };
        resolve();
        return newData;
      });
    });
  }, []);

  const handleOptionalSectionsSave = useCallback((data: { selectedSections?: string[], grantId: string }) => {
    setWizardData((prev) => {
      const newData = {
        ...prev,
        selectedSections: data.selectedSections,
        grantId: data.grantId
      };

      // Save to localStorage immediately
      const savedState = localStorage.getItem(WIZARD_STATE_KEY);
      const savedData = savedState ? JSON.parse(savedState) : {};
      localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify({
        ...savedData,
        data: {
          ...savedData.data,
          ...newData
        }
      }));

      return newData;
    });
  }, []);

  const steps = useMemo(() => [
    {
      title: 'Organization & Opportunity',
      component: (
        <OrganizationOpportunityStep
          onNext={handleOrganizationOpportunityNext}
          initialData={{
            organizationId: wizardData.organizationId,
            opportunityId: wizardData.opportunityId,
            searchTerm: wizardData.searchTerm
          }}
        />
      ),
    },
    {
      title: 'Grant Type & Basic Info',
      component: (
        <GrantTypeBasicInfoStep
          onNext={handleGrantTypeBasicInfoNext}
          onSave={handleGrantTypeBasicInfoNext}
          initialData={{
            title: wizardData.title,
            description: wizardData.description,
            grantTypeId: wizardData.grantTypeId,
            resubmission: wizardData.resubmission,
            amount_requested: wizardData.amount_requested,
            organizationId: wizardData.organizationId
          }}
        />
      ),
    },
    {
      title: 'Optional Sections',
      component: (
        <OptionalSectionsStep
          onNext={handleOptionalSectionsNext}
          onSave={handleOptionalSectionsSave}
          initialData={{
            selectedSections: wizardData.selectedSections,
            opportunityId: wizardData.opportunityId
          }}
        />
      ),
    },
  ], [
    wizardData.organizationId,
    wizardData.opportunityId,
    wizardData.title,
    wizardData.description,
    wizardData.grantTypeId,
    wizardData.resubmission,
    wizardData.grantId,
    wizardData.selectedSections,
    wizardData.searchTerm,
    wizardData.amount_requested,
    handleOrganizationOpportunityNext,
    handleGrantTypeBasicInfoNext,
    handleOptionalSectionsNext,
    handleOptionalSectionsSave
  ]);

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