-- Delete existing sections for qualifying grants
DELETE FROM public.grant_sections 
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE code LIKE 'T%' OR code IN ('D43', 'D71', 'U2R', 'K12', 'KL2', 'KM1')
);

-- Insert new sections
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
        (1, 'Project Summary/Abstract', 'A succinct summary of the proposed training program.', false,
         $$Based on the context provided by the grant creator, generate a concise and compelling Project Summary/Abstract for an NIH training grant application. The summary should:
- Provide a brief overview of the training program, including its objectives and significance.
- Describe the target audience and how the program addresses a critical need in the field.
- Highlight innovative aspects of the training approach.
- Use clear, jargon-free language suitable for a broad scientific audience.
- Adhere to the 30-line limit and NIH formatting requirements (no hyperlinks, URLs, or unallowable content).
Use the following information from the grant creator:
- Training program objectives: [User input]
- Significance and need: [User input]
- Target audience: [User input]
- Innovative aspects: [User input]
Ensure the attachment is written in a persuasive manner, emphasizing the program's purpose and impact.$$,
         $$Review the Project Summary/Abstract for spelling, grammar, and sentence structure errors. Ensure clarity, conciseness, and a polished, professional tone suitable for NIH reviewers.$$,
         $$Check the Project Summary/Abstract for logical coherence, accuracy in reflecting the training program’s objectives, and adherence to the 30-line limit. Ensure it effectively conveys the program’s purpose and relevance without extraneous details or inconsistencies.$$,
         NULL,
         $$Verify that the Project Summary/Abstract meets NIH requirements as a vindictive reviewer aiming to reject non-compliant submissions:
- Is it 30 lines or fewer?
- Does it use plain language accessible to a broad audience?
- Does it address the program’s objectives and significance clearly?
- Is it free of hyperlinks, URLs, or unallowable content (e.g., videos)?
- Does it avoid excessive technical detail or jargon that obscures the message?
Flag any deviation with precise justification.$$,
         $$Provide training program objectives, significance, target audience, and innovative aspects.$$),

        (2, 'Project Narrative', 'A brief description of the project''s relevance to public health.', false,
         $$Based on the context provided by the grant creator, generate a concise Project Narrative for an NIH training grant application. The narrative should:
- Describe the training program's relevance to public health in 2-3 sentences.
- Highlight how the program addresses public health needs or advances health outcomes.
- Use clear, accessible language for a broad audience, avoiding technical jargon.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Public health relevance: [User input]
- Program impact: [User input]
Ensure the attachment is succinct and impactful, meeting NIH expectations.$$,
         $$Review the Project Narrative for spelling, grammar, and sentence structure errors. Ensure brevity, clarity, and a professional tone suitable for NIH reviewers.$$,
         $$Check the Project Narrative for logical consistency and accuracy in linking the training program to public health relevance. Ensure it is concise (2-3 sentences) and free of irrelevant details.$$,
         NULL,
         $$Verify that the Project Narrative meets NIH requirements as a critical reviewer:
- Is it limited to 2-3 sentences?
- Does it clearly articulate relevance to public health?
- Is it free of hyperlinks, URLs, or unallowable content?
- Does it avoid jargon and remain accessible?
Reject with specific reasoning if any requirement is unmet.$$,
         $$Provide public health relevance and program impact.$$),

        (3, 'Bibliography & References Cited', 'List of references cited in the application.', true,
         $$Based on the context provided by the grant creator, generate a Bibliography & References Cited attachment for an NIH training grant application. The attachment should:
- Compile a complete list of all references cited in the application.
- Use a standard citation format (e.g., APA, MLA, or NIH-preferred style if specified in the FOA).
- Include PMCIDs for NIH-funded articles where applicable.
- Adhere to NIH formatting requirements (no hyperlinks or URLs unless PMCID links are permitted).
Use the following information from the grant creator:
- List of references: [User input]
Ensure the list is accurate, complete, and professionally formatted.$$,
         $$Review the Bibliography & References Cited for citation format consistency, spelling, and grammatical accuracy. Ensure all entries are correctly formatted and polished.$$,
         $$Check the Bibliography & References Cited for completeness and accuracy:
- Are all cited references included?
- Are PMCIDs provided for NIH-funded articles where required?
- Is the citation style consistent and appropriate?
Flag any omissions or errors with specific details.$$,
         NULL,
         $$Verify that the Bibliography & References Cited meets NIH requirements as a strict reviewer:
- Are all references cited in the application listed?
- Are PMCIDs included for applicable NIH-funded articles?
- Is it free of hyperlinks or URLs (except PMCID links if allowed)?
- Is the format consistent and compliant with the FOA?
Reject with precise justification for any non-compliance.$$,
         $$Provide list of references cited in the application.$$),

        (4, 'Facilities & Other Resources', 'Description of institutional resources available for the training program.', false,
         $$Based on the context provided by the grant creator, generate a Facilities & Other Resources attachment for an NIH training grant application. The attachment should:
- Describe the institutional environment, including facilities, equipment, and resources supporting the training program.
- Explain how these resources enhance the program's feasibility and success.
- Use clear, persuasive language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Available facilities and resources: [User input]
- Impact on training program: [User input]
Ensure the description is detailed and demonstrates institutional support.$$,
         $$Review the Facilities & Other Resources attachment for spelling, grammar, and sentence structure errors. Ensure clarity, conciseness, and a professional tone.$$,
         $$Check the Facilities & Other Resources attachment for logical coherence and accuracy:
- Do the described resources align with the training program’s needs?
- Are claims about resource availability and impact substantiated?
Flag any inconsistencies or vague statements.$$,
         NULL,
         $$Verify that the Facilities & Other Resources attachment meets NIH requirements as an exacting reviewer:
- Does it clearly describe the institutional environment and resources?
- Does it explain how resources support the training program?
- Is it free of hyperlinks or URLs?
- Is it specific and detailed, avoiding generic statements?
Reject with detailed reasoning if requirements are not met.$$,
         $$Provide details of available facilities and resources and their impact on the training program.$$),

        (5, 'Equipment', 'List of major equipment available for the training program.', true,
         $$Based on the context provided by the grant creator, generate an Equipment attachment for an NIH training grant application. The attachment should:
- List major equipment available for the training program.
- Briefly describe how each item supports the program’s activities or objectives.
- Use clear, concise language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- List of major equipment: [User input]
- Role in training program: [User input]
Ensure the list is specific and relevant to the program.$$,
         $$Review the Equipment attachment for spelling, grammar, and sentence structure errors. Ensure clarity and a professional tone.$$,
         $$Check the Equipment attachment for accuracy and relevance:
- Are all listed items major equipment relevant to the training program?
- Do descriptions logically connect equipment to program needs?
Flag any irrelevant or unsubstantiated entries.$$,
         NULL,
         $$Verify that the Equipment attachment meets NIH requirements as a meticulous reviewer:
- Does it list only major equipment available for the program?
- Does it explain the equipment’s role in supporting the program?
- Is it free of hyperlinks or URLs?
- Is it concise yet specific?
Reject with exact reasons for any shortfall.$$,
         $$Provide list of major equipment and their role in the training program.$$),

        (6, 'Other Attachments', 'Additional attachments as specified in the funding opportunity announcement (FOA).', true,
         $$Based on the context provided by the grant creator, generate an Other Attachments section for an NIH training grant application. The attachment should:
- Include content as specified in the FOA (e.g., additional data, plans, or statements).
- Follow the exact instructions provided in the FOA for each attachment.
- Use clear, professional language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs unless specified).
Use the following information from the grant creator:
- FOA-specific requirements and content: [User input]
Ensure each attachment is named and formatted as per FOA instructions.$$,
         $$Review the Other Attachments for spelling, grammar, and sentence structure errors. Ensure clarity and adherence to FOA naming conventions.$$,
         $$Check the Other Attachments for accuracy and compliance:
