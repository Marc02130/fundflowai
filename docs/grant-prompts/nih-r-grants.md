-- Delete existing sections for qualifying grants to avoid duplicates
DELETE FROM public.grant_sections 
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE (code LIKE 'R%' OR code LIKE 'U%')
    AND code NOT IN ('R41', 'R42', 'R43', 'R44', 'SB1', 'U43', 'U44', 'UB1', 'UT1', 'UT2')
);

-- Insert new sections for qualifying grants
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
        -- 1. Project Summary/Abstract (Page 25, Required)
        (1, 'Project Summary/Abstract', 'A succinct summary of the proposed work, limited to 30 lines, describing the research’s broad, long-term objectives and public health relevance.', false, 
         'Generate a Project Summary/Abstract for an NIH grant application based on the research overview provided by the grant writer. The summary should:\n- Provide a concise background of the research area and its importance.\n- State the broad, long-term objectives of the proposed work.\n- Describe the specific problem or gap in knowledge being addressed.\n- Highlight the relevance to public health or scientific advancement.\n- Be written in clear, concise language suitable for a broad scientific audience, avoiding excessive jargon.\n- Adhere to the 30-line limit and NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Research background and importance: [User input]\n- Long-term objectives: [User input]\n- Specific problem or gap: [User input]\n- Public health relevance: [User input]', 
         'Review the Project Summary/Abstract for spelling, grammar, and sentence structure errors. Ensure clarity, conciseness, and a polished, professional tone.', 
         'Check the Project Summary/Abstract for logical coherence, accuracy in reflecting the research objectives, and adherence to the 30-line limit. Ensure it effectively conveys the project’s purpose and relevance without extraneous details.', 
         NULL, 
         'Verify that the Project Summary/Abstract meets NIH requirements:\n- Is it 30 lines or fewer?\n- Does it use plain language accessible to a broad audience?\n- Does it address the broad, long-term objectives and public health relevance?\n- Is it free of hyperlinks, URLs, or unallowable content (e.g., proprietary information)?\n- Does it avoid excessive technical detail or jargon?', 
         'Provide research background, long-term objectives, specific problem or gap, and public health relevance.'),
        
        -- 2. Project Narrative (Page 25, Required)
        (2, 'Project Narrative', 'A 2-3 sentence description of the project’s relevance to public health, written in plain language for a lay audience.', false,
         'Generate a Project Narrative for an NIH grant application using the public health details provided by the grant writer. The narrative should:\n- Concisely (in 2-3 sentences) describe the project’s relevance to public health.\n- Use plain language suitable for a lay audience, avoiding scientific jargon.\n- Highlight how the research addresses a health issue or advances well-being.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Public health relevance: [User input]\n- Impact on health or well-being: [User input]', 
         'Review the Project Narrative for spelling, grammar, and clarity. Ensure it is concise, impactful, and polished.', 
         'Check the Project Narrative for clarity and effectiveness in conveying public health relevance within 2-3 sentences. Ensure no unnecessary details or jargon are included.', 
         NULL, 
         'Verify that the Project Narrative meets NIH requirements:\n- Is it 2-3 sentences long?\n- Does it use plain, lay-friendly language?\n- Does it clearly articulate the project’s relevance to public health?\n- Is it free of hyperlinks or URLs?', 
         'Provide public health relevance and impact on health or well-being.'),
        
        -- 3. Bibliography & References Cited (Page 26, Optional)
        (3, 'Bibliography & References Cited', 'A list of all references cited in the application, formatted consistently.', true,
         'Generate a Bibliography & References Cited section for an NIH grant application using the references provided by the grant writer. Ensure:\n- All references cited in the application are included.\n- References are formatted consistently (e.g., NIH or APA style).\n- Each entry is complete with authors, title, journal, year, volume, and pages as applicable.\n- Adheres to NIH formatting requirements (no hyperlinks unless PMCID is included).\nUse the following information from the grant writer:\n- List of references cited: [User input]', 
         'Review the Bibliography & References Cited section for spelling, grammar, and formatting consistency across all entries.', 
         'Check the Bibliography & References Cited section for accuracy and completeness. Ensure all cited works are listed, formatting is consistent, and no uncited references are included.', 
         NULL, 
         'Verify that the Bibliography & References Cited meets NIH requirements:\n- Does it include all references cited in the application?\n- Is the formatting consistent and appropriate (e.g., NIH or APA style)?\n- Are hyperlinks absent except for PMCIDs where applicable?\n- Does it avoid extraneous or uncited references?', 
         'Provide a list of all references cited in the application.'),
        
        -- 4. Facilities & Other Resources (Page 27, Required)
        (4, 'Facilities & Other Resources', 'Describes the institutional resources (e.g., labs, equipment, support services) available to support the project.', false,
         'Generate a Facilities & Other Resources section for an NIH grant application using the resource details provided by the grant writer. The section should:\n- Describe the institutional environment, including labs, equipment, and support services.\n- Explain how these resources will facilitate the project’s success.\n- Highlight any unique or specialized facilities relevant to the research.\n- Be concise and specific, avoiding vague statements.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Institutional resources available: [User input]\n- How resources support the project: [User input]', 
         'Review the Facilities & Other Resources section for spelling, grammar, and clarity. Ensure a professional and polished presentation.', 
         'Check the Facilities & Other Resources section for completeness and relevance. Ensure all listed resources are tied to the project’s needs and no critical resources are omitted.', 
         NULL, 
         'Verify that the Facilities & Other Resources section meets NIH requirements:\n- Does it describe the institutional environment and available resources?\n- Does it explain how these resources support the project?\n- Is it specific and free of vague or unsupported claims?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide details on institutional resources and how they support the project.'),
        
        -- 5. Equipment (Page 28, Optional)
        (5, 'Equipment', 'Lists major equipment available for the project, with brief descriptions of relevance if applicable.', true,
         'Generate an Equipment section for an NIH grant application using the equipment details provided by the grant writer. The section should:\n- List major equipment available for the project.\n- Include brief descriptions of how each piece supports the research, if applicable.\n- Be concise and relevant to the project’s needs.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- List of major equipment: [User input]\n- Relevance to the project: [User input]', 
         'Review the Equipment section for spelling, grammar, and clarity. Ensure a polished and concise presentation.', 
         'Check the Equipment section for completeness and relevance. Ensure all listed equipment is necessary for the project and no irrelevant items are included.', 
         NULL, 
         'Verify that the Equipment section meets NIH requirements:\n- Does it list only major equipment relevant to the project?\n- Are descriptions (if included) brief and tied to project needs?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide a list of major equipment and its relevance to the project.'),
        
        -- 6. Biographical Sketch (Page 29, Required)
        (6, 'Biographical Sketch', 'Provides biographical information for key personnel, including education, positions, and contributions, using the NIH Biosketch format.', false,
         NULL, NULL, NULL, NULL, NULL, 
         'Provide completed NIH-format Biosketches for all Senior/Key Personnel.'),
        
        -- 7. Budget Justification (Page 34, Required)
        (7, 'Budget Justification', 'Details and justifies all requested budget items (e.g., personnel, equipment, travel) to support the project.', false,
         'Generate a Budget Justification for an NIH grant application using the budget details provided by the grant writer. The justification should:\n- Detail each budget category (e.g., personnel, equipment, travel, supplies).\n- Justify the necessity of each item for the project’s success.\n- Provide specific explanations for costs, aligning with NIH budget guidelines.\n- Be clear, concise, and comprehensive.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Budget categories and amounts: [User input]\n- Justification for each category: [User input]', 
         'Review the Budget Justification for spelling, grammar, and clarity. Ensure a professional and polished tone.', 
         'Check the Budget Justification for completeness, accuracy, and logical consistency. Ensure all costs are justified, align with the project scope, and no critical items are omitted.', 
         NULL, 
         'Verify that the Budget Justification meets NIH requirements:\n- Does it detail and justify all budget categories?\n- Are costs reasonable, allowable, and necessary for the project?\n- Is it specific and aligned with NIH budget guidelines?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide budget categories, amounts, and justification for each.'),
        
        -- 8. Introduction to Application (Page 38, Conditionally Required - Optional)
        (8, 'Introduction to Application', 'A one-page summary for resubmissions or revisions, addressing prior reviewer critiques and describing changes made.', true,
         'Generate an Introduction to Application for an NIH resubmission or revision grant using the reviewer feedback and revisions provided by the grant writer. The introduction should:\n- Summarize the major critiques from the previous review.\n- Describe specific changes made in response to each critique.\n- Highlight how the revised application is improved and more competitive.\n- Be concise, persuasive, and limited to one page.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Previous reviewer critiques: [User input]\n- Summary of changes made: [User input]', 
         'Review the Introduction to Application for spelling, grammar, and clarity. Ensure a polished and professional presentation.', 
         'Check the Introduction to Application for logical flow and completeness. Ensure all major critiques are addressed and changes are clearly described within the one-page limit.', 
         NULL, 
         'Verify that the Introduction to Application meets NIH requirements:\n- Is it one page or less?\n- Does it address all major reviewer critiques?\n- Does it clearly describe the changes made?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide previous reviewer critiques and a summary of changes made.'),
        
        -- 9. Specific Aims (Page 38, Required)
        (9, 'Specific Aims', 'A one-page outline of the research goals, including background, aims, and expected impact.', false,
         'Based on the context provided by the grant writer, generate a compelling and cohesive Specific Aims attachment for an NIH grant application. The attachment should:\n- Start with an introductory paragraph that sets the context by describing the research background and significance, identifies the gap in knowledge or problem to be addressed, and states the overall goal of the proposed research.\n- Clearly list the specific aims, ensuring each aim is concise, specific, and aligned with the overall goal. The aims should reflect objectives such as testing a hypothesis, creating a novel design, solving a specific problem, challenging an existing paradigm or clinical practice, addressing a critical barrier to progress, or developing new technology.\n- Conclude with a paragraph that summarizes the expected outcomes and explains the impact of the research on the field(s), emphasizing how achieving these aims will advance knowledge, solve problems, or lead to new applications.\n- Use the following information provided by the grant writer:\n  - Research background and significance: [User input]\n  - Overall goal of the research: [User input]\n  - Specific aims: [User input]\n  - Expected outcomes: [User input]\n  - Impact on the research field(s): [User input]\n- Ensure the attachment is:\n  - Written in a clear, concise, and persuasive manner, using active voice and avoiding unnecessary jargon, so it is accessible to a broad scientific audience.\n  - Crafted to make every word count, highlighting the novelty, significance, and potential impact of the research.\n  - Compliant with NIH requirements: adheres to the one-page limit, formatted as a PDF-ready text document without hyperlinks or URLs.', 
         'Review the Specific Aims section for spelling, grammar, and sentence structure errors. Ensure clarity, conciseness, and a polished tone.', 
         'Check the Specific Aims section for logical consistency, alignment with the overall goal, and feasibility of the aims. Ensure the background, aims, and impact are cohesive within the one-page limit.', 
         NULL, 
         'Verify that the Specific Aims section meets NIH requirements:\n- Is it one page or less?\n- Does it include an introduction, specific aims, and impact summary?\n- Are the aims concise, specific, and aligned with the goal?\n- Is it free of hyperlinks or URLs?\n- Does it use clear, persuasive language suitable for a broad audience?', 
         'Provide research background, overall goal, specific aims, expected outcomes, and impact.'),
        
        -- 10. Research Strategy (Page 39, Required)
        (10, 'Research Strategy', 'Details the project’s significance, innovation, and approach, typically 6 or 12 pages depending on grant type.', false,
         'Generate a Research Strategy section for an NIH grant application using the research details provided by the grant writer. The section should:\n- Be organized into three subsections: Significance, Innovation, and Approach.\n- **Significance**: Explain the importance of the problem, the scientific premise, and how the project will advance the field.\n- **Innovation**: Describe how the project challenges existing paradigms, introduces novel concepts, methods, or technologies, and offers advantages over prior approaches.\n- **Approach**: Detail the overall strategy, methodology, and analyses, including preliminary data (if any), plans for addressing weaknesses, and alternative strategies for risks.\n- Incorporate scientific rigor and address biological variables (e.g., sex) as applicable.\n- Be clear, logical, and persuasive, tailored to the grant type’s page limit (e.g., 12 pages for R01).\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Significance and scientific premise: [User input]\n- Innovation details: [User input]\n- Approach, methodology, and preliminary data: [User input]\n- Risk management and alternatives: [User input]', 
         'Review the Research Strategy section for spelling, grammar, and clarity. Ensure each subsection is well-organized, cohesive, and professionally presented.', 
         'Check the Research Strategy section for logical flow, scientific accuracy, and consistency across subsections. Ensure the approach is feasible, risks are addressed, and preliminary data (if included) supports the plan.', 
         'Objective:\nGenerate high-quality visuals (e.g., graphs, charts, diagrams) for the Research Strategy section based on the user-provided context and data files. The visuals should enhance the clarity and impact of the research plan.\nInstructions:\n- Analyze the user’s context and data to determine the best visual type (e.g., flowchart for methods, graph for preliminary data trends).\n- Ensure visuals are scientifically accurate, clearly labeled (e.g., axes, legends, titles), and professionally designed.\n- Deliver visuals in PNG or PDF format, compatible with NIH guidelines (high resolution, no embedded links).\n- If raw data is provided (e.g., tables), select an appropriate visual (e.g., bar chart for comparisons).\n- Attach a note: "Please review the generated visual(s) for accuracy and alignment with your research objectives."', 
         'Verify that the Research Strategy section meets NIH requirements:\n- Does it include Significance, Innovation, and Approach subsections?\n- Does it adhere to the page limit (e.g., 12 pages for R01, 6 for other types)?\n- Is the scientific premise robust and supported?\n- Does it address scientific rigor and biological variables (e.g., sex)?\n- Is it free of hyperlinks or URLs?\n- Does it provide a clear, compelling case for funding?', 
         'Provide significance, innovation, approach details, preliminary data, and risk management. Include data files for visuals if desired.'),
        
        -- 11. Progress Report Publication List (Page 42, Conditionally Required - Optional)
        (11, 'Progress Report Publication List', 'Lists publications resulting from prior NIH support, required for renewals.', true,
         'Generate a Progress Report Publication List for an NIH renewal grant application using the publication details provided by the grant writer. The list should:\n- Include all publications resulting from prior NIH support.\n- Format each entry consistently (e.g., NIH or APA style), with authors, title, journal, year, volume, and pages.\n- Indicate PMCIDs or availability status as required.\n- Adhere to NIH formatting requirements (hyperlinks allowed for PMCIDs only).\nUse the following information from the grant writer:\n- List of publications from prior support: [User input]', 
         'Review the Progress Report Publication List for spelling, grammar, and formatting consistency across all entries.', 
         'Check the Progress Report Publication List for accuracy and completeness. Ensure all publications from prior support are included and correctly formatted.', 
         NULL, 
         'Verify that the Progress Report Publication List meets NIH requirements:\n- Does it list all publications from prior NIH support?\n- Is each entry formatted consistently with PMCIDs or availability noted?\n- Are hyperlinks limited to PMCIDs only?\n- Does it avoid extraneous or unrelated publications?', 
         'Provide a list of publications from prior NIH support.'),
        
        -- 12. Vertebrate Animals (Page 43, Conditionally Required - Optional)
        (12, 'Vertebrate Animals', 'Describes the use of vertebrate animals, including justification, procedures, and welfare considerations.', true,
         'Generate a Vertebrate Animals section for an NIH grant application using the animal use details provided by the grant writer. The section should:\n- Justify the use of vertebrate animals, including species and numbers.\n- Describe procedures involving animals and how they address research goals.\n- Address minimization of pain and distress, use of anesthetics/analgesics, and euthanasia methods.\n- Be concise, specific, and compliant with NIH animal welfare policies.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Species and numbers: [User input]\n- Justification for use: [User input]\n- Procedures and research goals: [User input]\n- Pain management and euthanasia: [User input]', 
         'Review the Vertebrate Animals section for spelling, grammar, and clarity. Ensure a polished and professional tone.', 
         'Check the Vertebrate Animals section for completeness and consistency. Ensure all required elements (justification, procedures, welfare) are addressed and align with the research plan.', 
         NULL, 
         'Verify that the Vertebrate Animals section meets NIH requirements:\n- Does it justify the use of vertebrate animals (species and numbers)?\n- Does it describe procedures and their relevance to research goals?\n- Does it address minimization of pain/distress, anesthetics, and euthanasia?\n- Is it compliant with NIH animal welfare policies?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide species, numbers, justification, procedures, and pain management/euthanasia details.'),
        
        -- 13. Select Agent Research (Page 44, Conditionally Required - Optional)
        (13, 'Select Agent Research', 'Details the use of select agents, including safety and containment procedures.', true,
         'Generate a Select Agent Research section for an NIH grant application using the select agent details provided by the grant writer. The section should:\n- Identify the select agents and toxins involved.\n- Describe their use in the research and relevance to project goals.\n- Detail safety, containment, and security procedures per federal guidelines.\n- Be concise, specific, and compliant with NIH select agent policies.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Select agents involved: [User input]\n- Use in research: [User input]\n- Safety and containment procedures: [User input]', 
         'Review the Select Agent Research section for spelling, grammar, and clarity. Ensure a professional presentation.', 
         'Check the Select Agent Research section for completeness and accuracy. Ensure all select agents, uses, and safety measures are fully described and consistent with the research plan.', 
         NULL, 
         'Verify that the Select Agent Research section meets NIH requirements:\n- Does it identify all select agents and toxins?\n- Does it describe their use and relevance to the research?\n- Does it detail safety, containment, and security measures?\n- Is it compliant with federal select agent regulations?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide select agents, their use, and safety/containment procedures.'),
        
        -- 14. Multiple PD/PI Leadership Plan (Page 45, Conditionally Required - Optional)
        (14, 'Multiple PD/PI Leadership Plan', 'Outlines the leadership approach and coordination for projects with multiple Principal Investigators.', true,
         'Generate a Multiple PD/PI Leadership Plan for an NIH grant application using the leadership details provided by the grant writer. The plan should:\n- Describe the rationale for a multi-PD/PI approach and each PI’s expertise.\n- Outline the governance and organizational structure, including decision-making processes.\n- Detail procedures for communication, coordination, and conflict resolution.\n- Be concise, specific, and persuasive.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Rationale and PI expertise: [User input]\n- Governance and decision-making: [User input]\n- Coordination and conflict resolution: [User input]', 
         'Review the Multiple PD/PI Leadership Plan for spelling, grammar, and clarity. Ensure a polished and cohesive presentation.', 
         'Check the Multiple PD/PI Leadership Plan for completeness and logical consistency. Ensure all required elements (rationale, governance, coordination) are addressed and feasible.', 
         NULL, 
         'Verify that the Multiple PD/PI Leadership Plan meets NIH requirements:\n- Does it justify the multi-PD/PI approach with PI expertise?\n- Does it outline governance and organizational structure?\n- Does it address communication, coordination, and conflict resolution?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide rationale, PI expertise, governance, and coordination/conflict resolution details.'),
        
        -- 15. Consortium/Contractual Arrangements (Page 46, Conditionally Required - Optional)
        (15, 'Consortium/Contractual Arrangements', 'Explains arrangements with collaborating organizations or subcontractors.', true,
         'Generate a Consortium/Contractual Arrangements section for an NIH grant application using the collaboration details provided by the grant writer. The section should:\n- Describe the collaborating organizations or subcontractors involved.\n- Explain the programmatic, fiscal, and administrative arrangements.\n- Highlight how these arrangements support the project’s goals.\n- Be concise and specific.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Collaborating organizations/subcontractors: [User input]\n- Arrangements (programmatic, fiscal, administrative): [User input]\n- Support for project goals: [User input]', 
         'Review the Consortium/Contractual Arrangements section for spelling, grammar, and clarity. Ensure a professional tone.', 
         'Check the Consortium/Contractual Arrangements section for completeness and relevance. Ensure all arrangements are detailed and tied to project success.', 
         NULL, 
         'Verify that the Consortium/Contractual Arrangements section meets NIH requirements:\n- Does it identify all collaborating organizations/subcontractors?\n- Does it explain programmatic, fiscal, and administrative arrangements?\n- Does it demonstrate support for the project?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide collaborating organizations, arrangements, and how they support the project.'),
        
        -- 16. Letters of Support (Page 47, Conditionally Required - Optional)
        (16, 'Letters of Support', 'Provides letters from collaborators, consultants, or institutions affirming support or resources.', true,
         'Generate Letters of Support for an NIH grant application using the support details provided by the grant writer. Each letter should:\n- Be written from the perspective of a collaborator, consultant, or institution.\n- Affirm specific support, resources, or commitments to the project.\n- Be concise, professional, and tailored to the project’s needs.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- List of supporters and their roles: [User input]\n- Specific support/resources provided: [User input]', 
         'Review the Letters of Support for spelling, grammar, and clarity. Ensure each letter is polished and professional.', 
         'Check the Letters of Support for accuracy and relevance. Ensure each letter aligns with the project’s goals and commitments are clearly stated.', 
         NULL, 
         'Verify that the Letters of Support meet NIH requirements:\n- Do they affirm specific support or resources for the project?\n- Are they from appropriate collaborators, consultants, or institutions?\n- Are they concise and relevant?\n- Are they formatted correctly with no hyperlinks or URLs?', 
         'Provide a list of supporters, their roles, and specific support/resources.'),
        
        -- 17. Resource Sharing Plan(s) (Page 48, Conditionally Required - Optional)
        (17, 'Resource Sharing Plan(s)', 'Describes how research resources (e.g., data, model organisms) will be shared, required for certain projects.', true,
         'Generate a Resource Sharing Plan(s) for an NIH grant application using the sharing details provided by the grant writer. The plan should:\n- Describe the resources to be shared (e.g., data, model organisms, tools).\n- Detail how, when, and with whom the resources will be shared.\n- Address any legal, ethical, or intellectual property considerations.\n- Be concise and compliant with NIH sharing policies.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Resources to be shared: [User input]\n- Sharing methods and timeline: [User input]\n- Legal/ethical considerations: [User input]', 
         'Review the Resource Sharing Plan(s) for spelling, grammar, and clarity. Ensure a polished presentation.', 
         'Check the Resource Sharing Plan(s) for completeness and feasibility. Ensure all resources, methods, and considerations are addressed consistently.', 
         NULL, 
         'Verify that the Resource Sharing Plan(s) meets NIH requirements:\n- Does it describe all applicable resources (e.g., data, model organisms)?\n- Does it detail sharing methods, timeline, and recipients?\n- Does it address legal, ethical, or IP issues?\n- Is it compliant with NIH sharing policies?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide resources to be shared, sharing methods/timeline, and legal/ethical considerations.'),
        
        -- 18. Authentication of Key Biological and/or Chemical Resources (Page 49, Conditionally Required - Optional)
        (18, 'Authentication of Key Biological and/or Chemical Resources', 'Verifies the identity and quality of key biological/chemical resources critical to the research.', true,
         'Generate an Authentication of Key Biological and/or Chemical Resources section for an NIH grant application using the resource details provided by the grant writer. The section should:\n- Identify key biological and/or chemical resources critical to the research.\n- Describe methods to authenticate their identity and quality (e.g., testing, validation).\n- Be concise, specific, and scientifically sound.\n- Adhere to NIH formatting requirements (no hyperlinks or URLs).\nUse the following information from the grant writer:\n- Key resources: [User input]\n- Authentication methods: [User input]', 
         'Review the Authentication section for spelling, grammar, and clarity. Ensure a professional tone.', 
         'Check the Authentication section for completeness and scientific validity. Ensure all key resources and methods are described and feasible.', 
         NULL, 
         'Verify that the Authentication section meets NIH requirements:\n- Does it identify all key biological/chemical resources?\n- Does it describe valid authentication methods?\n- Is it concise and relevant to the research?\n- Is it formatted correctly with no hyperlinks or URLs?', 
         'Provide key resources and authentication methods.'),
        
        -- 19. Appendix (Page 50, Optional)
        (19, 'Appendix', 'Includes supplementary materials allowed by the funding opportunity (e.g., manuscripts, surveys), limited to specific items.', true,
         NULL, NULL, NULL, NULL, NULL, 
		 'Provide supplementary materials and funding opportunity requirements.'),
        
        -- 20. Assignment Request Form (Page 51, Optional)
        (20, 'Assignment Request Form', 'Suggests NIH institute/center and review group assignments (optional form, PDF attachment if submitted).', true,
         NULL, NULL, NULL, NULL, NULL, 
         'Provide completed Assignment Request Form if desired.')
) AS s(flow_order, name, description, optional, ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions)
WHERE (g.code LIKE 'R%' OR g.code LIKE 'U%')
AND g.code NOT IN ('R41', 'R42', 'R43', 'R44', 'SB1', 'U43', 'U44', 'UB1', 'UT1', 'UT2');

-- Delete existing sections for qualifying grants to avoid duplicates
DELETE FROM public.grant_requirements
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE (code LIKE 'R%' OR code LIKE 'U%')
    AND code NOT IN ('R41', 'R42', 'R43', 'R44', 'SB1', 'U43', 'U44', 'UB1', 'UT1', 'UT2')
);

-- Insert requirements for fellowship grants (code starting with 'F') into grant_requirements table
INSERT INTO public.grant_requirements (
    grant_id,
    requirement,
    url
)
SELECT 
    g.id,
    'Research Application Guide' AS requirement,
    'https://grants.nih.gov/grants/how-to-apply-application-guide/forms-i/research-forms-i.pdf' AS url
FROM public.grants g
WHERE (g.code LIKE 'R%' OR g.code LIKE 'U%')
AND g.code NOT IN ('R41', 'R42', 'R43', 'R44', 'SB1', 'U43', 'U44', 'UB1', 'UT1', 'UT2');