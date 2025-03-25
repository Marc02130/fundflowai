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
  searchTerm?: string;
  amount_requested?: number;
}

export default function NewGrantApplication() {
  const navigate = useNavigate();
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [error, setError] = useState<string | null>(null);

  const handleComplete = useCallback(async (data: WizardData): Promise<string> => {
    let sectionsToCreate;
    // Move finalData declaration outside try block for catch block access
    const selectedSections = data.selectedSections || wizardData.selectedSections;
    const finalData: WizardData = {
      ...wizardData,
      ...data,
      selectedSections
    };

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Create the grant application
      console.log('Creating grant application with data:', {
        user_id: user.id,
        title: finalData.title,
        description: finalData.description,
        status: 'in-progress',
        grant_type_id: finalData.grantTypeId,
        resubmission: finalData.resubmission,
        grant_opportunity_id: finalData.opportunityId,
        amount_requested: finalData.amount_requested
      });

      const { data: application, error: applicationError } = await supabase
        .from('grant_applications')
        .insert({
          user_id: user.id,
          title: finalData.title,
          description: finalData.description,
          status: 'in-progress',
          grant_type_id: finalData.grantTypeId,
          resubmission: finalData.resubmission,
          grant_opportunity_id: finalData.opportunityId,
          amount_requested: finalData.amount_requested
        })
        .select()
        .single();

      if (applicationError) {
        console.error('Grant application creation error:', {
          error: applicationError,
          details: applicationError.details,
          hint: applicationError.hint,
          message: applicationError.message
        });
        throw applicationError;
      }

      // Fetch all sections (both required and optional) for the organization
      const { data: allSections, error: sectionsError } = await supabase
        .from('grant_sections')
        .select(`
          id, 
          flow_order, 
          optional,
          name
        `)
        .eq('organization_id', finalData.organizationId)
        .order('flow_order');

      if (sectionsError) throw sectionsError;

      // Create sections array: all required sections plus selected optional sections
      console.log('Creating sections - data:', {
        allSections,
        selectedSections: selectedSections,
        wizardData: finalData
      });

      sectionsToCreate = allSections
        .filter(section => {
          // Include if:
          // 1. Section is required (optional = false) OR
          // 2. Section is optional AND was selected
          const shouldInclude = !section.optional || (section.optional && selectedSections?.includes(section.id));
          console.log('Section filter:', {
            id: section.id,
            name: section.name,
            optional: section.optional,
            selected: selectedSections?.includes(section.id),
            included: shouldInclude
          });
          return shouldInclude;
        })
        .map(section => ({
          grant_application_id: application.id,
          grant_section_id: section.id,
          flow_order: section.flow_order,
          is_completed: false
        }));

      // Create grant application sections
      console.log('About to create sections:', {
        sectionsToCreate,
        selectedSections: selectedSections,
        organizationId: finalData.organizationId
      });

      const { error: createSectionsError } = await supabase
        .from('grant_application_section')
        .insert(sectionsToCreate);

      if (createSectionsError) {
        console.error('Error creating sections:', {
          error: createSectionsError,
          details: createSectionsError.details,
          hint: createSectionsError.hint,
          message: createSectionsError.message
        });
        throw createSectionsError;
      }

      // Create grant assistants
      let assistantData = null;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-grant-assistant`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              grant_application_id: application.id,
              grant_type_id: finalData.grantTypeId,
              description: finalData.description || ''
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to create assistants:', errorData);
          // Continue with navigation even if assistant creation fails
        } else {
          assistantData = await response.json();
          console.log('Assistants created successfully:', assistantData);
        }
      } catch (assistantError) {
        console.error('Error creating assistants:', assistantError);
        // Continue even if there was an error
      }
      
      // Call vectorize-grant-requirements to fetch and process requirement documents
      try {
        const vectorStoreId = assistantData?.vector_store_id;
        
        const vectorizeResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vectorize-grant-requirements`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              grant_application_id: application.id,
              vector_store_id: vectorStoreId
            })
          }
        );
        
        if (!vectorizeResponse.ok) {
          const errorData = await vectorizeResponse.json();
          console.error('Failed to vectorize requirements:', errorData);
          // Non-blocking - continue even if this fails
        } else {
          const vectorizeResult = await vectorizeResponse.json();
          console.log('Requirements vectorization successful:', vectorizeResult);
        }
      } catch (vectorizeError) {
        console.error('Error vectorizing requirements:', vectorizeError);
        // Non-blocking - continue even if this fails
      }

      // Navigate to the application view with state indicating new grant creation
      navigate(`/dashboard/applications/${application.id}`, {
        state: { newGrantCreated: true }
      });
      
      return application.id;
    } catch (err) {
      console.error('Error creating application:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        data: finalData,
        sections: sectionsToCreate
      });
      setError('Failed to create application');
      throw err;
    }
  }, [navigate, wizardData]);

  const handleOrganizationOpportunityNext = useCallback(async (data: {
    organizationId: string;
    opportunityId: string;
    searchTerm: string;
  }) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Save organization and opportunity data
        setWizardData((prev) => {
          const newData = {
            ...prev,
            organizationId: data.organizationId,
            opportunityId: data.opportunityId,
            searchTerm: data.searchTerm
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

  const handleOptionalSectionsSave = useCallback((data: { selectedSections?: string[] }) => {
    setWizardData((prev) => {
      const newData = {
        ...prev,
        selectedSections: data.selectedSections
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
            opportunityId: wizardData.opportunityId,
            organizationId: wizardData.organizationId
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