- Does each attachment match the FOA’s specified requirements?
- Are naming conventions followed precisely?
Flag any discrepancies or missing elements.$$,
         NULL,
         $$Verify that the Other Attachments meet NIH and FOA requirements as a rigorous reviewer:
- Are all FOA-specified attachments included?
- Do filenames match FOA instructions exactly?
- Is content compliant with FOA guidelines?
- Is it free of hyperlinks or URLs unless permitted?
Reject with specific violations noted.$$,
         $$Provide FOA-specific requirements and content for each attachment.$$),

        (7, 'Biosketches', 'Biographical sketches for key personnel.', false,
         NULL, NULL, NULL, NULL, NULL,
         $$Provide completed biosketches for all key personnel as per NIH format.$$),

        (8, 'Budget Justification', 'Detailed justification of the budget request.', false,
         $$Based on the context provided by the grant creator, generate a Budget Justification attachment for an NIH training grant application. The attachment should:
- Provide a detailed breakdown of all budget items (e.g., personnel, equipment, supplies).
- Justify each item’s necessity for the training program, linking costs to program goals.
- Use clear, precise language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Budget items and costs: [User input]
- Justification for each item: [User input]
Ensure the justification is thorough and aligns with NIH guidelines.$$,
         $$Review the Budget Justification for spelling, grammar, and sentence structure errors. Ensure clarity, precision, and a professional tone.$$,
         $$Check the Budget Justification for logical consistency and accuracy:
- Do justifications align with budget items and program goals?
- Are cost estimates reasonable and substantiated?
Flag any discrepancies or unsupported claims.$$,
         NULL,
         $$Verify that the Budget Justification meets NIH requirements as a critical reviewer:
- Does it justify all budget items comprehensively?
- Are explanations specific to the training program’s needs?
- Is it free of hyperlinks or URLs?
- Does it comply with FOA budget guidelines?
Reject with detailed critique for any issues.$$,
         $$Provide budget items, costs, and justifications.$$),

        (9, 'Introduction to Application', 'Summary for resubmissions or revisions addressing prior reviews.', true,
         $$Based on the context provided by the grant creator, generate an Introduction to Application attachment for an NIH training grant resubmission or revision. The attachment should:
- Summarize responses to previous reviewer critiques.
- Highlight changes made to the application since the prior submission.
- Use clear, concise language to demonstrate responsiveness to feedback.
- Adhere to the 1-page limit and NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Previous reviewer critiques: [User input]
- Changes made: [User input]
Ensure the introduction is persuasive and addresses all major concerns.$$,
         $$Review the Introduction to Application for spelling, grammar, and sentence structure errors. Ensure clarity and a professional tone.$$,
         $$Check the Introduction to Application for logical flow and completeness:
- Does it address all major reviewer critiques?
- Are changes clearly linked to feedback?
Flag any omissions or inconsistencies.$$,
         NULL,
         $$Verify that the Introduction to Application meets NIH requirements as a stringent reviewer:
- Is it 1 page or less?
- Does it respond to prior critiques comprehensively?
- Is it free of hyperlinks or URLs?
- Is it concise yet thorough?
Reject with specific flaws identified.$$,
         $$Provide previous reviewer critiques and changes made.$$),

        (10, 'Specific Aims', 'Outline of the training program goals.', false,
         $$Based on the context provided by the grant creator, generate a compelling Specific Aims attachment for an NIH training grant application. The attachment should:
- Start with an introductory paragraph describing the training program’s background, significance, and the critical need it addresses.
- Clearly list the specific aims, ensuring each is concise, specific, and aligned with the program’s overall goal (e.g., enhancing skills, addressing workforce needs).
- Conclude with a paragraph summarizing expected outcomes and the program’s impact on the field.
- Use clear, persuasive language accessible to a broad audience, avoiding unnecessary jargon.
- Adhere to the 1-page limit and NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Program background and significance: [User input]
- Overall goal: [User input]
- Specific aims: [User input]
- Expected outcomes and impact: [User input]
Ensure the attachment highlights novelty and significance effectively.$$,
         $$Review the Specific Aims attachment for spelling, grammar, and sentence structure errors. Ensure clarity, conciseness, and a polished tone.$$,
         $$Check the Specific Aims attachment for logical coherence and alignment:
- Do the aims support the overall goal?
- Are expected outcomes realistic and impactful?
Flag any inconsistencies or vague statements.$$,
         NULL,
         $$Verify that the Specific Aims attachment meets NIH requirements as a ruthless reviewer:
- Is it 1 page or less?
- Does it include an introduction, aims, and impact statement?
- Is it free of hyperlinks or URLs?
- Are aims specific, measurable, and significant?
Reject with precise reasons for any non-compliance.$$,
         $$Provide program background, overall goal, specific aims, expected outcomes, and impact.$$),

        (11, 'Training Program', 'Detailed description of the training plan.', false,
         $$Based on the context provided by the grant creator, generate a detailed Training Program attachment for an NIH training grant application. The attachment should:
- Describe the overall training plan, including goals, structure, and components.
- Explain recruitment and retention strategies, emphasizing diversity.
- Detail the curriculum, mentoring approach, and evaluation methods.
- Highlight how the program addresses field-specific needs.
- Use clear, persuasive language suitable for reviewers.
- Adhere to the page limit specified in the FOA (typically 6-12 pages) and NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Training goals and structure: [User input]
- Recruitment and retention strategies: [User input]
- Curriculum and mentoring plans: [User input]
- Evaluation methods: [User input]
Ensure the attachment is comprehensive and compelling.$$,
         $$Review the Training Program attachment for spelling, grammar, and sentence structure errors. Ensure clarity, conciseness, and a professional tone.$$,
         $$Check the Training Program attachment for logical flow and feasibility:
- Are goals, recruitment, curriculum, mentoring, and evaluation cohesive?
- Are strategies practical and aligned with FOA goals?
Flag any gaps or unrealistic claims.$$,
         NULL,
         $$Verify that the Training Program attachment meets NIH requirements as a discerning reviewer:
- Does it address goals, recruitment, curriculum, mentoring, and evaluation?
- Is it within the FOA-specified page limit?
- Is it free of hyperlinks or URLs?
- Is it detailed, persuasive, and specific to the training grant?
Reject with exact critiques for any deficiencies.$$,
         $$Provide training goals, recruitment and retention strategies, curriculum, mentoring plans, and evaluation methods.$$),

        (12, 'Progress Report Publication List', 'List of publications from prior support (for renewals).', true,
         $$Based on the context provided by the grant creator, generate a Progress Report Publication List attachment for an NIH training grant renewal. The attachment should:
- List all publications resulting from prior support, including PMCIDs where applicable.
- Organize the list clearly, with authors, titles, and references in a standard format.
- Adhere to NIH formatting requirements (no hyperlinks or URLs except PMCID links if allowed).
Use the following information from the grant creator:
- List of publications: [User input]
Ensure the list is complete and compliant with NIH standards.$$,
         $$Review the Progress Report Publication List for spelling, grammar, and formatting errors. Ensure consistency and professionalism.$$,
         $$Check the Progress Report Publication List for accuracy:
- Are all publications from prior support included?
- Are PMCIDs provided where required?
Flag any omissions or formatting issues.$$,
         NULL,
         $$Verify that the Progress Report Publication List meets NIH requirements as a strict reviewer:
- Does it include all relevant publications from prior support?
- Are PMCIDs included for NIH-funded articles?
- Is it free of hyperlinks or URLs (except PMCID links if permitted)?
- Is the format clear and consistent?
Reject with specific errors noted.$$,
         $$Provide list of publications from prior support.$$),

        (13, 'Vertebrate Animals', 'Details on the use of vertebrate animals if involved.', true,
         $$Based on the context provided by the grant creator, generate a Vertebrate Animals attachment for an NIH training grant application. The attachment should:
- Address the five required points: description of procedures, justification, minimization of pain, euthanasia method, and veterinary care.
- Use clear, precise language compliant with NIH animal welfare policies.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Animal use details: [User input]
Ensure the attachment meets all NIH and ethical standards.$$,
         $$Review the Vertebrate Animals attachment for spelling, grammar, and sentence structure errors. Ensure clarity and a professional tone.$$,
         $$Check the Vertebrate Animals attachment for completeness and accuracy:
- Are all five required points addressed?
- Are procedures and justifications scientifically sound?
Flag any missing elements or inconsistencies.$$,
         NULL,
         $$Verify that the Vertebrate Animals attachment meets NIH requirements as a meticulous reviewer:
- Does it cover description, justification, pain minimization, euthanasia, and veterinary care?
- Is it compliant with NIH animal welfare policies?
- Is it free of hyperlinks or URLs?
- Is it specific and detailed?
Reject with precise reasons for any non-compliance.$$,
         $$Provide details of vertebrate animal use, including procedures and justifications.$$),

        (14, 'Select Agent Research', 'Details on select agent use if applicable.', true,
         $$Based on the context provided by the grant creator, generate a Select Agent Research attachment for an NIH training grant application. The attachment should:
- Describe the select agents involved and their use in the training program.
- Detail biosafety and security measures in place.
- Use clear, precise language compliant with NIH and federal regulations.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Select agent details and safety measures: [User input]
Ensure the attachment meets all regulatory requirements.$$,
         $$Review the Select Agent Research attachment for spelling, grammar, and sentence structure errors. Ensure clarity and professionalism.$$,
         $$Check the Select Agent Research attachment for accuracy and completeness:
- Are select agents and their use fully described?
- Are biosafety and security measures adequate?
Flag any omissions or regulatory concerns.$$,
         NULL,
         $$Verify that the Select Agent Research attachment meets NIH requirements as a rigorous reviewer:
- Does it detail select agents and their use?
- Are biosafety and security measures specified?
- Is it free of hyperlinks or URLs?
- Does it comply with federal select agent regulations?
Reject with specific violations listed.$$,
         $$Provide details of select agents and safety measures.$$),

        (15, 'Multiple PD/PI Leadership Plan', 'Leadership plan for multiple principal investigators.', true,
         $$Based on the context provided by the grant creator, generate a Multiple PD/PI Leadership Plan attachment for an NIH training grant application. The attachment should:
- Outline the leadership structure and roles of multiple PIs.
- Justify the need for multiple PIs and explain governance and coordination plans.
- Use clear, persuasive language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- PI roles and structure: [User input]
- Justification and coordination plan: [User input]
Ensure the plan is logical and justifies the multi-PI approach.$$,
         $$Review the Multiple PD/PI Leadership Plan for spelling, grammar, and sentence structure errors. Ensure clarity and a professional tone.$$,
         $$Check the Multiple PD/PI Leadership Plan for logical consistency:
- Are roles and coordination plans feasible?
- Does the justification support the multi-PI structure?
Flag any gaps or unclear elements.$$,
         NULL,
         $$Verify that the Multiple PD/PI Leadership Plan meets NIH requirements as a critical reviewer:
- Does it outline roles, justification, and coordination?
- Is the need for multiple PIs clearly defended?
- Is it free of hyperlinks or URLs?
- Is it specific and well-organized?
Reject with detailed reasoning for any issues.$$,
         $$Provide PI roles, structure, justification, and coordination plan.$$),

        (16, 'Consortium/Contractual Arrangements', 'Details on consortium or contractual agreements.', true,
         $$Based on the context provided by the grant creator, generate a Consortium/Contractual Arrangements attachment for an NIH training grant application. The attachment should:
- Describe the consortium or contractual agreements, including roles and responsibilities.
- Explain how these arrangements support the training program.
- Use clear, precise language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Consortium details and roles: [User input]
- Support for training program: [User input]
Ensure the attachment clarifies all agreements.$$,
         $$Review the Consortium/Contractual Arrangements attachment for spelling, grammar, and sentence structure errors. Ensure clarity and professionalism.$$,
         $$Check the Consortium/Contractual Arrangements attachment for accuracy:
- Are roles and responsibilities clearly defined?
- Does it logically support the training program?
Flag any vague or inconsistent details.$$,
         NULL,
         $$Verify that the Consortium/Contractual Arrangements attachment meets NIH requirements as a thorough reviewer:
- Does it detail all agreements and roles?
- Does it explain support for the program?
- Is it free of hyperlinks or URLs?
- Is it specific and comprehensive?
Reject with precise critiques if deficient.$$,
         $$Provide consortium details, roles, and support for the training program.$$),

        (17, 'Letters of Support', 'Letters from collaborators affirming support.', true,
         $$Based on the context provided by the grant creator, generate a Letters of Support attachment for an NIH training grant application. The attachment should:
- Include letters from collaborators affirming their support and roles.
- Specify commitments (e.g., resources, mentoring) in clear, persuasive language.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Collaborator details and commitments: [User input]
Ensure each letter is professional and specific to the program.$$,
         $$Review the Letters of Support for spelling, grammar, and sentence structure errors. Ensure clarity and a formal tone.$$,
         $$Check the Letters of Support for relevance and specificity:
- Do letters align with the training program’s needs?
- Are commitments clear and credible?
Flag any generic or unsupported statements.$$,
         NULL,
         $$Verify that the Letters of Support meet NIH requirements as a strict reviewer:
- Do they affirm specific support for the program?
- Are they from relevant collaborators?
- Are they free of hyperlinks or URLs?
- Are commitments detailed and credible?
Reject with specific issues noted.$$,
         $$Provide collaborator details and their commitments.$$),

        (18, 'Resource Sharing Plan(s)', 'Plan for sharing research resources.', true,
         $$Based on the context provided by the grant creator, generate a Resource Sharing Plan(s) attachment for an NIH training grant application. The attachment should:
- Describe plans for sharing resources (e.g., data, materials) generated by the program.
- Address how, when, and with whom resources will be shared.
- Use clear, precise language compliant with NIH policy.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Resource sharing details: [User input]
Ensure the plan is practical and meets NIH expectations.$$,
         $$Review the Resource Sharing Plan(s) for spelling, grammar, and sentence structure errors. Ensure clarity and professionalism.$$,
         $$Check the Resource Sharing Plan(s) for feasibility and completeness:
- Are sharing methods and timelines realistic?
- Does it cover all relevant resources?
Flag any impractical or missing elements.$$,
         NULL,
         $$Verify that the Resource Sharing Plan(s) meets NIH requirements as a critical reviewer:
- Does it address how, when, and with whom resources are shared?
- Is it compliant with NIH sharing policies?
- Is it free of hyperlinks or URLs?
- Is it specific and actionable?
Reject with detailed reasoning for any lapses.$$,
         $$Provide details of resource sharing plans.$$),

        (19, 'Authentication of Key Biological and/or Chemical Resources', 'Authentication of key resources if applicable.', true,
         $$Based on the context provided by the grant creator, generate an Authentication of Key Biological and/or Chemical Resources attachment for an NIH training grant application. The attachment should:
- Describe methods to authenticate key resources (e.g., cell lines, chemicals).
- Explain how authenticity ensures program success.
- Use clear, precise language compliant with NIH guidelines.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Key resources and authentication methods: [User input]
Ensure the attachment is scientifically rigorous.$$,
         $$Review the Authentication attachment for spelling, grammar, and sentence structure errors. Ensure clarity and a professional tone.$$,
         $$Check the Authentication attachment for accuracy and detail:
- Are authentication methods scientifically valid?
- Does it support the program’s objectives?
Flag any vague or unsupported claims.$$,
         NULL,
         $$Verify that the Authentication attachment meets NIH requirements as a meticulous reviewer:
- Does it describe authentication of key resources?
- Are methods specific and appropriate?
- Is it free of hyperlinks or URLs?
- Does it ensure resource reliability?
Reject with precise critiques for any issues.$$,
         $$Provide key resources and authentication methods.$$),

        (20, 'Appendix', 'Supplemental materials allowable under NIH policy.', true,
         NULL, NULL, NULL, NULL, NULL,
         $$Provide supplemental materials allowable under NIH policy.$$),

        (21, 'Data Tables', 'Statistical data about the training program, trainees, and outcomes.', false,
         NULL, NULL, NULL, NULL, NULL,
         $$Provide completed Data Tables as per NIH guidelines.$$),

        (22, 'Letters of Institutional Commitment', 'Letters affirming institutional support for the training program.', false,
         $$Based on the context provided by the grant creator, generate Letters of Institutional Commitment for an NIH training grant application. The attachment should:
- Include letters from institutional leadership (e.g., dean, chair) affirming support.
- Specify resources, facilities, or commitments (e.g., funding, space) provided.
- Use clear, persuasive language suitable for reviewers.
- Adhere to NIH formatting requirements (no hyperlinks or URLs).
Use the following information from the grant creator:
- Institutional support details: [User input]
Ensure each letter is authoritative and specific.$$,
         $$Review the Letters of Institutional Commitment for spelling, grammar, and sentence structure errors. Ensure clarity and a formal tone.$$,
         $$Check the Letters of Institutional Commitment for specificity and credibility:
- Are commitments detailed and relevant to the program?
- Are letters from appropriate leadership?
Flag any vague or unsupported claims.$$,
         NULL,
         $$Verify that the Letters of Institutional Commitment meet NIH requirements as a rigorous reviewer:
- Do they specify tangible institutional support?
- Are they from authorized leadership?
- Are they free of hyperlinks or URLs?
- Are commitments clear and program-specific?
Reject with detailed reasoning for any shortcomings.$$,
         $$Provide details of institutional support from leadership.$$)
    ) AS s(flow_order, name, description, optional, ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions)
WHERE g.code LIKE 'T%' OR g.code IN ('D43', 'D71', 'U2R', 'K12', 'KL2', 'KM1');


-- Delete existing sections for qualifying grants to avoid duplicates
DELETE FROM public.grant_requirements
WHERE grant_id IN (
    SELECT id 
    FROM public.grants 
    WHERE (code LIKE 'T%' OR code IN ('D43', 'D71', 'U2R', 'K12', 'KL2', 'KM1'))
);

-- Insert requirements for fellowship grants (code starting with 'F') into grant_requirements table
INSERT INTO public.grant_requirements (
    grant_id,
    requirement,
    url
)
SELECT 
    g.id,
    'Training Application Guide' AS requirement,
    'https://grants.nih.gov/grants/how-to-apply-application-guide/forms-i/training-forms-i.pdf' AS url
FROM public.grants g
WHERE (g.code LIKE 'T%' OR g.code IN ('D43', 'D71', 'U2R', 'K12', 'KL2', 'KM1'));