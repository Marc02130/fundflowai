-- Delete existing sections for qualifying grants to avoid duplicates
DELETE FROM public.grant_sections 
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE code LIKE 'K%' AND code NOT IN ('K12', 'KL2', 'KM1')
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
        (1, 'Candidate Information and Goals for Career Development', 'Details the candidate’s background, career goals, and career development plan.', false,
         'Based on the context provided by the grant creator, generate a comprehensive Candidate Information and Goals for Career Development attachment for an NIH K grant application. The attachment should:\n- Describe the candidate’s background, including education, training, and research experience relevant to the proposed career development.\n- Outline immediate and long-term career goals, explaining how they align with the candidate’s prior experience and the proposed research.\n- Detail a career development plan, including planned training activities (e.g., courses, workshops, mentoring), how these enhance research skills, and how they support the transition to independence.\n- Use the following information provided by the grant creator:\n  - Candidate background: [User input]\n  - Immediate and long-term career goals: [User input]\n  - Career development plan details: [User input]\nEnsure the attachment is:\n- Written in a clear, concise, and persuasive manner, using active voice, suitable for a broad scientific audience.\n- Limited to 6 pages when combined with Research Strategy (unless specified otherwise in the FOA), formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Candidate Information and Goals for Career Development section for spelling, grammar, and sentence structure errors. Ensure clarity, conciseness, and a professional tone.',
         'Check the Candidate Information and Goals for Career Development section for logical consistency, alignment between background, goals, and plan, and feasibility of the proposed training. Ensure cohesion with the Research Strategy within the 6-page limit.',
         NULL,
         'Verify that the Candidate Information and Goals for Career Development section meets NIH requirements:\n- Does it address background, career goals, and career development plan?\n- Is it within the 6-page limit when combined with Research Strategy?\n- Is it free of hyperlinks or URLs?\n- Does it use clear, persuasive language suitable for reviewers?',
         'Provide your background, immediate and long-term career goals, and details of your career development plan.'
        ),
        (2, 'Specific Aims', 'Outlines the specific objectives of the research project.', false,
         'Based on the context provided by the grant creator, generate a compelling and cohesive Specific Aims attachment for an NIH K grant application. The attachment should:\n- Start with an introductory paragraph describing the research background, significance, knowledge gap or problem, and overall goal.\n- List specific aims, each concise, specific, and aligned with the goal (e.g., testing a hypothesis, solving a problem, developing technology).\n- Conclude with a paragraph summarizing expected outcomes and the research’s impact on the field(s).\n- Use the following information provided by the grant creator:\n  - Research background and significance: [User input]\n  - Overall goal: [User input]\n  - Specific aims: [User input]\n  - Expected outcomes: [User input]\n  - Impact on the field(s): [User input]\nEnsure the attachment is:\n- Clear, concise, persuasive, using active voice, accessible to a broad audience.\n- Limited to 1 page, formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Specific Aims section for spelling, grammar, and sentence structure errors. Ensure clarity, conciseness, and a polished tone.',
         'Check the Specific Aims section for logical consistency, alignment with the goal, and feasibility of the aims. Ensure cohesion within the 1-page limit.',
         NULL,
         'Verify that the Specific Aims section meets NIH requirements:\n- Is it 1 page or less?\n- Does it include an introduction, aims, and impact summary?\n- Are aims concise, specific, and aligned with the goal?\n- Is it free of hyperlinks or URLs?\n- Does it use persuasive language for a broad audience?',
         'Provide research background, overall goal, specific aims, expected outcomes, and impact.'
        ),
        (3, 'Research Strategy', 'Describes the research plan, including significance, innovation, and approach.', false,
         'Based on the context provided by the grant creator, generate a detailed Research Strategy attachment for an NIH K grant application. The attachment should:\n- Include a Significance section explaining the research’s importance, scientific premise, and impact on the field.\n- Include an Innovation section highlighting novel aspects of the research.\n- Include an Approach section detailing the research design, methods, expected outcomes, potential problems, and alternative strategies.\n- Use the following information provided by the grant creator:\n  - Significance and scientific premise: [User input]\n  - Innovative aspects: [User input]\n  - Research design and methods: [User input]\n  - Expected outcomes and alternatives: [User input]\nEnsure the attachment is:\n- Clear, concise, persuasive, using active voice, suitable for a broad audience.\n- Limited to 6 pages when combined with Candidate Information (unless specified otherwise), formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Research Strategy section for spelling, grammar, and sentence structure errors. Ensure clarity and a professional tone.',
         'Check the Research Strategy section for logical flow, scientific rigor, and feasibility of the approach. Ensure alignment with Significance and Innovation within the 6-page limit.',
         NULL,
         'Verify that the Research Strategy section meets NIH requirements:\n- Does it address Significance, Innovation, and Approach?\n- Is it within the 6-page limit with Candidate Information?\n- Is it free of hyperlinks or URLs?\n- Does it use rigorous, persuasive language?',
         'Provide significance, innovation, research design, methods, expected outcomes, and alternatives.'
        ),
        (4, 'Training in the Responsible Conduct of Research', 'Describes the plan for training in responsible research conduct.', false,
         'Based on the context provided by the grant creator, generate a Training in the Responsible Conduct of Research attachment for an NIH K grant application. The attachment should:\n- Describe the training format (e.g., courses, workshops), subject matter (e.g., ethics, data management), faculty participation, duration, and frequency.\n- Use the following information provided by the grant creator:\n  - Training format and subject matter: [User input]\n  - Faculty participation: [User input]\n  - Duration and frequency: [User input]\nEnsure the attachment is:\n- Clear, concise, and detailed, using active voice, suitable for reviewers.\n- Limited to 1 page, formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Training in the Responsible Conduct of Research section for spelling, grammar, and sentence structure errors. Ensure clarity and precision.',
         'Check the Training in the Responsible Conduct of Research section for completeness and feasibility of the training plan within the 1-page limit.',
         NULL,
         'Verify that the Training in the Responsible Conduct of Research section meets NIH requirements:\n- Does it cover format, subject matter, faculty participation, duration, and frequency?\n- Is it 1 page or less?\n- Is it free of hyperlinks or URLs?',
         'Provide training format, subject matter, faculty participation, duration, and frequency.'
        ),
        (5, 'Plans and Statements of Mentor and Co-Mentor(s)', 'Details the mentoring plan and commitments from mentors.', false,
         'Based on the context provided by the grant creator, generate a Plans and Statements of Mentor and Co-Mentor(s) attachment for an NIH K grant application. The attachment should:\n- Describe the mentoring plan, including guidance on research, career development, and transition to independence.\n- Include specific commitments from each mentor/co-mentor (e.g., time, resources).\n- Use the following information provided by the grant creator:\n  - Mentoring plan details: [User input]\n  - Mentor/co-mentor commitments: [User input]\nEnsure the attachment is:\n- Clear, concise, persuasive, using active voice, suitable for reviewers.\n- Limited to 6 pages, formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Plans and Statements of Mentor and Co-Mentor(s) section for spelling, grammar, and sentence structure errors. Ensure clarity and a polished tone.',
         'Check the Plans and Statements of Mentor and Co-Mentor(s) section for consistency, specificity of commitments, and feasibility within the 6-page limit.',
         NULL,
         'Verify that the Plans and Statements of Mentor and Co-Mentor(s) section meets NIH requirements:\n- Does it detail the mentoring plan and mentor commitments?\n- Is it 6 pages or less?\n- Is it free of hyperlinks or URLs?',
         'Provide mentoring plan details and mentor/co-mentor commitments.'
        ),
        (6, 'Letters of Support from Collaborators, Contributors, and Consultants', 'Provides support letters from collaborators and contributors.', true,
         'Based on the context provided by the grant creator, generate a Letters of Support from Collaborators, Contributors, and Consultants attachment for an NIH K grant application. The attachment should:\n- Include individual letters detailing each collaborator’s role, commitment, and support for the project.\n- Use the following information provided by the grant creator:\n  - Collaborators’ roles and commitments: [User input]\nEnsure the attachment is:\n- Clear, concise, and specific, using active voice, suitable for reviewers.\n- Limited to 6 pages, formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Letters of Support section for spelling, grammar, and sentence structure errors. Ensure clarity and professionalism.',
         'Check the Letters of Support section for specificity of roles and commitments, and consistency within the 6-page limit.',
         NULL,
         'Verify that the Letters of Support section meets NIH requirements:\n- Does it detail collaborator roles and commitments?\n- Is it 6 pages or less?\n- Is it free of hyperlinks or URLs?',
         'Provide roles and commitments of collaborators.'
        ),
        (7, 'Description of Institutional Environment', 'Describes the institutional resources and environment supporting the research.', false,
         'Based on the context provided by the grant creator, generate a Description of Institutional Environment attachment for an NIH K grant application. The attachment should:\n- Describe the institutional resources (e.g., facilities, equipment, intellectual environment) and how they support the candidate’s research and career development.\n- Use the following information provided by the grant creator:\n  - Institutional resources and support: [User input]\nEnsure the attachment is:\n- Clear, concise, and specific, using active voice, suitable for reviewers.\n- Limited to 1 page, formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Description of Institutional Environment section for spelling, grammar, and sentence structure errors. Ensure clarity and precision.',
         'Check the Description of Institutional Environment section for specificity and relevance to the research within the 1-page limit.',
         NULL,
         'Verify that the Description of Institutional Environment section meets NIH requirements:\n- Does it describe resources and support?\n- Is it 1 page or less?\n- Is it free of hyperlinks or URLs?',
         'Provide details of institutional resources and support.'
        ),
        (8, 'Institutional Commitment to Candidate’s Research Career Development', 'Documents the institution’s commitment to the candidate’s career.', false,
         'Based on the context provided by the grant creator, generate an Institutional Commitment to Candidate’s Research Career Development attachment for an NIH K grant application. The attachment should:\n- Detail the institution’s commitment (e.g., time, resources, support) to the candidate’s research and career development.\n- Use the following information provided by the grant creator:\n  - Institutional commitment details: [User input]\nEnsure the attachment is:\n- Clear, concise, and specific, using active voice, suitable for reviewers.\n- Limited to 1 page, formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Institutional Commitment section for spelling, grammar, and sentence structure errors. Ensure clarity and professionalism.',
         'Check the Institutional Commitment section for specificity and feasibility of commitments within the 1-page limit.',
         NULL,
         'Verify that the Institutional Commitment section meets NIH requirements:\n- Does it detail institutional support?\n- Is it 1 page or less?\n- Is it free of hyperlinks or URLs?',
         'Provide details of institutional commitment.'
        ),
        (9, 'Biographical Sketch', 'Provides the candidate’s biosketch in NIH format.', false,
         'Based on the context provided by the grant creator, generate a Biographical Sketch attachment for an NIH K grant application. The attachment should:\n- Follow the NIH biosketch format, including Personal Statement, Positions and Honors, Contributions to Science, and Research Support.\n- Use the following information provided by the grant creator:\n  - Personal statement: [User input]\n  - Positions and honors: [User input]\n  - Contributions to Science: [User input]\n  - Research support: [User input]\nEnsure the attachment is:\n- Clear, concise, and formatted per NIH guidelines, suitable for reviewers.\n- Limited to 5 pages, formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Biographical Sketch section for spelling, grammar, and sentence structure errors. Ensure clarity and adherence to NIH format.',
         'Check the Biographical Sketch section for completeness and accuracy of all sections within the 5-page limit.',
         NULL,
         'Verify that the Biographical Sketch section meets NIH requirements:\n- Does it include Personal Statement, Positions and Honors, Contributions to Science, and Research Support?\n- Is it 5 pages or less?\n- Is it free of hyperlinks or URLs?',
         'Provide personal statement, positions and honors, contributions to science, and research support.'
        ),
        (10, 'Progress Report Publication List', 'Lists publications from prior support (for renewals).', true,
         'Based on the context provided by the grant creator, generate a Progress Report Publication List attachment for an NIH K grant application. The attachment should:\n- List publications resulting from prior NIH support, formatted per NIH guidelines.\n- Use the following information provided by the grant creator:\n  - List of publications: [User input]\nEnsure the attachment is:\n- Clear, concise, and formatted correctly, suitable for reviewers.\n- Formatted as a PDF-ready text document without hyperlinks or URLs (PMCID allowed).',
         'Review the Progress Report Publication List section for spelling, grammar, and formatting errors. Ensure clarity and NIH compliance.',
         'Check the Progress Report Publication List section for completeness and correct formatting of citations.',
         NULL,
         'Verify that the Progress Report Publication List section meets NIH requirements:\n- Does it list publications from prior support?\n- Is it formatted per NIH guidelines?\n- Includes PMCID where applicable, no hyperlinks or URLs?',
         'Provide list of publications from prior support.'
        ),
        (11, 'Vertebrate Animals', 'Details procedures involving vertebrate animals (if applicable).', true,
         'Based on the context provided by the grant creator, generate a Vertebrate Animals attachment for an NIH K grant application. The attachment should:\n- Describe the procedures involving animals, justification for species and numbers, minimization of pain/distress, and euthanasia method.\n- Use the following information provided by the grant creator:\n  - Animal procedures and justification: [User input]\n  - Minimization of pain/distress and euthanasia: [User input]\nEnsure the attachment is:\n- Clear, concise, and detailed, using active voice, suitable for reviewers.\n- Formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Vertebrate Animals section for spelling, grammar, and sentence structure errors. Ensure clarity and precision.',
         'Check the Vertebrate Animals section for completeness and ethical compliance.',
         NULL,
         'Verify that the Vertebrate Animals section meets NIH requirements:\n- Does it address procedures, justification, minimization of pain, and euthanasia?\n- Is it free of hyperlinks or URLs?',
         'Provide animal procedures, justification, pain minimization, and euthanasia details.'
        ),
        (12, 'Select Agent Research', 'Describes research involving select agents (if applicable).', true,
         'Based on the context provided by the grant creator, generate a Select Agent Research attachment for an NIH K grant application. The attachment should:\n- Detail the select agents, research procedures, safety measures, and compliance with regulations.\n- Use the following information provided by the grant creator:\n  - Select agents and procedures: [User input]\n  - Safety and compliance measures: [User input]\nEnsure the attachment is:\n- Clear, concise, and detailed, using active voice, suitable for reviewers.\n- Formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Select Agent Research section for spelling, grammar, and sentence structure errors. Ensure clarity and precision.',
         'Check the Select Agent Research section for completeness and regulatory compliance.',
         NULL,
         'Verify that the Select Agent Research section meets NIH requirements:\n- Does it detail agents, procedures, safety, and compliance?\n- Is it free of hyperlinks or URLs?',
         'Provide select agents, procedures, safety, and compliance details.'
        ),
        (13, 'Multiple PD/PI Leadership Plan', 'Outlines leadership plan for multiple PIs (if applicable).', true,
         'Based on the context provided by the grant creator, generate a Multiple PD/PI Leadership Plan attachment for an NIH K grant application. The attachment should:\n- Describe the leadership structure, roles, responsibilities, and coordination among multiple PIs.\n- Use the following information provided by the grant creator:\n  - Leadership structure and PI roles: [User input]\nEnsure the attachment is:\n- Clear, concise, and detailed, using active voice, suitable for reviewers.\n- Formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Multiple PD/PI Leadership Plan section for spelling, grammar, and sentence structure errors. Ensure clarity and coherence.',
         'Check the Multiple PD/PI Leadership Plan section for clarity of roles and feasibility.',
         NULL,
         'Verify that the Multiple PD/PI Leadership Plan section meets NIH requirements:\n- Does it outline leadership structure and roles?\n- Is it free of hyperlinks or URLs?',
         'Provide leadership structure and PI roles.'
        ),
        (14, 'Consortium/Contractual Arrangements', 'Details consortium or contractual agreements (if applicable).', true,
         'Based on the context provided by the grant creator, generate a Consortium/Contractual Arrangements attachment for an NIH K grant application. The attachment should:\n- Describe the consortium or contractual agreements, including roles, responsibilities, and resource sharing.\n- Use the following information provided by the grant creator:\n  - Consortium/contract details: [User input]\nEnsure the attachment is:\n- Clear, concise, and detailed, using active voice, suitable for reviewers.\n- Formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Consortium/Contractual Arrangements section for spelling, grammar, and sentence structure errors. Ensure clarity and precision.',
         'Check the Consortium/Contractual Arrangements section for specificity and consistency.',
         NULL,
         'Verify that the Consortium/Contractual Arrangements section meets NIH requirements:\n- Does it detail agreements and roles?\n- Is it free of hyperlinks or URLs?',
         'Provide consortium/contract details.'
        ),
        (15, 'Resource Sharing Plan(s)', 'Outlines plans for sharing research resources (if applicable).', true,
         'Based on the context provided by the grant creator, generate a Resource Sharing Plan(s) attachment for an NIH K grant application. The attachment should:\n- Describe plans for sharing data, materials, or other resources, including how, when, and with whom they will be shared.\n- Use the following information provided by the grant creator:\n  - Resource sharing details: [User input]\nEnsure the attachment is:\n- Clear, concise, and detailed, using active voice, suitable for reviewers.\n- Formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Resource Sharing Plan(s) section for spelling, grammar, and sentence structure errors. Ensure clarity and precision.',
         'Check the Resource Sharing Plan(s) section for feasibility and completeness.',
         NULL,
         'Verify that the Resource Sharing Plan(s) section meets NIH requirements:\n- Does it outline sharing plans?\n- Is it free of hyperlinks or URLs?',
         'Provide resource sharing details.'
        ),
        (16, 'Authentication of Key Biological and/or Chemical Resources', 'Authenticates key resources used in the research (if applicable).', true,
         'Based on the context provided by the grant creator, generate an Authentication of Key Biological and/or Chemical Resources attachment for an NIH K grant application. The attachment should:\n- Detail the authentication methods for key resources (e.g., cell lines, chemicals) critical to the research.\n- Use the following information provided by the grant creator:\n  - Key resources and authentication methods: [User input]\nEnsure the attachment is:\n- Clear, concise, and detailed, using active voice, suitable for reviewers.\n- Limited to 1 page, formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Authentication of Key Resources section for spelling, grammar, and sentence structure errors. Ensure clarity and precision.',
         'Check the Authentication of Key Resources section for specificity and scientific validity within the 1-page limit.',
         NULL,
         'Verify that the Authentication of Key Resources section meets NIH requirements:\n- Does it detail authentication methods?\n- Is it 1 page or less?\n- Is it free of hyperlinks or URLs?',
         'Provide key resources and authentication methods.'
        ),
        (17, 'Appendix', 'Includes allowable supplemental materials.', true,
         'Based on the context provided by the grant creator, generate an Appendix attachment for an NIH K grant application. The attachment should:\n- Include allowable materials (e.g., manuscripts, surveys) per NIH guidelines.\n- Use the following information provided by the grant creator:\n  - Appendix materials: [User input]\nEnsure the attachment is:\n- Clear, concise, and compliant with NIH Appendix policy, formatted as a PDF-ready document.',
         'Review the Appendix section for spelling, grammar, and formatting errors. Ensure clarity and compliance.',
         'Check the Appendix section for adherence to NIH allowable materials.',
         NULL,
         'Verify that the Appendix section meets NIH requirements:\n- Does it include only allowable materials?\n- Is it formatted correctly?',
         'Provide allowable appendix materials.'
        ),
        (18, 'Assignment Request Form', 'Requests specific NIH assignment preferences (optional).', true,
         'Based on the context provided by the grant creator, generate an Assignment Request Form attachment for an NIH K grant application. The attachment should:\n- Specify preferences for awarding component, study section, and expertise needed, per NIH guidelines.\n- Use the following information provided by the grant creator:\n  - Assignment preferences: [User input]\nEnsure the attachment is:\n- Clear, concise, and compliant with NIH guidelines, formatted as a PDF-ready text document without hyperlinks or URLs.',
         'Review the Assignment Request Form section for spelling, grammar, and formatting errors. Ensure clarity and compliance.',
         'Check the Assignment Request Form section for completeness and adherence to NIH guidelines.',
         NULL,
         'Verify that the Assignment Request Form section meets NIH requirements:\n- Does it specify preferences per guidelines?\n- Is it free of hyperlinks or URLs?',
         'Provide assignment preferences.'
        )
    ) AS s(flow_order, name, description, optional, ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions)
WHERE g.code LIKE 'K%' AND g.code NOT IN ('K12', 'KL2', 'KM1');

-- Delete existing sections for qualifying grants to avoid duplicates
DELETE FROM public.grant_requirements
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE code LIKE 'K%' AND code NOT IN ('K12', 'KL2', 'KM1')
);

-- Insert requirements for fellowship grants (code starting with 'F') into grant_requirements table
INSERT INTO public.grant_requirements (
    grant_id,
    requirement,
    url
)
SELECT 
    g.id,
    'Career Application Guide' AS requirement,
    'https://grants.nih.gov/grants/how-to-apply-application-guide/forms-i/career-forms-i.pdf' AS url
FROM public.grants g
WHERE g.code LIKE 'K%' AND g.code NOT IN ('K12', 'KL2', 'KM1');