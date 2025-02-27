-- Delete existing sections for qualifying grants to avoid duplicates
DELETE FROM public.grant_sections 
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE code LIKE 'F%'
);

-- Insert sections for fellowship grants (code starting with 'F') into grant_sections table
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
        -- 1. Cover Letter
        (1, 'Cover Letter', 'Optional letter providing additional context or information.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         $$Provide the cover letter content if desired.$$
        ),
        -- 2. Assignment Request Form
        (2, 'Assignment Request Form', 'Optional form to request specific NIH assignment.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         $$Provide the assignment request form content if desired.$$
        ),
        -- 3. Project Summary/Abstract
        (3, 'Project Summary/Abstract', 'A concise summary of the proposed research.', false, 
         $$Generate a Project Summary/Abstract for an NIH fellowship grant application based on the research overview provided by the grant writer. The summary should:
- Provide a brief background of the research area and its significance.
- State the specific research problem or gap in knowledge.
- Outline the objectives and methods of the proposed research.
- Highlight the expected outcomes and their potential impact.
- Be written in clear, concise language suitable for a broad scientific audience.
- Adhere to the 30-line limit and NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant writer:
- Research background and significance: [User input]
- Research problem or gap: [User input]
- Objectives and methods: [User input]
- Expected outcomes and impact: [User input]$$,
         $$Review the Project Summary/Abstract for spelling, grammar, and sentence structure errors. Ensure clarity, conciseness, and a polished tone suitable for NIH reviewers.$$,
         $$Check the Project Summary/Abstract for logical consistency, accuracy in reflecting the research plan, and adherence to the 30-line limit. Ensure it effectively conveys the research’s purpose and significance without redundancy or ambiguity.$$,
         NULL,
         $$Verify that the Project Summary/Abstract meets NIH requirements:
- Is it 30 lines or less?
- Does it use plain language accessible to a broad audience?
- Does it address the research problem, objectives, methods, and significance?
- Is it free of hyperlinks or URLs?
- Does it avoid excessive technical detail or jargon?
Flag any deviations with specific reasons for potential rejection.$$,
         $$Provide research background, research problem, objectives, methods, expected outcomes, and impact.$$
        ),
        -- 4. Project Narrative
        (4, 'Project Narrative', 'A 2-3 sentence description of the research’s relevance to public health.', false, 
         $$Generate a Project Narrative for an NIH fellowship grant application. The narrative should:
- Describe the research's relevance to public health in 2-3 sentences.
- Use plain language accessible to a broad audience.
- Highlight how the research addresses a public health issue or advances health outcomes.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant writer:
- Public health relevance: [User input]
- Impact on health outcomes: [User input]$$,
         $$Review the Project Narrative for spelling, grammar, and sentence structure errors. Ensure it is concise, clear, and impactful.$$,
         $$Check the Project Narrative for logical consistency and accuracy in conveying relevance to public health. Ensure it is within 2-3 sentences and free of unnecessary details.$$,
         NULL,
         $$Verify that the Project Narrative meets NIH requirements:
- Is it 2-3 sentences long?
- Does it use plain language?
- Does it clearly articulate the research’s relevance to public health?
- Is it free of hyperlinks or URLs?
Flag any non-compliance with specific reasons.$$,
         $$Provide the public health relevance and impact on health outcomes.$$
        ),
        -- 5. Bibliography & References Cited
        (5, 'Bibliography & References Cited', 'A list of references cited in the application.', true, 
         $$Generate a Bibliography & References Cited section for an NIH fellowship grant application. The section should:
- List all references cited in the application.
- Use a consistent citation format (e.g., APA, MLA).
- Include PMCIDs for NIH-funded articles where applicable.
- Adhere to NIH formatting requirements (no hyperlinks unless PMCID links are allowed).
Use the following information from the grant writer:
- List of references: [User input]$$,
         $$Review the Bibliography & References Cited for citation format consistency, spelling, and grammatical accuracy.$$,
         $$Check the Bibliography & References Cited for completeness:
- Are all cited references included?
- Are PMCIDs provided where required?
Flag any omissions or errors.$$,
         NULL,
         $$Verify that the Bibliography & References Cited meets NIH requirements:
- Are all cited references listed?
- Are PMCIDs included for applicable articles?
- Is it free of hyperlinks (except PMCID links if allowed)?
- Is the format consistent?
Flag any issues with precise justification.$$,
         $$Provide a list of references cited in the application.$$
        ),
        -- 6. Facilities & Other Resources
        (6, 'Facilities & Other Resources', 'A description of institutional resources available to support the research.', false, 
         $$Generate a Facilities & Other Resources section for an NIH fellowship grant application. The section should:
- Describe the institutional environment, including labs, equipment, and support services.
- Explain how these resources will facilitate the research project.
- Use clear, persuasive language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant writer:
- Available resources: [User input]
- How resources support the project: [User input]$$,
         $$Review the Facilities & Other Resources section for spelling, grammar, and sentence structure errors. Ensure clarity and a professional tone.$$,
         $$Check the Facilities & Other Resources section for logical coherence:
- Do the described resources align with the project’s needs?
- Are claims about resource availability substantiated?
Flag any inconsistencies or vague statements.$$,
         NULL,
         $$Verify that the Facilities & Other Resources section meets NIH requirements:
- Does it describe the institutional environment and available resources?
- Does it explain how resources support the project?
- Is it free of hyperlinks or URLs?
- Is it specific and detailed?
Flag any deviations with reasons.$$,
         $$Provide details about available resources and how they support the project.$$
        ),
        -- 7. Equipment
        (7, 'Equipment', 'A list of major equipment available for the project.', true, 
         $$Generate an Equipment section for an NIH fellowship grant application. The section should:
- List major equipment available for the project.
- Briefly describe how each piece supports the research.
- Use clear, concise language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant writer:
- List of major equipment: [User input]
- Role in research: [User input]$$,
         $$Review the Equipment section for spelling, grammar, and sentence structure errors. Ensure clarity and precision.$$,
         $$Check the Equipment section for relevance:
- Are all listed items major equipment relevant to the project?
- Do descriptions logically connect equipment to research needs?
Flag any irrelevant or unsubstantiated entries.$$,
         NULL,
         $$Verify that the Equipment section meets NIH requirements:
- Does it list only major equipment?
- Does it explain the equipment’s role in the project?
- Is it free of hyperlinks or URLs?
- Is it concise yet specific?
Flag any non-compliance.$$,
         $$Provide a list of major equipment and their role in the research.$$
        ),
        -- 8. Other Attachments
        (8, 'Other Attachments', 'Additional attachments as specified in the FOA.', true, 
         $$Generate Other Attachments for an NIH fellowship grant application as specified in the FOA. The attachments should:
- Follow the exact instructions provided in the FOA.
- Use clear, professional language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs unless specified).
Use the following information from the grant writer:
- FOA-specific requirements and content: [User input]$$,
         $$Review the Other Attachments for spelling, grammar, and sentence structure errors. Ensure clarity and adherence to FOA instructions.$$,
         $$Check the Other Attachments for accuracy and compliance:
