-- Delete existing sections for qualifying grants to avoid duplicates
DELETE FROM public.grant_sections 
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE code IN ('R41', 'R42', 'R43', 'R44', 'SB1', 'U43', 'U44', 'UB1', 'UT1', 'UT2')
);

INSERT INTO public.grant_sections (
    grant_id,
    name,
    description,
    output_type,
    flow_order,
    optional,
    ai_generator_prompt,
    ai_editor_prompt,
    ai_error_prompt,
    ai_visualizations_prompt,
    ai_requirements_prompt,
    instructions
)
SELECT 
    g.id,
    s.name,
    s.description,
    'pdf',
    s.flow_order,
    s.optional,
    s.ai_generator_prompt,
    s.ai_editor_prompt,
    s.ai_error_prompt,
    s.ai_visualizations_prompt,
    s.ai_requirements_prompt,
    s.instructions
FROM public.grants g
CROSS JOIN (
    VALUES
        -- 1. Cover Letter Attachment
        (1, 'Cover Letter Attachment', 'An optional letter providing additional context or information for the application, such as explaining late submissions or special considerations.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         'Provide the cover letter content if desired, including any special considerations.'
        ),
        -- 2. PHS Assignment Request Form
        (2, 'PHS Assignment Request Form', 'An optional form to request assignment to a specific NIH institute, study section, or expertise area.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         'Provide assignment preferences if desired (institute, study section, expertise).'
        ),
        -- 3. Project Summary/Abstract
        (3, 'Project Summary/Abstract', 'A succinct summary (30 lines max) of the proposed project, including goals, significance, and relevance to public health.', false, 
         $$Based on the context provided by the grant writer, generate a concise Project Summary/Abstract for an NIH SBIR/STTR grant application. The attachment should:
- Summarize the proposed project, including the research background, long-term goals, specific objectives, and significance.
- Highlight the project's relevance to public health and potential impact.
- Use the following information from the grant writer:
  - Research background and significance: [User input]
  - Long-term goals: [User input]
  - Specific objectives: [User input]
  - Relevance to public health: [User input]
- Ensure the summary is:
  - Written in clear, concise language, avoiding technical jargon where possible, for a broad scientific audience.
  - Limited to 30 lines of text, compliant with NIH formatting as a PDF-ready document without hyperlinks or URLs.$$, 
         $$Review the Project Summary/Abstract for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Sentences are concise and readable, with a maximum of 30 lines.
- Language is appropriate for a broad scientific audience.$$, 
         $$Check the Project Summary/Abstract for logical consistency and accuracy:
- Verify that the research background, goals, objectives, and public health relevance are logically aligned.
- Ensure no contradictions or vague statements.
- Confirm the summary stays within 30 lines.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Project Summary/Abstract:
- Must be 30 lines or fewer, or it will be rejected.
- Must clearly state the project's goals, significance, and public health relevance.
- Reject if it contains jargon without explanation, exceeds line limit, or lacks clarity for a broad audience.$$, 
         'Provide research background, long-term goals, specific objectives, and relevance to public health.'
        ),
        -- 4. Project Narrative
        (4, 'Project Narrative', 'A 2-3 sentence description of the project''s relevance to public health, written for the lay public.', false, 
         $$Based on the grant writer's input, generate a Project Narrative for an NIH SBIR/STTR grant application. The attachment should:
- Describe the project's relevance to public health in 2-3 sentences, using simple, lay-friendly language.
- Use the following input:
  - Public health impact: [User input]
- Ensure it is:
  - Concise (2-3 sentences max), clear, and accessible to the general public.
  - Formatted as a PDF-ready document per NIH guidelines.$$, 
         $$Review the Project Narrative for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Limited to 2-3 sentences, readable by a lay audience.$$, 
         $$Check the Project Narrative for logical consistency and accuracy:
- Verify the public health impact is clearly stated and aligns with the project.
- Ensure no vague or overly technical statements.
- Confirm it is 2-3 sentences.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Project Narrative:
- Must be 2-3 sentences, or it will be rejected.
- Must clearly convey public health relevance in lay terms.
- Reject if it uses jargon or exceeds sentence limit.$$, 
         'Provide a brief statement on how the project impacts public health.'
        ),
        -- 5. Bibliography and References Cited
        (5, 'Bibliography and References Cited', 'A list of references cited in the Research Strategy, required only if references are included.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         'Provide a list of references cited in the Research Strategy, if applicable.'
        ),
        -- 6. Facilities & Other Resources
        (6, 'Facilities & Other Resources', 'A description of facilities, equipment, and resources available to demonstrate the capacity to complete the project.', false, 
         $$Generate a Facilities & Other Resources attachment for an NIH SBIR/STTR grant application. The attachment should:
- Describe the facilities, equipment, and resources available, emphasizing how they support the project's feasibility.
- Use the following input:
  - Facilities and equipment: [User input]
  - Resources: [User input]
- Ensure it is:
  - Clear, concise, and formatted as a PDF per NIH guidelines.
  - Specific to the project's needs and capabilities.$$, 
         $$Review the Facilities & Other Resources attachment for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Descriptions are concise and relevant.$$, 
         $$Check the Facilities & Other Resources attachment for logical consistency and accuracy:
- Verify that listed facilities, equipment, and resources support the project's feasibility.
- Ensure no vague or irrelevant details.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Facilities & Other Resources attachment:
- Must demonstrate the applicant’s capacity to complete the project.
- Reject if facilities or resources are insufficiently described or unrelated to the project.$$, 
         'List available facilities, equipment, and resources.'
        ),
        -- 7. Equipment
        (7, 'Equipment', 'A list of major equipment already available, required if such equipment is critical to the project.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         'List major equipment available for the project, if applicable.'
        ),
        -- 8. Certification Letters (Commercialization Plan Attachment)
        (8, 'Certification Letters (Commercialization Plan Attachment)', 'Letters certifying investment or sales for SBIR/STTR Fast-Track or Phase II applications, conditionally required based on funding opportunity.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         'Provide certification letters for investment or sales, if required by the FOA.'
        ),
        -- 9. Specific Aims
        (9, 'Specific Aims', 'A 1-page document stating the project’s goals, specific objectives, and expected outcomes.', false, 
         $$Based on the context provided by the grant writer, generate a compelling and cohesive Specific Aims attachment for an NIH SBIR/STTR grant application. The attachment should:
- Start with an introductory paragraph describing the research background, significance, and overall goal.
- Clearly list the specific aims, ensuring each is concise, specific, and aligned with the goal (e.g., hypothesis testing, innovation, problem-solving).
- Conclude with a paragraph summarizing expected outcomes and impact on the field.
- Use the following input:
  - Research background and significance: [User input]
  - Overall goal: [User input]
  - Specific aims: [User input]
  - Expected outcomes: [User input]
  - Impact on the field: [User input]
- Ensure it is:
  - Clear, persuasive, and accessible to a broad scientific audience.
  - Limited to 1 page, formatted as a PDF without hyperlinks.$$, 
         $$Review the Specific Aims attachment for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Text is concise, persuasive, and fits within 1 page.$$, 
         $$Check the Specific Aims attachment for logical consistency and accuracy:
- Verify aims align with the goal and outcomes.
- Ensure no contradictions or vague statements.
- Confirm it fits within 1 page.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Specific Aims attachment:
- Must be 1 page or less, or it will be rejected.
- Must clearly state goals, aims, and impact.
- Reject if aims are unclear, misaligned, or lack significance.$$, 
         'Provide research background, overall goal, specific aims, expected outcomes, and impact.'
        ),
        -- 10. Research Strategy
        (10, 'Research Strategy', 'A 6-page (Phase I) or 12-page (Phase II) document detailing the project''s significance, innovation, and approach.', false, 
         $$Generate a Research Strategy attachment for an NIH SBIR/STTR grant application. The attachment should:
- Detail the project's Significance, Innovation, and Approach.
- Use the following input:
  - Significance: [User input]
  - Innovation: [User input]
  - Approach: [User input]
  - Supporting data: [User input]
- Ensure it is:
  - Clear, concise, and persuasive for a scientific audience.
  - Compliant with page limits: 6 pages for Phase I, 12 pages for Phase II, formatted as a PDF.$$, 
         $$Review the Research Strategy attachment for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Text is readable and within page limits (6 for Phase I, 12 for Phase II).$$, 
         $$Check the Research Strategy attachment for logical consistency and accuracy:
- Verify significance, innovation, and approach are cohesive and supported by data.
- Ensure no logical gaps or inaccuracies.
- Confirm page limit compliance.$$, 
         $$Generate high-quality visuals (e.g., graphs, charts) for the Research Strategy attachment based on:
- Supporting data: [User input]
- Instructions: [User input]
Ensure visuals are:
- Scientifically accurate, clearly labeled, and NIH-compliant (PNG/PDF, high resolution).
- Enhance the approach or data presentation.$$, 
         $$Act as a critical NIH reviewer and evaluate the Research Strategy attachment:
- Must not exceed 6 pages (Phase I) or 12 pages (Phase II), or it will be rejected.
- Must demonstrate significance, innovation, and a feasible approach.
- Reject if lacking rigor, novelty, or supporting data.$$, 
         'Provide significance, innovation, approach, and supporting data.'
        ),
        -- 11. Biographical Sketch
        (11, 'Biographical Sketch', 'Biographical sketches for all key personnel, detailing qualifications and roles.', false, 
         NULL, NULL, NULL, NULL, NULL, 
         'Provide biosketches for all key personnel.'
        ),
        -- 12. Letters of Support
        (12, 'Letters of Support', 'Letters from collaborators or supporters affirming commitment or resources, required if applicable.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         'Provide letters of support, if applicable.'
        ),
        -- 13. Progress Report Publication List
        (13, 'Progress Report Publication List', 'A list of publications from prior support, required for renewal applications.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         'Provide a list of publications from prior support, if applicable.'
        ),
        -- 14. Vertebrate Animals
        (14, 'Vertebrate Animals', 'A description of the use and care of vertebrate animals, required if animals are involved.', true, 
         $$Generate a Vertebrate Animals attachment for an NIH SBIR/STTR grant application. The attachment should:
- Describe the use and care of vertebrate animals, including justification, minimization of pain, and euthanasia methods.
- Use the following input:
  - Animal use details: [User input]
  - Care procedures: [User input]
- Ensure it is:
  - Clear, concise, and compliant with NIH guidelines as a PDF.$$, 
         $$Review the Vertebrate Animals attachment for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Text is concise and specific.$$, 
         $$Check the Vertebrate Animals attachment for logical consistency and accuracy:
- Verify justification, care, and euthanasia details are complete and aligned.
- Ensure no omissions or inconsistencies.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Vertebrate Animals attachment:
- Must justify animal use, minimize pain, and specify euthanasia methods.
- Reject if incomplete or non-compliant with NIH animal welfare policies.$$, 
         'Provide details on the use and care of vertebrate animals, if applicable.'
        ),
        -- 15. Select Agent Research
        (15, 'Select Agent Research', 'Details on the use of select agents and safety protocols, required if select agents are involved.', true, 
         $$Generate a Select Agent Research attachment for an NIH SBIR/STTR grant application. The attachment should:
- Detail the use of select agents, including safety protocols and containment measures.
- Use the following input:
  - Select agent details: [User input]
  - Safety protocols: [User input]
- Ensure it is:
  - Clear, concise, and formatted as a PDF per NIH guidelines.$$, 
         $$Review the Select Agent Research attachment for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Text is precise and readable.$$, 
         $$Check the Select Agent Research attachment for logical consistency and accuracy:
- Verify agent use and safety protocols are fully described and feasible.
- Ensure no gaps or contradictions.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Select Agent Research attachment:
- Must detail select agent use and safety measures comprehensively.
- Reject if safety protocols are inadequate or incomplete.$$, 
         'Provide details on select agent use and safety protocols, if applicable.'
        ),
        -- 16. Multiple PD/PI Leadership Plan
        (16, 'Multiple PD/PI Leadership Plan', 'A plan outlining the leadership structure and roles for multiple Principal Investigators, required if applicable.', true, 
         $$Generate a Multiple PD/PI Leadership Plan for an NIH SBIR/STTR grant application. The attachment should:
- Outline the leadership structure, roles, and coordination mechanisms for multiple PIs.
- Use the following input:
  - PI roles and responsibilities: [User input]
  - Coordination plan: [User input]
- Ensure it is:
  - Clear, concise, and formatted as a PDF per NIH guidelines.$$, 
         $$Review the Multiple PD/PI Leadership Plan for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Text is concise and logical.$$, 
         $$Check the Multiple PD/PI Leadership Plan for logical consistency and accuracy:
- Verify roles and coordination are clearly defined and feasible.
- Ensure no overlaps or ambiguities.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Multiple PD/PI Leadership Plan:
- Must clearly define PI roles and coordination.
- Reject if leadership structure is unclear or impractical.$$, 
         'Provide PI roles and coordination plan, if applicable.'
        ),
        -- 17. Consortium/Contractual Arrangements
        (17, 'Consortium/Contractual Arrangements', 'A description of consortium or contractual agreements, required if such arrangements exist.', true, 
         $$Generate a Consortium/Contractual Arrangements attachment for an NIH SBIR/STTR grant application. The attachment should:
- Describe the consortium or contractual arrangements, including roles and responsibilities.
- Use the following input:
  - Consortium/contract details: [User input]
  - Roles and responsibilities: [User input]
- Ensure it is:
  - Clear, concise, and formatted as a PDF per NIH guidelines.$$, 
         $$Review the Consortium/Contractual Arrangements attachment for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Text is specific and readable.$$, 
         $$Check the Consortium/Contractual Arrangements attachment for logical consistency and accuracy:
- Verify arrangements and roles are well-defined and supportive of the project.
- Ensure no discrepancies or missing details.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Consortium/Contractual Arrangements attachment:
- Must clearly outline arrangements and their relevance to the project.
- Reject if roles are vague or agreements are unsupported.$$, 
         'Provide details on consortium or contractual arrangements, if applicable.'
        ),
        -- 18. Resource Sharing Plan
        (18, 'Resource Sharing Plan', 'A plan for sharing research resources or data, required if the project generates shareable outputs.', true, 
         $$Generate a Resource Sharing Plan for an NIH SBIR/STTR grant application. The attachment should:
- Outline how research resources or data will be shared, including timelines and methods.
- Use the following input:
  - Resources/data to share: [User input]
  - Sharing plan: [User input]
- Ensure it is:
  - Clear, concise, and formatted as a PDF per NIH guidelines.$$, 
         $$Review the Resource Sharing Plan for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Text is precise and understandable.$$, 
         $$Check the Resource Sharing Plan for logical consistency and accuracy:
- Verify the sharing plan is feasible and aligns with the resources/data.
- Ensure no omissions or unrealistic commitments.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Resource Sharing Plan:
- Must specify shareable resources and a feasible sharing method.
- Reject if plan is vague, incomplete, or non-compliant with NIH policy.$$, 
         'Provide details on resources/data to share and the sharing plan, if applicable.'
        ),
        -- 19. Authentication of Key Biological and/or Chemical Resources
        (19, 'Authentication of Key Biological and/or Chemical Resources', 'Details on how key biological or chemical resources will be authenticated, required if such resources are used.', true, 
         $$Generate an Authentication of Key Biological and/or Chemical Resources attachment for an NIH SBIR/STTR grant application. The attachment should:
- Describe how key resources will be authenticated, including methods and validation plans.
- Use the following input:
  - Key resources: [User input]
  - Authentication methods: [User input]
- Ensure it is:
  - Clear, concise, and formatted as a PDF per NIH guidelines.$$, 
         $$Review the Authentication attachment for spelling, grammar, and clarity. Ensure:
- No typographical or grammatical errors.
- Text is specific and readable.$$, 
         $$Check the Authentication attachment for logical consistency and accuracy:
- Verify authentication methods are appropriate and feasible for the resources.
- Ensure no gaps or inconsistencies.$$, 
         NULL, 
         $$Act as a critical NIH reviewer and evaluate the Authentication attachment:
- Must detail authentication methods for all key resources.
- Reject if methods are inadequate or unspecified.$$, 
         'Provide details on key resources and authentication methods, if applicable.'
        ),
        -- 20. Appendix
        (20, 'Appendix', 'Supplemental materials allowable under NIH policy, optional and strictly limited per the Funding Opportunity Announcement (FOA).', true, 
         NULL, NULL, NULL, NULL, NULL, 
         'Provide supplemental materials per FOA restrictions, if desired.'
        )
    ) AS s(flow_order, name, description, optional, ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions)
WHERE g.code IN ('R41', 'R42', 'R43', 'R44', 'SB1', 'U43', 'U44', 'UB1', 'UT1', 'UT2');


-- Delete existing sections for qualifying grants to avoid duplicates
DELETE FROM public.grant_requirements
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE code IN ('R41', 'R42', 'R43', 'R44', 'SB1', 'U43', 'U44', 'UB1', 'UT1', 'UT2')
);

-- Insert requirements for fellowship grants (code starting with 'F') into grant_requirements table
INSERT INTO public.grant_requirements (
    grant_id,
    requirement,
    url
)
SELECT 
    g.id,
    'SBIR/STTR Application Guide' AS requirement,
    'https://grants.nih.gov/grants/how-to-apply-application-guide/forms-i/sbir-sttr-forms-i.pdf' AS url
FROM public.grants g
WHERE g.code IN ('R41', 'R42', 'R43', 'R44', 'SB1', 'U43', 'U44', 'UB1', 'UT1', 'UT2');