- Does each attachment match the FOA’s requirements?
- Are naming conventions followed?
Flag any discrepancies.$$,
         NULL,
         $$Verify that the Other Attachments meet NIH and FOA requirements:
- Are all specified attachments included?
- Do filenames match FOA instructions?
- Is content compliant with guidelines?
- Is it free of hyperlinks or URLs unless permitted?
Flag any violations.$$,
         $$Provide FOA-specific requirements and content.$$
        ),
        -- 9. Sponsors' Biographical Sketches
        (9, 'Sponsors'' Biographical Sketches', 'Biographical sketches for the sponsor and co-sponsor(s).', false, 
         NULL, NULL, NULL, NULL, NULL, 
         $$Provide completed biographical sketches for all sponsors in NIH format.$$
        ),
        -- 10. Applicant’s Background and Goals for Fellowship Training
        (10, 'Applicant’s Background and Goals for Fellowship Training', 'Details on background, goals, and fellowship support.', false, 
         $$Generate the Applicant’s Background and Goals for Fellowship Training section for an NIH fellowship grant application. The section should:
- Describe your educational background, research experience, and career goals.
- Explain how the fellowship will support your training and career development.
- Use clear, persuasive language tailored to NIH reviewers.
- Adhere to the page limit in the FOA and NIH formatting requirements (no URLs).
Use the following information:
- Educational background: [User input]
- Research experience: [User input]
- Career goals: [User input]
- How fellowship supports goals: [User input]$$,
         $$Review the Applicant’s Background section for spelling, grammar, and sentence structure errors. Ensure clarity and a professional tone.$$,
         $$Check the Applicant’s Background section for logical flow:
- Does it coherently connect background, experience, and goals?
- Is the fellowship’s role in supporting goals clear?
Flag any gaps or inconsistencies.$$,
         NULL,
         $$Verify that the Applicant’s Background section meets NIH requirements:
- Does it address background, experience, and goals?
- Is it within the FOA page limit?
- Is it free of hyperlinks or URLs?
- Is it persuasive and specific?
Flag any issues with reasons.$$,
         $$Provide educational background, research experience, career goals, and how fellowship supports them.$$
        ),
        -- 11. Specific Aims
        (11, 'Specific Aims', 'A one-page outline of the research objectives and hypotheses.', false, 
         $$Generate a Specific Aims section for an NIH fellowship grant application. The section should:
- Start with an introductory paragraph setting the research context, significance, and overall goal.
- List specific aims that are concise, specific, and aligned with the goal.
- Conclude with a paragraph summarizing expected outcomes and impact.
- Use clear, persuasive language accessible to a broad audience.
- Adhere to the 1-page limit and NIH formatting requirements (no URLs).
Use the following information:
- Research background and significance: [User input]
- Overall goal: [User input]
- Specific aims: [User input]
- Expected outcomes: [User input]
- Impact: [User input]$$,
         $$Review the Specific Aims section for spelling, grammar, and sentence structure errors. Ensure clarity and conciseness.$$,
         $$Check the Specific Aims section for logical consistency:
- Are aims aligned with the goal?
- Are outcomes realistic and impactful?
Flag any vague or misaligned elements.$$,
         NULL,
         $$Verify that the Specific Aims section meets NIH requirements:
- Is it 1 page or less?
- Does it include introduction, aims, and impact?
- Is it free of hyperlinks or URLs?
- Are aims specific and significant?
Flag any non-compliance.$$,
         $$Provide research background, overall goal, specific aims, expected outcomes, and impact.$$
        ),
        -- 12. Research Strategy
        (12, 'Research Strategy', 'A detailed plan covering significance, innovation, and approach.', false, 
         $$Generate a Research Strategy section for an NIH fellowship grant application. The section should:
- Address Significance: Explain the research’s importance and potential impact.
- Address Innovation: Highlight novel aspects of the approach or methods.
- Address Approach: Detail the research design, methods, and analysis plan.
- Use clear, persuasive language tailored to NIH reviewers.
- Adhere to the page limit in the FOA and NIH formatting requirements (no URLs).
Use the following information:
- Significance: [User input]
- Innovation: [User input]
- Approach: [User input]
- Preliminary data (if any): [User input]$$,
         $$Review the Research Strategy section for spelling, grammar, and sentence structure errors. Ensure clarity and a professional tone.$$,
         $$Check the Research Strategy section for logical flow:
- Is the approach feasible and aligned with significance and innovation?
- Are methods scientifically sound?
Flag any weaknesses or inconsistencies.$$,
         $$Generate high-quality visuals (e.g., graphs, charts) for the Research Strategy based on provided data. Ensure visuals are accurate, labeled, and compliant with NIH standards.$$,
         $$Verify that the Research Strategy section meets NIH requirements:
- Does it address significance, innovation, and approach?
- Is it within the page limit?
- Is it free of hyperlinks or URLs?
- Are visuals (if included) compliant?
Flag any issues with reasons.$$,
         $$Provide significance, innovation, approach, and preliminary data (if any).$$
        ),
        -- 13. Respective Contributions
        (13, 'Respective Contributions', 'A description of the collaborative process between applicant and sponsor.', false, 
         $$Generate a Respective Contributions section for an NIH fellowship grant application. The section should:
- Describe the collaborative process between you and your sponsor.
- Explain your role and the sponsor’s role in developing the research plan.
- Use clear, concise language suitable for reviewers.
- Adhere to NIH formatting requirements (no URLs).
Use the following information:
- Collaborative process: [User input]
- Your role: [User input]
- Sponsor’s role: [User input]$$,
         $$Review the Respective Contributions section for spelling, grammar, and clarity. Ensure it is concise and professional.$$,
         $$Check the Respective Contributions section for accuracy:
- Are roles clearly defined?
- Is the collaboration logical?
Flag any vague statements.$$,
         NULL,
         $$Verify that the Respective Contributions section meets NIH requirements:
- Does it describe the collaborative process?
- Are roles clearly explained?
- Is it free of hyperlinks or URLs?
Flag any non-compliance.$$,
         $$Provide details on the collaborative process, your role, and the sponsor’s role.$$
        ),
        -- 14. Selection of Sponsor and Institution
        (14, 'Selection of Sponsor and Institution', 'An explanation of why the sponsor and institution were chosen.', false, 
         $$Generate a Selection of Sponsor and Institution section for an NIH fellowship grant application. The section should:
- Explain why you chose your sponsor and institution for your training.
- Highlight the sponsor’s expertise and institutional resources.
- Use clear, persuasive language.
- Adhere to NIH formatting requirements (no URLs).
Use the following information:
- Reasons for choosing sponsor: [User input]
- Reasons for choosing institution: [User input]$$,
         $$Review the Selection section for spelling, grammar, and clarity. Ensure it is persuasive and professional.$$,
         $$Check the Selection section for logical reasoning:
- Are the choices justified?
- Is the sponsor’s expertise relevant?
Flag any weak justifications.$$,
         NULL,
         $$Verify that the Selection section meets NIH requirements:
- Does it explain the choice of sponsor and institution?
- Is it free of hyperlinks or URLs?
- Is it specific and persuasive?
Flag any issues.$$,
         $$Provide reasons for choosing your sponsor and institution.$$
        ),
        -- 15. Training in the Responsible Conduct of Research
        (15, 'Training in the Responsible Conduct of Research', 'A plan for training in research ethics.', false, 
         $$Generate a Training in the Responsible Conduct of Research section for an NIH fellowship grant application. The section should:
- Describe your plan for ethics training, including format, subject matter, and duration.
- Explain how the training will be integrated into your fellowship.
- Use clear, detailed language.
- Adhere to NIH formatting requirements (no URLs).
Use the following information:
- Ethics training plan: [User input]
- Integration into fellowship: [User input]$$,
         $$Review the Training section for spelling, grammar, and clarity. Ensure it is detailed and professional.$$,
         $$Check the Training section for completeness:
- Does it cover format, subject matter, and duration?
- Is the integration plan feasible?
Flag any missing elements.$$,
         NULL,
         $$Verify that the Training section meets NIH requirements:
- Does it describe the ethics training plan?
- Is it free of hyperlinks or URLs?
- Is it specific and compliant?
Flag any non-compliance.$$,
         $$Provide your ethics training plan and how it integrates into your fellowship.$$
        ),
        -- 16. Sponsor and Co-Sponsor Statements
        (16, 'Sponsor and Co-Sponsor Statements', 'Statements from sponsor(s) detailing the training plan.', false, 
         NULL, NULL, NULL, NULL, NULL, 
         $$Provide statements from your sponsor(s) detailing the training plan.$$
        ),
        -- 17. Letters of Support from Collaborators, Contributors, and Consultants
        (17, 'Letters of Support from Collaborators, Contributors, and Consultants', 'Support letters, if applicable.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         $$Provide letters of support from collaborators, if applicable.$$
        ),
        -- 18. Description of Institutional Environment and Commitment to Training
        (18, 'Description of Institutional Environment and Commitment to Training', 'Details on institutional support.', false, 
         $$Generate a Description of Institutional Environment and Commitment to Training section for an NIH fellowship grant application. The section should:
- Describe the institutional environment, including resources and support for training.
- Explain the institution’s commitment to your training and career development.
- Use clear, persuasive language.
- Adhere to NIH formatting requirements (no URLs).
Use the following information:
- Institutional environment: [User input]
- Institutional commitment: [User input]$$,
         $$Review the Description section for spelling, grammar, and clarity. Ensure it is persuasive and professional.$$,
         $$Check the Description section for specificity:
- Are resources and commitments clearly described?
- Is the institution’s role in training evident?
Flag any vague statements.$$,
         NULL,
         $$Verify that the Description section meets NIH requirements:
- Does it describe the environment and commitment?
- Is it free of hyperlinks or URLs?
- Is it specific and detailed?
Flag any issues.$$,
         $$Provide details on the institutional environment and commitment to your training.$$
        ),
        -- 19. Applicant's Biographical Sketch
        (19, 'Applicant''s Biographical Sketch', 'The applicant’s biographical sketch in NIH format.', false, 
         NULL, NULL, NULL, NULL, NULL, 
         $$Provide your completed biographical sketch in NIH format.$$
        ),
        -- 20. Progress Report Publication List
        (20, 'Progress Report Publication List', 'List of publications from prior support for renewals.', true, 
         $$Generate a Progress Report Publication List for an NIH fellowship grant application. The section should:
- List publications from prior support, including PMCIDs where applicable.
- Use a consistent format.
- Adhere to NIH formatting requirements (no URLs except PMCID links).
Use the following information:
- List of publications: [User input]$$,
         $$Review the Progress Report Publication List for spelling, grammar, and formatting errors.$$,
         $$Check the Progress Report Publication List for completeness:
- Are all relevant publications included?
- Are PMCIDs provided where required?
Flag any omissions.$$,
         NULL,
         $$Verify that the Progress Report Publication List meets NIH requirements:
- Does it include all publications from prior support?
- Are PMCIDs included?
- Is it free of hyperlinks (except PMCID links)?
Flag any non-compliance.$$,
         $$Provide a list of publications from prior support (for renewals).$$
        ),
        -- 21. Vertebrate Animals
        (21, 'Vertebrate Animals', 'A plan for the use and care of vertebrate animals, if applicable.', true, 
         $$Generate a Vertebrate Animals section for an NIH fellowship grant application. The section should:
- Describe the use of animals, justification, and care procedures.
- Follow NIH guidelines for animal welfare.
- Use clear, detailed language.
- Adhere to NIH formatting requirements (no URLs).
Use the following information:
- Animal use details: [User input]$$,
         $$Review the Vertebrate Animals section for spelling, grammar, and clarity. Ensure it is detailed and compliant.$$,
         $$Check the Vertebrate Animals section for completeness:
- Does it address use, justification, and care?
- Is it compliant with NIH policies?
Flag any missing elements.$$,
         NULL,
         $$Verify that the Vertebrate Animals section meets NIH requirements:
- Does it cover all necessary aspects of animal use?
- Is it free of hyperlinks or URLs?
Flag any issues.$$,
         $$Provide details on the use and care of vertebrate animals, if applicable.$$
        ),
        -- 22. Select Agent Research
        (22, 'Select Agent Research', 'A description of select agent use and safety protocols, if applicable.', true, 
         $$Generate a Select Agent Research section for an NIH fellowship grant application. The section should:
- Describe the select agents used and safety protocols.
- Follow NIH and federal guidelines.
- Use clear, detailed language.
- Adhere to NIH formatting requirements (no URLs).
Use the following information:
- Select agent details: [User input]$$,
         $$Review the Select Agent Research section for spelling, grammar, and clarity. Ensure it is detailed and compliant.$$,
         $$Check the Select Agent Research section for completeness:
- Does it describe agents and safety measures?
- Is it compliant with regulations?
Flag any missing elements.$$,
         NULL,
         $$Verify that the Select Agent Research section meets NIH requirements:
- Does it cover all necessary details?
- Is it free of hyperlinks or URLs?
Flag any issues.$$,
         $$Provide details on select agent use and safety, if applicable.$$
        ),
        -- 23. Resource Sharing Plan
        (23, 'Resource Sharing Plan', 'A plan for sharing research resources, if applicable.', true, 
         $$Generate a Resource Sharing Plan for an NIH fellowship grant application. The plan should:
- Describe how resources (e.g., data, materials) will be shared.
- Follow NIH guidelines for resource sharing.
- Use clear, detailed language.
- Adhere to NIH formatting requirements (no URLs).
Use the following information:
- Resource sharing details: [User input]$$,
         $$Review the Resource Sharing Plan for spelling, grammar, and clarity. Ensure it is detailed and compliant.$$,
         $$Check the Resource Sharing Plan for completeness:
- Does it describe sharing methods and timelines?
- Is it compliant with NIH policies?
Flag any missing elements.$$,
         NULL,
         $$Verify that the Resource Sharing Plan meets NIH requirements:
- Does it cover all necessary aspects of resource sharing?
- Is it free of hyperlinks or URLs?
Flag any issues.$$,
         $$Provide details on resource sharing, if applicable.$$
        ),
        -- 24. Authentication of Key Biological and/or Chemical Resources
        (24, 'Authentication of Key Biological and/or Chemical Resources', 'Authentication details, if applicable.', true, 
         $$Generate an Authentication of Key Biological and/or Chemical Resources section for an NIH fellowship grant application. The section should:
- Describe how key resources will be authenticated.
- Follow NIH guidelines for authentication.
- Use clear, detailed language.
- Adhere to NIH formatting requirements (no URLs).
Use the following information:
- Authentication details: [User input]$$,
         $$Review the Authentication section for spelling, grammar, and clarity. Ensure it is detailed and compliant.$$,
         $$Check the Authentication section for completeness:
- Does it describe authentication methods?
- Is it compliant with NIH policies?
Flag any missing elements.$$,
         NULL,
         $$Verify that the Authentication section meets NIH requirements:
- Does it cover all necessary aspects of authentication?
- Is it free of hyperlinks or URLs?
Flag any issues.$$,
         $$Provide details on authentication of key resources, if applicable.$$
        ),
        -- 25. Appendix
        (25, 'Appendix', 'Supplemental materials, with strict limitations, optional per FOA.', true, 
         NULL, NULL, NULL, NULL, NULL, 
         $$Provide supplemental materials per FOA restrictions, if desired.$$
        )
    ) AS s(flow_order, name, description, optional, ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions)
WHERE g.code LIKE 'F%';

-- Delete existing sections for qualifying grants to avoid duplicates
DELETE FROM public.grant_requirements
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE code LIKE 'F%'
);

-- Insert requirements for fellowship grants (code starting with 'F') into grant_requirements table
INSERT INTO public.grant_requirements (
    grant_id,
    requirement,
    url
)
SELECT 
    g.id,
    'Fellowship Application Guide' AS requirement,
    'https://grants.nih.gov/grants/how-to-apply-application-guide/forms-i/fellowship-forms-i.pdf' AS url
FROM public.grants g
WHERE g.code LIKE 'F%';