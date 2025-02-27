INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES
-- 1. Concept Outline (Optional, Preliminary)
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Concept Outline',
    'A brief overview of the proposed project, required for certain NSF programs to assess suitability before a full proposal.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF grant application based on the context provided by the grant writer. The Concept Outline should:
- Be concise, typically 1-2 pages, as a preliminary document.
- Provide an overview of the proposed project, including the research question, objectives, and significance.
- Highlight the potential intellectual merit (advancing knowledge) and broader impacts (societal benefits).
- Use the following information provided by the grant writer:
  - Project overview: [User input]
  - Research question: [User input]
  - Objectives: [User input]
  - Significance: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
Ensure the document is clear, compelling, and formatted as a PDF per NSF guidelines, avoiding proprietary information.',
    'Review the Concept Outline for spelling, grammar, and clarity. Ensure it is concise, within 1-2 pages, and free of jargon.',
    'Check the Concept Outline for logical consistency and completeness. Verify that:
- The overview aligns with the research question and objectives.
- Intellectual merit and broader impacts are distinctly addressed.
Flag any vague statements, missing elements, or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Concept Outline:
- Must be 1-2 pages.
- Must include project overview, research question, objectives, significance, intellectual merit, and broader impacts.
- Must be clear and persuasive to justify a full proposal.
- Reject if: exceeds 2 pages, lacks clarity, omits key components, or includes confidential data.',
    'Provide project overview, research question, objectives, significance, intellectual merit, and broader impacts.'
),

-- 2. Letter of Intent (Optional, Preliminary)
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Letter of Intent',
    'A brief letter indicating intent to submit a proposal, required for some NSF programs.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF grant application based on the context provided by the grant writer. The Letter of Intent should:
- Be brief, typically 1 page, as a preliminary submission.
- Include the project title, principal investigator (PI) name, and a concise project description.
- Indicate the NSF program targeted, if specified.
- Use the following information provided by the grant writer:
  - Project title: [User input]
  - PI name: [User input]
  - Project description: [User input]
  - Target NSF program (if applicable): [User input]
Ensure the document is formatted as a PDF per NSF guidelines, formal in tone, and free of unnecessary detail.',
    'Review the Letter of Intent for spelling, grammar, and clarity. Ensure it is within 1 page and formal.',
    'Check the Letter of Intent for completeness and accuracy. Verify that:
- Project title, PI name, and description are included.
- The description aligns with the target program (if provided).
Flag missing information or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letter of Intent:
- Must be 1 page or less.
- Must include project title, PI name, and a brief description.
- Must align with the specified NSF program, if applicable.
- Reject if: exceeds 1 page, omits required elements, or is misaligned with program goals.',
    'Provide project title, PI name, project description, and target NSF program (if applicable).'
),

-- 3. Project Summary (Required, Ch 2.D.2.b(i))
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Project Summary',
    'A concise summary of the project, highlighting its goals, intellectual merit, and broader impacts.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF grant application based on the context provided by the grant writer. The Project Summary should:
- Be limited to 1 page.
- Include three distinct sections: Overview, Intellectual Merit, and Broader Impacts.
- Overview: Summarize the project’s goals, objectives, and approach.
- Intellectual Merit: Describe how the project advances knowledge within its field or across fields.
- Broader Impacts: Explain the potential societal benefits and contributions to specific outcomes (e.g., education, diversity).
- Be written in third person, avoiding proprietary or confidential information.
- Use the following information provided by the grant writer:
  - Project goals and objectives: [User input]
  - Approach: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
Ensure the document is concise, clear, and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(i) guidelines, with no URLs.',
    'Review the Project Summary for spelling, grammar, and clarity. Ensure it is in third person, within 1 page, and includes Overview, Intellectual Merit, and Broader Impacts sections.',
    'Check the Project Summary for logical consistency and completeness. Verify that:
- Overview aligns with goals and approach.
- Intellectual Merit justifies knowledge advancement.
- Broader Impacts specify tangible societal benefits.
Flag vague statements, missing sections, or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Project Summary:
- Must be 1 page or less.
- Must include Overview, Intellectual Merit, and Broader Impacts as distinct sections.
- Must be in third person, free of proprietary/confidential info or URLs.
- Reject if: exceeds 1 page, omits a section, lacks clarity in merit or impacts, or violates format rules.',
    'Provide project goals, approach, intellectual merit, and broader impacts.'
),

-- 4. Project Description (Required, Ch 2.D.2.b(ii))
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Project Description',
    'The detailed narrative of the proposed research, including objectives, methods, and significance.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF grant application based on the context provided by the grant writer. The Project Description should:
- Be limited to 15 pages unless specified otherwise in the solicitation.
- Clearly state the research objectives and, where applicable, hypotheses.
- Describe the proposed methods, experimental design, and technical approaches.
- Explain the intellectual merit (advancing knowledge) and broader impacts (societal benefits).
- Include a results dissemination plan.
- Address prior NSF support (if applicable) with award number, summary, and outcomes per PAPPG Ch 2.D.2.b(ii).
- Use the following information provided by the grant writer:
  - Research objectives/hypotheses: [User input]
  - Methods and approaches: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Dissemination plan: [User input]
  - Prior NSF support (if any): [User input]
Ensure the document is persuasive, rigorously detailed, and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(ii) guidelines.',
    'Review the Project Description for spelling, grammar, and clarity. Ensure it is well-organized, within 15 pages (unless specified), and includes all required elements.',
    'Check the Project Description for logical consistency and rigor. Verify that:
- Objectives align with methods and hypotheses (if applicable).
- Methods are feasible and scientifically sound.
- Intellectual merit and broader impacts are robustly justified.
- Prior NSF support is detailed (if applicable).
Flag gaps, inconsistencies, or lack of specificity.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the context and instructions. Ensure visuals:
- Clarify methods, data, or outcomes.
- Include clear labels, legends, and titles.
- Enhance the narrative without clutter.
- Use the following information provided by the grant writer:
  - Data/concepts to visualize: [User input]
  - Visual instructions: [User input]
Deliver visuals in PDF format, meeting NSF formatting guidelines.',
    'Act as a critical NSF reviewer and evaluate the Project Description:
- Must not exceed 15 pages unless solicitation permits.
- Must include objectives, methods, merit, impacts, dissemination plan, and prior NSF support (if applicable).
- Must be scientifically rigorous and persuasive.
- Reject if: exceeds page limit, lacks detail, omits required elements, or is poorly justified.',
    'Provide research objectives, methods, intellectual merit, broader impacts, dissemination plan, and prior NSF support (if any).'
),

-- 5. References Cited (Required, Ch 2.D.2.b(iii))
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'References Cited',
    'A comprehensive list of all references cited in the Project Description.',
    5,
    false,
    'pdf',
    'Generate a References Cited section for an NSF grant application based on the context provided by the grant writer. The section should:
- Include full bibliographic citations for all works referenced in the Project Description.
- Use a consistent, NSF-acceptable citation style (e.g., APA, MLA).
- Have no page limit but list only cited references.
- Use the following information provided by the grant writer:
  - List of cited works or Project Description text: [User input or attachment]
Ensure the document is accurate and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(iii) guidelines.',
    'Review the References Cited for spelling, grammar, and citation style consistency. Ensure all entries are complete.',
    'Check the References Cited for accuracy and relevance. Verify that:
- All citations match those in the Project Description.
- Each entry includes full bibliographic details.
Flag missing, uncited, or erroneous references.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the References Cited:
- Must include all and only references cited in the Project Description.
- Must use a consistent, acceptable citation style.
- Reject if: omits cited references, includes uncited works, or has incomplete entries.',
    'Provide a list of cited works or the Project Description text with references.'
),

-- 6. Biographical Sketches (Required, Ch 2.D.2.b(iv))
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Biographical Sketches',
    'Detailed bios for all senior personnel, showcasing qualifications and contributions.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF grant application based on the context provided by the grant writer. Each sketch should:
- Be limited to 3 pages per individual.
- Include: Professional Preparation (education), Appointments (reverse chronological), Products (up to 5 relevant, 5 other), Synergistic Activities (up to 5).
- Follow the NSF-approved format (e.g., SciENcv or NSF fillable PDF).
- Use the following information provided by the grant writer:
  - Senior personnel details (education, appointments, products, activities): [User input]
Ensure the document is formatted as a PDF per NSF PAPPG Ch 2.D.2.b(iv) guidelines.',
    'Review the Biographical Sketches for spelling, grammar, and NSF format adherence. Ensure each is within 3 pages.',
    'Check the Biographical Sketches for completeness and accuracy. Verify that:
- All required sections are included and accurate.
- Products and activities are relevant to the project.
Flag missing sections, excessive entries, or inaccuracies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Biographical Sketches:
- Must not exceed 3 pages per person.
- Must include Professional Preparation, Appointments, Products (max 10), Synergistic Activities (max 5).
- Must follow NSF-approved format.
- Reject if: exceeds page limit, omits sections, or includes irrelevant data.',
    'Provide education, appointments, products, and synergistic activities for each senior personnel.'
),

-- 7. Budget and Budget Justification (Required, Ch 2.D.2.b(v))
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Budget Justification',
    'A narrative justifying the proposed budget across all categories.',
    7,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF grant application based on the context provided by the grant writer. The Budget Justification should:
- Be limited to 5 pages for the entire proposal.
- Justify all budget categories (e.g., personnel, equipment, travel, participant support) as reasonable, allowable, and allocable per NSF policy.
- Provide detailed cost breakdowns and rationales.
- Use the following information provided by the grant writer:
  - Budget details and cost rationales: [User input]
Ensure the document is clear, concise, and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(v) guidelines.',
    'Review the Budget Justification for spelling, grammar, and clarity. Ensure it is within 5 pages and covers all budget categories.',
    'Check the Budget Justification for consistency and accuracy. Verify that:
- Costs align with the budget and project scope.
- Justifications are specific and allowable per NSF rules.
Flag unexplained costs, inconsistencies, or unallowable items.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Budget Justification:
- Must not exceed 5 pages.
- Must justify all budget categories with detail.
- Must comply with NSF cost principles (reasonable, allowable, allocable).
- Reject if: exceeds page limit, lacks specificity, or includes unallowable costs.',
    'Provide budget details and cost rationales for all categories.'
),

-- 8. Current and Pending Support (Required, Ch 2.D.2.b(vi))
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Current and Pending Support',
    'A disclosure of all current and pending support for senior personnel.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support document for an NSF grant application based on the context provided by the grant writer. The document should:
- List all current and pending support for each senior personnel, including this proposal.
- Include project titles, funding sources, award amounts, periods, and person-months committed per year.
- Follow the NSF-approved format (e.g., SciENcv or NSF fillable PDF).
- Use the following information provided by the grant writer:
  - Current and pending support details: [User input]
Ensure the document is complete and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(vi) guidelines.',
    'Review the Current and Pending Support for spelling, grammar, and NSF format adherence. Ensure all required details are present.',
    'Check the Current and Pending Support for accuracy and completeness. Verify that:
- All projects include titles, sources, amounts, periods, and effort.
- This proposal is included as pending.
Flag omissions, inaccuracies, or format deviations.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Current and Pending Support:
- Must list all current/pending support for each senior personnel.
- Must include titles, sources, amounts, periods, and effort in NSF format.
- Must include this proposal.
- Reject if: incomplete, inaccurate, or not in NSF format.',
    'Provide current and pending support details for all senior personnel.'
),

-- 9. Facilities, Equipment, and Other Resources (Required, Ch 2.D.2.b(vii))
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the project.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF grant application based on the context provided by the grant writer. The section should:
- Describe all physical and intellectual resources available (e.g., labs, equipment, computing).
- Explain how these resources ensure project feasibility and success.
- Avoid quantifying costs unless resources require budget support.
- Use the following information provided by the grant writer:
  - Available facilities and equipment: [User input]
  - Other resources and their role: [User input]
Ensure the document is specific and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(vii) guidelines.',
    'Review the Facilities, Equipment, and Other Resources for spelling, grammar, and clarity. Ensure descriptions are specific and relevant.',
    'Check the Facilities, Equipment, and Other Resources for relevance and accuracy. Verify that:
- Resources support the project’s objectives and methods.
- No unnecessary cost quantification is included.
Flag vague descriptions or irrelevant resources.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Facilities, Equipment, and Other Resources:
- Must describe resources clearly and link them to project feasibility.
- Must avoid cost details unless budgeted.
- Reject if: vague, incomplete, or includes irrelevant/unavailable resources.',
    'Provide details on available facilities, equipment, and other resources.'
),

-- 10. Data Management and Sharing Plan (Required, Ch 2.D.2.b(viii))
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Data Management and Sharing Plan',
    'A plan for managing, storing, and sharing project data.',
    10,
    false,
    'pdf',
    'Generate a Data Management and Sharing Plan for an NSF grant application based on the context provided by the grant writer. The plan should:
- Be limited to 2 pages.
- Describe the types of data to be produced and how they will be collected, stored, and preserved.
- Detail data formats, metadata standards, and policies for access and sharing (including public dissemination).
- Address compliance with NSF data sharing policies.
- Use the following information provided by the grant writer:
  - Data types and collection methods: [User input]
  - Storage and preservation plans: [User input]
  - Sharing and access policies: [User input]
Ensure the document is detailed and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(viii) guidelines.',
    'Review the Data Management and Sharing Plan for spelling, grammar, and clarity. Ensure it is within 2 pages and comprehensive.',
    'Check the Data Management and Sharing Plan for feasibility and completeness. Verify that:
- Data types and management strategies are specific.
- Sharing plans comply with NSF policies and are practical.
Flag omissions, vague plans, or non-compliance.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Data Management and Sharing Plan:
- Must not exceed 2 pages.
- Must detail data types, collection, storage, preservation, and sharing policies.
- Must comply with NSF data sharing requirements.
- Reject if: exceeds page limit, lacks specificity, or violates NSF policy.',
    'Provide data types, collection methods, storage plans, and sharing policies.'
),

-- 11. Collaborators & Other Affiliations Information (Required but Optional Submission, Ch 2.D.2.b(ix))
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Collaborators & Other Affiliations Information',
    'A list of collaborators and affiliations for senior personnel to identify conflicts of interest.',
    11,
    true,
    'pdf',
    'Generate a Collaborators & Other Affiliations Information document for an NSF grant application based on the context provided by the grant writer. The document should:
- Follow the NSF COA template format.
- List all collaborators, co-authors (last 48 months), graduate advisors/advisees, and affiliations for each senior personnel.
- Have no page limit but maintain clarity and organization.
- Use the following information provided by the grant writer:
  - Collaborators, co-authors, advisees, and affiliations: [User input]
Ensure the document is accurate and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(ix) guidelines.',
    'Review the Collaborators & Other Affiliations Information for spelling, grammar, and NSF COA template adherence. Ensure all required lists are complete.',
    'Check the Collaborators & Other Affiliations Information for accuracy and completeness. Verify that:
- All required individuals and affiliations are listed.
- Timeframes (e.g., 48 months for co-authors) are respected.
Flag omissions or errors.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Collaborators & Other Affiliations Information:
- Must use the NSF COA template.
- Must include all collaborators, co-authors (48 months), advisees, and affiliations.
- Reject if: template not followed, incomplete, or inaccurate.',
    'Provide a list of collaborators, co-authors, advisees, and affiliations for all senior personnel.'
),

-- Special Processing Instructions Below (All Optional, Ch 2.E)

-- 12. Postdoctoral Researcher Mentoring Plan (Optional, Ch 2.E.1)
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Postdoctoral Researcher Mentoring Plan',
    'A plan for mentoring postdoctoral researchers, required if funding is requested for postdocs.',
    12,
    true,
    'pdf',
    'Generate a Postdoctoral Researcher Mentoring Plan for an NSF grant application based on the context provided by the grant writer. The plan should:
- Be limited to 1 page.
- Describe mentoring activities (e.g., career counseling, training, skill development).
- Explain how these activities enhance postdoctoral career development.
- Use the following information provided by the grant writer:
  - Mentoring activities and goals: [User input]
Ensure the document is concise, specific, and formatted as a PDF per NSF PAPPG Ch 2.E.1 guidelines.',
    'Review the Postdoctoral Researcher Mentoring Plan for spelling, grammar, and clarity. Ensure it is within 1 page.',
    'Check the Postdoctoral Researcher Mentoring Plan for specificity and relevance. Verify that:
- Activities are detailed and tied to career development.
- The plan is feasible and impactful.
Flag vague or irrelevant content.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Postdoctoral Researcher Mentoring Plan:
- Must be 1 page or less.
- Must detail specific mentoring activities and career benefits.
- Reject if: exceeds 1 page, lacks specificity, or is irrelevant to postdocs.',
    'Provide mentoring activities and career development goals for postdocs, if applicable.'
),

-- 13. Plans for Data Management and Sharing (Already Covered as Data Management and Sharing Plan, Ch 2.E.2)

-- 14. Rationale for Conducting Activities Outside the U.S. (Optional, Ch 2.E.3)
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Rationale for Conducting Activities Outside the U.S.',
    'A justification for performing project activities outside the United States.',
    13,
    true,
    'pdf',
    'Generate a Rationale for Conducting Activities Outside the U.S. for an NSF grant application based on the context provided by the grant writer. The rationale should:
- Be concise, typically 1 page unless specified.
- Specify activities to be performed outside the U.S. and their locations.
- Justify why these activities cannot be conducted in the U.S. (e.g., unique resources, expertise).
- Use the following information provided by the grant writer:
  - Activities and locations: [User input]
  - Justification for non-U.S. location: [User input]
Ensure the document is clear, justified, and formatted as a PDF per NSF PAPPG Ch 2.E.3 guidelines.',
    'Review the Rationale for spelling, grammar, and clarity. Ensure it is concise and justified.',
    'Check the Rationale for logical consistency and completeness. Verify that:
- Activities and locations are specific.
- Justification is compelling and unique to non-U.S. settings.
Flag vague or unconvincing reasons.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Rationale:
- Must specify activities, locations, and a compelling non-U.S. justification.
- Reject if: lacks specificity, justification is weak, or activities could reasonably occur in the U.S.',
    'Provide activities, locations, and justification for conducting them outside the U.S., if applicable.'
),

-- 15. Projects Requiring Additional Documentation (Optional, Ch 2.E.4 Placeholder)
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Additional Project Documentation',
    'Supplementary documentation required for specific project types (e.g., conference agendas, permits).',
    14,
    true,
    'pdf',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Provide any additional documentation required by the solicitation (e.g., conference agendas, permits, letters of support), if applicable.'
),

-- 16. Projects Involving Human Subjects (Optional, Ch 2.E.5)
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Human Subjects Documentation',
    'A section detailing the involvement of human subjects and ethical considerations.',
    15,
    true,
    'pdf',
    'Generate a Human Subjects Documentation section for an NSF grant application based on the context provided by the grant writer. The section should:
- Be concise, typically 1-2 pages unless specified.
- Describe the involvement of human subjects (e.g., participant types, activities).
- Detail procedures for obtaining informed consent.
- Explain measures to protect privacy, confidentiality, and participant welfare.
- Specify IRB approval status or plans to obtain it.
- Use the following information provided by the grant writer:
  - Human subjects involvement: [User input]
  - Consent procedures: [User input]
  - Privacy and welfare measures: [User input]
  - IRB status: [User input]
Ensure the document is ethical, detailed, and formatted as a PDF per NSF PAPPG Ch 2.E.5 guidelines.',
    'Review the Human Subjects Documentation for spelling, grammar, and clarity. Ensure all ethical elements are addressed.',
    'Check the Human Subjects Documentation for completeness and ethics. Verify that:
- Involvement and procedures are specific.
- Consent and privacy measures are robust.
- IRB status is clear.
Flag omissions, ethical lapses, or vague details.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Human Subjects Documentation:
- Must detail involvement, consent, privacy/welfare measures, and IRB status.
- Must demonstrate ethical compliance.
- Reject if: incomplete, ethically deficient, or omits IRB plans/status.',
    'Provide human subjects involvement, consent procedures, privacy/welfare measures, and IRB status, if applicable.'
),

-- 17. Projects Involving Vertebrate Animals (Optional, Ch 2.E.6)
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Vertebrate Animals Documentation',
    'A section justifying and detailing the use of vertebrate animals.',
    16,
    true,
    'pdf',
    'Generate a Vertebrate Animals Documentation section for an NSF grant application based on the context provided by the grant writer. The section should:
- Be concise, typically 1-2 pages unless specified.
- Justify the use of vertebrate animals (species, number) and why alternatives are not feasible.
- Describe procedures, pain/distress minimization, and euthanasia methods (consistent with AVMA guidelines).
- Confirm IACUC approval or pending status.
- Use the following information provided by the grant writer:
  - Animal use details (species, number): [User input]
  - Procedures and welfare measures: [User input]
  - IACUC status: [User input]
Ensure the document is ethical, specific, and formatted as a PDF per NSF PAPPG Ch 2.E.6 guidelines.',
    'Review the Vertebrate Animals Documentation for spelling, grammar, and clarity. Ensure ethical details are complete.',
    'Check the Vertebrate Animals Documentation for ethics and completeness. Verify that:
- Justification is robust and alternatives are addressed.
- Procedures minimize welfare impacts.
- IACUC status is included.
Flag ethical issues, vague details, or omissions.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Vertebrate Animals Documentation:
- Must justify species/number, detail procedures/welfare, and include IACUC status.
- Must comply with AVMA euthanasia guidelines.
- Reject if: justification weak, welfare unaddressed, or IACUC omitted.',
    'Provide animal use details, procedures/welfare measures, and IACUC status, if applicable.'
),

-- 18. Dual Use Research of Concern (Optional, Ch 2.E.7)
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Dual Use Research of Concern',
    'Documentation addressing research with potential dual-use implications.',
    17,
    true,
    'pdf',
    'Generate a Dual Use Research of Concern section for an NSF grant application based on the context provided by the grant writer. The section should:
- Be concise, typically 1-2 pages unless specified.
- Identify if the research involves any of the 15 agents/toxins listed in the U.S. Government Policy for DURC.
- Describe potential dual-use implications (e.g., misuse risks).
- Outline a risk mitigation plan (e.g., oversight, training).
- Use the following information provided by the grant writer:
  - Agents/toxins involved: [User input]
  - Dual-use implications: [User input]
  - Risk mitigation plan: [User input]
Ensure the document is detailed, proactive, and formatted as a PDF per NSF PAPPG Ch 2.E.7 guidelines.',
    'Review the Dual Use Research of Concern section for spelling, grammar, and clarity. Ensure all elements are addressed.',
    'Check the Dual Use Research of Concern section for completeness and feasibility. Verify that:
- Agents/toxins are specified and linked to DURC policy.
- Implications are clear and realistic.
- Mitigation plan is practical.
Flag omissions, vague risks, or weak mitigation.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Dual Use Research of Concern section:
- Must identify agents/toxins, describe dual-use risks, and provide a mitigation plan.
- Must align with U.S. DURC policy.
- Reject if: incomplete, risks unclear, or mitigation inadequate.',
    'Provide agents/toxins involved, dual-use implications, and risk mitigation plan, if applicable.'
),

-- 19. Letters of Collaboration (Optional, Ch 2.E.8)
(
    '931d90c8-9577-4467-b323-64312e459b6f',
    'Letters of Collaboration',
    'Letters from collaborators confirming their involvement, distinct from endorsement letters.',
    18,
    true,
    'pdf',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Provide letters of collaboration from all listed collaborators, confirming their role and commitment (no endorsements), if applicable.'
);

-- Insert sections for NSF GOALI Proposal (Grant ID: 22216894-228c-43c4-808f-3d6723d6ef55)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES

-- 1. Concept Outline (Optional, Pre-submission)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Concept Outline',
    'A brief overview of the proposed GOALI research, emphasizing the industry-academic collaboration and potential for transformative outcomes.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The Concept Outline should:
- Be concise, typically 1-2 pages.
- Introduce the research question or problem, emphasizing its interdisciplinary nature.
- Highlight the industry-academic collaboration, including the role of the industrial partner.
- Explain the potential for transformative outcomes and why the research requires the GOALI mechanism.
- Use the following information provided by the grant writer:
  - Research question or problem: [User input]
  - Interdisciplinary approach: [User input]
  - Industry-academic collaboration details: [User input]
  - Transformative potential: [User input]
  - Justification for GOALI mechanism: [User input]
Ensure the document is compelling, avoids proprietary information, and is formatted as a PDF per NSF guidelines.',
    'Review the Concept Outline for spelling, grammar, and clarity. Ensure it:
- Is within 1-2 pages.
- Uses concise, professional language.
- Avoids jargon or proprietary data.',
    'Check the Concept Outline for logical consistency and completeness. Verify that:
- The research question is clearly stated.
- The industry-academic collaboration is well-defined.
- The transformative potential is articulated.
- The justification for the GOALI mechanism is convincing.
Flag missing elements or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Concept Outline:
- Must be 1-2 pages.
- Must include the research question, interdisciplinary approach, industry-academic collaboration, transformative potential, and GOALI justification.
- Must avoid proprietary information.
- Reject if: exceeds 2 pages, lacks specificity, or fails to justify the GOALI mechanism convincingly.',
    'Provide a brief overview of the research question, interdisciplinary approach, industry-academic collaboration, transformative potential, and justification for the GOALI mechanism.'
),

-- 2. Letter of Intent (Optional, Pre-submission)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Letter of Intent',
    'A brief letter indicating intent to submit a GOALI proposal, highlighting its interdisciplinary and industry-relevant aspects.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The Letter of Intent should:
- Be brief, typically 1 page.
- Include the project title, PI name, and a concise description of the interdisciplinary research.
- Highlight the industry-academic collaboration and transformative potential.
- Specify the target NSF program, if known.
- Use the following information provided by the grant writer:
  - Project title: [User input]
  - PI name: [User input]
  - Research description: [User input]
  - Industry-academic collaboration: [User input]
  - Transformative potential: [User input]
  - Target NSF program (if applicable): [User input]
Ensure the document is formal, clear, and formatted as a PDF per NSF guidelines.',
    'Review the Letter of Intent for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses a formal, professional tone.
- Includes all required elements.',
    'Check the Letter of Intent for completeness and consistency. Verify that:
- Project title, PI name, research description, industry-academic collaboration, and transformative potential are included.
- The interdisciplinary and industry-relevant aspects are clearly stated.
- The target program (if provided) is plausible.
Flag missing elements or vague statements.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letter of Intent:
- Must be 1 page or less.
- Must include project title, PI name, research description, industry-academic collaboration, and transformative potential.
- Must align with GOALI goals.
- Reject if: exceeds 1 page, omits required elements, or lacks a clear industry-academic collaboration case.',
    'Provide project title, PI name, research description, industry-academic collaboration, transformative potential, and target NSF program (if applicable).'
),

-- 3. Cover Sheet (Required, Ch 2.D.2.a)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Cover Sheet',
    'The cover sheet for the proposal, including basic information about the project and the submitting organization. This is a form and does not require a document from the grant writer.',
    3,
    false,
    'pdf',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Complete the NSF Cover Sheet form with required information.'
),

-- 4. Project Summary (Required, Ch 2.D.2.b(i))
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Project Summary',
    'A concise summary of the GOALI research, covering overview, intellectual merit, broader impacts, and industry-academic collaboration.',
    4,
    false,
    'pdf',
    'Generate a Project Summary for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The Project Summary should:
- Be limited to 1 page.
- Include three sections: Overview, Intellectual Merit, and Broader Impacts.
- Overview: Summarize the interdisciplinary research goals, approach, and industry-academic collaboration.
- Intellectual Merit: Explain how the research advances knowledge and involves industry-relevant innovation.
- Broader Impacts: Detail the potential societal benefits, including industry and workforce development.
- Be written in third person, avoiding URLs or proprietary data.
- Use the following information provided by the grant writer:
  - Research goals and approach: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Industry-academic collaboration: [User input]
Ensure the document is persuasive and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(i).',
    'Review the Project Summary for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses third-person narrative.
- Clearly separates Overview, Intellectual Merit, and Broader Impacts.',
    'Check the Project Summary for logical consistency and completeness. Verify that:
- The Overview ties goals and approach to the industry-academic collaboration.
- Intellectual Merit specifies advancements and industry relevance.
- Broader Impacts outline concrete societal benefits, including industry and workforce development.
- No proprietary data or URLs are included.
Flag missing sections or vague claims.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Project Summary:
- Must be 1 page or less.
- Must include Overview, Intellectual Merit, and Broader Impacts, with a clear industry-academic collaboration focus.
- Must be in third person, free of proprietary info or URLs.
- Reject if: exceeds 1 page, omits sections, or fails to justify industry-academic collaboration or impact.',
    'Provide research goals and approach, intellectual merit, broader impacts, and industry-academic collaboration details.'
),

-- 5. Project Description (Required, Ch 2.D.2.b(ii) and Ch 2.F.5)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Project Description',
    'A detailed narrative of the GOALI research, including objectives, methods, industry-academic collaboration, and transformative potential.',
    5,
    false,
    'pdf',
    'Generate a Project Description for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The Project Description should:
- Be limited to 15 pages unless otherwise specified.
- Clearly state objectives and, if applicable, hypotheses.
- Describe methods and technical approaches in detail.
- Explain intellectual merit (advancing knowledge and industry-relevant innovation) and broader impacts (societal benefits, including workforce development).
- Provide a strong justification for the industry-academic collaboration, including the role of the industrial partner.
- Outline expected outcomes, including technology transfer or commercialization potential.
- Include a dissemination plan.
- Use the following information provided by the grant writer:
  - Objectives/hypotheses: [User input]
  - Methods: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Industry-academic collaboration: [User input]
  - Expected outcomes: [User input]
  - Dissemination plan: [User input]
Ensure the document is rigorous, concise, and formatted as a PDF per NSF PAPPG guidelines, with visuals if appropriate.',
    'Review the Project Description for spelling, grammar, and clarity. Ensure it:
- Is within 15 pages.
- Is logically structured with all required elements.
- Uses precise scientific language.',
    'Check the Project Description for logical consistency and rigor. Verify that:
- Objectives align with methods and outcomes.
- Methods are feasible and detailed.
- Intellectual merit and broader impacts are robust, with a focus on industry-academic collaboration.
- Industry-academic collaboration is well-justified and integrated.
- Expected outcomes include technology transfer or commercialization potential.
- Dissemination plan is practical.
Flag gaps or vague sections.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the context and attachments. Ensure visuals:
- Illustrate the industry-academic collaboration (e.g., workflow between academia and industry).
- Clarify complex methodologies or concepts.
- Highlight potential outcomes or impacts.
- Include clear labels, titles, and legends.
- Are high-resolution and uncluttered.
- Use the following information provided by the grant writer:
  - Data/concepts to visualize: [User input]
  - Visual instructions: [User input]
Deliver visuals in PDF format per NSF guidelines.',
    'Act as a critical NSF reviewer and evaluate the Project Description:
- Must be 15 pages or less.
- Must include objectives, methods, intellectual merit, broader impacts, industry-academic collaboration, outcomes, and dissemination plan.
- Must convincingly argue for the GOALI mechanism.
- Reject if: exceeds page limit, lacks required elements, or fails to demonstrate industry-academic collaboration or transformative potential.',
    'Provide objectives, methods, intellectual merit, broader impacts, industry-academic collaboration, outcomes, and dissemination plan.'
),

-- 6. References Cited (Required, Ch 2.D.2.b(iii))
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'References Cited',
    'A list of all references cited in the Project Description.',
    6,
    false,
    'pdf',
    'Generate a References Cited section for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The section should:
- Include full bibliographic citations for all works cited in the Project Description.
- Use a consistent, NSF-acceptable citation style (e.g., APA, MLA).
- List only cited references, with no page limit.
- Use the following information provided by the grant writer:
  - Cited works or Project Description text: [User input or attachment]
Ensure the document is accurate and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(iii).',
    'Review the References Cited for spelling, grammar, and citation consistency. Ensure all entries are complete.',
    'Check the References Cited for accuracy and relevance. Verify that:
- All citations match Project Description references.
- Each entry has full bibliographic details.
Flag uncited references or missing citations.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the References Cited:
- Must include all and only references cited in the Project Description.
- Must use a consistent, acceptable citation style.
- Reject if: omits cited works, includes uncited works, or has incomplete entries.',
    'Provide a list of cited works or the Project Description text.'
),

-- 7. Biographical Sketches (Required, Ch 2.D.2.b(iv))
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Biographical Sketches',
    'Bios for senior personnel, detailing qualifications and contributions, with emphasis on industry-academic collaboration experience.',
    7,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF GOALI grant application based on the context and attachments provided by the grant writer. Each sketch should:
- Be limited to 3 pages per individual per Ch 2.D.2.b(iv).
- Include: Professional Preparation (education), Appointments (reverse chronological), Products (up to 5 relevant, 5 other), Synergistic Activities (up to 5, highlighting industry-academic collaborations).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Senior personnel details (education, appointments, products, activities): [User input]
Ensure the document is formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Biographical Sketches for spelling, grammar, and format adherence. Ensure each is within 3 pages.',
    'Check the Biographical Sketches for completeness and accuracy. Verify that:
- All sections are included and accurate.
- Products and activities are relevant, with industry-academic collaboration focus where applicable.
Flag missing sections or excessive entries.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Biographical Sketches:
- Must be 3 pages or less per person.
- Must include Professional Preparation, Appointments, Products (max 10), and Synergistic Activities (max 5, with industry-academic focus).
- Must follow NSF format.
- Reject if: exceeds page limit, omits sections, or lacks industry-academic relevance.',
    'Provide education, appointments, products, and synergistic activities for each senior personnel, emphasizing industry-academic collaboration experience.'
),

-- 8. Budget and Budget Justification (Required, Ch 2.D.2.b(v))
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Budget Justification',
    'A narrative justifying all proposed budget costs, with attention to industry-academic collaboration needs.',
    8,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The Budget Justification should:
- Be limited to 5 pages per Ch 2.D.2.b(v).
- Justify all budget categories (e.g., personnel, equipment) as allowable, reasonable, and allocable per NSF policy.
- Explain how the budget supports the industry-academic collaboration (e.g., travel for meetings, shared resources).
- Use the following information provided by the grant writer:
  - Budget details and cost rationales: [User input]
Ensure the document is detailed and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Budget Justification for spelling, grammar, and clarity. Ensure it:
- Is within 5 pages.
- Justifies all budget categories specifically.',
    'Check the Budget Justification for consistency and accuracy. Verify that:
- Costs align with project scope and budget.
- Justifications are specific, allowable, and support industry-academic collaboration needs.
Flag unexplained or unallowable costs.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Budget Justification:
- Must be 5 pages or less.
- Must justify all budget categories with specific, allowable rationales, emphasizing industry-academic collaboration support.
- Reject if: exceeds page limit, lacks detail, or includes unallowable costs.',
    'Provide budget details and cost rationales, emphasizing industry-academic collaboration needs.'
),

-- 9. Current and Pending Support (Required, Ch 2.D.2.b(vi))
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Current and Pending Support',
    'A disclosure of all current and pending support for senior personnel.',
    9,
    false,
    'pdf',
    'Generate a Current and Pending Support document for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The document should:
- List all current and pending support for each senior personnel, including this proposal.
- Include project titles, funding sources, amounts, periods, and effort (person-months).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Current and pending support details: [User input]
Ensure the document is complete and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(vi).',
    'Review the Current and Pending Support for spelling, grammar, and format adherence. Ensure all details are present.',
    'Check the Current and Pending Support for accuracy and completeness. Verify that:
- All projects include required details.
- This proposal is listed as pending.
Flag omissions or inaccuracies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Current and Pending Support:
- Must list all current/pending support with titles, sources, amounts, periods, and effort.
- Must include this proposal.
- Reject if: incomplete, inaccurate, or not in NSF format.',
    'Provide current and pending support details for all senior personnel.'
),

-- 10. Facilities, Equipment, and Other Resources (Required, Ch 2.D.2.b(vii))
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the interdisciplinary project and industry-academic collaboration.',
    10,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The section should:
- Describe available physical and intellectual resources (e.g., labs, equipment, computing).
- Explain how these resources support the interdisciplinary approach and industry-academic collaboration (e.g., shared facilities).
- Avoid cost quantification unless budgeted.
- Use the following information provided by the grant writer:
  - Available facilities and equipment: [User input]
  - Other resources and roles: [User input]
Ensure the document is specific and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(vii).',
    'Review the Facilities, Equipment, and Other Resources for spelling, grammar, and clarity. Ensure descriptions are specific.',
    'Check the Facilities, Equipment, and Other Resources for relevance and accuracy. Verify that:
- Resources support interdisciplinary project objectives and industry-academic collaboration.
- No unbudgeted cost details are included.
Flag vague or irrelevant items.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Facilities, Equipment, and Other Resources:
- Must describe resources clearly and link to project feasibility and collaboration.
- Must avoid unbudgeted cost details.
- Reject if: vague, incomplete, or includes irrelevant resources.',
    'Provide details on facilities, equipment, and other resources, emphasizing interdisciplinary and industry-academic support.'
),

-- 11. Data Management Plan (Required, Ch 2.D.2.b(viii))
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Data Management Plan',
    'A plan for managing, storing, and sharing project data, considering interdisciplinary and industry-academic data needs.',
    11,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 2 pages per Ch 2.D.2.b(viii).
- Describe data types, collection methods, storage, and preservation.
- Detail access, sharing policies, and metadata standards, considering interdisciplinary and industry-academic data integration.
- Comply with NSF data sharing policies.
- Use the following information provided by the grant writer:
  - Data types and collection methods: [User input]
  - Storage and preservation plans: [User input]
  - Sharing policies: [User input]
Ensure the document is detailed and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Data Management Plan for spelling, grammar, and clarity. Ensure it is within 2 pages.',
    'Check the Data Management Plan for feasibility and completeness. Verify that:
- Data types and strategies are specific, considering interdisciplinary and industry-academic needs.
- Sharing plans comply with NSF policy and support cross-disciplinary access.
Flag omissions or vague plans.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Data Management Plan:
- Must be 2 pages or less.
- Must detail data types, collection, storage, preservation, and sharing, with interdisciplinary and industry-academic considerations.
- Must comply with NSF data policies.
- Reject if: exceeds 2 pages, lacks specificity, or violates policy.',
    'Provide data types, collection methods, storage plans, and sharing policies, considering interdisciplinary and industry-academic needs.'
),

-- 12. Postdoctoral Mentoring Plan (Optional, Ch 2.E.1)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers, required if postdocs are funded.',
    12,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 1 page per Ch 2.E.1.
- Describe mentoring activities (e.g., career development, interdisciplinary training, industry exposure).
- Explain how these enhance postdoc skills, especially in interdisciplinary and industry-academic contexts.
- Use the following information provided by the grant writer:
  - Mentoring activities and goals: [User input]
Ensure the document is specific and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity. Ensure it is within 1 page.',
    'Check the Postdoctoral Mentoring Plan for specificity and relevance. Verify that:
- Activities are detailed and tied to interdisciplinary and industry-academic development.
- Plan is feasible.
Flag vague or irrelevant content.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Postdoctoral Mentoring Plan:
- Must be 1 page or less.
- Must detail specific mentoring activities and benefits, with interdisciplinary and industry-academic focus.
- Reject if: exceeds 1 page, lacks specificity, or is irrelevant.',
    'Provide mentoring activities and goals, emphasizing interdisciplinary and industry-academic training, if postdocs are funded.'
),

-- 13. Human Subjects Documentation (Optional, Ch 2.E.5)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Human Subjects Documentation',
    'Details involvement of human subjects and ethical considerations.',
    13,
    true,
    'pdf',
    'Generate a Human Subjects Documentation section for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The section should:
- Be concise, typically 1-2 pages per Ch 2.E.5.
- Describe human subjects involvement (e.g., participants, activities).
- Detail informed consent, privacy, and welfare protections.
- Specify IRB approval status or plans.
- Use the following information provided by the grant writer:
  - Human subjects involvement: [User input]
  - Consent and protection measures: [User input]
  - IRB status: [User input]
Ensure the document is ethical and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Human Subjects Documentation for spelling, grammar, and clarity. Ensure ethical elements are addressed.',
    'Check the Human Subjects Documentation for completeness and ethics. Verify that:
- Involvement and protections are specific.
- Consent and IRB plans are robust.
Flag omissions or ethical issues.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Human Subjects Documentation:
- Must detail involvement, consent, protections, and IRB status.
- Must demonstrate ethical compliance.
- Reject if: incomplete, ethically deficient, or omits IRB plans.',
    'Provide human subjects involvement, consent/protection measures, and IRB status, if applicable.'
),

-- 14. Vertebrate Animals Documentation (Optional, Ch 2.E.6)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Vertebrate Animals Documentation',
    'Justifies and details the use of vertebrate animals.',
    14,
    true,
    'pdf',
    'Generate a Vertebrate Animals Documentation section for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The section should:
- Be concise, typically 1-2 pages per Ch 2.E.6.
- Justify use of vertebrate animals (species, number) and lack of alternatives.
- Describe procedures, pain minimization, and euthanasia (per AVMA guidelines).
- Confirm IACUC approval or pending status.
- Use the following information provided by the grant writer:
  - Animal use details (species, number): [User input]
  - Procedures and welfare measures: [User input]
  - IACUC status: [User input]
Ensure the document is ethical and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Vertebrate Animals Documentation for spelling, grammar, and clarity. Ensure ethical details are complete.',
    'Check the Vertebrate Animals Documentation for ethics and completeness. Verify that:
- Justification is robust.
- Procedures minimize welfare impacts.
- IACUC status is included.
Flag ethical lapses or omissions.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Vertebrate Animals Documentation:
- Must justify species/number, detail procedures/welfare, and include IACUC status.
- Must comply with AVMA guidelines.
- Reject if: justification weak, welfare unaddressed, or IACUC omitted.',
    'Provide animal use details, procedures/welfare measures, and IACUC status, if applicable.'
),

-- 15. Dual Use Research of Concern (Optional, Ch 2.E.7)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Dual Use Research of Concern',
    'Addresses research with potential dual-use implications.',
    15,
    true,
    'pdf',
    'Generate a Dual Use Research of Concern section for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The section should:
- Be concise, typically 1-2 pages per Ch 2.E.7.
- Identify any of the 15 DURC agents/toxins involved.
- Describe potential dual-use risks (e.g., misuse potential).
- Outline a risk mitigation plan (e.g., oversight, training).
- Use the following information provided by the grant writer:
  - Agents/toxins involved: [User input]
  - Dual-use risks: [User input]
  - Mitigation plan: [User input]
Ensure the document is proactive and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Dual Use Research of Concern section for spelling, grammar, and clarity. Ensure all elements are addressed.',
    'Check the Dual Use Research of Concern section for completeness and feasibility. Verify that:
- Agents/toxins are specified.
- Risks are clear.
- Mitigation plan is practical.
Flag omissions or weak mitigation.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Dual Use Research of Concern:
- Must identify agents/toxins, describe risks, and provide a mitigation plan.
- Must align with U.S. DURC policy.
- Reject if: incomplete, risks unclear, or mitigation inadequate.',
    'Provide agents/toxins involved, dual-use risks, and mitigation plan, if applicable.'
),

-- 16. Industrial Participation Statement (Required for GOALI, Ch 2.F.5)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Industrial Participation Statement',
    'A statement describing the industrial participation in the GOALI project.',
    16,
    false,
    'pdf',
    'Generate an Industrial Participation Statement for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The statement should:
- Be concise, typically 1-2 pages.
- Describe the role of the industrial partner in the project, including their contributions (e.g., resources, expertise, facilities).
- Explain how the collaboration will enhance the research and its potential for technology transfer or commercialization.
- Use the following information provided by the grant writer:
  - Industrial partner details: [User input]
  - Contributions: [User input]
  - Collaboration benefits: [User input]
Ensure the document is clear, specific, and formatted as a PDF per NSF PAPPG Ch 2.F.5.',
    'Review the Industrial Participation Statement for spelling, grammar, and clarity. Ensure it is within 1-2 pages.',
    'Check the Industrial Participation Statement for completeness and specificity. Verify that:
- The industrial partner’s role and contributions are clearly defined.
- The benefits of the collaboration are well-articulated.
Flag vague or incomplete descriptions.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Industrial Participation Statement:
- Must be 1-2 pages.
- Must describe the industrial partner’s role, contributions, and collaboration benefits.
- Reject if: exceeds 2 pages, lacks specificity, or fails to demonstrate meaningful collaboration.',
    'Provide details on the industrial partner, their contributions, and the benefits of the collaboration.'
),

-- 17. Industrial Partner Letter of Support (Required for GOALI, Ch 2.F.5)
(
    '22216894-228c-43c4-808f-3d6723d6ef55',
    'Industrial Partner Letter of Support',
    'A letter from the industrial partner confirming their commitment to the project.',
    17,
    false,
    'pdf',
    'Generate an Industrial Partner Letter of Support for an NSF GOALI grant application based on the context and attachments provided by the grant writer. The letter should:
- Be brief, typically 1 page.
- Confirm the industrial partner’s commitment to the project, including specific contributions (e.g., resources, expertise).
- Describe the expected benefits of the collaboration for the industrial partner.
- Be signed by an authorized representative of the industrial partner.
- Use the following information provided by the grant writer:
  - Industrial partner details: [User input]
  - Commitment details: [User input]
  - Expected benefits: [User input]
Ensure the document is formal, clear, and formatted as a PDF per NSF PAPPG Ch 2.F.5.',
    'Review the Industrial Partner Letter of Support for spelling, grammar, and clarity. Ensure it is 1 page and includes a signature line.',
    'Check the Industrial Partner Letter of Support for completeness and specificity. Verify that:
- The commitment and contributions are clearly stated.
- The expected benefits are described.
- The letter is signed by an authorized representative.
Flag vague commitments or missing signature.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Industrial Partner Letter of Support:
- Must be 1 page.
- Must confirm commitment, describe contributions, and state benefits.
- Must be signed by an authorized representative.
- Reject if: exceeds 1 page, lacks specificity, or is not signed.',
    'Provide industrial partner details, commitment details, expected benefits, and ensure the letter is signed.'
);

-- Insert sections for NSF Planning Proposal (Grant ID: 39ad3fe4-a9bb-41f9-881b-bdb850830b09)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES

-- 1. Concept Outline (Optional, Pre-submission)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Concept Outline',
    'A brief overview of the proposed planning activities, emphasizing the need for planning and potential outcomes.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF Planning Proposal based on the context and attachments provided by the grant writer. The Concept Outline should:
- Be concise, typically 1-2 pages.
- Introduce the planning activities (e.g., workshops, meetings) and their objectives.
- Highlight the need for planning and the potential outcomes or future research directions.
- Explain why the planning is necessary and cannot be achieved through a standard proposal.
- Use the following information provided by the grant writer:
  - Planning activities: [User input]
  - Objectives: [User input]
  - Need for planning: [User input]
  - Potential outcomes: [User input]
Ensure the document is clear, avoids proprietary information, and is formatted as a PDF per NSF guidelines.',
    'Review the Concept Outline for spelling, grammar, and clarity. Ensure it:
- Is within 1-2 pages.
- Uses concise, professional language.
- Avoids jargon or proprietary data.',
    'Check the Concept Outline for logical consistency and completeness. Verify that:
- Planning activities and objectives are clearly stated.
- The need for planning is well-justified.
- Potential outcomes are articulated.
Flag missing elements or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Concept Outline:
- Must be 1-2 pages.
- Must include planning activities, objectives, need for planning, and potential outcomes.
- Must avoid proprietary information.
- Reject if: exceeds 2 pages, lacks specificity, or fails to justify the need for planning convincingly.',
    'Provide a brief overview of the planning activities, objectives, need for planning, and potential outcomes.'
),

-- 2. Letter of Intent (Optional, Pre-submission)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Letter of Intent',
    'A brief letter indicating intent to submit a Planning Proposal, highlighting its significance.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF Planning Proposal based on the context and attachments provided by the grant writer. The Letter of Intent should:
- Be brief, typically 1 page.
- Include the project title, PI name, and a concise description of the planning activities.
- Highlight the significance of the planning efforts.
- Specify the target NSF program, if known.
- Use the following information provided by the grant writer:
  - Project title: [User input]
  - PI name: [User input]
  - Planning activities description: [User input]
  - Significance: [User input]
  - Target NSF program (if applicable): [User input]
Ensure the document is formal, clear, and formatted as a PDF per NSF guidelines.',
    'Review the Letter of Intent for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses a formal, professional tone.
- Includes all required elements.',
    'Check the Letter of Intent for completeness and consistency. Verify that:
- Project title, PI name, planning activities description, and significance are included.
- The significance is clearly stated.
- The target program (if provided) is plausible.
Flag missing elements or vague statements.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letter of Intent:
- Must be 1 page or less.
- Must include project title, PI name, planning activities description, and significance.
- Must align with Planning Proposal goals.
- Reject if: exceeds 1 page, omits required elements, or lacks a clear significance case.',
    'Provide project title, PI name, planning activities description, significance, and target NSF program (if applicable).'
),

-- 3. Project Summary (Required, Ch 2.F.1)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Project Summary',
    'A concise summary of the planning activities, covering overview, intellectual merit, and broader impacts.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF Planning Proposal based on the context and attachments provided by the grant writer. The Project Summary should:
- Be limited to 1 page per NSF PAPPG Ch 2.F.1.
- Include three sections: Overview, Intellectual Merit, and Broader Impacts.
- Overview: Summarize the planning activities (e.g., workshops, meetings) and their objectives.
- Intellectual Merit: Explain how the planning will advance knowledge or build capacity.
- Broader Impacts: Detail the potential societal benefits or future research outcomes.
- Be written in third person, avoiding URLs or proprietary data.
- Use the following information provided by the grant writer:
  - Planning activities and objectives: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
Ensure the document is clear, persuasive, and formatted as a PDF.',
    'Review the Project Summary for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses third-person narrative.
- Clearly separates Overview, Intellectual Merit, and Broader Impacts.',
    'Check the Project Summary for logical consistency and completeness. Verify that:
- The Overview ties planning activities to objectives.
- Intellectual Merit specifies advancements or capacity building.
- Broader Impacts outline concrete societal benefits or future research potential.
- No proprietary data or URLs are included.
Flag missing sections or vague claims.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Project Summary:
- Must be 1 page or less.
- Must include Overview, Intellectual Merit, and Broader Impacts, with a clear focus on planning activities.
- Must be in third person, free of proprietary info or URLs.
- Reject if: exceeds 1 page, omits sections, or fails to justify intellectual merit or broader impacts.',
    'Provide planning activities and objectives, intellectual merit, and broader impacts.'
),

-- 4. Project Description (Required, Ch 2.F.1)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Project Description',
    'A detailed narrative of the planning activities, including objectives, methods, and expected outcomes.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF Planning Proposal based on the context and attachments provided by the grant writer. The Project Description should:
- Be limited to 5 pages per NSF PAPPG Ch 2.F.1.
- Clearly state the objectives of the planning activities.
- Describe the methods or approaches for conducting the planning (e.g., workshops, meetings).
- Explain the intellectual merit (advancing knowledge or capacity) and broader impacts (societal benefits).
- Outline expected outcomes and how they will inform future research or capacity building.
- Include a dissemination plan for results, if applicable.
- Use the following information provided by the grant writer:
  - Objectives: [User input]
  - Methods/approaches: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Expected outcomes: [User input]
  - Dissemination plan (if applicable): [User input]
Ensure the document is rigorous, concise, and formatted as a PDF, with visuals if appropriate.',
    'Review the Project Description for spelling, grammar, and clarity. Ensure it:
- Is within 5 pages.
- Is logically structured with all required elements.
- Uses precise language suitable for a planning proposal.',
    'Check the Project Description for logical consistency and rigor. Verify that:
- Objectives align with methods and expected outcomes.
- Methods are feasible and detailed.
- Intellectual merit and broader impacts are robust.
- Expected outcomes are clearly articulated.
- Dissemination plan is practical, if included.
Flag gaps or vague sections.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the context and attachments. Ensure visuals:
- Illustrate planning activities or expected outcomes (e.g., workshop flowcharts).
- Clarify complex concepts or methods.
- Include clear labels, titles, and legends.
- Are high-resolution and uncluttered.
- Use the following information provided by the grant writer:
  - Data/concepts to visualize: [User input]
  - Visual instructions: [User input]
Deliver visuals in PDF format per NSF guidelines.',
    'Act as a critical NSF reviewer and evaluate the Project Description:
- Must be 5 pages or less.
- Must include objectives, methods, intellectual merit, broader impacts, expected outcomes, and dissemination plan (if applicable).
- Must convincingly argue for the need for planning.
- Reject if: exceeds page limit, lacks required elements, or fails to demonstrate intellectual merit or broader impacts.',
    'Provide objectives, methods, intellectual merit, broader impacts, expected outcomes, and dissemination plan (if applicable).'
),

-- 5. Budget Justification (Required, Ch 2.F.1)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Budget Justification',
    'A narrative justifying all proposed budget costs for the planning activities.',
    5,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF Planning Proposal based on the context and attachments provided by the grant writer. The Budget Justification should:
- Be limited to 5 pages per NSF PAPPG Ch 2.F.1.
- Justify all budget categories (e.g., personnel, travel, participant support) as allowable, reasonable, and allocable per NSF policy.
- Explain how the budget supports the planning activities (e.g., travel for meetings, participant stipends).
- Use the following information provided by the grant writer:
  - Budget details and cost rationales: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Budget Justification for spelling, grammar, and clarity. Ensure it:
- Is within 5 pages.
- Justifies all budget categories specifically.',
    'Check the Budget Justification for consistency and accuracy. Verify that:
- Costs align with the planning activities and budget.
- Justifications are specific, allowable, and support the planning needs.
Flag unexplained or unallowable costs.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Budget Justification:
- Must be 5 pages or less.
- Must justify all budget categories with specific, allowable rationales.
- Reject if: exceeds page limit, lacks detail, or includes unallowable costs.',
    'Provide budget details and cost rationales, emphasizing planning activity support.'
),

-- 6. Biographical Sketches (Required, Ch 2.F.1)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Biographical Sketches',
    'Bios for senior personnel, detailing qualifications and contributions relevant to the planning activities.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF Planning Proposal based on the context and attachments provided by the grant writer. Each sketch should:
- Be limited to 3 pages per individual per NSF PAPPG Ch 2.F.1.
- Include: Professional Preparation (education), Appointments (reverse chronological), Products (up to 5 relevant, 5 other), Synergistic Activities (up to 5, highlighting planning or collaboration experience).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Senior personnel details (education, appointments, products, activities): [User input]
Ensure the document is formatted as a PDF.',
    'Review the Biographical Sketches for spelling, grammar, and format adherence. Ensure each is within 3 pages.',
    'Check the Biographical Sketches for completeness and accuracy. Verify that:
- All sections are included and accurate.
- Products and activities are relevant to the planning activities.
Flag missing sections or excessive entries.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Biographical Sketches:
- Must be 3 pages or less per person.
- Must include Professional Preparation, Appointments, Products (max 10), and Synergistic Activities (max 5, with planning or collaboration focus).
- Must follow NSF format.
- Reject if: exceeds page limit, omits sections, or lacks relevance to planning activities.',
    'Provide education, appointments, products, and synergistic activities for each senior personnel, emphasizing planning or collaboration experience.'
),

-- 7. Current and Pending Support (Required, Ch 2.F.1)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Current and Pending Support',
    'A disclosure of all current and pending support for senior personnel.',
    7,
    false,
    'pdf',
    'Generate a Current and Pending Support document for an NSF Planning Proposal based on the context and attachments provided by the grant writer. The document should:
- List all current and pending support for each senior personnel, including this proposal.
- Include project titles, funding sources, amounts, periods, and effort (person-months).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Current and pending support details: [User input]
Ensure the document is complete and formatted as a PDF per NSF PAPPG Ch 2.F.1.',
    'Review the Current and Pending Support for spelling, grammar, and format adherence. Ensure all details are present.',
    'Check the Current and Pending Support for accuracy and completeness. Verify that:
- All projects include required details.
- This proposal is listed as pending.
Flag omissions or inaccuracies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Current and Pending Support:
- Must list all current/pending support with titles, sources, amounts, periods, and effort.
- Must include this proposal.
- Reject if: incomplete, inaccurate, or not in NSF format.',
    'Provide current and pending support details for all senior personnel.'
),

-- 8. Facilities, Equipment, and Other Resources (Required, Ch 2.F.1)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the planning activities.',
    8,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF Planning Proposal based on the context and attachments provided by the grant writer. The section should:
- Describe available physical and intellectual resources (e.g., meeting spaces, computing resources).
- Explain how these resources support the planning activities.
- Avoid cost quantification unless budgeted.
- Use the following information provided by the grant writer:
  - Available facilities and equipment: [User input]
  - Other resources and roles: [User input]
Ensure the document is specific and formatted as a PDF per NSF PAPPG Ch 2.F.1.',
    'Review the Facilities, Equipment, and Other Resources for spelling, grammar, and clarity. Ensure descriptions are specific.',
    'Check the Facilities, Equipment, and Other Resources for relevance and accuracy. Verify that:
- Resources support planning activities.
- No unbudgeted cost details are included.
Flag vague or irrelevant items.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Facilities, Equipment, and Other Resources:
- Must describe resources clearly and link to planning activity feasibility.
- Must avoid unbudgeted cost details.
- Reject if: vague, incomplete, or includes irrelevant resources.',
    'Provide details on facilities, equipment, and other resources, emphasizing planning activity support.'
),

-- 9. Data Management Plan (Required, Ch 2.F.1)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Data Management Plan',
    'A plan for managing, storing, and sharing data generated during planning activities.',
    9,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF Planning Proposal based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 2 pages per NSF PAPPG Ch 2.F.1.
- Describe data types, collection methods, storage, and preservation for planning-related data.
- Detail access, sharing policies, and metadata standards.
- Comply with NSF data sharing policies.
- Use the following information provided by the grant writer:
  - Data types and collection methods: [User input]
  - Storage and preservation plans: [User input]
  - Sharing policies: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Data Management Plan for spelling, grammar, and clarity. Ensure it is within 2 pages.',
    'Check the Data Management Plan for feasibility and completeness. Verify that:
- Data types and strategies are specific to planning activities.
- Sharing plans comply with NSF policy.
Flag omissions or vague plans.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Data Management Plan:
- Must be 2 pages or less.
- Must detail data types, collection, storage, preservation, and sharing for planning activities.
- Must comply with NSF data policies.
- Reject if: exceeds 2 pages, lacks specificity, or violates policy.',
    'Provide data types, collection methods, storage plans, and sharing policies for planning activities.'
),

-- 10. Letters of Collaboration (Optional, Ch 2.F.1)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Letters of Collaboration',
    'Letters confirming collaborator involvement in the planning activities, if applicable.',
    10,
    true,
    'pdf',
    'Generate Letters of Collaboration for an NSF Planning Proposal based on the context and attachments provided by the grant writer. Each letter should:
- Be brief, typically 1 page per collaborator.
- Confirm the collaborator’s role and commitment to the planning activities.
- Avoid endorsement language (e.g., praise for PI).
- Use the following information provided by the grant writer:
  - Collaborator names and roles: [User input]
  - Commitment details: [User input]
Ensure the document is formal and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Letters of Collaboration for spelling, grammar, and clarity. Ensure each is 1 page and avoids endorsements.',
    'Check the Letters of Collaboration for accuracy and compliance. Verify that:
- Roles and commitments are specific.
- No endorsement language is present.
Flag vague commitments or inappropriate praise.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letters of Collaboration:
- Must be 1 page or less per letter.
- Must confirm roles and commitments without endorsements.
- Reject if: exceeds page limit, lacks specificity, or includes endorsement language.',
    'Provide collaborator names, roles, and commitment details, if applicable.'
),

-- 11. Postdoctoral Mentoring Plan (Optional, Ch 2.E.1)
(
    '39ad3fe4-a9bb-41f9-881b-bdb850830b09',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers, required if postdocs are funded for planning activities.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF Planning Proposal based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 1 page per NSF PAPPG Ch 2.E.1.
- Describe mentoring activities (e.g., career development, planning involvement).
- Explain how these enhance postdoc skills, especially in planning or interdisciplinary contexts.
- Use the following information provided by the grant writer:
  - Mentoring activities and goals: [User input]
Ensure the document is specific and formatted as a PDF.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity. Ensure it is within 1 page.',
    'Check the Postdoctoral Mentoring Plan for specificity and relevance. Verify that:
- Activities are detailed and tied to planning or interdisciplinary development.
- Plan is feasible.
Flag vague or irrelevant content.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Postdoctoral Mentoring Plan:
- Must be 1 page or less.
- Must detail specific mentoring activities and benefits, with planning or interdisciplinary focus.
- Reject if: exceeds 1 page, lacks specificity, or is irrelevant.',
    'Provide mentoring activities and goals, emphasizing planning or interdisciplinary training, if postdocs are funded.'
);

-- Insert sections for NSF RAPID Proposal (Grant ID: 24ccd701-82e4-436b-aa83-180e573d628f)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES

-- 1. Concept Outline (Optional, Pre-submission)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Concept Outline',
    'A brief overview of the proposed RAPID research, emphasizing the urgency and significance of the research question.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF RAPID grant application based on the context and attachments provided by the grant writer. The Concept Outline should:
- Be concise, typically 1-2 pages.
- Introduce the research question or problem.
- Highlight the significance and urgency of the research, explaining why it cannot wait for a standard proposal cycle.
- Outline the potential outcomes or impact of the research.
- Use the following information provided by the grant writer:
  - Research question or problem: [User input]
  - Significance: [User input]
  - Urgency justification: [User input]
  - Potential outcomes: [User input]
Ensure the document is clear, avoids proprietary information, and is formatted as a PDF per NSF guidelines.',
    'Review the Concept Outline for spelling, grammar, and clarity. Ensure it:
- Is within 1-2 pages.
- Uses concise, professional language.
- Avoids jargon or proprietary data.',
    'Check the Concept Outline for logical consistency and completeness. Verify that:
- The research question is clearly stated.
- The significance and urgency are well-justified.
- Potential outcomes are articulated.
Flag missing elements or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Concept Outline:
- Must be 1-2 pages.
- Must include the research question, significance, urgency justification, and potential outcomes.
- Must avoid proprietary information.
- Reject if: exceeds 2 pages, lacks specificity, or fails to justify urgency convincingly.',
    'Provide a brief overview of the research question, significance, urgency justification, and potential outcomes.'
),

-- 2. Letter of Intent (Optional, Pre-submission)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Letter of Intent',
    'A brief letter indicating intent to submit a RAPID proposal, highlighting the urgency and significance of the research.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF RAPID grant application based on the context and attachments provided by the grant writer. The Letter of Intent should:
- Be brief, typically 1 page.
- Include the project title, PI name, and a concise description of the research.
- Highlight the urgency and significance of the research.
- Specify the target NSF program, if known.
- Use the following information provided by the grant writer:
  - Project title: [User input]
  - PI name: [User input]
  - Research description: [User input]
  - Urgency and significance: [User input]
  - Target NSF program (if applicable): [User input]
Ensure the document is formal, clear, and formatted as a PDF per NSF guidelines.',
    'Review the Letter of Intent for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses a formal, professional tone.
- Includes all required elements.',
    'Check the Letter of Intent for completeness and consistency. Verify that:
- Project title, PI name, research description, and urgency/significance are included.
- The urgency and significance are clearly stated.
- The target program (if provided) is plausible.
Flag missing elements or vague statements.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letter of Intent:
- Must be 1 page or less.
- Must include project title, PI name, research description, and urgency/significance.
- Must align with RAPID goals.
- Reject if: exceeds 1 page, omits required elements, or lacks a clear urgency case.',
    'Provide project title, PI name, research description, urgency and significance, and target NSF program (if applicable).'
),

-- 3. Project Summary (Required, Ch 2.F.2)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Project Summary',
    'A concise summary of the RAPID research, covering overview, intellectual merit, broader impacts, and urgency.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF RAPID grant application based on the context and attachments provided by the grant writer. The Project Summary should:
- Be limited to 1 page per NSF PAPPG Ch 2.F.2.
- Include three sections: Overview, Intellectual Merit, and Broader Impacts.
- Overview: Summarize the research goals, approach, and urgency.
- Intellectual Merit: Explain how the research advances knowledge or addresses a critical gap.
- Broader Impacts: Detail the potential societal benefits or immediate applications.
- Be written in third person, avoiding URLs or proprietary data.
- Use the following information provided by the grant writer:
  - Research goals and approach: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Urgency justification: [User input]
Ensure the document is clear, persuasive, and formatted as a PDF.',
    'Review the Project Summary for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses third-person narrative.
- Clearly separates Overview, Intellectual Merit, and Broader Impacts.',
    'Check the Project Summary for logical consistency and completeness. Verify that:
- The Overview ties goals and approach to urgency.
- Intellectual Merit specifies advancements or gap closure.
- Broader Impacts outline concrete societal benefits or applications.
- No proprietary data or URLs are included.
Flag missing sections or vague claims.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Project Summary:
- Must be 1 page or less.
- Must include Overview, Intellectual Merit, and Broader Impacts, with a clear urgency justification.
- Must be in third person, free of proprietary info or URLs.
- Reject if: exceeds 1 page, omits sections, or fails to justify intellectual merit, broader impacts, or urgency.',
    'Provide research goals and approach, intellectual merit, broader impacts, and urgency justification.'
),

-- 4. Project Description (Required, Ch 2.F.2)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Project Description',
    'A detailed narrative of the RAPID research, including objectives, methods, urgency, and expected outcomes.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF RAPID grant application based on the context and attachments provided by the grant writer. The Project Description should:
- Be limited to 5-10 pages per NSF PAPPG Ch 2.F.2.
- Clearly state the research objectives and, if applicable, hypotheses.
- Describe the methods and technical approaches in detail.
- Explain the intellectual merit (advancing knowledge or addressing a critical gap) and broader impacts (societal benefits or immediate applications).
- Provide a strong justification for the urgency and why the research cannot wait for a standard proposal cycle.
- Outline expected outcomes and a dissemination plan.
- Use the following information provided by the grant writer:
  - Objectives/hypotheses: [User input]
  - Methods: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Urgency justification: [User input]
  - Expected outcomes: [User input]
  - Dissemination plan: [User input]
Ensure the document is rigorous, concise, and formatted as a PDF, with visuals if appropriate.',
    'Review the Project Description for spelling, grammar, and clarity. Ensure it:
- Is within 5-10 pages.
- Is logically structured with all required elements.
- Uses precise scientific language.',
    'Check the Project Description for logical consistency and rigor. Verify that:
- Objectives align with methods and expected outcomes.
- Methods are feasible and detailed.
- Intellectual merit and broader impacts are robust.
- Urgency justification is compelling and specific.
- Dissemination plan is practical.
Flag gaps or vague sections.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the context and attachments. Ensure visuals:
- Illustrate the urgency or research methods (e.g., timelines, data plots).
- Clarify complex concepts or approaches.
- Include clear labels, titles, and legends.
- Are high-resolution and uncluttered.
- Use the following information provided by the grant writer:
  - Data/concepts to visualize: [User input]
  - Visual instructions: [User input]
Deliver visuals in PDF format per NSF guidelines.',
    'Act as a critical NSF reviewer and evaluate the Project Description:
- Must be 5-10 pages.
- Must include objectives, methods, intellectual merit, broader impacts, urgency justification, expected outcomes, and dissemination plan.
- Must convincingly argue for the RAPID mechanism.
- Reject if: exceeds page limit, lacks required elements, or fails to demonstrate urgency or rigor.',
    'Provide objectives, methods, intellectual merit, broader impacts, urgency justification, expected outcomes, and dissemination plan.'
),

-- 5. Budget Justification (Required, Ch 2.F.2)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Budget Justification',
    'A narrative justifying all proposed budget costs for the RAPID research.',
    5,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF RAPID grant application based on the context and attachments provided by the grant writer. The Budget Justification should:
- Be limited to 5 pages per NSF PAPPG Ch 2.F.2.
- Justify all budget categories (e.g., personnel, travel, equipment) as allowable, reasonable, and allocable per NSF policy.
- Explain how the budget supports the rapid response nature of the research (e.g., expedited equipment purchase).
- Use the following information provided by the grant writer:
  - Budget details and cost rationales: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Budget Justification for spelling, grammar, and clarity. Ensure it:
- Is within 5 pages.
- Justifies all budget categories specifically.',
    'Check the Budget Justification for consistency and accuracy. Verify that:
- Costs align with the research activities and budget.
- Justifications are specific, allowable, and support the rapid response needs.
Flag unexplained or unallowable costs.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Budget Justification:
- Must be 5 pages or less.
- Must justify all budget categories with specific, allowable rationales.
- Reject if: exceeds page limit, lacks detail, or includes unallowable costs.',
    'Provide budget details and cost rationales, emphasizing rapid response needs.'
),

-- 6. Biographical Sketches (Required, Ch 2.F.2)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Biographical Sketches',
    'Bios for senior personnel, detailing qualifications and contributions relevant to the RAPID research.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF RAPID grant application based on the context and attachments provided by the grant writer. Each sketch should:
- Be limited to 3 pages per individual per NSF PAPPG Ch 2.F.2.
- Include: Professional Preparation (education), Appointments (reverse chronological), Products (up to 5 relevant, 5 other), Synergistic Activities (up to 5, highlighting rapid response or urgent research experience).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Senior personnel details (education, appointments, products, activities): [User input]
Ensure the document is formatted as a PDF.',
    'Review the Biographical Sketches for spelling, grammar, and format adherence. Ensure each is within 3 pages.',
    'Check the Biographical Sketches for completeness and accuracy. Verify that:
- All sections are included and accurate.
- Products and activities are relevant to the RAPID research.
Flag missing sections or excessive entries.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Biographical Sketches:
- Must be 3 pages or less per person.
- Must include Professional Preparation, Appointments, Products (max 10), and Synergistic Activities (max 5, with rapid response or urgent research focus).
- Must follow NSF format.
- Reject if: exceeds page limit, omits sections, or lacks relevance to RAPID research.',
    'Provide education, appointments, products, and synergistic activities for each senior personnel, emphasizing rapid response or urgent research experience.'
),

-- 7. Current and Pending Support (Required, Ch 2.F.2)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Current and Pending Support',
    'A disclosure of all current and pending support for senior personnel.',
    7,
    false,
    'pdf',
    'Generate a Current and Pending Support document for an NSF RAPID grant application based on the context and attachments provided by the grant writer. The document should:
- List all current and pending support for each senior personnel, including this proposal.
- Include project titles, funding sources, amounts, periods, and effort (person-months).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Current and pending support details: [User input]
Ensure the document is complete and formatted as a PDF per NSF PAPPG Ch 2.F.2.',
    'Review the Current and Pending Support for spelling, grammar, and format adherence. Ensure all details are present.',
    'Check the Current and Pending Support for accuracy and completeness. Verify that:
- All projects include required details.
- This proposal is listed as pending.
Flag omissions or inaccuracies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Current and Pending Support:
- Must list all current/pending support with titles, sources, amounts, periods, and effort.
- Must include this proposal.
- Reject if: incomplete, inaccurate, or not in NSF format.',
    'Provide current and pending support details for all senior personnel.'
),

-- 8. Facilities, Equipment, and Other Resources (Required, Ch 2.F.2)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the RAPID research.',
    8,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF RAPID grant application based on the context and attachments provided by the grant writer. The section should:
- Describe available physical and intellectual resources (e.g., labs, equipment, computing).
- Explain how these resources support the rapid response nature of the research.
- Avoid cost quantification unless budgeted.
- Use the following information provided by the grant writer:
  - Available facilities and equipment: [User input]
  - Other resources and roles: [User input]
Ensure the document is specific and formatted as a PDF per NSF PAPPG Ch 2.F.2.',
    'Review the Facilities, Equipment, and Other Resources for spelling, grammar, and clarity. Ensure descriptions are specific.',
    'Check the Facilities, Equipment, and Other Resources for relevance and accuracy. Verify that:
- Resources support the RAPID research activities.
- No unbudgeted cost details are included.
Flag vague or irrelevant items.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Facilities, Equipment, and Other Resources:
- Must describe resources clearly and link to RAPID research feasibility.
- Must avoid unbudgeted cost details.
- Reject if: vague, incomplete, or includes irrelevant resources.',
    'Provide details on facilities, equipment, and other resources, emphasizing RAPID research support.'
),

-- 9. Data Management Plan (Required, Ch 2.F.2)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Data Management Plan',
    'A plan for managing, storing, and sharing data generated during the RAPID research.',
    9,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF RAPID grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 2 pages per NSF PAPPG Ch 2.F.2.
- Describe data types, collection methods, storage, and preservation for RAPID research data.
- Detail access, sharing policies, and metadata standards, considering the rapid timeline.
- Comply with NSF data sharing policies.
- Use the following information provided by the grant writer:
  - Data types and collection methods: [User input]
  - Storage and preservation plans: [User input]
  - Sharing policies: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Data Management Plan for spelling, grammar, and clarity. Ensure it is within 2 pages.',
    'Check the Data Management Plan for feasibility and completeness. Verify that:
- Data types and strategies are specific to RAPID research.
- Sharing plans comply with NSF policy and are feasible given the timeline.
Flag omissions or vague plans.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Data Management Plan:
- Must be 2 pages or less.
- Must detail data types, collection, storage, preservation, and sharing for RAPID research.
- Must comply with NSF data policies.
- Reject if: exceeds 2 pages, lacks specificity, or violates policy.',
    'Provide data types, collection methods, storage plans, and sharing policies for RAPID research.'
),

-- 10. Letters of Collaboration (Optional, Ch 2.F.2)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Letters of Collaboration',
    'Letters confirming collaborator involvement in the RAPID research, if applicable.',
    10,
    true,
    'pdf',
    'Generate Letters of Collaboration for an NSF RAPID grant application based on the context and attachments provided by the grant writer. Each letter should:
- Be brief, typically 1 page per collaborator.
- Confirm the collaborator’s role and commitment to the RAPID research.
- Avoid endorsement language (e.g., praise for PI).
- Use the following information provided by the grant writer:
  - Collaborator names and roles: [User input]
  - Commitment details: [User input]
Ensure the document is formal and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Letters of Collaboration for spelling, grammar, and clarity. Ensure each is 1 page and avoids endorsements.',
    'Check the Letters of Collaboration for accuracy and compliance. Verify that:
- Roles and commitments are specific.
- No endorsement language is present.
Flag vague commitments or inappropriate praise.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letters of Collaboration:
- Must be 1 page or less per letter.
- Must confirm roles and commitments without endorsements.
- Reject if: exceeds page limit, lacks specificity, or includes endorsement language.',
    'Provide collaborator names, roles, and commitment details, if applicable.'
),

-- 11. Postdoctoral Mentoring Plan (Optional, Ch 2.E.1)
(
    '24ccd701-82e4-436b-aa83-180e573d628f',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers, required if postdocs are funded for the RAPID research.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF RAPID grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 1 page per NSF PAPPG Ch 2.E.1.
- Describe mentoring activities (e.g., career development, rapid response training).
- Explain how these enhance postdoc skills, especially in rapid or urgent research contexts.
- Use the following information provided by the grant writer:
  - Mentoring activities and goals: [User input]
Ensure the document is specific and formatted as a PDF.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity. Ensure it is within 1 page.',
    'Check the Postdoctoral Mentoring Plan for specificity and relevance. Verify that:
- Activities are detailed and tied to rapid or urgent research contexts.
- Plan is feasible.
Flag vague or irrelevant content.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Postdoctoral Mentoring Plan:
- Must be 1 page or less.
- Must detail specific mentoring activities and benefits, with rapid or urgent research focus.
- Reject if: exceeds 1 page, lacks specificity, or is irrelevant.',
    'Provide mentoring activities and goals, emphasizing rapid or urgent research training, if postdocs are funded.'
);

-- Concept Outline (Optional)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Concept Outline',
    'A concise overview of the proposed EAGER research, highlighting its exploratory nature and potential impact.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The Concept Outline should:
- Be concise, typically 1-2 pages.
- Introduce the research question or problem, emphasizing its exploratory or high-risk nature.
- Highlight the potential for significant impact or transformative outcomes.
- Explain why the research requires the EAGER mechanism (e.g., unconventional approaches, early-stage concepts).
- Use the following information provided by the grant writer:
  - Research question or problem: [User input]
  - Exploratory/high-risk justification: [User input]
  - Potential impact: [User input]
Ensure the document is clear, avoids proprietary information, and is formatted as a PDF per NSF guidelines.',
    'Review the Concept Outline for spelling, grammar, and clarity. Ensure it:
- Is within 1-2 pages.
- Uses concise, professional language.
- Avoids jargon or proprietary data.',
    'Check the Concept Outline for logical consistency and completeness. Verify that:
- The research question is clearly stated.
- The exploratory/high-risk nature is well-justified.
- The potential impact is articulated.
Flag missing elements or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Concept Outline:
- Must be 1-2 pages.
- Must include the research question, exploratory/high-risk justification, and potential impact.
- Must avoid proprietary information.
- Reject if: exceeds 2 pages, lacks specificity, or fails to justify the EAGER mechanism convincingly.',
    'Provide a brief overview of the research question, exploratory/high-risk justification, and potential impact.'
);

-- Letter of Intent (Optional)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Letter of Intent',
    'A brief letter indicating intent to submit an EAGER proposal, highlighting its exploratory and high-impact aspects.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The Letter of Intent should:
- Be brief, typically 1 page.
- Include the project title, PI name, and a concise description of the exploratory research.
- Highlight the potential for transformative outcomes.
- Specify the target NSF program, if known.
- Use the following information provided by the grant writer:
  - Project title: [User input]
  - PI name: [User input]
  - Research description: [User input]
  - Transformative potential: [User input]
  - Target NSF program (if applicable): [User input]
Ensure the document is formal, clear, and formatted as a PDF per NSF guidelines.',
    'Review the Letter of Intent for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses a formal, professional tone.
- Includes all required elements.',
    'Check the Letter of Intent for completeness and consistency. Verify that:
- Project title, PI name, research description, and transformative potential are included.
- The exploratory and high-impact aspects are clearly stated.
- The target program (if provided) is plausible.
Flag missing elements or vague statements.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letter of Intent:
- Must be 1 page or less.
- Must include project title, PI name, research description, and transformative potential.
- Must align with EAGER goals.
- Reject if: exceeds 1 page, omits required elements, or lacks a clear transformative case.',
    'Provide project title, PI name, research description, transformative potential, and target NSF program (if applicable).'
);

-- Project Summary (Required)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Project Summary',
    'A concise summary of the EAGER research, covering overview, intellectual merit, broader impacts, and exploratory nature.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The Project Summary should:
- Be limited to 1 page per NSF PAPPG Ch 2.F.3.
- Include three sections: Overview, Intellectual Merit, and Broader Impacts.
- Overview: Summarize the research goals, approach, and exploratory/high-risk nature.
- Intellectual Merit: Explain how the research advances knowledge or tackles novel challenges.
- Broader Impacts: Detail the potential societal benefits or transformative outcomes.
- Be written in third person, avoiding URLs or proprietary data.
- Use the following information provided by the grant writer:
  - Research goals and approach: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Exploratory/high-risk justification: [User input]
Ensure the document is clear, persuasive, and formatted as a PDF.',
    'Review the Project Summary for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses third-person narrative.
- Clearly separates Overview, Intellectual Merit, and Broader Impacts.',
    'Check the Project Summary for logical consistency and completeness. Verify that:
- The Overview ties goals and approach to the exploratory/high-risk nature.
- Intellectual Merit specifies knowledge advancement or novel challenges.
- Broader Impacts outline concrete societal benefits or transformative outcomes.
- No proprietary data or URLs are included.
Flag missing sections or vague claims.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Project Summary:
- Must be 1 page or less.
- Must include Overview, Intellectual Merit, and Broader Impacts, with a clear exploratory/high-risk justification.
- Must be in third person, free of proprietary info or URLs.
- Reject if: exceeds 1 page, omits sections, or fails to justify the EAGER mechanism or impact.',
    'Provide research goals and approach, intellectual merit, broader impacts, and exploratory/high-risk justification.'
);

-- Project Description (Required)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Project Description',
    'A detailed narrative of the EAGER research, including objectives, methods, exploratory aspects, and outcomes.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The Project Description should:
- Be limited to 5-15 pages per NSF PAPPG Ch 2.F.3.
- Clearly state objectives and, if applicable, hypotheses.
- Describe methods and technical approaches in detail.
- Explain intellectual merit (advancing knowledge or tackling novel challenges) and broader impacts (societal benefits or transformative outcomes).
- Provide a strong justification for the exploratory/high-risk nature (e.g., untested ideas, transformative potential).
- Outline expected outcomes and a dissemination plan.
- Use the following information provided by the grant writer:
  - Objectives/hypotheses: [User input]
  - Methods: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Exploratory/high-risk justification: [User input]
  - Expected outcomes: [User input]
  - Dissemination plan: [User input]
Ensure the document is rigorous, concise, and formatted as a PDF, with visuals if appropriate.',
    'Review the Project Description for spelling, grammar, and clarity. Ensure it:
- Is within 5-15 pages.
- Is logically structured with all required elements.
- Uses precise scientific language.',
    'Check the Project Description for logical consistency and rigor. Verify that:
- Objectives align with methods and outcomes.
- Methods are feasible and detailed.
- Intellectual merit and broader impacts are robust.
- Exploratory/high-risk justification is compelling.
- Dissemination plan is practical.
Flag gaps or vague sections.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the context and attachments. Ensure visuals:
- Illustrate exploratory aspects or methods (e.g., conceptual models).
- Clarify complex concepts or approaches.
- Include clear labels, titles, and legends.
- Are high-resolution and uncluttered.
- Use the following information provided by the grant writer:
  - Data/concepts to visualize: [User input]
  - Visual instructions: [User input]
Deliver visuals in PDF format per NSF guidelines.',
    'Act as a critical NSF reviewer and evaluate the Project Description:
- Must be 5-15 pages.
- Must include objectives, methods, intellectual merit, broader impacts, exploratory/high-risk justification, expected outcomes, and dissemination plan.
- Must convincingly argue for the EAGER mechanism.
- Reject if: exceeds page limit, lacks required elements, or fails to demonstrate exploratory nature or rigor.',
    'Provide objectives, methods, intellectual merit, broader impacts, exploratory/high-risk justification, expected outcomes, and dissemination plan.'
);

-- References Cited (Required)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'References Cited',
    'A list of all references cited in the Project Description.',
    5,
    false,
    'pdf',
    'Generate a References Cited section for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The section should:
- Include full bibliographic citations for all works cited in the Project Description.
- Use a consistent, NSF-acceptable citation style (e.g., APA, MLA).
- List only cited references, with no page limit.
- Use the following information provided by the grant writer:
  - Cited works or Project Description text: [User input or attachment]
Ensure the document is accurate and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(iii).',
    'Review the References Cited for spelling, grammar, and citation consistency. Ensure all entries are complete.',
    'Check the References Cited for accuracy and relevance. Verify that:
- All citations match Project Description references.
- Each entry has full bibliographic details.
Flag uncited references or missing citations.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the References Cited:
- Must include all and only references cited in the Project Description.
- Must use a consistent, acceptable citation style.
- Reject if: omits cited works, includes uncited works, or has incomplete entries.',
    'Provide a list of cited works or the Project Description text.'
);

-- Biographical Sketches (Required)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Biographical Sketches',
    'Bios for senior personnel, detailing qualifications and contributions relevant to the EAGER research.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF EAGER grant application based on the context and attachments provided by the grant writer. Each sketch should:
- Be limited to 3 pages per individual per NSF PAPPG Ch 2.F.3.
- Include: Professional Preparation (education), Appointments (reverse chronological), Products (up to 5 relevant, 5 other), Synergistic Activities (up to 5, highlighting exploratory or high-risk research experience).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Senior personnel details (education, appointments, products, activities): [User input]
Ensure the document is formatted as a PDF.',
    'Review the Biographical Sketches for spelling, grammar, and format adherence. Ensure each is within 3 pages.',
    'Check the Biographical Sketches for completeness and accuracy. Verify that:
- All sections are included and accurate.
- Products and activities are relevant to the EAGER research.
Flag missing sections or excessive entries.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Biographical Sketches:
- Must be 3 pages or less per person.
- Must include Professional Preparation, Appointments, Products (max 10), and Synergistic Activities (max 5, with exploratory or high-risk focus).
- Must follow NSF format.
- Reject if: exceeds page limit, omits sections, or lacks relevance to EAGER research.',
    'Provide education, appointments, products, and synergistic activities for each senior personnel, emphasizing exploratory or high-risk research experience.'
);

-- Budget Justification (Required)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Budget Justification',
    'A narrative justifying all proposed budget costs for the EAGER research.',
    7,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The Budget Justification should:
- Be limited to 5 pages per NSF PAPPG Ch 2.F.3.
- Justify all budget categories (e.g., personnel, travel, equipment) as allowable, reasonable, and allocable per NSF policy.
- Explain how the budget supports the exploratory or high-risk nature of the research (e.g., unique equipment needs).
- Use the following information provided by the grant writer:
  - Budget details and cost rationales: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Budget Justification for spelling, grammar, and clarity. Ensure it:
- Is within 5 pages.
- Justifies all budget categories specifically.',
    'Check the Budget Justification for consistency and accuracy. Verify that:
- Costs align with the research activities and budget.
- Justifications are specific, allowable, and support the exploratory or high-risk needs.
Flag unexplained or unallowable costs.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Budget Justification:
- Must be 5 pages or less.
- Must justify all budget categories with specific, allowable rationales.
- Reject if: exceeds page limit, lacks detail, or includes unallowable costs.',
    'Provide budget details and cost rationales, emphasizing exploratory or high-risk research needs.'
);

-- Current and Pending Support (Required)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Current and Pending Support',
    'A disclosure of all current and pending support for senior personnel.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support document for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The document should:
- List all current and pending support for each senior personnel, including this proposal.
- Include project titles, funding sources, amounts, periods, and effort (person-months).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Current and pending support details: [User input]
Ensure the document is complete and formatted as a PDF per NSF PAPPG Ch 2.F.3.',
    'Review the Current and Pending Support for spelling, grammar, and format adherence. Ensure all details are present.',
    'Check the Current and Pending Support for accuracy and completeness. Verify that:
- All projects include required details.
- This proposal is listed as pending.
Flag omissions or inaccuracies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Current and Pending Support:
- Must list all current/pending support with titles, sources, amounts, periods, and effort.
- Must include this proposal.
- Reject if: incomplete, inaccurate, or not in NSF format.',
    'Provide current and pending support details for all senior personnel.'
);

-- Facilities, Equipment, and Other Resources (Required)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the EAGER research.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The section should:
- Describe available physical and intellectual resources (e.g., labs, equipment, computing).
- Explain how these resources support the exploratory or high-risk nature of the research.
- Avoid cost quantification unless budgeted.
- Use the following information provided by the grant writer:
  - Available facilities and equipment: [User input]
  - Other resources and roles: [User input]
Ensure the document is specific and formatted as a PDF per NSF PAPPG Ch 2.F.3.',
    'Review the Facilities, Equipment, and Other Resources for spelling, grammar, and clarity. Ensure descriptions are specific.',
    'Check the Facilities, Equipment, and Other Resources for relevance and accuracy. Verify that:
- Resources support the EAGER research activities.
- No unbudgeted cost details are included.
Flag vague or irrelevant items.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Facilities, Equipment, and Other Resources:
- Must describe resources clearly and link to EAGER research feasibility.
- Must avoid unbudgeted cost details.
- Reject if: vague, incomplete, or includes irrelevant resources.',
    'Provide details on facilities, equipment, and other resources, emphasizing support for exploratory or high-risk research.'
);

-- Data Management Plan (Optional)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Data Management Plan',
    'A plan for managing, storing, and sharing data generated during the EAGER research, if applicable.',
    10,
    true,
    'pdf',
    'Generate a Data Management Plan for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 2 pages per NSF PAPPG Ch 2.E.1.
- Describe data types, collection methods, storage, and preservation for EAGER research data.
- Detail access, sharing policies, and metadata standards, considering the exploratory nature.
- Comply with NSF data sharing policies.
- Use the following information provided by the grant writer:
  - Data types and collection methods: [User input]
  - Storage and preservation plans: [User input]
  - Sharing policies: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Data Management Plan for spelling, grammar, and clarity. Ensure it is within 2 pages.',
    'Check the Data Management Plan for feasibility and completeness. Verify that:
- Data types and strategies are specific to EAGER research.
- Sharing plans comply with NSF policy and are feasible.
Flag omissions or vague plans.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Data Management Plan:
- Must be 2 pages or less.
- Must detail data types, collection, storage, preservation, and sharing for EAGER research.
- Must comply with NSF data policies.
- Reject if: exceeds 2 pages, lacks specificity, or violates policy.',
    'Provide data types, collection methods, storage plans, and sharing policies for EAGER research, if applicable.'
);

-- Postdoctoral Mentoring Plan (Optional)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers, required if postdocs are funded for the EAGER research.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 1 page per NSF PAPPG Ch 2.E.2.
- Describe mentoring activities (e.g., career development, exploratory research training).
- Explain how these enhance postdoc skills, especially in exploratory or high-risk contexts.
- Use the following information provided by the grant writer:
  - Mentoring activities and goals: [User input]
Ensure the document is specific and formatted as a PDF.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity. Ensure it is within 1 page.',
    'Check the Postdoctoral Mentoring Plan for specificity and relevance. Verify that:
- Activities are detailed and tied to exploratory or high-risk research contexts.
- Plan is feasible.
Flag vague or irrelevant content.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Postdoctoral Mentoring Plan:
- Must be 1 page or less.
- Must detail specific mentoring activities and benefits, with exploratory or high-risk focus.
- Reject if: exceeds 1 page, lacks specificity, or is irrelevant.',
    'Provide mentoring activities and goals, emphasizing exploratory or high-risk research training, if postdocs are funded.'
);

-- Human Subjects Documentation (Optional)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Human Subjects Documentation',
    'Documentation for research involving human subjects, if applicable.',
    12,
    true,
    'pdf',
    'Generate Human Subjects Documentation for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The documentation should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.5.
- Describe the involvement of human subjects (e.g., participants, activities).
- Detail informed consent, privacy, and welfare protections.
- Specify IRB approval status or plans.
- Use the following information provided by the grant writer:
  - Human subjects involvement: [User input]
  - Consent and protection measures: [User input]
  - IRB status: [User input]
Ensure the document is ethical and formatted as a PDF per NSF guidelines.',
    'Review the Human Subjects Documentation for spelling, grammar, and clarity. Ensure ethical elements are addressed.',
    'Check the Human Subjects Documentation for completeness and ethics. Verify that:
- Involvement and protections are specific.
- Consent and IRB plans are robust.
Flag omissions or ethical issues.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Human Subjects Documentation:
- Must detail involvement, consent, protections, and IRB status.
- Must demonstrate ethical compliance.
- Reject if: incomplete, ethically deficient, or omits IRB plans.',
    'Provide human subjects involvement, consent/protection measures, and IRB status, if applicable.'
);

-- Vertebrate Animals Documentation (Optional)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Vertebrate Animals Documentation',
    'Documentation for research involving vertebrate animals, if applicable.',
    13,
    true,
    'pdf',
    'Generate Vertebrate Animals Documentation for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The documentation should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.6.
- Justify use of vertebrate animals (species, number) and lack of alternatives.
- Describe procedures, pain minimization, and euthanasia (per AVMA guidelines).
- Confirm IACUC approval or pending status.
- Use the following information provided by the grant writer:
  - Animal use details (species, number): [User input]
  - Procedures and welfare measures: [User input]
  - IACUC status: [User input]
Ensure the document is ethical and formatted as a PDF per NSF guidelines.',
    'Review the Vertebrate Animals Documentation for spelling, grammar, and clarity. Ensure ethical details are complete.',
    'Check the Vertebrate Animals Documentation for ethics and completeness. Verify that:
- Justification is robust.
- Procedures minimize welfare impacts.
- IACUC status is included.
Flag ethical lapses or omissions.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Vertebrate Animals Documentation:
- Must justify species/number, detail procedures/welfare, and include IACUC status.
- Must comply with AVMA guidelines.
- Reject if: justification weak, welfare unaddressed, or IACUC omitted.',
    'Provide animal use details, procedures/welfare measures, and IACUC status, if applicable.'
);

-- Dual Use Research of Concern (Optional)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES (
    '48002569-6095-4783-a240-1b1142f3b614',
    'Dual Use Research of Concern',
    'Documentation addressing research with potential dual-use implications, if applicable.',
    14,
    true,
    'pdf',
    'Generate a Dual Use Research of Concern section for an NSF EAGER grant application based on the context and attachments provided by the grant writer. The section should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.7.
- Identify any of the 15 DURC agents/toxins involved.
- Describe potential dual-use risks (e.g., misuse potential).
- Outline a risk mitigation plan (e.g., oversight, training).
- Use the following information provided by the grant writer:
  - Agents/toxins involved: [User input]
  - Dual-use risks: [User input]
  - Mitigation plan: [User input]
Ensure the document is proactive and formatted as a PDF per NSF guidelines.',
    'Review the Dual Use Research of Concern section for spelling, grammar, and clarity. Ensure all elements are addressed.',
    'Check the Dual Use Research of Concern section for completeness and feasibility. Verify that:
- Agents/toxins are specified.
- Risks are clear.
- Mitigation plan is practical.
Flag omissions or weak mitigation.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Dual Use Research of Concern:
- Must identify agents/toxins, describe risks, and provide a mitigation plan.
- Must align with U.S. DURC policy.
- Reject if: incomplete, risks unclear, or mitigation inadequate.',
    'Provide agents/toxins involved, dual-use risks, and mitigation plan, if applicable.'
);

-- Insert sections for NSF RAISE Proposal (Grant ID: 1df163d2-ea16-43bd-9a04-132e3d0efab4)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES

-- 1. Concept Outline (Optional)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Concept Outline',
    'A brief overview of the proposed RAISE research, emphasizing its interdisciplinary and high-risk/high-reward nature.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The Concept Outline should:
- Be concise, typically 1-2 pages.
- Introduce the interdisciplinary research question or problem.
- Highlight the potential for transformative outcomes.
- Explain why the research requires the RAISE mechanism (e.g., unconventional approaches, integration of multiple disciplines).
- Use the following information provided by the grant writer:
  - Research question or problem: [User input]
  - Interdisciplinary approach: [User input]
  - Transformative potential: [User input]
Ensure the document is clear, avoids proprietary information, and is formatted as a PDF per NSF guidelines.',
    'Review the Concept Outline for spelling, grammar, and clarity. Ensure it:
- Is within 1-2 pages.
- Uses concise, professional language.
- Avoids jargon or proprietary data.',
    'Check the Concept Outline for logical consistency and completeness. Verify that:
- The research question is clearly stated.
- The interdisciplinary approach is well-justified.
- The transformative potential is articulated.
Flag missing elements or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Concept Outline:
- Must be 1-2 pages.
- Must include the research question, interdisciplinary approach, and transformative potential.
- Must avoid proprietary information.
- Reject if: exceeds 2 pages, lacks specificity, or fails to justify the RAISE mechanism convincingly.',
    'Provide a brief overview of the research question, interdisciplinary approach, and transformative potential.'
),

-- 2. Letter of Intent (Optional)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Letter of Intent',
    'A brief letter indicating intent to submit a RAISE proposal, highlighting its interdisciplinary and transformative aspects.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The Letter of Intent should:
- Be brief, typically 1 page.
- Include the project title, PI name, and a concise description of the interdisciplinary research.
- Highlight the potential for transformative outcomes.
- Specify the target NSF program, if known.
- Use the following information provided by the grant writer:
  - Project title: [User input]
  - PI name: [User input]
  - Research description: [User input]
  - Transformative potential: [User input]
  - Target NSF program (if applicable): [User input]
Ensure the document is formal, clear, and formatted as a PDF per NSF guidelines.',
    'Review the Letter of Intent for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses a formal, professional tone.
- Includes all required elements.',
    'Check the Letter of Intent for completeness and consistency. Verify that:
- Project title, PI name, research description, and transformative potential are included.
- The interdisciplinary and transformative aspects are clearly stated.
- The target program (if provided) is plausible.
Flag missing elements or vague statements.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letter of Intent:
- Must be 1 page or less.
- Must include project title, PI name, research description, and transformative potential.
- Must align with RAISE goals.
- Reject if: exceeds 1 page, omits required elements, or lacks a clear transformative case.',
    'Provide project title, PI name, research description, transformative potential, and target NSF program (if applicable).'
),

-- 3. Project Summary (Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Project Summary',
    'A concise summary of the RAISE research, covering overview, intellectual merit, broader impacts, and interdisciplinary nature.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The Project Summary should:
- Be limited to 1 page per NSF PAPPG Ch 2.F.4.
- Include three sections: Overview, Intellectual Merit, and Broader Impacts.
- Overview: Summarize the interdisciplinary research goals, approach, and significance.
- Intellectual Merit: Explain how the research advances knowledge across multiple disciplines.
- Broader Impacts: Detail the potential societal benefits or transformative outcomes.
- Be written in third person, avoiding URLs or proprietary data.
- Use the following information provided by the grant writer:
  - Research goals and approach: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Interdisciplinary justification: [User input]
Ensure the document is clear, persuasive, and formatted as a PDF.',
    'Review the Project Summary for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses third-person narrative.
- Clearly separates Overview, Intellectual Merit, and Broader Impacts.',
    'Check the Project Summary for logical consistency and completeness. Verify that:
- The Overview ties goals and approach to the interdisciplinary nature.
- Intellectual Merit specifies advancements across disciplines.
- Broader Impacts outline concrete societal benefits or transformative outcomes.
- No proprietary data or URLs are included.
Flag missing sections or vague claims.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Project Summary:
- Must be 1 page or less.
- Must include Overview, Intellectual Merit, and Broader Impacts, with a clear interdisciplinary justification.
- Must be in third person, free of proprietary info or URLs.
- Reject if: exceeds 1 page, omits sections, or fails to justify the RAISE mechanism or impact.',
    'Provide research goals and approach, intellectual merit, broader impacts, and interdisciplinary justification.'
),

-- 4. Project Description (Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Project Description',
    'A detailed narrative of the RAISE research, including objectives, methods, interdisciplinary integration, and outcomes.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The Project Description should:
- Be limited to 15 pages per NSF PAPPG Ch 2.F.4.
- Clearly state objectives and, if applicable, hypotheses.
- Describe methods and technical approaches in detail.
- Explain intellectual merit (advancing knowledge across disciplines) and broader impacts (societal benefits or transformative outcomes).
- Provide a strong justification for the interdisciplinary approach and integration of multiple fields.
- Outline expected outcomes and a dissemination plan.
- Use the following information provided by the grant writer:
  - Objectives/hypotheses: [User input]
  - Methods: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Interdisciplinary justification: [User input]
  - Expected outcomes: [User input]
  - Dissemination plan: [User input]
Ensure the document is rigorous, concise, and formatted as a PDF, with visuals if appropriate.',
    'Review the Project Description for spelling, grammar, and clarity. Ensure it:
- Is within 15 pages.
- Is logically structured with all required elements.
- Uses precise scientific language.',
    'Check the Project Description for logical consistency and rigor. Verify that:
- Objectives align with methods and outcomes.
- Methods are feasible and detailed.
- Intellectual merit and broader impacts are robust.
- Interdisciplinary justification is compelling.
- Dissemination plan is practical.
Flag gaps or vague sections.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the context and attachments. Ensure visuals:
- Illustrate interdisciplinary integration or methods (e.g., conceptual models).
- Clarify complex concepts or approaches.
- Include clear labels, titles, and legends.
- Are high-resolution and uncluttered.
- Use the following information provided by the grant writer:
  - Data/concepts to visualize: [User input]
  - Visual instructions: [User input]
Deliver visuals in PDF format per NSF guidelines.',
    'Act as a critical NSF reviewer and evaluate the Project Description:
- Must be 15 pages or less.
- Must include objectives, methods, intellectual merit, broader impacts, interdisciplinary justification, expected outcomes, and dissemination plan.
- Must convincingly argue for the RAISE mechanism.
- Reject if: exceeds page limit, lacks required elements, or fails to demonstrate interdisciplinary integration or rigor.',
    'Provide objectives, methods, intellectual merit, broader impacts, interdisciplinary justification, expected outcomes, and dissemination plan.'
),

-- 5. References Cited (Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'References Cited',
    'A list of all references cited in the Project Description.',
    5,
    false,
    'pdf',
    'Generate a References Cited section for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The section should:
- Include full bibliographic citations for all works cited in the Project Description.
- Use a consistent, NSF-acceptable citation style (e.g., APA, MLA).
- List only cited references, with no page limit.
- Use the following information provided by the grant writer:
  - Cited works or Project Description text: [User input or attachment]
Ensure the document is accurate and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(iii).',
    'Review the References Cited for spelling, grammar, and citation consistency. Ensure all entries are complete.',
    'Check the References Cited for accuracy and relevance. Verify that:
- All citations match Project Description references.
- Each entry has full bibliographic details.
Flag uncited references or missing citations.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the References Cited:
- Must include all and only references cited in the Project Description.
- Must use a consistent, acceptable citation style.
- Reject if: omits cited works, includes uncited works, or has incomplete entries.',
    'Provide a list of cited works or the Project Description text.'
),

-- 6. Biographical Sketches (Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Biographical Sketches',
    'Bios for senior personnel, detailing qualifications and contributions relevant to the RAISE research.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF RAISE grant application based on the context and attachments provided by the grant writer. Each sketch should:
- Be limited to 3 pages per individual per NSF PAPPG Ch 2.F.4.
- Include: Professional Preparation (education), Appointments (reverse chronological), Products (up to 5 relevant, 5 other), Synergistic Activities (up to 5, highlighting interdisciplinary or transformative research experience).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Senior personnel details (education, appointments, products, activities): [User input]
Ensure the document is formatted as a PDF.',
    'Review the Biographical Sketches for spelling, grammar, and format adherence. Ensure each is within 3 pages.',
    'Check the Biographical Sketches for completeness and accuracy. Verify that:
- All sections are included and accurate.
- Products and activities are relevant to the RAISE research.
Flag missing sections or excessive entries.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Biographical Sketches:
- Must be 3 pages or less per person.
- Must include Professional Preparation, Appointments, Products (max 10), and Synergistic Activities (max 5, with interdisciplinary or transformative focus).
- Must follow NSF format.
- Reject if: exceeds page limit, omits sections, or lacks relevance to RAISE research.',
    'Provide education, appointments, products, and synergistic activities for each senior personnel, emphasizing interdisciplinary or transformative research experience.'
),

-- 7. Budget Justification (Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Budget Justification',
    'A narrative justifying all proposed budget costs for the RAISE research.',
    7,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The Budget Justification should:
- Be limited to 5 pages per NSF PAPPG Ch 2.F.4.
- Justify all budget categories (e.g., personnel, travel, equipment) as allowable, reasonable, and allocable per NSF policy.
- Explain how the budget supports the interdisciplinary or high-risk nature of the research (e.g., cross-disciplinary collaboration costs).
- Use the following information provided by the grant writer:
  - Budget details and cost rationales: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Budget Justification for spelling, grammar, and clarity. Ensure it:
- Is within 5 pages.
- Justifies all budget categories specifically.',
    'Check the Budget Justification for consistency and accuracy. Verify that:
- Costs align with the research activities and budget.
- Justifications are specific, allowable, and support the interdisciplinary or high-risk needs.
Flag unexplained or unallowable costs.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Budget Justification:
- Must be 5 pages or less.
- Must justify all budget categories with specific, allowable rationales.
- Reject if: exceeds page limit, lacks detail, or includes unallowable costs.',
    'Provide budget details and cost rationales, emphasizing interdisciplinary or high-risk research needs.'
),

-- 8. Current and Pending Support (Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Current and Pending Support',
    'A disclosure of all current and pending support for senior personnel.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support document for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The document should:
- List all current and pending support for each senior personnel, including this proposal.
- Include project titles, funding sources, amounts, periods, and effort (person-months).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Current and pending support details: [User input]
Ensure the document is complete and formatted as a PDF per NSF PAPPG Ch 2.F.4.',
    'Review the Current and Pending Support for spelling, grammar, and format adherence. Ensure all details are present.',
    'Check the Current and Pending Support for accuracy and completeness. Verify that:
- All projects include required details.
- This proposal is listed as pending.
Flag omissions or inaccuracies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Current and Pending Support:
- Must list all current/pending support with titles, sources, amounts, periods, and effort.
- Must include this proposal.
- Reject if: incomplete, inaccurate, or not in NSF format.',
    'Provide current and pending support details for all senior personnel.'
),

-- 9. Facilities, Equipment, and Other Resources (Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the RAISE research.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The section should:
- Describe available physical and intellectual resources (e.g., labs, equipment, computing).
- Explain how these resources support the interdisciplinary or high-risk nature of the research.
- Avoid cost quantification unless budgeted.
- Use the following information provided by the grant writer:
  - Available facilities and equipment: [User input]
  - Other resources and roles: [User input]
Ensure the document is specific and formatted as a PDF per NSF PAPPG Ch 2.F.4.',
    'Review the Facilities, Equipment, and Other Resources for spelling, grammar, and clarity. Ensure descriptions are specific.',
    'Check the Facilities, Equipment, and Other Resources for relevance and accuracy. Verify that:
- Resources support the RAISE research activities.
- No unbudgeted cost details are included.
Flag vague or irrelevant items.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Facilities, Equipment, and Other Resources:
- Must describe resources clearly and link to RAISE research feasibility.
- Must avoid unbudgeted cost details.
- Reject if: vague, incomplete, or includes irrelevant resources.',
    'Provide details on facilities, equipment, and other resources, emphasizing support for interdisciplinary or high-risk research.'
),

-- 10. Data Management Plan (Conditionally Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Data Management Plan',
    'A plan for managing, storing, and sharing data generated during the RAISE research, if applicable.',
    10,
    true,
    'pdf',
    'Generate a Data Management Plan for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 2 pages per NSF PAPPG Ch 2.E.1.
- Describe data types, collection methods, storage, and preservation for RAISE research data.
- Detail access, sharing policies, and metadata standards, considering interdisciplinary data.
- Comply with NSF data sharing policies.
- Use the following information provided by the grant writer:
  - Data types and collection methods: [User input]
  - Storage and preservation plans: [User input]
  - Sharing policies: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Data Management Plan for spelling, grammar, and clarity. Ensure it is within 2 pages.',
    'Check the Data Management Plan for feasibility and completeness. Verify that:
- Data types and strategies are specific to RAISE research.
- Sharing plans comply with NSF policy and are feasible.
Flag omissions or vague plans.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Data Management Plan:
- Must be 2 pages or less.
- Must detail data types, collection, storage, preservation, and sharing for RAISE research.
- Must comply with NSF data policies.
- Reject if: exceeds 2 pages, lacks specificity, or violates policy.',
    'Provide data types, collection methods, storage plans, and sharing policies for RAISE research, if applicable.'
),

-- 11. Postdoctoral Mentoring Plan (Conditionally Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers, required if postdocs are funded for the RAISE research.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 1 page per NSF PAPPG Ch 2.E.2.
- Describe mentoring activities (e.g., career development, interdisciplinary training).
- Explain how these enhance postdoc skills, especially in interdisciplinary or high-risk contexts.
- Use the following information provided by the grant writer:
  - Mentoring activities and goals: [User input]
Ensure the document is specific and formatted as a PDF.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity. Ensure it is within 1 page.',
    'Check the Postdoctoral Mentoring Plan for specificity and relevance. Verify that:
- Activities are detailed and tied to interdisciplinary or high-risk research contexts.
- Plan is feasible.
Flag vague or irrelevant content.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Postdoctoral Mentoring Plan:
- Must be 1 page or less.
- Must detail specific mentoring activities and benefits, with interdisciplinary or high-risk focus.
- Reject if: exceeds 1 page, lacks specificity, or is irrelevant.',
    'Provide mentoring activities and goals, emphasizing interdisciplinary or high-risk research training, if postdocs are funded.'
),

-- 12. Human Subjects Documentation (Conditionally Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Human Subjects Documentation',
    'Documentation for research involving human subjects, if applicable.',
    12,
    true,
    'pdf',
    'Generate Human Subjects Documentation for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The documentation should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.5.
- Describe the involvement of human subjects (e.g., participants, activities).
- Detail informed consent, privacy, and welfare protections.
- Specify IRB approval status or plans.
- Use the following information provided by the grant writer:
  - Human subjects involvement: [User input]
  - Consent and protection measures: [User input]
  - IRB status: [User input]
Ensure the document is ethical and formatted as a PDF per NSF guidelines.',
    'Review the Human Subjects Documentation for spelling, grammar, and clarity. Ensure ethical elements are addressed.',
    'Check the Human Subjects Documentation for completeness and ethics. Verify that:
- Involvement and protections are specific.
- Consent and IRB plans are robust.
Flag omissions or ethical issues.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Human Subjects Documentation:
- Must detail involvement, consent, protections, and IRB status.
- Must demonstrate ethical compliance.
- Reject if: incomplete, ethically deficient, or omits IRB plans.',
    'Provide human subjects involvement, consent/protection measures, and IRB status, if applicable.'
),

-- 13. Vertebrate Animals Documentation (Conditionally Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Vertebrate Animals Documentation',
    'Documentation for research involving vertebrate animals, if applicable.',
    13,
    true,
    'pdf',
    'Generate Vertebrate Animals Documentation for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The documentation should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.6.
- Justify use of vertebrate animals (species, number) and lack of alternatives.
- Describe procedures, pain minimization, and euthanasia (per AVMA guidelines).
- Confirm IACUC approval or pending status.
- Use the following information provided by the grant writer:
  - Animal use details (species, number): [User input]
  - Procedures and welfare measures: [User input]
  - IACUC status: [User input]
Ensure the document is ethical and formatted as a PDF per NSF guidelines.',
    'Review the Vertebrate Animals Documentation for spelling, grammar, and clarity. Ensure ethical details are complete.',
    'Check the Vertebrate Animals Documentation for ethics and completeness. Verify that:
- Justification is robust.
- Procedures minimize welfare impacts.
- IACUC status is included.
Flag ethical lapses or omissions.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Vertebrate Animals Documentation:
- Must justify species/number, detail procedures/welfare, and include IACUC status.
- Must comply with AVMA guidelines.
- Reject if: justification weak, welfare unaddressed, or IACUC omitted.',
    'Provide animal use details, procedures/welfare measures, and IACUC status, if applicable.'
),

-- 14. Dual Use Research of Concern (Conditionally Required)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Dual Use Research of Concern',
    'Documentation addressing research with potential dual-use implications, if applicable.',
    14,
    true,
    'pdf',
    'Generate a Dual Use Research of Concern section for an NSF RAISE grant application based on the context and attachments provided by the grant writer. The section should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.7.
- Identify any of the 15 DURC agents/toxins involved.
- Describe potential dual-use risks (e.g., misuse potential).
- Outline a risk mitigation plan (e.g., oversight, training).
- Use the following information provided by the grant writer:
  - Agents/toxins involved: [User input]
  - Dual-use risks: [User input]
  - Mitigation plan: [User input]
Ensure the document is proactive and formatted as a PDF per NSF guidelines.',
    'Review the Dual Use Research of Concern section for spelling, grammar, and clarity. Ensure all elements are addressed.',
    'Check the Dual Use Research of Concern section for completeness and feasibility. Verify that:
- Agents/toxins are specified.
- Risks are clear.
- Mitigation plan is practical.
Flag omissions or weak mitigation.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Dual Use Research of Concern:
- Must identify agents/toxins, describe risks, and provide a mitigation plan.
- Must align with U.S. DURC policy.
- Reject if: incomplete, risks unclear, or mitigation inadequate.',
    'Provide agents/toxins involved, dual-use risks, and mitigation plan, if applicable.'
),

-- 15. Letters of Collaboration (Optional)
(
    '1df163d2-ea16-43bd-9a04-132e3d0efab4',
    'Letters of Collaboration',
    'Letters confirming collaborator involvement, if applicable.',
    15,
    true,
    'pdf',
    'Generate Letters of Collaboration for an NSF RAISE grant application based on the context and attachments provided by the grant writer. Each letter should:
- Be brief, typically 1 page per collaborator.
- Confirm the collaborator’s role and commitment (e.g., interdisciplinary expertise, resources).
- Avoid endorsement language (e.g., praise for PI).
- Use the following information provided by the grant writer:
  - Collaborator names and roles: [User input]
  - Commitment details: [User input]
Ensure the document is formal and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Letters of Collaboration for spelling, grammar, and clarity. Ensure each is 1 page and avoids endorsements.',
    'Check the Letters of Collaboration for accuracy and compliance. Verify that:
- Roles and commitments are specific.
- No endorsement language is present.
Flag vague commitments or inappropriate praise.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letters of Collaboration:
- Must be 1 page or less per letter.
- Must confirm roles and commitments without endorsements.
- Reject if: exceeds page limit, lacks specificity, or includes endorsement language.',
    'Provide collaborator names, roles, and commitment details, if applicable.'
);

-- Insert sections for NSF Ideas Lab Proposal (Grant ID: a24bfbea-5382-4ac2-ada0-569b36083b35)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES

-- 1. Concept Outline (Optional Pre-Submission)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Concept Outline',
    'A brief overview of the proposed Ideas Lab research, emphasizing its interdisciplinary and transformative nature.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The Concept Outline should:
- Be concise, typically 1-2 pages.
- Introduce the research question or problem, emphasizing its interdisciplinary nature.
- Highlight the potential for transformative outcomes and why the research fits the Ideas Lab mechanism.
- Explain the need for collaborative, interdisciplinary approaches to address the problem.
- Use the following information provided by the grant writer:
  - Research question or problem: [User input]
  - Interdisciplinary approach: [User input]
  - Transformative potential: [User input]
Ensure the document is clear, avoids proprietary information, and is formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Concept Outline for spelling, grammar, and clarity. Ensure it:
- Is within 1-2 pages.
- Uses concise, professional language.
- Avoids jargon or proprietary data.',
    'Check the Concept Outline for logical consistency and completeness. Verify that:
- The research question is clearly stated.
- The interdisciplinary approach is well-justified.
- The transformative potential is articulated.
Flag missing elements or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Concept Outline:
- Must be 1-2 pages.
- Must include the research question, interdisciplinary approach, and transformative potential.
- Must avoid proprietary information.
- Reject if: exceeds 2 pages, lacks specificity, or fails to justify the Ideas Lab mechanism convincingly.',
    'Provide a brief overview of the research question, interdisciplinary approach, and transformative potential.'
),

-- 2. Letter of Intent (Optional Pre-Submission)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Letter of Intent',
    'A brief letter indicating intent to submit an Ideas Lab proposal, highlighting its interdisciplinary and transformative aspects.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The Letter of Intent should:
- Be brief, typically 1 page.
- Include the project title, PI name, and a concise description of the interdisciplinary research.
- Highlight the transformative potential and the need for collaborative approaches.
- Specify the target NSF program, if known.
- Use the following information provided by the grant writer:
  - Project title: [User input]
  - PI name: [User input]
  - Research description: [User input]
  - Transformative potential: [User input]
  - Target NSF program (if applicable): [User input]
Ensure the document is formal, clear, and formatted as a PDF per NSF guidelines.',
    'Review the Letter of Intent for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses a formal, professional tone.
- Includes all required elements.',
    'Check the Letter of Intent for completeness and consistency. Verify that:
- Project title, PI name, research description, and transformative potential are included.
- The interdisciplinary and collaborative aspects are clearly stated.
- The target program (if provided) is plausible.
Flag missing elements or vague statements.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letter of Intent:
- Must be 1 page or less.
- Must include project title, PI name, research description, and transformative potential.
- Must align with Ideas Lab goals.
- Reject if: exceeds 1 page, omits required elements, or lacks a clear transformative case.',
    'Provide project title, PI name, research description, transformative potential, and target NSF program (if applicable).'
),

-- 3. Project Summary (Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Project Summary',
    'A concise summary of the Ideas Lab research, covering overview, intellectual merit, and broader impacts.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The Project Summary should:
- Be limited to 1 page per NSF PAPPG Ch 2.F.6.
- Include three sections: Overview, Intellectual Merit, and Broader Impacts.
- Overview: Summarize the interdisciplinary research goals, approach, and significance.
- Intellectual Merit: Explain how the research advances knowledge across multiple disciplines.
- Broader Impacts: Detail the potential societal benefits or transformative outcomes.
- Be written in third person, avoiding URLs or proprietary data.
- Use the following information provided by the grant writer:
  - Research goals and approach: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
Ensure the document is clear, persuasive, and formatted as a PDF.',
    'Review the Project Summary for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses third-person narrative.
- Clearly separates Overview, Intellectual Merit, and Broader Impacts.',
    'Check the Project Summary for logical consistency and completeness. Verify that:
- The Overview ties goals and approach to the interdisciplinary nature.
- Intellectual Merit specifies advancements across disciplines.
- Broader Impacts outline concrete societal benefits or transformative outcomes.
- No proprietary data or URLs are included.
Flag missing sections or vague claims.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Project Summary:
- Must be 1 page or less.
- Must include Overview, Intellectual Merit, and Broader Impacts.
- Must be in third person, free of proprietary info or URLs.
- Reject if: exceeds 1 page, omits sections, or fails to justify intellectual merit or broader impacts.',
    'Provide research goals and approach, intellectual merit, and broader impacts.'
),

-- 4. Project Description (Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Project Description',
    'A detailed narrative of the Ideas Lab research, including objectives, methods, interdisciplinary integration, and outcomes.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The Project Description should:
- Be limited to 15 pages per NSF PAPPG Ch 2.F.6.
- Clearly state objectives and, if applicable, hypotheses.
- Describe methods and technical approaches in detail.
- Explain intellectual merit (advancing knowledge across disciplines) and broader impacts (societal benefits or transformative outcomes).
- Provide a strong justification for the interdisciplinary approach and the need for collaborative, creative problem-solving.
- Outline expected outcomes and a dissemination plan.
- Use the following information provided by the grant writer:
  - Objectives/hypotheses: [User input]
  - Methods: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
  - Interdisciplinary justification: [User input]
  - Expected outcomes: [User input]
  - Dissemination plan: [User input]
Ensure the document is rigorous, concise, and formatted as a PDF, with visuals if appropriate.',
    'Review the Project Description for spelling, grammar, and clarity. Ensure it:
- Is within 15 pages.
- Is logically structured with all required elements.
- Uses precise scientific language.',
    'Check the Project Description for logical consistency and rigor. Verify that:
- Objectives align with methods and outcomes.
- Methods are feasible and detailed.
- Intellectual merit and broader impacts are robust.
- Interdisciplinary justification is compelling.
- Dissemination plan is practical.
Flag gaps or vague sections.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the context and attachments. Ensure visuals:
- Illustrate interdisciplinary integration or methods (e.g., conceptual models).
- Clarify complex concepts or approaches.
- Include clear labels, titles, and legends.
- Are high-resolution and uncluttered.
- Use the following information provided by the grant writer:
  - Data/concepts to visualize: [User input]
  - Visual instructions: [User input]
Deliver visuals in PDF format per NSF guidelines.',
    'Act as a critical NSF reviewer and evaluate the Project Description:
- Must be 15 pages or less.
- Must include objectives, methods, intellectual merit, broader impacts, interdisciplinary justification, expected outcomes, and dissemination plan.
- Must convincingly argue for the Ideas Lab mechanism.
- Reject if: exceeds page limit, lacks required elements, or fails to demonstrate interdisciplinary integration or rigor.',
    'Provide objectives, methods, intellectual merit, broader impacts, interdisciplinary justification, expected outcomes, and dissemination plan.'
),

-- 5. References Cited (Conditionally Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'References Cited',
    'A list of all references cited in the Project Description, if applicable.',
    5,
    true,
    'pdf',
    'Generate a References Cited section for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The section should:
- Include full bibliographic citations for all works cited in the Project Description.
- Use a consistent, NSF-acceptable citation style (e.g., APA, MLA).
- List only cited references, with no page limit.
- Use the following information provided by the grant writer:
  - Cited works or Project Description text: [User input or attachment]
Ensure the document is accurate and formatted as a PDF per NSF PAPPG Ch 2.D.2.b(iii).',
    'Review the References Cited for spelling, grammar, and citation consistency. Ensure all entries are complete.',
    'Check the References Cited for accuracy and relevance. Verify that:
- All citations match Project Description references.
- Each entry has full bibliographic details.
Flag uncited references or missing citations.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the References Cited:
- Must include all and only references cited in the Project Description.
- Must use a consistent, acceptable citation style.
- Reject if: omits cited works, includes uncited works, or has incomplete entries.',
    'Provide a list of cited works or the Project Description text, if applicable.'
),

-- 6. Biographical Sketches (Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Biographical Sketches',
    'Bios for senior personnel, detailing qualifications and contributions relevant to the Ideas Lab research.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. Each sketch should:
- Be limited to 3 pages per individual per NSF PAPPG Ch 2.F.6.
- Include: Professional Preparation (education), Appointments (reverse chronological), Products (up to 5 relevant, 5 other), Synergistic Activities (up to 5, highlighting interdisciplinary or collaborative experience).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Senior personnel details (education, appointments, products, activities): [User input]
Ensure the document is formatted as a PDF.',
    'Review the Biographical Sketches for spelling, grammar, and format adherence. Ensure each is within 3 pages.',
    'Check the Biographical Sketches for completeness and accuracy. Verify that:
- All sections are included and accurate.
- Products and activities are relevant to the Ideas Lab research.
Flag missing sections or excessive entries.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Biographical Sketches:
- Must be 3 pages or less per person.
- Must include Professional Preparation, Appointments, Products (max 10), and Synergistic Activities (max 5, with interdisciplinary focus).
- Must follow NSF format.
- Reject if: exceeds page limit, omits sections, or lacks relevance to Ideas Lab research.',
    'Provide education, appointments, products, and synergistic activities for each senior personnel.'
),

-- 7. Budget Justification (Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Budget Justification',
    'A narrative justifying all proposed budget costs for the Ideas Lab research.',
    7,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The Budget Justification should:
- Be limited to 5 pages per NSF PAPPG Ch 2.F.6.
- Justify all budget categories (e.g., personnel, travel, equipment) as allowable, reasonable, and allocable per NSF policy.
- Explain how the budget supports the interdisciplinary or collaborative nature of the research (e.g., travel for team meetings).
- Use the following information provided by the grant writer:
  - Budget details and cost rationales: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Budget Justification for spelling, grammar, and clarity. Ensure it:
- Is within 5 pages.
- Justifies all budget categories specifically.',
    'Check the Budget Justification for consistency and accuracy. Verify that:
- Costs align with the research activities and budget.
- Justifications are specific, allowable, and support interdisciplinary needs.
Flag unexplained or unallowable costs.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Budget Justification:
- Must be 5 pages or less.
- Must justify all budget categories with specific, allowable rationales.
- Reject if: exceeds page limit, lacks detail, or includes unallowable costs.',
    'Provide budget details and cost rationales.'
),

-- 8. Current and Pending Support (Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Current and Pending Support',
    'A disclosure of all current and pending support for senior personnel.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support document for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The document should:
- List all current and pending support for each senior personnel, including this proposal.
- Include project titles, funding sources, amounts, periods, and effort (person-months).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Current and pending support details: [User input]
Ensure the document is complete and formatted as a PDF per NSF PAPPG Ch 2.F.6.',
    'Review the Current and Pending Support for spelling, grammar, and format adherence. Ensure all details are present.',
    'Check the Current and Pending Support for accuracy and completeness. Verify that:
- All projects include required details.
- This proposal is listed as pending.
Flag omissions or inaccuracies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Current and Pending Support:
- Must list all current/pending support with titles, sources, amounts, periods, and effort.
- Must include this proposal.
- Reject if: incomplete, inaccurate, or not in NSF format.',
    'Provide current and pending support details for all senior personnel.'
),

-- 9. Facilities, Equipment, and Other Resources (Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the Ideas Lab research.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The section should:
- Describe available physical and intellectual resources (e.g., labs, equipment, computing).
- Explain how these resources support the interdisciplinary or collaborative nature of the research.
- Avoid cost quantification unless budgeted.
- Use the following information provided by the grant writer:
  - Available facilities and resources: [User input]
Ensure the document is specific and formatted as a PDF per NSF PAPPG Ch 2.F.6.',
    'Review the Facilities, Equipment, and Other Resources for spelling, grammar, and clarity. Ensure descriptions are specific.',
    'Check the Facilities, Equipment, and Other Resources for relevance and accuracy. Verify that:
- Resources support the Ideas Lab research activities.
- No unbudgeted cost details are included.
Flag vague or irrelevant items.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Facilities, Equipment, and Other Resources:
- Must describe resources clearly and link to Ideas Lab research feasibility.
- Must avoid unbudgeted cost details.
- Reject if: vague, incomplete, or includes irrelevant resources.',
    'Provide details on available facilities and resources.'
),

-- 10. Data Management and Sharing Plan (Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Data Management and Sharing Plan',
    'A plan for managing, storing, and sharing data generated during the Ideas Lab research.',
    10,
    false,
    'pdf',
    'Generate a Data Management and Sharing Plan for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 2 pages per NSF PAPPG Ch 2.E.1.
- Describe data types, collection methods, storage, and preservation strategies.
- Detail access, sharing policies, and metadata standards, considering interdisciplinary data needs.
- Comply with NSF data sharing policies.
- Use the following information provided by the grant writer:
  - Data types and collection methods: [User input]
  - Storage and preservation plans: [User input]
  - Sharing policies: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Data Management and Sharing Plan for spelling, grammar, and clarity. Ensure it is within 2 pages.',
    'Check the Data Management and Sharing Plan for feasibility and completeness. Verify that:
- Data types and strategies are specific to the research.
- Sharing plans comply with NSF policy.
Flag omissions or vague plans.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Data Management and Sharing Plan:
- Must be 2 pages or less.
- Must detail data types, collection, storage, preservation, and sharing.
- Must comply with NSF data policies.
- Reject if: exceeds 2 pages, lacks specificity, or violates policy.',
    'Provide data types, collection methods, storage plans, and sharing policies.'
),

-- 11. Postdoctoral Researcher Mentoring Plan (Conditionally Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Postdoctoral Researcher Mentoring Plan',
    'A plan for mentoring postdoctoral researchers, if applicable.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Researcher Mentoring Plan for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 1 page per NSF PAPPG Ch 2.E.2.
- Describe mentoring activities (e.g., career development, interdisciplinary training).
- Explain how these enhance postdoc skills in an interdisciplinary context.
- Use the following information provided by the grant writer:
  - Mentoring activities and goals: [User input]
Ensure the document is specific and formatted as a PDF.',
    'Review the Postdoctoral Researcher Mentoring Plan for spelling, grammar, and clarity. Ensure it is within 1 page.',
    'Check the Postdoctoral Researcher Mentoring Plan for specificity and relevance. Verify that:
- Activities are detailed and tied to interdisciplinary research.
- Plan is feasible.
Flag vague or irrelevant content.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Postdoctoral Researcher Mentoring Plan:
- Must be 1 page or less.
- Must detail specific mentoring activities and benefits for interdisciplinary research.
- Reject if: exceeds 1 page, lacks specificity, or is irrelevant.',
    'Provide mentoring activities and goals, if postdocs are involved.'
),

-- 12. Letters of Collaboration (Optional)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Letters of Collaboration',
    'Letters confirming collaborator involvement, if applicable.',
    12,
    true,
    'pdf',
    'Generate Letters of Collaboration for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. Each letter should:
- Be brief, typically 1 page per collaborator.
- Confirm the collaborator’s role and commitment (e.g., expertise, resources).
- Avoid endorsement language.
- Use the following information provided by the grant writer:
  - Collaborator names and roles: [User input]
  - Commitment details: [User input]
Ensure the document is formal and formatted as a PDF per NSF PAPPG guidelines.',
    'Review the Letters of Collaboration for spelling, grammar, and clarity. Ensure each is 1 page and avoids endorsements.',
    'Check the Letters of Collaboration for accuracy and compliance. Verify that:
- Roles and commitments are specific.
- No endorsement language is present.
Flag vague commitments or inappropriate praise.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letters of Collaboration:
- Must be 1 page or less per letter.
- Must confirm roles and commitments without endorsements.
- Reject if: exceeds page limit, lacks specificity, or includes endorsement language.',
    'Provide collaborator names, roles, and commitment details, if applicable.'
),

-- 13. Human Subjects Documentation (Conditionally Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Human Subjects Documentation',
    'Documentation for research involving human subjects, if applicable.',
    13,
    true,
    'pdf',
    'Generate Human Subjects Documentation for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The documentation should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.5.
- Describe the involvement of human subjects (e.g., participants, activities).
- Detail informed consent, privacy, and welfare protections.
- Specify IRB approval status or plans.
- Use the following information provided by the grant writer:
  - Human subjects involvement: [User input]
  - Consent and protection measures: [User input]
  - IRB status: [User input]
Ensure the document is ethical and formatted as a PDF.',
    'Review the Human Subjects Documentation for spelling, grammar, and clarity. Ensure ethical elements are addressed.',
    'Check the Human Subjects Documentation for completeness and ethics. Verify that:
- Involvement and protections are specific.
- Consent and IRB plans are robust.
Flag omissions or ethical issues.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Human Subjects Documentation:
- Must detail involvement, consent, protections, and IRB status.
- Must demonstrate ethical compliance.
- Reject if: incomplete, ethically deficient, or omits IRB plans.',
    'Provide human subjects involvement, consent/protection measures, and IRB status, if applicable.'
),

-- 14. Vertebrate Animals Documentation (Conditionally Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Vertebrate Animals Documentation',
    'Documentation for research involving vertebrate animals, if applicable.',
    14,
    true,
    'pdf',
    'Generate Vertebrate Animals Documentation for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The documentation should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.6.
- Justify use of vertebrate animals (species, number) and lack of alternatives.
- Describe procedures, pain minimization, and euthanasia (per AVMA guidelines).
- Confirm IACUC approval or pending status.
- Use the following information provided by the grant writer:
  - Animal use details (species, number): [User input]
  - Procedures and welfare measures: [User input]
  - IACUC status: [User input]
Ensure the document is ethical and formatted as a PDF.',
    'Review the Vertebrate Animals Documentation for spelling, grammar, and clarity. Ensure ethical details are complete.',
    'Check the Vertebrate Animals Documentation for ethics and completeness. Verify that:
- Justification is robust.
- Procedures minimize welfare impacts.
- IACUC status is included.
Flag ethical lapses or omissions.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Vertebrate Animals Documentation:
- Must justify species/number, detail procedures/welfare, and include IACUC status.
- Must comply with AVMA guidelines.
- Reject if: justification weak, welfare unaddressed, or IACUC omitted.',
    'Provide animal use details, procedures/welfare measures, and IACUC status, if applicable.'
),

-- 15. Dual Use Research of Concern (Conditionally Required)
(
    'a24bfbea-5382-4ac2-ada0-569b36083b35',
    'Dual Use Research of Concern',
    'Documentation addressing research with potential dual-use implications, if applicable.',
    15,
    true,
    'pdf',
    'Generate a Dual Use Research of Concern section for an NSF Ideas Lab grant application based on the context and attachments provided by the grant writer. The section should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.7.
- Identify any of the 15 DURC agents/toxins involved.
- Describe potential dual-use risks (e.g., misuse potential).
- Outline a risk mitigation plan (e.g., oversight, training).
- Use the following information provided by the grant writer:
  - Agents/toxins involved: [User input]
  - Dual-use risks: [User input]
  - Mitigation plan: [User input]
Ensure the document is proactive and formatted as a PDF.',
    'Review the Dual Use Research of Concern section for spelling, grammar, and clarity. Ensure all elements are addressed.',
    'Check the Dual Use Research of Concern section for completeness and feasibility. Verify that:
- Agents/toxins are specified.
- Risks are clear.
- Mitigation plan is practical.
Flag omissions or weak mitigation.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Dual Use Research of Concern:
- Must identify agents/toxins, describe risks, and provide a mitigation plan.
- Must align with U.S. DURC policy.
- Reject if: incomplete, risks unclear, or mitigation inadequate.',
    'Provide agents/toxins involved, dual-use risks, and mitigation plan, if applicable.'
);


-- Insert sections for NSF FASED Proposal (Grant ID: 343d59e1-0142-4ab8-a6a5-601c701e19a6)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES

-- 1. Concept Outline (Optional Pre-Submission)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Concept Outline',
    'A brief overview of the proposed FASED research, emphasizing the need for facilitation due to disability.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF FASED grant application based on the context and attachments provided by the grant writer. The Concept Outline should:
- Be concise, typically 1-2 pages.
- Introduce the research question or problem.
- Emphasize the need for facilitation due to disability and how it will enable the research.
- Highlight the potential impact of the research.
- Use the following information provided by the grant writer:
  - Research question: [User input]
  - Facilitation needs: [User input]
  - Impact of facilitation: [User input]
Ensure the document is clear, avoids proprietary information, and is formatted as a PDF per NSF guidelines.',
    'Review the Concept Outline for spelling, grammar, and clarity. Ensure it:
- Is within 1-2 pages.
- Uses concise, professional language.
- Avoids jargon or proprietary data.',
    'Check the Concept Outline for logical consistency and completeness. Verify that:
- The research question is clearly stated.
- The need for facilitation is well-justified.
- The impact of facilitation is articulated.
Flag missing elements or inconsistencies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Concept Outline:
- Must be 1-2 pages.
- Must include the research question, facilitation needs, and impact of facilitation.
- Must avoid proprietary information.
- Reject if: exceeds 2 pages, lacks specificity, or fails to justify the need for facilitation convincingly.',
    'Provide a brief overview of the research question, facilitation needs, and impact of facilitation.'
),

-- 2. Letter of Intent (Optional Pre-Submission)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Letter of Intent',
    'A brief letter indicating intent to submit a FASED proposal, highlighting the research and facilitation aspects.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF FASED grant application based on the context and attachments provided by the grant writer. The Letter of Intent should:
- Be brief, typically 1 page.
- Include the project title, PI name, and a concise description of the research.
- Highlight the need for facilitation due to disability.
- Specify the target NSF program, if known.
- Use the following information provided by the grant writer:
  - Project title: [User input]
  - PI name: [User input]
  - Research description: [User input]
  - Facilitation needs: [User input]
  - Target NSF program (if applicable): [User input]
Ensure the document is formal, clear, and formatted as a PDF per NSF guidelines.',
    'Review the Letter of Intent for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses a formal, professional tone.
- Includes all required elements.',
    'Check the Letter of Intent for completeness and consistency. Verify that:
- Project title, PI name, research description, and facilitation needs are included.
- The need for facilitation is clearly stated.
- The target program (if provided) is plausible.
Flag missing elements or vague statements.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letter of Intent:
- Must be 1 page or less.
- Must include project title, PI name, research description, and facilitation needs.
- Must align with FASED goals.
- Reject if: exceeds 1 page, omits required elements, or lacks a clear facilitation case.',
    'Provide project title, PI name, research description, facilitation needs, and target NSF program (if applicable).'
),

-- 3. Project Summary (Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Project Summary',
    'A concise summary of the proposed research, including intellectual merit and broader impacts.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF FASED grant application based on the context and attachments provided by the grant writer. The Project Summary should:
- Be limited to 1 page per NSF PAPPG Ch 2.F.7.
- Include three sections: Overview, Intellectual Merit, and Broader Impacts.
- Focus on the scientific aspects of the research.
- Use the following information provided by the grant writer:
  - Overview: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
Ensure the document is clear, persuasive, and formatted as a PDF.',
    'Review the Project Summary for spelling, grammar, and clarity. Ensure it:
- Is 1 page or less.
- Uses third-person narrative.
- Clearly separates the three sections.',
    'Check the Project Summary for logical consistency and completeness. Verify that:
- The Overview is concise and clear.
- Intellectual Merit and Broader Impacts are robust.
Flag vague or missing elements.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Project Summary:
- Must be 1 page or less.
- Must include Overview, Intellectual Merit, and Broader Impacts.
- Reject if: exceeds 1 page, lacks clarity, or fails to address intellectual merit or broader impacts adequately.',
    'Provide an overview, intellectual merit, and broader impacts of the research.'
),

-- 4. Project Description (Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Project Description',
    'A detailed narrative of the proposed research, including how the requested facilitation will enable the activities.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF FASED grant application based on the context and attachments provided by the grant writer. The Project Description should:
- Be up to 15 pages per NSF PAPPG guidelines.
- Include a detailed description of the research or teaching activities per NSF PAPPG Ch 2.F.7.
- Contain a subsection titled "Facilitation for Scientists and Engineers with Disabilities" that explains how the requested facilitation will allow the individual to perform these activities.
- Address intellectual merit and broader impacts.
- Use the following information provided by the grant writer:
  - Research activities: [User input]
  - Facilitation details: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
Ensure the document is rigorous, clear, and formatted as a PDF, with visuals if appropriate.',
    'Review the Project Description for spelling, grammar, and clarity. Ensure it:
- Is within 15 pages.
- Includes all required elements.
- Uses precise scientific language.',
    'Check the Project Description for logical consistency and completeness. Verify that:
- Research activities are clearly described.
- The facilitation subsection is detailed and justified.
- Intellectual merit and broader impacts are robust.
Flag gaps or inconsistencies.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the context and attachments. Ensure visuals:
- Illustrate research methods or facilitation needs (e.g., accessibility diagrams).
- Clarify complex concepts.
- Include clear labels and titles.
- Are high-resolution and uncluttered.
Use the following information: [Data/concepts to visualize], [Visual instructions]. Deliver visuals in PDF format.',
    'Act as a critical NSF reviewer and evaluate the Project Description:
- Must be 15 pages or less.
- Must include research or teaching activities, facilitation details, intellectual merit, and broader impacts per NSF PAPPG Ch 2.F.7.
- Must convincingly justify the need for facilitation.
- Reject if: exceeds page limit, lacks required elements, or fails to demonstrate facilitation needs or research rigor.',
    'Provide research activities, facilitation details, intellectual merit, and broader impacts.'
),

-- 5. References Cited (Conditionally Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'References Cited',
    'A list of all references cited in the Project Description, if applicable.',
    5,
    true,
    'pdf',
    'Generate a References Cited section for an NSF FASED grant application based on the context and attachments provided by the grant writer. The section should:
- Include full bibliographic citations for all works cited in the Project Description per NSF PAPPG Ch 2.D.2.b(iii).
- Use a consistent, NSF-acceptable citation style (e.g., APA, MLA).
- List only cited references, with no page limit.
- Use the following information provided by the grant writer:
  - Cited works or Project Description text: [User input or attachment]
Ensure the document is accurate and formatted as a PDF.',
    'Review the References Cited for spelling, grammar, and citation consistency. Ensure all entries are complete.',
    'Check the References Cited for accuracy and relevance. Verify that:
- All citations match Project Description references.
- Each entry has full bibliographic details.
Flag uncited references or missing citations.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the References Cited:
- Must include all and only references cited in the Project Description.
- Must use a consistent, acceptable citation style.
- Reject if: omits cited works, includes uncited works, or has incomplete entries.',
    'Provide a list of cited works or the Project Description text, if applicable.'
),

-- 6. Biographical Sketches (Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Biographical Sketches',
    'Bios for senior personnel, detailing qualifications and contributions relevant to the FASED research.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF FASED grant application based on the context and attachments provided by the grant writer. Each sketch should:
- Be limited to 3 pages per individual per NSF PAPPG Ch 2.F.7.
- Include: Professional Preparation (education), Appointments (reverse chronological), Products (up to 5 relevant, 5 other), Synergistic Activities (up to 5, highlighting relevant experience).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Senior personnel details (education, appointments, products, activities): [User input]
Ensure the document is formatted as a PDF.',
    'Review the Biographical Sketches for spelling, grammar, and format adherence. Ensure each is within 3 pages.',
    'Check the Biographical Sketches for completeness and accuracy. Verify that:
- All sections are included and accurate.
- Products and activities are relevant to the FASED research.
Flag missing sections or excessive entries.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Biographical Sketches:
- Must be 3 pages or less per person.
- Must include Professional Preparation, Appointments, Products (max 10), and Synergistic Activities (max 5).
- Must follow NSF format.
- Reject if: exceeds page limit, omits sections, or lacks relevance to FASED research.',
    'Provide education, appointments, products, and synergistic activities for each senior personnel.'
),

-- 7. Budget Justification (Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Budget Justification',
    'A narrative justifying all proposed budget costs, including specific justification for FASED funding.',
    7,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF FASED grant application based on the context and attachments provided by the grant writer. The Budget Justification should:
- Detail all budget items per NSF PAPPG Ch 2.F.7.
- Include a specific justification for the requested FASED funding, explaining how each item will facilitate the research or teaching activities.
- Ensure all costs are allowable, reasonable, and allocable per NSF policy.
- Use the following information provided by the grant writer:
  - Budget details: [User input]
  - FASED funding justification: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Budget Justification for spelling, grammar, and clarity. Ensure it:
- Justifies all budget items.
- Specifically addresses FASED funding.',
    'Check the Budget Justification for consistency and accuracy. Verify that:
- Costs align with the budget and research activities.
- FASED funding is clearly justified.
Flag unexplained or unallowable costs.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Budget Justification:
- Must justify all budget items, with specific attention to FASED funding per NSF PAPPG Ch 2.F.7.
- Must comply with NSF cost principles.
- Reject if: lacks detail, includes unallowable costs, or fails to justify FASED funding adequately.',
    'Provide budget details and specific justification for FASED funding.'
),

-- 8. Current and Pending Support (Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Current and Pending Support',
    'A disclosure of all current and pending support for senior personnel.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support document for an NSF FASED grant application based on the context and attachments provided by the grant writer. The document should:
- List all current and pending support for each senior personnel, including this proposal per NSF PAPPG Ch 2.F.7.
- Include project titles, funding sources, amounts, periods, and effort (person-months).
- Follow NSF-approved format (e.g., SciENcv).
- Use the following information provided by the grant writer:
  - Current and pending support details: [User input]
Ensure the document is complete and formatted as a PDF.',
    'Review the Current and Pending Support for spelling, grammar, and format adherence. Ensure all details are present.',
    'Check the Current and Pending Support for accuracy and completeness. Verify that:
- All projects include required details.
- This proposal is listed as pending.
Flag omissions or inaccuracies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Current and Pending Support:
- Must list all current/pending support with titles, sources, amounts, periods, and effort.
- Must include this proposal.
- Reject if: incomplete, inaccurate, or not in NSF format.',
    'Provide current and pending support details for all senior personnel.'
),

-- 9. Facilities, Equipment, and Other Resources (Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the FASED research.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF FASED grant application based on the context and attachments provided by the grant writer. The section should:
- Describe available physical and intellectual resources (e.g., labs, equipment, computing) per NSF PAPPG Ch 2.F.7.
- Explain how these resources support the research activities and facilitation needs.
- Avoid cost quantification unless budgeted.
- Use the following information provided by the grant writer:
  - Available facilities and resources: [User input]
Ensure the document is specific and formatted as a PDF.',
    'Review the Facilities, Equipment, and Other Resources for spelling, grammar, and clarity. Ensure descriptions are specific.',
    'Check the Facilities, Equipment, and Other Resources for relevance and accuracy. Verify that:
- Resources support the FASED research activities.
- No unbudgeted cost details are included.
Flag vague or irrelevant items.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Facilities, Equipment, and Other Resources:
- Must describe resources clearly and link to FASED research feasibility.
- Must avoid unbudgeted cost details.
- Reject if: vague, incomplete, or includes irrelevant resources.',
    'Provide details on available facilities and resources.'
),

-- 10. Data Management Plan (Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Data Management Plan',
    'A plan for managing, storing, and sharing data generated during the FASED research.',
    10,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF FASED grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 2 pages per NSF PAPPG Ch 2.E.1.
- Describe data types, collection methods, storage, and preservation strategies.
- Detail access, sharing policies, and metadata standards.
- Comply with NSF data sharing policies.
- Use the following information provided by the grant writer:
  - Data types and collection methods: [User input]
  - Storage and preservation plans: [User input]
  - Sharing policies: [User input]
Ensure the document is detailed and formatted as a PDF.',
    'Review the Data Management Plan for spelling, grammar, and clarity. Ensure it is within 2 pages.',
    'Check the Data Management Plan for feasibility and completeness. Verify that:
- Data types and strategies are specific to the research.
- Sharing plans comply with NSF policy.
Flag omissions or vague plans.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Data Management Plan:
- Must be 2 pages or less.
- Must detail data types, collection, storage, preservation, and sharing.
- Must comply with NSF data policies.
- Reject if: exceeds 2 pages, lacks specificity, or violates policy.',
    'Provide data types, collection methods, storage plans, and sharing policies.'
),

-- 11. Postdoctoral Mentoring Plan (Conditionally Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers, if applicable.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF FASED grant application based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 1 page per NSF PAPPG Ch 2.E.2.
- Describe mentoring activities (e.g., career development, training).
- Explain how these enhance postdoc skills.
- Use the following information provided by the grant writer:
  - Mentoring activities: [User input]
Ensure the document is specific and formatted as a PDF.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity. Ensure it is within 1 page.',
    'Check the Postdoctoral Mentoring Plan for specificity and relevance. Verify that:
- Activities are detailed and appropriate.
Flag vague or irrelevant content.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Postdoctoral Mentoring Plan:
- Must be 1 page or less.
- Must detail specific mentoring activities and benefits.
- Reject if: exceeds 1 page or lacks specificity.',
    'Provide mentoring activities, if postdocs are involved.'
),

-- 12. Human Subjects Documentation (Conditionally Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Human Subjects Documentation',
    'Documentation for research involving human subjects, if applicable.',
    12,
    true,
    'pdf',
    'Generate Human Subjects Documentation for an NSF FASED grant application based on the context and attachments provided by the grant writer. The documentation should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.5.
- Describe the involvement of human subjects (e.g., participants, activities).
- Detail informed consent, privacy, and welfare protections.
- Specify IRB approval status or plans.
- Use the following information provided by the grant writer:
  - Human subjects involvement: [User input]
  - Consent and protection measures: [User input]
  - IRB status: [User input]
Ensure the document is ethical and formatted as a PDF.',
    'Review the Human Subjects Documentation for spelling, grammar, and clarity. Ensure ethical elements are addressed.',
    'Check the Human Subjects Documentation for completeness and ethics. Verify that:
- Involvement and protections are specific.
- Consent and IRB plans are robust.
Flag omissions or ethical issues.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Human Subjects Documentation:
- Must detail involvement, consent, protections, and IRB status.
- Must demonstrate ethical compliance.
- Reject if: incomplete, ethically deficient, or omits IRB plans.',
    'Provide human subjects involvement, consent/protection measures, and IRB status, if applicable.'
),

-- 13. Vertebrate Animals Documentation (Conditionally Required)
(
    '343d59e1-0142-4ab8-a6a5-601c701e19a6',
    'Vertebrate Animals Documentation',
    'Documentation for research involving vertebrate animals, if applicable.',
    13,
    true,
    'pdf',
    'Generate Vertebrate Animals Documentation for an NSF FASED grant application based on the context and attachments provided by the grant writer. The documentation should:
- Be concise, typically 1-2 pages per NSF PAPPG Ch 2.E.6.
- Justify use of vertebrate animals (species, number) and lack of alternatives.
- Describe procedures, pain minimization, and euthanasia (per AVMA guidelines).
- Confirm IACUC approval or pending status.
- Use the following information provided by the grant writer:
  - Animal use details (species, number): [User input]
  - Procedures and welfare measures: [User input]
  - IACUC status: [User input]
Ensure the document is ethical and formatted as a PDF.',
    'Review the Vertebrate Animals Documentation for spelling, grammar, and clarity. Ensure ethical details are complete.',
    'Check the Vertebrate Animals Documentation for ethics and completeness. Verify that:
- Justification is robust.
- Procedures minimize welfare impacts.
- IACUC status is included.
Flag ethical lapses or omissions.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Vertebrate Animals Documentation:
- Must justify species/number, detail procedures/welfare, and include IACUC status.
- Must comply with AVMA guidelines.
- Reject if: justification weak, welfare unaddressed, or IACUC omitted.',
    'Provide animal use details, procedures/welfare measures, and IACUC status, if applicable.'
);



-- Insert sections for NSF Equipment Proposal (Grant ID: d96c435e-509d-4cf3-8d82-cf92e4dac7f4)
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt,
    ai_requirements_prompt, instructions
) VALUES

-- 1. Concept Outline (Optional Pre-Submission Section)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Concept Outline',
    'A brief overview introducing the proposed equipment acquisition or development, its significance, and its potential impact on research.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The Concept Outline should:
- Be concise, limited to 1-2 pages.
- Introduce the equipment to be acquired or developed, emphasizing its importance to research.
- Highlight the need for the equipment and its anticipated impact on advancing scientific inquiry and training.
- Outline the key features and capabilities of the equipment.
- Use the following information provided by the grant writer:
  - Equipment description: [User input]
  - Need and impact: [User input]
  - Key features: [User input]
Ensure the document is clear, avoids proprietary details, is written in a professional tone, and is formatted as a PDF.',
    'Review the Concept Outline for spelling, grammar, and clarity. Ensure it is within 1-2 pages, maintains a professional tone, and adheres to standard English conventions suitable for an NSF submission.',
    'Check the Concept Outline for logical consistency, completeness, and coherence. Verify that it includes the equipment description, need, impact, and key features, and that the narrative flows logically without gaps or contradictions.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Concept Outline. It must be within 1-2 pages, clearly justify the equipment’s need, and demonstrate its potential research impact per NSF PAPPG guidelines. Reject if it lacks specificity, includes proprietary information, or fails to articulate significance.',
    'Provide the equipment description, need and impact, and key features.'
),

-- 2. Letter of Intent (Optional Pre-Submission Section)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Letter of Intent',
    'A concise letter signaling intent to submit an Equipment Proposal, summarizing the equipment and its significance.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The Letter of Intent should:
- Be limited to 1 page.
- Include the project title, principal investigator (PI) name, and a brief description of the equipment and its significance to research.
- Use the following information provided by the grant writer:
  - Project title: [User input]
  - PI name: [User input]
  - Equipment description: [User input]
Ensure the document is formal, concise, written in a professional tone, and formatted as a PDF.',
    'Review the Letter of Intent for spelling, grammar, and clarity. Ensure it is within 1 page, uses a formal tone, and adheres to standard English conventions.',
    'Check the Letter of Intent for completeness and consistency. Verify that it includes the project title, PI name, and equipment description, and that the content is concise and logically presented.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Letter of Intent. It must be 1 page or less, clearly introduce the equipment and its significance, and comply with NSF PAPPG pre-submission expectations. Reject if it exceeds the page limit, lacks clarity, or omits required elements.',
    'Provide the project title, PI name, and a brief equipment description.'
),

-- 3. Project Summary (Required)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Project Summary',
    'A concise summary of the equipment proposal, covering overview, intellectual merit, and broader impacts.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The Project Summary should:
- Be limited to 1 page.
- Include three distinct sections: Overview, Intellectual Merit, and Broader Impacts.
- Overview: Describe the equipment, its capabilities, and the research it will enable.
- Intellectual Merit: Explain how the equipment advances scientific knowledge and research capabilities.
- Broader Impacts: Detail the equipment’s benefits to education, training, and society.
- Use the following information provided by the grant writer:
  - Equipment description: [User input]
  - Research enabled: [User input]
  - Intellectual merit: [User input]
  - Broader impacts: [User input]
Ensure the document is clear, persuasive, avoids jargon unless necessary, and is formatted as a PDF.',
    'Review the Project Summary for spelling, grammar, and clarity. Ensure it is within 1 page, uses a professional tone, and adheres to standard English conventions suitable for NSF reviewers.',
    'Check the Project Summary for logical consistency, completeness, and coherence. Verify that it includes all three required sections (Overview, Intellectual Merit, Broader Impacts), each distinct and fully developed, with no overlap or missing elements.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Project Summary. It must comply with NSF PAPPG requirements, be within 1 page, and clearly articulate the equipment’s significance across all three sections. Reject if it exceeds the page limit, lacks persuasion, or omits any section.',
    'Provide the equipment description, research enabled, intellectual merit, and broader impacts.'
),

-- 4. Project Description (Required)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Project Description',
    'A detailed narrative justifying the equipment acquisition or development, per NSF PAPPG Chapter 2.F.9.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The Project Description should:
- Be limited to 15 pages.
- Include four subsections per NSF PAPPG Chapter 2.F.9:
  a. Description of the equipment, including technical specifications and capabilities.
  b. Justification for the need, explaining why the equipment is essential for research advancement.
  c. Impact on research and training, detailing how it enhances scientific capabilities and educational opportunities.
  d. Management plan for maintenance and operation, including staffing, sustainability, and access policies.
- Address intellectual merit and broader impacts within the context of the equipment’s use, avoiding detailed research plans beyond justification.
- Use the following information provided by the grant writer:
  - Equipment description: [User input]
  - Need justification: [User input]
  - Impact on research and training: [User input]
  - Management plan: [User input]
Ensure the document is rigorous, clear, uses a scientific tone, and is formatted as a PDF with optional visuals.',
    'Review the Project Description for spelling, grammar, and clarity. Ensure it is within 15 pages, maintains a professional scientific tone, and adheres to standard English conventions.',
    'Check the Project Description for logical consistency, completeness, and coherence. Verify that all four subsections are included, fully developed, and cohesively linked to the equipment’s purpose, with no extraneous research plans.',
    'Generate high-quality visuals (e.g., diagrams, technical drawings) for the Project Description based on the context and attachments. Ensure visuals:
- Illustrate the equipment’s design, integration, or research application.
- Include clear labels, titles, and legends.
- Are high-resolution, professional, and grant-ready.
Use the following information: [Data/concepts to visualize], [Visual instructions]. Deliver visuals in PDF format.',
    'Act as a critical NSF reviewer and evaluate the Project Description. It must comply with NSF PAPPG Chapter 2.F.9, include all four subsections within 15 pages, and rigorously justify the equipment’s need and impact. Reject if it exceeds the page limit, omits subsections, or includes unjustified research details.',
    'Provide the equipment description, need justification, impact on research and training, and management plan.'
),

-- 5. References Cited (Conditionally Required)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'References Cited',
    'A list of references cited in the Project Description, required only if citations are present.',
    5,
    true,
    'pdf',
    'Generate a References Cited section for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The section should:
- Include full bibliographic citations for all references cited in the Project Description.
- Use a consistent citation style (e.g., APA, MLA, Chicago).
- Exclude references not cited in the text.
- Use the following information provided by the grant writer:
  - Cited references: [User input]
Ensure the document is clear, formatted as a PDF, and adheres to NSF citation standards.',
    'Review the References Cited section for spelling, grammar, and citation consistency. Ensure all entries are complete, properly formatted, and free of typographical errors.',
    'Check the References Cited section for accuracy, relevance, and completeness. Verify that all citations match those in the Project Description and include full details, with no extraneous references.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the References Cited section. It must include only cited references with complete, consistent citations per NSF PAPPG guidelines. Reject if it contains uncited references, incomplete entries, or inconsistent formatting.',
    'Provide a list of cited references, if applicable.'
),

-- 6. Biographical Sketches (Required)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Biographical Sketches',
    'Biosketches for senior personnel, detailing qualifications relevant to the equipment proposal.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. Each sketch should:
- Be limited to 3 pages per person.
- Include:
  a. Professional preparation (education and training).
  b. Appointments (in reverse chronological order).
  c. Up to 5 products most relevant to the equipment proposal (e.g., publications, equipment development).
  d. Up to 5 synergistic activities (e.g., equipment management, training).
- Use the following information provided by the grant writer:
  - Personnel details: [User input]
Ensure the document follows NSF biosketch guidelines, is formatted as a PDF, and highlights equipment-relevant expertise.',
    'Review the Biographical Sketches for spelling, grammar, and clarity. Ensure each is within 3 pages, follows NSF format, and maintains a professional tone.',
    'Check the Biographical Sketches for completeness, consistency, and relevance. Verify that all required sections are included and content aligns with the equipment proposal’s goals.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Biographical Sketches. Each must be within 3 pages, include all required sections per NSF PAPPG, and demonstrate relevant expertise. Reject if it exceeds the page limit, omits sections, or lacks relevance.',
    'Provide personnel details for each senior member, including education, appointments, relevant products, and synergistic activities.'
),

-- 7. Budget Justification (Required)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Budget Justification',
    'A narrative justifying all costs associated with the equipment acquisition or development.',
    7,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The Budget Justification should:
- Detail all costs (e.g., equipment purchase, installation, maintenance).
- Provide specific justifications for each cost (e.g., "The $X cost for the ABC system is based on vendor quote Y").
- Address cost-sharing or institutional contributions, if applicable.
- Ensure costs are allowable, reasonable, and allocable per NSF policy.
- Use the following information provided by the grant writer:
  - Budget details: [User input]
Ensure the document is concise, clear, uses a professional tone, and is formatted as a PDF.',
    'Review the Budget Justification for spelling, grammar, and clarity. Ensure it is concise, uses a professional tone, and adheres to standard English conventions.',
    'Check the Budget Justification for accuracy, consistency, and completeness. Verify that all costs are specifically justified, align with the budget, and comply with NSF cost principles.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Budget Justification. It must justify all costs with specific, allowable, and reasonable rationales per NSF PAPPG. Reject if it lacks detail, includes unallowable costs, or misaligns with the budget.',
    'Provide budget details and specific justifications for all equipment-related costs.'
),

-- 8. Current and Pending Support (Required)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Current and Pending Support',
    'A disclosure of all current and pending support for senior personnel, including this proposal.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support document for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The document should:
- List all current and pending support for each senior personnel, including this proposal (marked as pending).
- Include project titles, funding sources, amounts, periods, and effort (person-months per year).
- Use the following information provided by the grant writer:
  - Support details: [User input]
Ensure the document is formatted as a PDF and complies with NSF disclosure requirements.',
    'Review the Current and Pending Support document for spelling, grammar, and clarity. Ensure all details are consistently formatted and clear.',
    'Check the Current and Pending Support document for accuracy and completeness. Verify that all projects include required details, this proposal is listed as pending, and there are no omissions.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Current and Pending Support document. It must list all support with complete, accurate details per NSF PAPPG. Reject if it omits projects, lacks required information, or contains inconsistencies.',
    'Provide current and pending support details for all senior personnel.'
),

-- 9. Facilities, Equipment, and Other Resources (Required)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Facilities, Equipment, and Other Resources',
    'A description of existing facilities and resources supporting the proposed equipment.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The section should:
- Describe existing facilities where the equipment will be housed and operated.
- Detail additional resources (e.g., staff, maintenance support) ensuring successful equipment use.
- Avoid duplicating information about the requested equipment.
- Use the following information provided by the grant writer:
  - Existing facilities: [User input]
  - Additional resources: [User input]
Ensure the document is clear, concise, uses a professional tone, and is formatted as a PDF.',
    'Review the Facilities, Equipment, and Other Resources section for spelling, grammar, and clarity. Ensure it avoids redundancy with the Project Description and maintains a professional tone.',
    'Check the Facilities, Equipment, and Other Resources section for relevance and completeness. Verify that it describes existing resources complementing the equipment, with no overlap with requested items.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Facilities, Equipment, and Other Resources section. It must clearly describe existing resources without duplicating equipment details, per NSF PAPPG. Reject if it includes irrelevant details or lacks specificity.',
    'Provide details on existing facilities and additional resources supporting the equipment.'
),

-- 10. Data Management Plan (Required)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Data Management Plan',
    'A plan for managing and sharing data generated by the equipment, or a statement if no data is generated.',
    10,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The plan should:
- Describe the types of data (if any) generated by the equipment, how it will be managed, stored, and shared.
- If no data is generated, state this explicitly (e.g., "This equipment will not generate data").
- Comply with NSF data sharing policies.
- Use the following information provided by the grant writer:
  - Data management details: [User input]
Ensure the document is clear, concise, uses a professional tone, and is formatted as a PDF.',
    'Review the Data Management Plan for spelling, grammar, and clarity. Ensure it is concise, uses a professional tone, and adheres to standard English conventions.',
    'Check the Data Management Plan for completeness and compliance. Verify that it addresses data management and sharing or clearly states no data generation, aligning with NSF policies.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Data Management Plan. It must comply with NSF PAPPG data policies, addressing data management or stating no data generation. Reject if it lacks clarity, omits required details, or fails policy compliance.',
    'Provide data management details or state if no data will be generated.'
),

-- 11. Postdoctoral Mentoring Plan (Conditionally Required - Special Processing)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers involved in the equipment proposal, if applicable.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The plan should:
- Be limited to 1 page.
- Describe specific mentoring activities (e.g., equipment training, career development) for postdocs.
- Explain how these activities enhance postdoc skills and career prospects related to the equipment.
- Use the following information provided by the grant writer:
  - Mentoring activities: [User input]
Ensure the document is concise, clear, uses a professional tone, and is formatted as a PDF.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity. Ensure it is within 1 page and maintains a professional tone.',
    'Check the Postdoctoral Mentoring Plan for specificity, relevance, and completeness. Verify that mentoring activities are detailed, tied to the equipment, and enhance postdoc development.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Postdoctoral Mentoring Plan. It must be within 1 page, detail specific equipment-related mentoring per NSF PAPPG Chapter 2.E, and enhance postdoc skills. Reject if it exceeds the page limit, is vague, or lacks relevance.',
    'Provide mentoring activities for postdocs, if applicable.'
),

-- 12. Documentation for Research Involving Human Subjects (Conditionally Required - Special Processing)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Human Subjects Documentation',
    'Documentation for equipment proposals involving human subjects research, if applicable.',
    12,
    true,
    'pdf',
    'Generate Human Subjects Documentation for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The documentation should:
- Describe the involvement of human subjects in research enabled by the equipment.
- Detail informed consent processes, privacy protections, and participant welfare measures.
- Specify IRB approval status or plans for obtaining approval.
- Use the following information provided by the grant writer:
  - Human subjects involvement: [User input]
  - Consent and protection measures: [User input]
  - IRB status: [User input]
Ensure the document is ethical, clear, complies with federal regulations, and is formatted as a PDF.',
    'Review the Human Subjects Documentation for spelling, grammar, and clarity. Ensure it thoroughly addresses ethical considerations and uses a professional tone.',
    'Check the Human Subjects Documentation for ethical rigor, completeness, and consistency. Verify that it details involvement, consent, protections, and IRB status, aligning with NSF PAPPG Chapter 2.E and federal standards.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Human Subjects Documentation. It must fully describe human subjects involvement, consent, protections, and IRB status per NSF PAPPG Chapter 2.E. Reject if it omits required elements, lacks ethical rigor, or fails regulatory alignment.',
    'Provide human subjects involvement, consent/protection measures, and IRB status, if applicable.'
),

-- 13. Documentation for Research Involving Vertebrate Animals (Conditionally Required - Special Processing)
(
    'd96c435e-509d-4cf3-8d82-cf92e4dac7f4',
    'Vertebrate Animals Documentation',
    'Documentation for equipment proposals involving vertebrate animals research, if applicable.',
    13,
    true,
    'pdf',
    'Generate Vertebrate Animals Documentation for an NSF Equipment Proposal based on the context and attachments provided by the grant writer. The documentation should:
- Justify the use of vertebrate animals (species, number) and explain why alternatives are not feasible.
- Describe procedures, pain minimization strategies, and euthanasia methods (per AVMA guidelines).
- Confirm IACUC approval or pending status.
- Use the following information provided by the grant writer:
  - Animal use details: [User input]
  - Procedures and welfare measures: [User input]
  - IACUC status: [User input]
Ensure the document is ethical, clear, complies with federal regulations, and is formatted as a PDF.',
    'Review the Vertebrate Animals Documentation for spelling, grammar, and clarity. Ensure it addresses ethical and welfare details thoroughly and uses a professional tone.',
    'Check the Vertebrate Animals Documentation for ethical rigor, completeness, and consistency. Verify that it justifies use, details procedures and welfare, and includes IACUC status, aligning with NSF PAPPG Chapter 2.E and federal standards.',
    NULL,
    'Act as a critical NSF reviewer and evaluate the Vertebrate Animals Documentation. It must justify animal use, detail procedures and welfare, and include IACUC status per NSF PAPPG Chapter 2.E. Reject if justification is weak, welfare is unaddressed, or it fails regulatory alignment.',
    'Provide animal use details, procedures/welfare measures, and IACUC status, if applicable.'
);



INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt,
    ai_requirements_prompt, instructions
) VALUES

-- 1. Concept Outline (Optional Pre-Submission Section)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Concept Outline',
    'A preliminary sketch of the proposed travel activities and their significance.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF Travel Proposal. The outline should:
- Briefly describe the planned travel activities (e.g., attending a conference, workshop, or research collaboration).
- Explain the significance of these activities for professional development and research dissemination.
- Describe how they align with NSF''s goals of fostering innovation and collaboration.
Use the following information provided by the grant writer:
- Travel activities: [User input]
- Significance and alignment: [User input]
Ensure the document is clear, concise, no more than one page, and formatted as a PDF.',
    'Check the Concept Outline for spelling, grammar, and clarity. Ensure it is concise, professional, and adheres to a one-page limit.',
    'Verify the logic and consistency of the Concept Outline. Ensure the travel activities are clearly connected to professional development and NSF goals, with no gaps or contradictions.',
    NULL,
    'Evaluate the Concept Outline against NSF expectations for Travel Proposals per PAPPG Chapter 2.F.10. Ensure it justifies the travel''s significance and alignment with NSF goals. Flag any omission of required elements, lack of clarity, or failure to persuade on the travel''s necessity.',
    'Provide a brief description of the travel activities and their significance.'
),

-- 2. Letter of Intent (Optional Pre-Submission Section)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Letter of Intent',
    'A formal letter indicating intent to submit a Travel Proposal, summarizing key aspects.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF Travel Proposal. The letter should:
- Include the project title.
- Provide a brief description of the travel activities.
- Explain their significance.
- State the expected outcomes.
Use the following information provided by the grant writer:
- Project title: [User input]
- Travel activities: [User input]
- Significance: [User input]
- Expected outcomes: [User input]
Ensure the letter is formal, concise, no more than one page, and formatted as a PDF.',
    'Check the Letter of Intent for spelling, grammar, and formal tone. Ensure it is clear, professional, and within one page.',
    'Verify the consistency and completeness of the Letter of Intent. Ensure all key aspects (title, activities, significance, outcomes) are included and logically presented.',
    NULL,
    'Evaluate the Letter of Intent against NSF guidelines per PAPPG Chapter 2.E. Ensure it provides a clear summary of the travel proposal and justifies its intent. Flag any missing elements, informal tone, or lack of persuasiveness.',
    'Provide the project title, travel activities, significance, and expected outcomes.'
),

-- 3. Project Summary (Required)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Project Summary',
    'A concise summary of the Travel Proposal, including intellectual merit and broader impacts.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF Travel Proposal per PAPPG Chapter 2.F.10. The summary should:
- Provide an overview of the travel activities.
- Explain the intellectual merit (e.g., advancing knowledge through participation).
- Describe the broader impacts (e.g., professional development, networking, dissemination).
Use the following information provided by the grant writer:
- Travel activities: [User input]
- Intellectual merit: [User input]
- Broader impacts: [User input]
Ensure the summary is within one page, written in third person, and formatted as a PDF.',
    'Check the Project Summary for spelling, grammar, and clarity. Ensure it adheres to the one-page limit and uses third-person perspective.',
    'Verify that the Project Summary clearly articulates intellectual merit and broader impacts. Ensure logical structure with no inconsistencies or missing elements.',
    NULL,
    'Evaluate the Project Summary against NSF requirements in PAPPG Chapter 2.F.10. Ensure it includes intellectual merit and broader impacts statements. Flag any lack of clarity, omission of required elements, or failure to meet the one-page limit.',
    'Provide an overview of the travel activities, intellectual merit, and broader impacts.'
),

-- 4. Project Description (Required)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Project Description',
    'A detailed description of the proposed travel activities, their significance, and outcomes.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF Travel Proposal per PAPPG Chapter 2.F.10. The description should:
- Detail the travel activities (e.g., conference attendance, workshop participation).
- Explain their significance for professional development and research.
- Describe how they align with NSF goals (e.g., innovation, collaboration).
- State expected outcomes (e.g., presentations, collaborations).
Use the following information provided by the grant writer:
- Travel plan: [User input]
- Significance: [User input]
- Alignment with NSF goals: [User input]
- Expected outcomes: [User input]
Ensure the document is comprehensive, persuasive, and formatted as a PDF.',
    'Check the Project Description for spelling, grammar, and clarity. Ensure it is well-organized and professional.',
    'Verify the logic and coherence of the Project Description. Ensure travel activities are linked to professional development and NSF goals, with no gaps or contradictions.',
    'Generate high-quality visuals (e.g., maps, schedules) based on the provided data: [User input]. Ensure visuals are clear, labeled, and enhance the proposal''s clarity.',
    'Evaluate the Project Description against NSF requirements in PAPPG Chapter 2.F.10. Ensure it justifies the travel''s necessity, significance, and alignment with NSF goals. Flag any lack of detail, weak justification, or misalignment.',
    'Provide a detailed travel plan, its significance, alignment with NSF goals, and expected outcomes.'
),

-- 5. References Cited (Conditionally Required)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'References Cited',
    'A list of references cited in the Project Description, if applicable.',
    5,
    true,
    'pdf',
    'Generate a References Cited section for an NSF Travel Proposal per PAPPG Chapter 2.F.10. The section should:
- Include full citations for all references in the Project Description.
Use the following information provided by the grant writer:
- List of references: [User input]
Ensure the document is formatted as a PDF with consistent citation style.',
    'Check the References Cited for spelling, grammar, and correct formatting. Ensure consistency in citation style.',
    'Verify that all citations are accurate, complete, and correspond to the Project Description. Ensure no references are missing or extraneous.',
    NULL,
    'Evaluate the References Cited against NSF guidelines in PAPPG Chapter 2.F.10. Ensure all cited works are listed with full bibliographic details. Flag any formatting errors or missing citations.',
    'Provide a list of references cited in the Project Description, if any.'
),

-- 6. Biographical Sketches (Required)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Biographical Sketches',
    'Biographical sketches for the PI and co-PIs, highlighting relevant experience.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF Travel Proposal per PAPPG Chapter 2.F.10. Each sketch should:
- List professional preparation.
- Detail appointments.
- Include products (e.g., publications, presentations).
- Describe synergistic activities.
Use the following information provided by the grant writer:
- PI and co-PI details: [User input]
Ensure each sketch is limited to two pages and formatted as a PDF.',
    'Check the Biographical Sketches for spelling, grammar, and adherence to the two-page limit per person. Ensure NSF biosketch format is followed.',
    'Verify that each sketch includes all required sections and highlights relevant experience. Ensure consistency and no missing details.',
    NULL,
    'Evaluate the Biographical Sketches against NSF requirements in PAPPG Chapter 2.F.10. Ensure all sections are complete and relevant. Flag any omissions, exceeding page limits, or irrelevant content.',
    'Provide details for the PI and co-PIs (professional preparation, appointments, products, synergistic activities).'
),

-- 7. Budget Justification (Required)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Budget Justification',
    'A narrative explaining the budget for the travel activities.',
    7,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF Travel Proposal per PAPPG Chapter 2.F.10. The justification should:
- Detail all travel costs (e.g., airfare, lodging, registration fees).
- Explain why each cost is necessary.
Use the following information provided by the grant writer:
- Budget details: [User input]
Ensure the document is clear, concise, and formatted as a PDF.',
    'Check the Budget Justification for spelling, grammar, and clarity. Ensure it is concise and professional.',
    'Verify that all budget items are justified and reasonable per NSF guidelines. Ensure no unallowable costs or missing explanations.',
    NULL,
    'Evaluate the Budget Justification against NSF requirements in PAPPG Chapter 2.F.10. Ensure all costs are justified and allowable. Flag any unexplained expenses or deviations from guidelines.',
    'Provide a breakdown of the budget and justifications for each cost.'
),

-- 8. Current and Pending Support (Required)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Current and Pending Support',
    'A list of current and pending support for the PI and co-PIs.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support section for an NSF Travel Proposal per PAPPG Chapter 2.F.10. The section should:
- List all current and pending projects.
- Detail funding sources, project titles, and overlap with this proposal.
Use the following information provided by the grant writer:
- Support details: [User input]
Ensure the document is formatted as a PDF.',
    'Check the Current and Pending Support for spelling, grammar, and clarity. Ensure it follows NSF format.',
    'Verify that all support is disclosed with no overlap unless justified. Ensure completeness and accuracy.',
    NULL,
    'Evaluate the Current and Pending Support against NSF requirements in PAPPG Chapter 2.F.10. Ensure full disclosure and proper format. Flag any missing projects or insufficient detail.',
    'Provide details of all current and pending support for the PI and co-PIs.'
),

-- 9. Facilities, Equipment, and Other Resources (Required)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the travel activities.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF Travel Proposal per PAPPG Chapter 2.F.10. The section should:
- Describe resources supporting the travel (e.g., institutional support).
Use the following information provided by the grant writer:
- Resources: [User input]
Ensure the document is clear and formatted as a PDF.',
    'Check the Facilities, Equipment, and Other Resources for spelling, grammar, and clarity. Ensure it is concise.',
    'Verify that described resources are relevant and sufficient to support the travel. Ensure no irrelevant details.',
    NULL,
    'Evaluate the Facilities, Equipment, and Other Resources against NSF requirements in PAPPG Chapter 2.F.10. Ensure relevance and adequacy. Flag any lack of specificity or support.',
    'Provide a description of resources supporting the travel activities.'
),

-- 10. Data Management Plan (Required)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Data Management Plan',
    'A plan for managing and sharing data generated during travel activities.',
    10,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF Travel Proposal per PAPPG Chapter 2.F.10. The plan should:
- Describe data management and sharing if data is generated (e.g., from presentations).
- State if no data will be generated.
Use the following information provided by the grant writer:
- Data management details: [User input]
Ensure the document is formatted as a PDF.',
    'Check the Data Management Plan for spelling, grammar, and clarity. Ensure it is concise.',
    'Verify that the plan addresses data management or states no data generation clearly. Ensure compliance with NSF policies.',
    NULL,
    'Evaluate the Data Management Plan against NSF requirements in PAPPG Chapter 2.F.10. Ensure compliance with data sharing policies. Flag any missing details or non-compliance.',
    'Provide details on data management or state if no data will be generated.'
),

-- 11. Postdoctoral Mentoring Plan (Conditionally Required, Special Processing)
(
    '1ddf18bc-3528-400f-8ff6-4aa570e9e5ba',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers involved in the travel, if applicable.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF Travel Proposal per PAPPG Chapter 2.E. The plan should:
- Describe mentoring activities for postdocs during the travel.
Use the following information provided by the grant writer:
- Mentoring activities: [User input]
Ensure the document is formatted as a PDF.',
    'Check the Postdoctoral Mentoring Plan for spelling, grammar, and clarity. Ensure it is specific.',
    'Verify that mentoring activities are feasible, specific, and beneficial. Ensure alignment with travel activities.',
    NULL,
    'Evaluate the Postdoctoral Mentoring Plan against NSF requirements in PAPPG Chapter 2.E. Ensure it meets mentoring standards. Flag any lack of detail or relevance.',
    'Provide details of mentoring activities for postdocs, if applicable.'
);




INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt,
    instructions
) VALUES

-- 1. Concept Outline (Optional Pre-Submission)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Concept Outline',
    'A preliminary overview to gauge NSF interest in the proposed center.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF Center Proposal. Include an introductory paragraph describing the center''s theme, significance, and interdisciplinary approach, followed by a concise outline of its goals and potential impact. Use the following information: Center theme [User input], Significance [User input], Goals [User input]. Ensure the document is compelling, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted by the solicitation.',
    'Review the Concept Outline generated for an NSF Center Proposal. Check for spelling, grammar, and clarity errors. Ensure the text is concise, compelling, and adheres to a one-page limit. Correct any issues while maintaining the original intent and avoiding hyperlinks unless permitted.',
    'Analyze the edited Concept Outline for an NSF Center Proposal. Check for logical consistency (e.g., theme aligns with goals), factual accuracy, and completeness (e.g., all required elements present). Flag any discrepancies or omissions that could weaken its persuasiveness or fail to gauge NSF interest.',
    'Generate high-quality visuals (e.g., diagrams or flowcharts) for the Concept Outline of an NSF Center Proposal. Use the user-provided context (e.g., center theme, goals) and image files (if uploaded) to create visuals that clarify the interdisciplinary approach or goals. Ensure visuals are clear, labeled, professional, and output as PDF-ready PNGs compatible with NSF standards.',
    'Evaluate the Concept Outline against NSF pre-submission expectations as a strict reviewer. Verify it includes a compelling theme, significance, interdisciplinary approach, goals, and impact within one page. Reject if it lacks clarity, exceeds the page limit, or includes unpermitted hyperlinks. Ensure it gauges NSF interest effectively.',
    'Provide the center''s theme, significance, and goals.'
),

-- 2. Letter of Intent (Optional Pre-Submission)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Letter of Intent',
    'A formal notification of intent to submit a Center Proposal.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF Center Proposal per PAPPG guidelines. Include the project title, PI name, a brief description of the center''s theme and objectives, and anticipated collaborators. Use the following information: Project title [User input], PI name [User input], Center description [User input], Collaborators [User input]. Ensure the letter is formal, concise, no more than one page, formatted as a PDF-ready text document, and adheres to NSF submission standards.',
    'Review the Letter of Intent generated for an NSF Center Proposal. Check for spelling, grammar, and formality errors. Ensure the text is concise, adheres to a one-page limit, and meets NSF standards. Correct any issues while preserving the original intent.',
    'Analyze the edited Letter of Intent for an NSF Center Proposal. Check for logical consistency (e.g., objectives align with theme), completeness (e.g., all required elements included), and adherence to NSF standards. Flag any inconsistencies or missing details that could undermine its purpose.',
    NULL,
    'Evaluate the Letter of Intent against NSF PAPPG guidelines as a strict reviewer. Verify it includes the project title, PI name, center description, and collaborators within one page. Reject if it lacks formality, exceeds the page limit, or deviates from submission standards.',
    'Provide the project title, PI name, center description, and list of anticipated collaborators.'
),

-- 3. Project Summary (Required)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Project Summary',
    'A concise summary of the Center Proposal, including intellectual merit and broader impacts.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF Center Proposal per PAPPG Chapter 2.D.2.b. Include an overview of the center, its intellectual merit, and broader impacts in three distinct sections. Use the following information: Overview [User input], Intellectual merit [User input], Broader impacts [User input]. Ensure it is written in third person, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Project Summary generated for an NSF Center Proposal. Check for spelling, grammar, and clarity errors. Ensure third-person voice, three distinct sections (overview, intellectual merit, broader impacts), and a one-page limit. Correct any issues while maintaining the original intent.',
    'Analyze the edited Project Summary for an NSF Center Proposal. Check for logical consistency (e.g., merit aligns with overview), completeness (e.g., all three sections present), and compliance with PAPPG 2.D.2.b. Flag any discrepancies or omissions that could weaken its impact.',
    NULL,
    'Evaluate the Project Summary against NSF PAPPG Chapter 2.D.2.b as a strict reviewer. Verify it includes overview, intellectual merit, and broader impacts in third person within one page. Reject if it lacks clarity, exceeds the page limit, or omits required sections.',
    'Provide the center''s overview, intellectual merit, and broader impacts.'
),

-- 4. Project Description (Required)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Project Description',
    'A detailed narrative of the proposed center, including its vision, research, management, and outreach.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF Center Proposal per PAPPG Chapter 2.D.2.d. Include subsections on the center''s vision, research plan, management plan, education and outreach, and partnerships. Address interdisciplinary goals, long-term impact, and resource integration. Use the following information: Vision [User input], Research plan [User input], Management plan [User input], Education and outreach [User input], Partnerships [User input]. Ensure it is comprehensive, persuasive, no more than 15 pages unless specified otherwise by the solicitation, formatted as a PDF-ready text document, and includes visuals where appropriate.',
    'Review the Project Description generated for an NSF Center Proposal. Check for spelling, grammar, and clarity errors. Ensure all subsections (vision, research, management, outreach, partnerships) are present and persuasive, within 15 pages unless specified otherwise. Correct any issues while preserving the original intent.',
    'Analyze the edited Project Description for an NSF Center Proposal. Check for logical consistency (e.g., research aligns with vision), completeness (e.g., all subsections included), and compliance with PAPPG 2.D.2.d. Flag any inconsistencies, omissions, or excessive length that could undermine its quality.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description of an NSF Center Proposal. Use the user-provided context (e.g., research plan, partnerships) and image files (if uploaded) to create visuals that enhance clarity of interdisciplinary goals or management structure. Ensure visuals are clear, labeled, professional, and output as PDF-ready PNGs compatible with NSF standards.',
    'Evaluate the Project Description against NSF PAPPG Chapter 2.D.2.d as a strict reviewer. Verify it includes vision, research, management, outreach, and partnerships, addressing interdisciplinary goals and impact within 15 pages unless specified otherwise. Reject if it lacks depth, exceeds page limits, or omits required elements.',
    'Provide the center''s vision, research plan, management plan, education and outreach details, and partnerships.'
),

-- 5. References Cited (Required)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'References Cited',
    'A list of references cited in the Project Description.',
    5,
    false,
    'pdf',
    'Generate a References Cited section for an NSF Center Proposal per PAPPG Chapter 2.D.2.e. Include full citations for all references in the Project Description. Use the following information: List of references [User input]. Ensure the document is formatted as a PDF-ready text document with consistent citation style.',
    'Review the References Cited section generated for an NSF Center Proposal. Check for spelling, grammar, and formatting errors. Ensure all citations are complete and consistently styled per PAPPG 2.D.2.e. Correct any issues while maintaining accuracy.',
    'Analyze the edited References Cited section for an NSF Center Proposal. Check for completeness (e.g., all Project Description references included), accuracy (e.g., correct titles, authors), and compliance with PAPPG 2.D.2.e. Flag any missing or inconsistent citations.',
    NULL,
    'Evaluate the References Cited section against NSF PAPPG Chapter 2.D.2.e as a strict reviewer. Verify all references from the Project Description are cited fully and consistently. Reject if citations are incomplete, inconsistent, or improperly formatted.',
    'Provide a list of references cited in the Project Description.'
),

-- 6. Biographical Sketches (Required)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Biographical Sketches',
    'Biosketches for the PI and co-PIs, highlighting relevant experience.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF Center Proposal per PAPPG Chapter 2.D.2.f. Each sketch should list professional preparation, appointments, products, and synergistic activities. Use the following information: PI and co-PI details [User input]. Ensure each sketch is limited to two pages, formatted as a PDF-ready text document, and adheres to NSF biosketch guidelines.',
    'Review the Biographical Sketches generated for an NSF Center Proposal. Check for spelling, grammar, and formatting errors. Ensure each sketch includes preparation, appointments, products, and activities, within two pages per PAPPG 2.D.2.f. Correct any issues while preserving accuracy.',
    'Analyze the edited Biographical Sketches for an NSF Center Proposal. Check for completeness (e.g., all required sections present), accuracy (e.g., correct dates, products), and compliance with PAPPG 2.D.2.f. Flag any omissions or sketches exceeding two pages.',
    NULL,
    'Evaluate the Biographical Sketches against NSF PAPPG Chapter 2.D.2.f as a strict reviewer. Verify each includes preparation, appointments, products, and activities within two pages. Reject if any are incomplete, inaccurate, or exceed the page limit.',
    'Provide details for the PI and co-PIs (professional preparation, appointments, products, synergistic activities).'
),

-- 7. Budget and Budget Justification (Required)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Budget and Budget Justification',
    'A detailed budget and narrative justification for the center''s expenses.',
    7,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF Center Proposal per PAPPG Chapter 2.D.2.g. Detail all costs (e.g., personnel, equipment, travel) and explain why each is necessary for the center''s operation. Use the following information: Budget details [User input]. Ensure the document is clear, concise, and formatted as a PDF-ready text document.',
    'Review the Budget Justification generated for an NSF Center Proposal. Check for spelling, grammar, and clarity errors. Ensure all costs are detailed and justified per PAPPG 2.D.2.g. Correct any issues while maintaining the original intent.',
    'Analyze the edited Budget Justification for an NSF Center Proposal. Check for logical consistency (e.g., costs align with justifications), completeness (e.g., all budget items covered), and compliance with PAPPG 2.D.2.g. Flag any discrepancies or unjustified costs.',
    NULL,
    'Evaluate the Budget Justification against NSF PAPPG Chapter 2.D.2.g as a strict reviewer. Verify all costs are detailed and justified clearly. Reject if any costs lack explanation, are inconsistent, or violate NSF guidelines.',
    'Provide a breakdown of the budget and justifications for each cost.'
),

-- 8. Current and Pending Support (Required)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Current and Pending Support',
    'A list of current and pending support for the PI and co-PIs.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support section for an NSF Center Proposal per PAPPG Chapter 2.D.2.h. List all current and pending projects, detailing funding sources, project titles, and overlap with this proposal. Use the following information: Support details [User input]. Ensure the document is formatted as a PDF-ready text document.',
    'Review the Current and Pending Support section generated for an NSF Center Proposal. Check for spelling, grammar, and formatting errors. Ensure all projects are listed with required details per PAPPG 2.D.2.h. Correct any issues while maintaining accuracy.',
    'Analyze the edited Current and Pending Support section for an NSF Center Proposal. Check for completeness (e.g., all projects listed), accuracy (e.g., correct funding details), and compliance with PAPPG 2.D.2.h. Flag any omissions or inconsistencies.',
    NULL,
    'Evaluate the Current and Pending Support section against NSF PAPPG Chapter 2.D.2.h as a strict reviewer. Verify all current and pending projects are listed with funding sources, titles, and overlap details. Reject if incomplete, inaccurate, or improperly formatted.',
    'Provide details of all current and pending support for the PI and co-PIs.'
),

-- 9. Facilities, Equipment, and Other Resources (Required)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available to support the center.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF Center Proposal per PAPPG Chapter 2.D.2.i. Describe resources supporting the center (e.g., labs, institutional support). Use the following information: Resources [User input]. Ensure the document is clear and formatted as a PDF-ready text document.',
    'Review the Facilities, Equipment, and Other Resources section generated for an NSF Center Proposal. Check for spelling, grammar, and clarity errors. Ensure all resources are described per PAPPG 2.D.2.i. Correct any issues while maintaining the original intent.',
    'Analyze the edited Facilities, Equipment, and Other Resources section for an NSF Center Proposal. Check for completeness (e.g., all relevant resources included), clarity, and compliance with PAPPG 2.D.2.i. Flag any omissions or vague descriptions.',
    NULL,
    'Evaluate the Facilities, Equipment, and Other Resources section against NSF PAPPG Chapter 2.D.2.i as a strict reviewer. Verify all resources supporting the center are clearly described. Reject if incomplete, unclear, or non-compliant with NSF guidelines.',
    'Provide a description of resources supporting the center.'
),

-- 10. Data Management Plan (Required)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Data Management Plan',
    'A plan for managing and sharing data generated by the center.',
    10,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF Center Proposal per PAPPG Chapter 2.D.2.j. Describe data management and sharing strategies. Use the following information: Data management details [User input]. Ensure the document is formatted as a PDF-ready text document.',
    'Review the Data Management Plan generated for an NSF Center Proposal. Check for spelling, grammar, and clarity errors. Ensure data management and sharing strategies are detailed per PAPPG 2.D.2.j. Correct any issues while maintaining the original intent.',
    'Analyze the edited Data Management Plan for an NSF Center Proposal. Check for logical consistency (e.g., strategies feasible), completeness (e.g., all data types addressed), and compliance with PAPPG 2.D.2.j. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Data Management Plan against NSF PAPPG Chapter 2.D.2.j as a strict reviewer. Verify it details data management and sharing strategies comprehensively. Reject if incomplete, unclear, or non-compliant with NSF policies.',
    'Provide details on data management and sharing strategies.'
),

-- 11. Postdoctoral Mentoring Plan (Conditionally Required, Special Processing)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers if included in the budget.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF Center Proposal per PAPPG Chapter 2.E.7. Describe mentoring activities, professional development, and integration into center goals. Use the following information: Mentoring activities [User input], Professional development [User input], Center integration [User input]. Ensure it is specific, no more than one page, formatted as a PDF-ready text document.',
    'Review the Postdoctoral Mentoring Plan generated for an NSF Center Proposal. Check for spelling, grammar, and clarity errors. Ensure mentoring, development, and integration details are specific within one page per PAPPG 2.E.7. Correct any issues while preserving the original intent.',
    'Analyze the edited Postdoctoral Mentoring Plan for an NSF Center Proposal. Check for logical consistency (e.g., activities support integration), completeness (e.g., all required elements present), and compliance with PAPPG 2.E.7. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Postdoctoral Mentoring Plan against NSF PAPPG Chapter 2.E.7 as a strict reviewer. Verify it details mentoring, development, and integration within one page. Reject if vague, exceeds the page limit, or omits required elements.',
    'Provide mentoring activities, professional development opportunities, and how postdocs integrate into the center.'
),

-- 12. Human Subjects (Conditionally Required, Special Processing)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Human Subjects',
    'Documentation for research involving human subjects, including IRB approval status.',
    12,
    true,
    'pdf',
    'Generate a Human Subjects section for an NSF Center Proposal per PAPPG Chapter 2.E.9. Include a description of the research, risks, protections, and IRB status. Use the following information: Research description [User input], Risks and protections [User input], IRB status [User input]. Ensure compliance with federal regulations, formatted as a PDF-ready text document.',
    'Review the Human Subjects section generated for an NSF Center Proposal. Check for spelling, grammar, and clarity errors. Ensure research, risks, protections, and IRB status are detailed per PAPPG 2.E.9. Correct any issues while maintaining compliance.',
    'Analyze the edited Human Subjects section for an NSF Center Proposal. Check for logical consistency (e.g., protections address risks), completeness (e.g., IRB status included), and compliance with PAPPG 2.E.9 and federal regulations. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Human Subjects section against NSF PAPPG Chapter 2.E.9 as a strict reviewer. Verify it includes research description, risks, protections, and IRB status, complying with federal regulations. Reject if incomplete, non-compliant, or unclear.',
    'Provide the human subjects research description, risks and protections, and IRB approval status.'
),

-- 13. Vertebrate Animals (Conditionally Required, Special Processing)
(
    '4dc27540-e8c9-4dda-99e0-f2e5a8f06b84',
    'Vertebrate Animals',
    'Documentation for research involving vertebrate animals, including IACUC approval.',
    13,
    true,
    'pdf',
    'Generate a Vertebrate Animals section for an NSF Center Proposal per PAPPG Chapter 2.E.9. Include a description of the animal research, justification, pain minimization, euthanasia methods, and IACUC status. Use the following information: Research description [User input], Justification [User input], Pain minimization [User input], Euthanasia methods [User input], IACUC status [User input]. Ensure compliance with PHS policy, formatted as a PDF-ready text document.',
    'Review the Vertebrate Animals section generated for an NSF Center Proposal. Check for spelling, grammar, and clarity errors. Ensure research, justification, pain minimization, euthanasia, and IACUC status are detailed per PAPPG 2.E.9. Correct any issues while maintaining compliance.',
    'Analyze the edited Vertebrate Animals section for an NSF Center Proposal. Check for logical consistency (e.g., justification supports research), completeness (e.g., all elements present), and compliance with PAPPG 2.E.9 and PHS policy. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Vertebrate Animals section against NSF PAPPG Chapter 2.E.9 as a strict reviewer. Verify it includes research description, justification, pain minimization, euthanasia methods, and IACUC status, complying with PHS policy. Reject if incomplete, non-compliant, or unclear.',
    'Provide the animal research description, justification for species and numbers, pain minimization methods, euthanasia methods, and IACUC approval status.'
);





INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt,
    instructions
) VALUES

-- 1. Concept Outline (Optional Pre-Submission)
(
    'c18f1958-d6d1-4484-b561-68e57b59e5d9',
    'Concept Outline',
    'An optional pre-submission section to gauge NSF interest in the CLB Supplemental Funding Request.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF CLB Supplemental Funding Request. Include an introductory paragraph describing the need for the supplement, the type of family leave, and how the leave will impact the research project. Use the following information: Type of leave [User input], Impact on research [User input]. Ensure the document is concise, no more than one page, and formatted as a PDF-ready text document without hyperlinks or URLs.',
    'Review the Concept Outline generated for an NSF CLB Supplemental Funding Request. Check for spelling, grammar, and clarity errors. Ensure the text is concise, compelling, and adheres to a one-page limit. Correct any issues while maintaining the original intent and avoiding hyperlinks unless permitted.',
    'Analyze the edited Concept Outline for an NSF CLB Supplemental Funding Request. Check for logical consistency (e.g., leave type aligns with impact), factual accuracy, and completeness (e.g., all required elements present). Flag any discrepancies or omissions that could weaken its persuasiveness or fail to gauge NSF interest.',
    NULL,
    'Evaluate the Concept Outline against NSF pre-submission expectations as a strict reviewer. Ensure it includes a compelling need for the supplement, type of leave, and impact on research within one page. Reject if it lacks clarity, exceeds the page limit, or includes unpermitted hyperlinks. Ensure it gauges NSF interest effectively.',
    'Provide the type of family leave and its impact on the research project.'
),

-- 2. Letter of Intent (Optional Pre-Submission)
(
    'c18f1958-d6d1-4484-b561-68e57b59e5d9',
    'Letter of Intent',
    'An optional formal notification of intent to submit a CLB Supplemental Funding Request.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF CLB Supplemental Funding Request per PAPPG guidelines. Include the project title, PI name, a brief description of the CLB plan, and the type of family leave. Use the following information: Project title [User input], PI name [User input], CLB plan summary [User input], Type of leave [User input]. Ensure the letter is formal, concise, no more than one page, and formatted as a PDF-ready text document without hyperlinks or URLs.',
    'Review the Letter of Intent generated for an NSF CLB Supplemental Funding Request. Check for spelling, grammar, and formality errors. Ensure the text is concise, adheres to a one-page limit, and meets NSF standards. Correct any issues while preserving the original intent.',
    'Analyze the edited Letter of Intent for an NSF CLB Supplemental Funding Request. Check for logical consistency (e.g., CLB plan aligns with leave type), completeness (e.g., all required elements included), and adherence to NSF standards. Flag any inconsistencies or missing details that could undermine its purpose.',
    NULL,
    'Evaluate the Letter of Intent against NSF PAPPG guidelines as a strict reviewer. Verify it includes the project title, PI name, CLB plan summary, and type of leave within one page. Reject if it lacks formality, exceeds the page limit, or deviates from submission standards.',
    'Provide the project title, PI name, CLB plan summary, and type of family leave.'
),

-- 3. CLB Plan Summary (Required)
(
    'c18f1958-d6d1-4484-b561-68e57b59e5d9',
    'CLB Plan Summary',
    'A summary of the Career Life Balance plan, detailing the need for supplemental funding and how it will maintain research productivity during family leave, as required by PAPPG Chapter 2.F.13.',
    3,
    false,
    'pdf',
    'Generate a CLB Plan Summary for an NSF CLB Supplemental Funding Request per PAPPG Chapter 2.F.13. Include the type of family leave, how the leave will impact the research project, and how the supplemental funding will be used to maintain productivity. Use the following information: Type of leave [User input], Impact on research [User input], Use of funding [User input]. Ensure the document is clear, concise, and formatted as a PDF-ready text document without hyperlinks or URLs.',
    'Review the CLB Plan Summary generated for an NSF CLB Supplemental Funding Request. Check for spelling, grammar, and clarity errors. Ensure the text is concise, professional, and adheres to NSF standards. Correct any issues while maintaining the original intent.',
    'Analyze the edited CLB Plan Summary for an NSF CLB Supplemental Funding Request. Check for logical consistency (e.g., leave type aligns with impact and funding use), completeness (e.g., all required elements present), and compliance with PAPPG Chapter 2.F.13. Flag any discrepancies or omissions that could weaken its justification.',
    NULL,
    'Evaluate the CLB Plan Summary against NSF PAPPG Chapter 2.F.13 requirements as a strict reviewer. Verify it includes the type of leave, impact on research, and use of funding. Reject if any element is missing, inadequately justified, or non-compliant with NSF guidelines.',
    'Provide the type of family leave, its impact on the research project, and how the supplemental funding will be used.'
),

-- 4. Budget and Budget Justification (Required)
(
    'c18f1958-d6d1-4484-b561-68e57b59e5d9',
    'Budget and Budget Justification',
    'A detailed budget and narrative justification for the supplemental funding, as required by PAPPG Chapter 6.E.4.',
    4,
    false,
    'pdf',
    'Generate a Budget and Budget Justification for an NSF CLB Supplemental Funding Request per PAPPG Chapter 6.E.4. Detail all requested costs (e.g., temporary personnel, travel) and explain why each is necessary to maintain research productivity during family leave. Use the following information: Budget details [User input]. Ensure the document is clear, concise, and formatted as a PDF-ready text document without hyperlinks or URLs.',
    'Review the Budget and Budget Justification generated for an NSF CLB Supplemental Funding Request. Check for spelling, grammar, and clarity errors. Ensure all costs are detailed and justified per NSF standards. Correct any issues while maintaining the original intent.',
    'Analyze the edited Budget and Budget Justification for an NSF CLB Supplemental Funding Request. Check for logical consistency (e.g., costs align with justifications), completeness (e.g., all budget items covered), and compliance with PAPPG Chapter 6.E.4. Flag any discrepancies or unjustified costs.',
    NULL,
    'Evaluate the Budget and Budget Justification against NSF PAPPG Chapter 6.E.4 as a strict reviewer. Verify all costs are justified, allowable, and reasonable. Reject if any cost lacks justification, is inconsistent, or violates NSF guidelines.',
    'Provide a breakdown of the budget and justifications for each cost.'
),

-- 5. Current and Pending Support (Conditionally Required per Special Processing Instructions)
(
    'c18f1958-d6d1-4484-b561-68e57b59e5d9',
    'Current and Pending Support',
    'A list of current and pending support for the PI, required if specified by the program or solicitation per PAPPG Chapter 2.E.',
    5,
    true,
    'pdf',
    'Generate a Current and Pending Support section for an NSF CLB Supplemental Funding Request, if required by the program. List all current and pending projects, detailing funding sources, project titles, and overlap with this supplement. Use the following information: Support details [User input]. Ensure the document is formatted as a PDF-ready text document without hyperlinks or URLs.',
    'Review the Current and Pending Support section generated for an NSF CLB Supplemental Funding Request. Check for spelling, grammar, and formatting errors. Ensure all projects are listed with required details per NSF standards. Correct any issues while maintaining accuracy.',
    'Analyze the edited Current and Pending Support section for an NSF CLB Supplemental Funding Request. Check for completeness (e.g., all projects listed), accuracy (e.g., correct funding details), and compliance with NSF requirements. Flag any omissions or inconsistencies.',
    NULL,
    'Evaluate the Current and Pending Support section against NSF PAPPG Chapter 2.E requirements as a strict reviewer. Verify all current and pending projects are listed with funding sources, titles, and overlap details. Reject if incomplete, inaccurate, or improperly formatted.',
    'Provide details of all current and pending support, if required by the program.'
);


INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt,
    instructions
) VALUES

-- 1. Concept Outline (Optional Pre-Submission)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Concept Outline',
    'An optional pre-submission document to gauge NSF interest in the proposed research infrastructure project.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF Research Infrastructure Proposal per PAPPG guidelines. Include an introductory paragraph describing the infrastructure project''s theme, significance, and interdisciplinary approach, followed by a concise outline of its goals and potential impact. Use the following information: Infrastructure theme [User input], Significance [User input], Goals [User input]. Ensure the document is compelling, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted by the solicitation.',
    'Review the Concept Outline for an NSF Research Infrastructure Proposal. Check for spelling, grammar, and clarity errors. Ensure the text is concise, compelling, and adheres to a one-page limit. Correct any issues while preserving the original intent and avoiding unpermitted hyperlinks.',
    'Analyze the edited Concept Outline for logical consistency (e.g., theme aligns with goals), factual accuracy, and completeness (e.g., includes theme, significance, goals, impact). Flag any discrepancies or omissions that could weaken its persuasiveness or fail to gauge NSF interest.',
    NULL,
    'Evaluate the Concept Outline as a strict NSF reviewer. Ensure it includes a compelling theme, significance, interdisciplinary approach, goals, and impact within one page. Reject if it lacks clarity, exceeds the page limit, includes unpermitted hyperlinks, or fails to engage NSF interest.',
    'Provide the infrastructure project''s theme, significance, and goals.'
),

-- 2. Letter of Intent (Optional Pre-Submission)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Letter of Intent',
    'An optional formal notification of intent to submit a Research Infrastructure Proposal.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF Research Infrastructure Proposal per PAPPG guidelines. Include the project title, PI name, a brief description of the infrastructure project''s theme and objectives, and anticipated collaborators. Use the following information: Project title [User input], PI name [User input], Project description [User input], Collaborators [User input]. Ensure the letter is formal, concise, no more than one page, and formatted as a PDF-ready text document without hyperlinks.',
    'Review the Letter of Intent for spelling, grammar, and formality errors. Ensure it is concise, adheres to a one-page limit, and meets NSF standards. Correct any issues while maintaining the original intent.',
    'Analyze the edited Letter of Intent for logical consistency (e.g., objectives align with theme), completeness (e.g., includes title, PI, description, collaborators), and adherence to NSF standards. Flag any inconsistencies or missing details.',
    NULL,
    'Evaluate the Letter of Intent as a strict NSF reviewer per PAPPG guidelines. Verify it includes project title, PI name, project description, and collaborators within one page. Reject if it lacks formality, exceeds the page limit, or omits required elements.',
    'Provide the project title, PI name, project description, and list of anticipated collaborators.'
),

-- 3. Project Summary (Required)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Project Summary',
    'A concise summary of the Research Infrastructure Proposal, including intellectual merit and broader impacts.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.D.2.b. Include three distinct sections: an overview of the infrastructure project, its intellectual merit, and broader impacts. Use the following information: Overview [User input], Intellectual merit [User input], Broader impacts [User input]. Ensure it is written in third person, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Project Summary for spelling, grammar, and clarity errors. Ensure third-person voice, three distinct sections (overview, intellectual merit, broader impacts), and a one-page limit. Correct any issues while maintaining the original intent.',
    'Analyze the edited Project Summary for logical consistency (e.g., merit aligns with overview), completeness (e.g., all three sections present), and compliance with PAPPG 2.D.2.b. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Project Summary as a strict NSF reviewer per PAPPG Chapter 2.D.2.b. Verify it includes overview, intellectual merit, and broader impacts in third person within one page. Reject if it lacks clarity, exceeds the page limit, or omits required sections.',
    'Provide the infrastructure project''s overview, intellectual merit, and broader impacts.'
),

-- 4. Project Description (Required)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Project Description',
    'A detailed narrative of the proposed research infrastructure, including design, development, and utilization plans.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.D.2.d and 2.F.12. Include subsections on the infrastructure''s design, development plan, utilization strategy, management plan, and sustainability. Address how it advances research capabilities and broader impacts. Use the following information: Design [User input], Development plan [User input], Utilization strategy [User input], Management plan [User input], Sustainability [User input]. Ensure it is comprehensive, persuasive, no more than 15 pages unless specified otherwise, formatted as a PDF-ready text document, and includes visuals where appropriate.',
    'Review the Project Description for spelling, grammar, and clarity errors. Ensure all subsections (design, development, utilization, management, sustainability) are present and persuasive, within 15 pages unless specified otherwise. Correct any issues while preserving the original intent.',
    'Analyze the edited Project Description for logical consistency (e.g., design supports utilization), completeness (e.g., all subsections included), and compliance with PAPPG 2.D.2.d and 2.F.12. Flag any inconsistencies, omissions, or excessive length.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description. Use the user-provided context (e.g., design, utilization strategy) and image files (if uploaded) to create visuals that enhance clarity of the infrastructure''s design or management structure. Ensure visuals are clear, labeled, professional, and output as PDF-ready PNGs compatible with NSF standards.',
    'Evaluate the Project Description as a strict NSF reviewer per PAPPG Chapter 2.D.2.d and 2.F.12. Verify it includes design, development, utilization, management, and sustainability, addressing research capabilities and broader impacts within 15 pages unless specified otherwise. Reject if it lacks depth, exceeds page limits, or omits required elements.',
    'Provide the infrastructure''s design, development plan, utilization strategy, management plan, and sustainability details.'
),

-- 5. References Cited (Required)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'References Cited',
    'A list of references cited in the Project Description.',
    5,
    false,
    'pdf',
    'Generate a References Cited section for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.D.2.e. Include full citations for all references in the Project Description. Use the following information: List of references [User input]. Ensure the document is formatted as a PDF-ready text document with consistent citation style.',
    'Review the References Cited section for spelling, grammar, and formatting errors. Ensure all citations are complete and consistently styled per PAPPG 2.D.2.e. Correct any issues while maintaining accuracy.',
    'Analyze the edited References Cited section for completeness (e.g., all Project Description references included), accuracy (e.g., correct titles, authors), and compliance with PAPPG 2.D.2.e. Flag any missing or inconsistent citations.',
    NULL,
    'Evaluate the References Cited section as a strict NSF reviewer per PAPPG Chapter 2.D.2.e. Verify all references from the Project Description are cited fully and consistently. Reject if citations are incomplete, inconsistent, or improperly formatted.',
    'Provide a list of references cited in the Project Description.'
),

-- 6. Biographical Sketches (Required)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Biographical Sketches',
    'Biosketches for the PI and co-PIs, highlighting relevant experience for the infrastructure project.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.D.2.f. Each sketch should list professional preparation, appointments, products, and synergistic activities relevant to the infrastructure project. Use the following information: PI and co-PI details [User input]. Ensure each sketch is limited to two pages, formatted as a PDF-ready text document, and adheres to NSF biosketch guidelines.',
    'Review the Biographical Sketches for spelling, grammar, and formatting errors. Ensure each sketch includes preparation, appointments, products, and activities within two pages per PAPPG 2.D.2.f. Correct any issues while maintaining accuracy.',
    'Analyze the edited Biographical Sketches for completeness (e.g., all required sections present), accuracy (e.g., correct dates, products), and compliance with PAPPG 2.D.2.f. Flag any omissions or sketches exceeding two pages.',
    NULL,
    'Evaluate the Biographical Sketches as a strict NSF reviewer per PAPPG Chapter 2.D.2.f. Verify each includes preparation, appointments, products, and activities within two pages. Reject if any are incomplete, inaccurate, or exceed the page limit.',
    'Provide details for the PI and co-PIs (professional preparation, appointments, products, synergistic activities).'
),

-- 7. Budget and Budget Justification (Required)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Budget and Budget Justification',
    'A detailed budget and narrative justification for the infrastructure project''s expenses.',
    7,
    false,
    'pdf',
    'Generate a Budget Justification for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.D.2.g. Detail all costs (e.g., equipment, construction, maintenance) and explain why each is necessary for the infrastructure project. Use the following information: Budget details [User input]. Ensure the document is clear, concise, and formatted as a PDF-ready text document without hyperlinks.',
    'Review the Budget Justification for spelling, grammar, and clarity errors. Ensure all costs are detailed and justified per NSF standards. Correct any issues while maintaining the original intent.',
    'Analyze the edited Budget Justification for logical consistency (e.g., costs align with justifications), completeness (e.g., all budget items covered), and compliance with PAPPG Chapter 2.D.2.g. Flag any discrepancies or unjustified costs.',
    NULL,
    'Evaluate the Budget Justification as a strict NSF reviewer per PAPPG Chapter 2.D.2.g. Verify all costs are justified, allowable, and reasonable. Reject if any cost lacks justification, is inconsistent, or violates NSF guidelines.',
    'Provide a breakdown of the budget and justifications for each cost.'
),

-- 8. Current and Pending Support (Required)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Current and Pending Support',
    'A list of current and pending support for the PI and co-PIs.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support section for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.D.2.h. List all current and pending projects, detailing funding sources, project titles, and overlap with this proposal. Use the following information: Support details [User input]. Ensure the document is formatted as a PDF-ready text document without hyperlinks.',
    'Review the Current and Pending Support section for spelling, grammar, and formatting errors. Ensure all projects are listed with required details per NSF standards. Correct any issues while maintaining accuracy.',
    'Analyze the edited Current and Pending Support section for completeness (e.g., all projects listed), accuracy (e.g., correct funding details), and compliance with PAPPG 2.D.2.h. Flag any omissions or inconsistencies.',
    NULL,
    'Evaluate the Current and Pending Support section as a strict NSF reviewer per PAPPG Chapter 2.D.2.h. Verify all current and pending projects are listed with funding sources, titles, and overlap details. Reject if incomplete, inaccurate, or improperly formatted.',
    'Provide details of all current and pending support for the PI and co-PIs.'
),

-- 9. Facilities, Equipment, and Other Resources (Required)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Facilities, Equipment, and Other Resources',
    'A description of existing resources that will support the proposed infrastructure project.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.D.2.i. Describe existing resources (e.g., labs, equipment, institutional support) that will complement the proposed infrastructure. Use the following information: Resources [User input]. Ensure the document is clear, concise, and formatted as a PDF-ready text document without hyperlinks.',
    'Review the Facilities, Equipment, and Other Resources section for spelling, grammar, and clarity errors. Ensure all resources are described per PAPPG 2.D.2.i. Correct any issues while maintaining the original intent.',
    'Analyze the edited Facilities, Equipment, and Other Resources section for completeness (e.g., all relevant resources included), clarity, and compliance with PAPPG 2.D.2.i. Flag any omissions or vague descriptions.',
    NULL,
    'Evaluate the Facilities, Equipment, and Other Resources section as a strict NSF reviewer per PAPPG Chapter 2.D.2.i. Verify all resources supporting the infrastructure project are clearly described. Reject if incomplete, unclear, or non-compliant.',
    'Provide a description of existing resources that will support the infrastructure project.'
),

-- 10. Data Management Plan (Required)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Data Management Plan',
    'A plan for managing and sharing data generated by the infrastructure project.',
    10,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.D.2.j. Describe data management and sharing strategies, ensuring compliance with NSF''s data sharing policies. Use the following information: Data management details [User input]. Ensure the document is formatted as a PDF-ready text document without hyperlinks.',
    'Review the Data Management Plan for spelling, grammar, and clarity errors. Ensure data management and sharing strategies are detailed per PAPPG 2.D.2.j. Correct any issues while maintaining the original intent.',
    'Analyze the edited Data Management Plan for logical consistency (e.g., strategies feasible), completeness (e.g., all data types addressed), and compliance with PAPPG 2.D.2.j. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Data Management Plan as a strict NSF reviewer per PAPPG Chapter 2.D.2.j. Verify it details data management and sharing strategies comprehensively. Reject if incomplete, unclear, or non-compliant with NSF policies.',
    'Provide details on data management and sharing strategies for the infrastructure project.'
),

-- 11. Postdoctoral Mentoring Plan (Conditionally Required, Special Processing)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers if included in the budget.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.E.7. Describe mentoring activities, professional development, and integration into infrastructure goals. Use the following information: Mentoring activities [User input], Professional development [User input], Infrastructure integration [User input]. Ensure it is specific, no more than one page, formatted as a PDF-ready text document without hyperlinks.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity errors. Ensure mentoring, development, and integration details are specific within one page per PAPPG 2.E.7. Correct any issues while preserving the original intent.',
    'Analyze the edited Postdoctoral Mentoring Plan for logical consistency (e.g., activities support integration), completeness (e.g., all required elements present), and compliance with PAPPG 2.E.7. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Postdoctoral Mentoring Plan as a strict NSF reviewer per PAPPG Chapter 2.E.7. Verify it details mentoring, development, and integration within one page. Reject if vague, exceeds the page limit, or omits required elements.',
    'Provide mentoring activities, professional development opportunities, and how postdocs integrate into the infrastructure project, if applicable.'
),

-- 12. Human Subjects (Conditionally Required, Special Processing)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Human Subjects',
    'Documentation for research involving human subjects, including IRB approval status, if applicable.',
    12,
    true,
    'pdf',
    'Generate a Human Subjects section for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.E.9. Include a description of the research involving human subjects, risks and protections, and IRB approval status (or exemption justification). Use the following information: Research description [User input], Risks and protections [User input], IRB status [User input]. Ensure compliance with federal regulations, formatted as a PDF-ready text document without hyperlinks.',
    'Review the Human Subjects section for spelling, grammar, and clarity errors. Ensure research, risks, protections, and IRB status are detailed per PAPPG 2.E.9. Correct any issues while maintaining compliance.',
    'Analyze the edited Human Subjects section for logical consistency (e.g., protections address risks), completeness (e.g., IRB status included), and compliance with PAPPG 2.E.9 and federal regulations. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Human Subjects section as a strict NSF reviewer per PAPPG Chapter 2.E.9. Verify it includes research description, risks, protections, and IRB status, complying with federal regulations. Reject if incomplete, non-compliant, or unclear.',
    'Provide the human subjects research description, risks and protections, and IRB approval status, if applicable.'
),

-- 13. Vertebrate Animals (Conditionally Required, Special Processing)
(
    'f64cdab7-ce1a-4e03-a022-339e1d0313f3',
    'Vertebrate Animals',
    'Documentation for research involving vertebrate animals, including IACUC approval, if applicable.',
    13,
    true,
    'pdf',
    'Generate a Vertebrate Animals section for an NSF Research Infrastructure Proposal per PAPPG Chapter 2.E.9. Include a description of the animal research, justification for species and numbers, pain minimization, euthanasia methods, and IACUC approval status. Use the following information: Research description [User input], Justification [User input], Pain minimization [User input], Euthanasia methods [User input], IACUC status [User input]. Ensure compliance with PHS policy, formatted as a PDF-ready text document without hyperlinks.',
    'Review the Vertebrate Animals section for spelling, grammar, and clarity errors. Ensure research, justification, pain minimization, euthanasia, and IACUC status are detailed per PAPPG 2.E.9. Correct any issues while maintaining compliance.',
    'Analyze the edited Vertebrate Animals section for logical consistency (e.g., justification supports research), completeness (e.g., all elements present), and compliance with PAPPG 2.E.9 and PHS policy. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Vertebrate Animals section as a strict NSF reviewer per PAPPG Chapter 2.E.9. Verify it includes research description, justification, pain minimization, euthanasia methods, and IACUC status, complying with PHS policy. Reject if incomplete, non-compliant, or unclear.',
    'Provide the animal research description, justification for species and numbers, pain minimization methods, euthanasia methods, and IACUC approval status, if applicable.'
);




INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt,
    instructions
) VALUES

-- 1. Concept Outline (Optional Pre-Submission)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Concept Outline',
    'An optional pre-submission document to gauge NSF interest in the proposed research opportunity.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF ROA-PUI Supplemental Funding Request per PAPPG guidelines. Include an introductory paragraph describing the research opportunity''s theme, significance, and alignment with NSF goals for Predominantly Undergraduate Institutions (PUIs). Use the following information provided by the grant writer: Research theme [User input], Significance [User input], Alignment with NSF goals [User input]. Ensure the document is compelling, concise, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted by the solicitation.',
    'Review the Concept Outline for spelling, grammar, and clarity errors. Ensure it is concise, compelling, and adheres to a one-page limit. Correct any issues while preserving the original intent and avoiding unpermitted hyperlinks.',
    'Analyze the edited Concept Outline for logical consistency (e.g., theme aligns with significance and NSF goals), completeness (e.g., includes theme, significance, alignment), and persuasiveness. Flag any discrepancies or omissions that could weaken its ability to gauge NSF interest.',
    NULL,
    'Evaluate the Concept Outline as a strict NSF reviewer. Verify it includes a compelling theme, significance, and alignment with NSF goals within one page. Reject if it lacks clarity, exceeds the page limit, includes unpermitted hyperlinks, or fails to engage NSF interest effectively.',
    'Provide the research opportunity''s theme, significance, and alignment with NSF goals.'
),

-- 2. Letter of Intent (Optional Pre-Submission)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Letter of Intent',
    'An optional formal notification of intent to submit a proposal for ROA-PUI supplemental funding.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF ROA-PUI Supplemental Funding Request per PAPPG guidelines. Include the project title, PI name, a brief description of the research opportunity, and anticipated collaborators from PUIs. Use the following information provided by the grant writer: Project title [User input], PI name [User input], Research description [User input], Collaborators [User input]. Ensure the letter is formal, concise, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Letter of Intent for spelling, grammar, and formality errors. Ensure it is concise, adheres to a one-page limit, and meets NSF standards. Correct any issues while maintaining the original intent.',
    'Analyze the edited Letter of Intent for logical consistency (e.g., research description aligns with collaborators), completeness (e.g., includes title, PI, description, collaborators), and adherence to NSF standards. Flag any inconsistencies or missing elements.',
    NULL,
    'Evaluate the Letter of Intent as a strict NSF reviewer per PAPPG guidelines. Verify it includes project title, PI name, research description, and collaborators within one page. Reject if it lacks formality, exceeds the page limit, or omits required elements.',
    'Provide the project title, PI name, research description, and list of anticipated collaborators.'
),

-- 3. Project Summary (Required)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Project Summary',
    'A concise summary of the proposed research opportunity, including intellectual merit and broader impacts, tailored for ROA-PUI.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.D.2.b. Include three distinct sections: an overview of the research opportunity, its intellectual merit, and broader impacts, emphasizing the involvement of PUIs. Use the following information provided by the grant writer: Overview [User input], Intellectual merit [User input], Broader impacts [User input]. Ensure it is written in third person, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Project Summary for spelling, grammar, and clarity errors. Ensure third-person voice, three distinct sections (overview, intellectual merit, broader impacts), and a one-page limit. Correct any issues while maintaining the original intent.',
    'Analyze the edited Project Summary for logical consistency (e.g., merit aligns with overview), completeness (e.g., all three sections present), and compliance with PAPPG 2.D.2.b. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Project Summary as a strict NSF reviewer per PAPPG Chapter 2.D.2.b. Verify it includes overview, intellectual merit, and broader impacts in third person within one page. Reject if it lacks clarity, exceeds the page limit, or omits required sections.',
    'Provide the research opportunity''s overview, intellectual merit, and broader impacts.'
),

-- 4. Project Description (Required)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Project Description',
    'A detailed narrative of the proposed research opportunity, including the research plan, educational impact, and collaboration with PUIs.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.D.2.d and 2.F.14. Include subsections on the research plan, educational impact, collaboration with PUIs, and how the supplement enhances research capacity at the PUI. Use the following information provided by the grant writer: Research plan [User input], Educational impact [User input], Collaboration details [User input]. Ensure it is comprehensive, persuasive, no more than 15 pages unless specified otherwise, formatted as a PDF-ready text document, and includes visuals where beneficial.',
    'Review the Project Description for spelling, grammar, and clarity errors. Ensure all subsections (research plan, educational impact, collaboration) are present and persuasive, within 15 pages unless specified otherwise. Correct any issues while preserving the original intent.',
    'Analyze the edited Project Description for logical consistency (e.g., research plan supports educational impact), completeness (e.g., all subsections included), and compliance with PAPPG 2.D.2.d and 2.F.14. Flag any inconsistencies, omissions, or excessive length.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the grant writer''s context and uploaded image files (if any). Use the provided information (e.g., research plan, collaboration details) to create visuals that enhance clarity of the research opportunity or collaboration structure. Ensure visuals are clear, labeled, professional, and output as PDF-ready PNGs compatible with NSF standards.',
    'Evaluate the Project Description as a strict NSF reviewer per PAPPG Chapter 2.D.2.d and 2.F.14. Verify it includes research plan, educational impact, and collaboration details, addressing how the supplement enhances PUI research capacity within 15 pages unless specified otherwise. Reject if it lacks depth, exceeds page limits, or omits required elements.',
    'Provide the research plan, educational impact, and collaboration details with PUIs.'
),

-- 5. References Cited (Required)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'References Cited',
    'A list of references cited in the Project Description.',
    5,
    false,
    'pdf',
    'Generate a References Cited section for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.D.2.e. Include full citations for all references mentioned in the Project Description. Use the following information provided by the grant writer: List of references [User input]. Ensure the document uses a consistent citation style, is formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the References Cited section for spelling, grammar, and formatting errors. Ensure all citations are complete and consistently styled per PAPPG 2.D.2.e. Correct any issues while maintaining accuracy.',
    'Analyze the edited References Cited section for completeness (e.g., all Project Description references included), accuracy (e.g., correct titles, authors), and compliance with PAPPG 2.D.2.e. Flag any missing or inconsistent citations.',
    NULL,
    'Evaluate the References Cited section as a strict NSF reviewer per PAPPG Chapter 2.D.2.e. Verify all references from the Project Description are cited fully and consistently. Reject if citations are incomplete, inconsistent, or improperly formatted.',
    'Provide a list of references cited in the Project Description.'
),

-- 6. Biographical Sketches (Required)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Biographical Sketches',
    'Biosketches for the PI and co-PIs, highlighting relevant experience for the research opportunity.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.D.2.f. For each PI and co-PI, include professional preparation, appointments, products, and synergistic activities relevant to the research opportunity. Use the following information provided by the grant writer: PI and co-PI details [User input]. Ensure each sketch is no more than two pages, formatted as a PDF-ready text document, and adheres to NSF biosketch guidelines.',
    'Review the Biographical Sketches for spelling, grammar, and formatting errors. Ensure each sketch includes preparation, appointments, products, and activities within two pages per PAPPG 2.D.2.f. Correct any issues while maintaining accuracy.',
    'Analyze the edited Biographical Sketches for completeness (e.g., all required sections present), accuracy (e.g., correct dates, products), and compliance with PAPPG 2.D.2.f. Flag any omissions or sketches exceeding two pages.',
    NULL,
    'Evaluate the Biographical Sketches as a strict NSF reviewer per PAPPG Chapter 2.D.2.f. Verify each includes preparation, appointments, products, and activities within two pages. Reject if any are incomplete, inaccurate, or exceed the page limit.',
    'Provide details for the PI and co-PIs (professional preparation, appointments, products, synergistic activities).'
),

-- 7. Budget and Budget Justification (Required)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Budget and Budget Justification',
    'A detailed budget and narrative justification for the supplemental funding.',
    7,
    false,
    'pdf',
    'Generate a Budget and Budget Justification for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.D.2.g. Detail all costs (e.g., personnel, travel, equipment) and provide a narrative justifying their necessity for the research opportunity at the PUI. Use the following information provided by the grant writer: Budget details [User input]. Ensure the document is clear, concise, no more than five pages, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Budget and Budget Justification for spelling, grammar, and clarity errors. Ensure all costs are detailed and justified within five pages per PAPPG 2.D.2.g. Correct any issues while maintaining the original intent.',
    'Analyze the edited Budget and Budget Justification for logical consistency (e.g., costs align with justifications), completeness (e.g., all budget items covered), and compliance with PAPPG 2.D.2.g. Flag any discrepancies or unjustified costs.',
    NULL,
    'Evaluate the Budget and Budget Justification as a strict NSF reviewer per PAPPG Chapter 2.D.2.g. Verify all costs are justified, allowable, and reasonable within five pages. Reject if any cost lacks justification, is inconsistent, or violates NSF guidelines.',
    'Provide a breakdown of the budget and justifications for each cost.'
),

-- 8. Current and Pending Support (Required)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Current and Pending Support',
    'A list of current and pending support for the PI and co-PIs.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support section for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.D.2.h. List all current and pending projects, including funding sources, project titles, and effort overlap with this proposal. Use the following information provided by the grant writer: Support details [User input]. Ensure the document is formatted as a PDF-ready text document and avoids hyperlinks unless permitted.',
    'Review the Current and Pending Support section for spelling, grammar, and formatting errors. Ensure all projects are listed with required details per PAPPG 2.D.2.h. Correct any issues while maintaining accuracy.',
    'Analyze the edited Current and Pending Support section for completeness (e.g., all projects listed), accuracy (e.g., correct funding details), and compliance with PAPPG 2.D.2.h. Flag any omissions or inconsistencies.',
    NULL,
    'Evaluate the Current and Pending Support section as a strict NSF reviewer per PAPPG Chapter 2.D.2.h. Verify all current and pending projects are listed with funding sources, titles, and overlap details. Reject if incomplete, inaccurate, or improperly formatted.',
    'Provide details of all current and pending support for the PI and co-PIs.'
),

-- 9. Facilities, Equipment, and Other Resources (Required)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available for the research opportunity at the PUI.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.D.2.i. Describe resources (e.g., labs, equipment, institutional support) at the PUI that will support the research opportunity. Use the following information provided by the grant writer: Resources [User input]. Ensure the document is clear, concise, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Facilities, Equipment, and Other Resources section for spelling, grammar, and clarity errors. Ensure all resources are described per PAPPG 2.D.2.i. Correct any issues while maintaining the original intent.',
    'Analyze the edited Facilities, Equipment, and Other Resources section for completeness (e.g., all relevant resources included), clarity, and compliance with PAPPG 2.D.2.i. Flag any omissions or vague descriptions.',
    NULL,
    'Evaluate the Facilities, Equipment, and Other Resources section as a strict NSF reviewer per PAPPG Chapter 2.D.2.i. Verify all resources supporting the research opportunity are clearly described. Reject if incomplete, unclear, or non-compliant.',
    'Provide a description of resources available at the PUI for the research opportunity.'
),

-- 10. Data Management Plan (Required)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Data Management Plan',
    'A plan for managing and sharing data generated by the research opportunity.',
    10,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.D.2.j. Describe data management and sharing strategies, including data types, storage, access, and compliance with NSF''s data sharing policies. Use the following information provided by the grant writer: Data management details [User input]. Ensure the document is no more than two pages, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Data Management Plan for spelling, grammar, and clarity errors. Ensure data management and sharing strategies are detailed within two pages per PAPPG 2.D.2.j. Correct any issues while maintaining the original intent.',
    'Analyze the edited Data Management Plan for logical consistency (e.g., strategies feasible), completeness (e.g., all data types addressed), and compliance with PAPPG 2.D.2.j. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Data Management Plan as a strict NSF reviewer per PAPPG Chapter 2.D.2.j. Verify it details data management and sharing strategies comprehensively within two pages. Reject if incomplete, unclear, or non-compliant with NSF policies.',
    'Provide details on data management and sharing strategies for the research opportunity.'
),

-- 11. Postdoctoral Mentoring Plan (Conditionally Required per PAPPG 2.E.7)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers if included in the budget.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.E.7. Describe mentoring activities, professional development opportunities, and integration into the research opportunity goals. Use the following information provided by the grant writer: Mentoring activities [User input], Professional development [User input], Integration details [User input]. Ensure it is specific, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity errors. Ensure mentoring, development, and integration details are specific within one page per PAPPG 2.E.7. Correct any issues while preserving the original intent.',
    'Analyze the edited Postdoctoral Mentoring Plan for logical consistency (e.g., activities support integration), completeness (e.g., all required elements present), and compliance with PAPPG 2.E.7. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Postdoctoral Mentoring Plan as a strict NSF reviewer per PAPPG Chapter 2.E.7. Verify it details mentoring, development, and integration within one page. Reject if vague, exceeds the page limit, or omits required elements.',
    'Provide mentoring activities, professional development opportunities, and how postdocs integrate into the research opportunity, if applicable.'
),

-- 12. Human Subjects (Conditionally Required per PAPPG 2.E.9)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Human Subjects',
    'Documentation for research involving human subjects, including IRB approval status, if applicable.',
    12,
    true,
    'pdf',
    'Generate a Human Subjects section for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.E.9. Include a description of the research involving human subjects, risks and protections, and IRB approval status (or exemption justification). Use the following information provided by the grant writer: Research description [User input], Risks and protections [User input], IRB status [User input]. Ensure compliance with federal regulations (45 CFR 46), formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Human Subjects section for spelling, grammar, and clarity errors. Ensure research, risks, protections, and IRB status are detailed per PAPPG 2.E.9. Correct any issues while maintaining compliance.',
    'Analyze the edited Human Subjects section for logical consistency (e.g., protections address risks), completeness (e.g., IRB status included), and compliance with PAPPG 2.E.9 and 45 CFR 46. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Human Subjects section as a strict NSF reviewer per PAPPG Chapter 2.E.9. Verify it includes research description, risks, protections, and IRB status, complying with federal regulations. Reject if incomplete, non-compliant, or unclear.',
    'Provide the human subjects research description, risks and protections, and IRB approval status, if applicable.'
),

-- 13. Vertebrate Animals (Conditionally Required per PAPPG 2.E.9)
(
    '21984935-bb0f-475b-9ef3-a51c46a25a49',
    'Vertebrate Animals',
    'Documentation for research involving vertebrate animals, including IACUC approval, if applicable.',
    13,
    true,
    'pdf',
    'Generate a Vertebrate Animals section for an NSF ROA-PUI Supplemental Funding Request per PAPPG Chapter 2.E.9. Include a description of the animal research, justification for species and numbers, pain minimization, euthanasia methods, and IACUC approval status. Use the following information provided by the grant writer: Research description [User input], Justification [User input], Pain minimization [User input], Euthanasia methods [User input], IACUC status [User input]. Ensure compliance with PHS policy, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Vertebrate Animals section for spelling, grammar, and clarity errors. Ensure research, justification, pain minimization, euthanasia, and IACUC status are detailed per PAPPG 2.E.9. Correct any issues while maintaining compliance.',
    'Analyze the edited Vertebrate Animals section for logical consistency (e.g., justification supports research), completeness (e.g., all elements present), and compliance with PAPPG 2.E.9 and PHS policy. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Vertebrate Animals section as a strict NSF reviewer per PAPPG Chapter 2.E.9. Verify it includes research description, justification, pain minimization, euthanasia methods, and IACUC status, complying with PHS policy. Reject if incomplete, non-compliant, or unclear.',
    'Provide the animal research description, justification for species and numbers, pain minimization methods, euthanasia methods, and IACUC approval status, if applicable.'
);




-- Insert sections into public.grant_sections for NSF Conference Proposal
-- Grant ID: d62b155b-805e-4fec-9fc9-1ab4c89f4b5f
INSERT INTO public.grant_sections (
    grant_id, name, description, flow_order, optional, output_type,
    ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, instructions
) VALUES

-- 1. Concept Outline (Optional Pre-Submission)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Concept Outline',
    'An optional pre-submission document to gauge NSF interest in the proposed conference.',
    1,
    true,
    'pdf',
    'Generate a Concept Outline for an NSF Conference Proposal. Include an introductory paragraph describing the conference''s theme, significance, and alignment with NSF goals. Use the following information provided by the grant writer: Conference theme [User input], Significance [User input], Alignment with NSF goals [User input]. Ensure the document is compelling, concise, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted by the solicitation.',
    'Review the Concept Outline for spelling, grammar, and clarity errors. Ensure it is concise, compelling, and adheres to a one-page limit. Correct any issues while preserving the original intent and avoiding unpermitted hyperlinks.',
    'Analyze the edited Concept Outline for logical consistency (e.g., theme aligns with significance and NSF goals), completeness (e.g., includes theme, significance, alignment), and persuasiveness. Flag any discrepancies or omissions that could weaken its ability to gauge NSF interest.',
    NULL,
    'Evaluate the Concept Outline as a strict NSF reviewer. Verify it includes a compelling theme, significance, and alignment with NSF goals within one page. Reject if it lacks clarity, exceeds the page limit, includes unpermitted hyperlinks, or fails to engage NSF interest effectively.',
    'Provide the conference''s theme, significance, and alignment with NSF goals.'
),

-- 2. Letter of Intent (Optional Pre-Submission)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Letter of Intent',
    'An optional formal notification of intent to submit a Conference Proposal.',
    2,
    true,
    'pdf',
    'Generate a Letter of Intent for an NSF Conference Proposal per PAPPG guidelines. Include the project title, PI name, a brief description of the conference''s theme and objectives, and anticipated collaborators. Use the following information provided by the grant writer: Project title [User input], PI name [User input], Conference description [User input], Collaborators [User input]. Ensure the letter is formal, concise, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Letter of Intent for spelling, grammar, and formality errors. Ensure it is concise, adheres to a one-page limit, and meets NSF standards. Correct any issues while maintaining the original intent.',
    'Analyze the edited Letter of Intent for logical consistency (e.g., objectives align with theme), completeness (e.g., includes title, PI, description, collaborators), and adherence to NSF standards. Flag any inconsistencies or missing details.',
    NULL,
    'Evaluate the Letter of Intent as a strict NSF reviewer per PAPPG guidelines. Verify it includes project title, PI name, conference description, and collaborators within one page. Reject if it lacks formality, exceeds the page limit, or omits required elements.',
    'Provide the project title, PI name, conference description, and list of anticipated collaborators.'
),

-- 3. Project Summary (Required, PAPPG 2.D.2.b)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Project Summary',
    'A concise summary of the proposed conference, including overview, intellectual merit, and broader impacts.',
    3,
    false,
    'pdf',
    'Generate a Project Summary for an NSF Conference Proposal per PAPPG Chapter 2.D.2.b. Include three distinct sections: an overview of the conference, its intellectual merit, and broader impacts. Use the following information provided by the grant writer: Overview [User input], Intellectual merit [User input], Broader impacts [User input]. Ensure it is written in third person, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Project Summary for spelling, grammar, and clarity errors. Ensure third-person voice, three distinct sections (overview, intellectual merit, broader impacts), and a one-page limit. Correct any issues while maintaining the original intent.',
    'Analyze the edited Project Summary for logical consistency (e.g., merit aligns with overview), completeness (e.g., all three sections present), and compliance with PAPPG 2.D.2.b. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Project Summary as a strict NSF reviewer per PAPPG Chapter 2.D.2.b. Verify it includes overview, intellectual merit, and broader impacts in third person within one page. Reject if it lacks clarity, exceeds the page limit, or omits required sections.',
    'Provide the conference''s overview, intellectual merit, and broader impacts.'
),

-- 4. Project Description (Required, PAPPG 2.D.2.d and 2.F.8)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Project Description',
    'A detailed narrative of the proposed conference, including need, topics, speakers, format, and plans for participant selection and childcare.',
    4,
    false,
    'pdf',
    'Generate a Project Description for an NSF Conference Proposal per PAPPG Chapter 2.D.2.d and 2.F.8. Include subsections on the need for the conference, list of topics, key speakers, conference format, plans for participant selection (including underrepresented groups), and childcare/family care resources. Use the following information provided by the grant writer: Need [User input], Topics [User input], Speakers [User input], Format [User input], Participant plans [User input], Childcare plans [User input]. Ensure it is comprehensive, persuasive, no more than 15 pages unless specified otherwise, formatted as a PDF-ready text document, and includes visuals where beneficial (e.g., agenda, organizational chart).',
    'Review the Project Description for spelling, grammar, and clarity errors. Ensure all required subsections are present and persuasive, within 15 pages unless specified otherwise. Correct any issues while preserving the original intent.',
    'Analyze the edited Project Description for logical consistency (e.g., format supports participant plans), completeness (e.g., all required subsections included), and compliance with PAPPG 2.D.2.d and 2.F.8. Flag any inconsistencies, omissions, or excessive length.',
    'Generate high-quality visuals (e.g., diagrams, charts) for the Project Description based on the grant writer''s context and uploaded image files (if any). Use the provided information (e.g., conference format, participant plans) to create visuals that enhance clarity of the conference structure or agenda. Ensure visuals are clear, labeled, professional, and output as PDF-ready PNGs compatible with NSF standards.',
    'Evaluate the Project Description as a strict NSF reviewer per PAPPG Chapter 2.D.2.d and 2.F.8. Verify it includes need, topics, speakers, format, participant plans, and childcare/family care resources within 15 pages unless specified otherwise. Reject if it lacks depth, exceeds page limits, or omits required elements.',
    'Provide the conference''s need, list of topics, key speakers, format, participant selection plans, and childcare/family care plans.'
),

-- 5. References Cited (Required, PAPPG 2.D.2.e)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'References Cited',
    'A list of references cited in the Project Description.',
    5,
    false,
    'pdf',
    'Generate a References Cited section for an NSF Conference Proposal per PAPPG Chapter 2.D.2.e. Include full citations for all references mentioned in the Project Description. Use the following information provided by the grant writer: List of references [User input]. Ensure the document uses a consistent citation style, is formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the References Cited section for spelling, grammar, and formatting errors. Ensure all citations are complete and consistently styled per PAPPG 2.D.2.e. Correct any issues while maintaining accuracy.',
    'Analyze the edited References Cited section for completeness (e.g., all Project Description references included), accuracy (e.g., correct titles, authors), and compliance with PAPPG 2.D.2.e. Flag any missing or inconsistent citations.',
    NULL,
    'Evaluate the References Cited section as a strict NSF reviewer per PAPPG Chapter 2.D.2.e. Verify all references from the Project Description are cited fully and consistently. Reject if citations are incomplete, inconsistent, or improperly formatted.',
    'Provide a list of references cited in the Project Description.'
),

-- 6. Biographical Sketches (Required, PAPPG 2.D.2.f)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Biographical Sketches',
    'Biosketches for the PI and co-PIs, highlighting relevant experience for the conference.',
    6,
    false,
    'pdf',
    'Generate Biographical Sketches for an NSF Conference Proposal per PAPPG Chapter 2.D.2.f. For each PI and co-PI, include professional preparation, appointments, products, and synergistic activities relevant to the conference. Use the following information provided by the grant writer: PI and co-PI details [User input]. Ensure each sketch is no more than two pages, formatted as a PDF-ready text document, and adheres to NSF biosketch guidelines.',
    'Review the Biographical Sketches for spelling, grammar, and formatting errors. Ensure each sketch includes preparation, appointments, products, and activities within two pages per PAPPG 2.D.2.f. Correct any issues while maintaining accuracy.',
    'Analyze the edited Biographical Sketches for completeness (e.g., all required sections present), accuracy (e.g., correct dates, products), and compliance with PAPPG 2.D.2.f. Flag any omissions or sketches exceeding two pages.',
    NULL,
    'Evaluate the Biographical Sketches as a strict NSF reviewer per PAPPG Chapter 2.D.2.f. Verify each includes preparation, appointments, products, and activities within two pages. Reject if any are incomplete, inaccurate, or exceed the page limit.',
    'Provide details for the PI and co-PIs (professional preparation, appointments, products, synergistic activities).'
),

-- 7. Budget and Budget Justification (Required, PAPPG 2.D.2.g)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Budget and Budget Justification',
    'A detailed budget and narrative justification for the conference''s expenses.',
    7,
    false,
    'pdf',
    'Generate a Budget and Budget Justification for an NSF Conference Proposal per PAPPG Chapter 2.D.2.g. Detail all costs (e.g., venue, travel, participant support) and provide a narrative justifying their necessity for the conference. Use the following information provided by the grant writer: Budget details [User input]. Ensure the document is clear, concise, no more than five pages, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Budget and Budget Justification for spelling, grammar, and clarity errors. Ensure all costs are detailed and justified within five pages per PAPPG 2.D.2.g. Correct any issues while maintaining the original intent.',
    'Analyze the edited Budget and Budget Justification for logical consistency (e.g., costs align with justifications), completeness (e.g., all budget items covered), and compliance with PAPPG 2.D.2.g. Flag any discrepancies or unjustified costs.',
    NULL,
    'Evaluate the Budget and Budget Justification as a strict NSF reviewer per PAPPG Chapter 2.D.2.g. Verify all costs are justified, allowable, and reasonable within five pages. Reject if any cost lacks justification, is inconsistent, or violates NSF guidelines.',
    'Provide a breakdown of the budget and justifications for each cost.'
),

-- 8. Current and Pending Support (Required, PAPPG 2.D.2.h)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Current and Pending Support',
    'A list of current and pending support for the PI and co-PIs.',
    8,
    false,
    'pdf',
    'Generate a Current and Pending Support section for an NSF Conference Proposal per PAPPG Chapter 2.D.2.h. List all current and pending projects, including funding sources, project titles, and effort overlap with this proposal. Use the following information provided by the grant writer: Support details [User input]. Ensure the document is formatted as a PDF-ready text document and avoids hyperlinks unless permitted.',
    'Review the Current and Pending Support section for spelling, grammar, and formatting errors. Ensure all projects are listed with required details per PAPPG 2.D.2.h. Correct any issues while maintaining accuracy.',
    'Analyze the edited Current and Pending Support section for completeness (e.g., all projects listed), accuracy (e.g., correct funding details), and compliance with PAPPG 2.D.2.h. Flag any omissions or inconsistencies.',
    NULL,
    'Evaluate the Current and Pending Support section as a strict NSF reviewer per PAPPG Chapter 2.D.2.h. Verify all current and pending projects are listed with funding sources, titles, and overlap details. Reject if incomplete, inaccurate, or improperly formatted.',
    'Provide details of all current and pending support for the PI and co-PIs.'
),

-- 9. Facilities, Equipment, and Other Resources (Required, PAPPG 2.D.2.i)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Facilities, Equipment, and Other Resources',
    'A description of resources available for the conference.',
    9,
    false,
    'pdf',
    'Generate a Facilities, Equipment, and Other Resources section for an NSF Conference Proposal per PAPPG Chapter 2.D.2.i. Describe resources (e.g., venue, AV equipment, institutional support) that will support the conference. Use the following information provided by the grant writer: Resources [User input]. Ensure the document is clear, concise, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Facilities, Equipment, and Other Resources section for spelling, grammar, and clarity errors. Ensure all resources are described per PAPPG 2.D.2.i. Correct any issues while maintaining the original intent.',
    'Analyze the edited Facilities, Equipment, and Other Resources section for completeness (e.g., all relevant resources included), clarity, and compliance with PAPPG 2.D.2.i. Flag any omissions or vague descriptions.',
    NULL,
    'Evaluate the Facilities, Equipment, and Other Resources section as a strict NSF reviewer per PAPPG Chapter 2.D.2.i. Verify all resources supporting the conference are clearly described. Reject if incomplete, unclear, or non-compliant.',
    'Provide a description of resources available for the conference.'
),

-- 10. Data Management Plan (Required, PAPPG 2.D.2.j)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Data Management Plan',
    'A plan for managing and sharing data generated by the conference, if applicable.',
    10,
    false,
    'pdf',
    'Generate a Data Management Plan for an NSF Conference Proposal per PAPPG Chapter 2.D.2.j. Describe how data (e.g., presentations, proceedings) will be managed and shared. If no data is generated, state this explicitly. Use the following information provided by the grant writer: Data management details [User input]. Ensure the document is no more than two pages, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Data Management Plan for spelling, grammar, and clarity errors. Ensure data management and sharing strategies are detailed within two pages per PAPPG 2.D.2.j. Correct any issues while maintaining the original intent.',
    'Analyze the edited Data Management Plan for logical consistency (e.g., strategies feasible), completeness (e.g., all data types addressed), and compliance with PAPPG 2.D.2.j. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Data Management Plan as a strict NSF reviewer per PAPPG Chapter 2.D.2.j. Verify it details data management and sharing strategies within two pages, or explicitly states no data is generated. Reject if incomplete, unclear, or non-compliant with NSF policies.',
    'Provide details on data management and sharing strategies for the conference, or state if no data is generated.'
),

-- 11. Postdoctoral Mentoring Plan (Conditionally Required, PAPPG 2.E.7)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Postdoctoral Mentoring Plan',
    'A plan for mentoring postdoctoral researchers if included in the budget.',
    11,
    true,
    'pdf',
    'Generate a Postdoctoral Mentoring Plan for an NSF Conference Proposal per PAPPG Chapter 2.E.7. Describe mentoring activities, professional development opportunities, and integration into the conference goals. Use the following information provided by the grant writer: Mentoring activities [User input], Professional development [User input], Integration details [User input]. Ensure it is specific, no more than one page, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Postdoctoral Mentoring Plan for spelling, grammar, and clarity errors. Ensure mentoring, development, and integration details are specific within one page per PAPPG 2.E.7. Correct any issues while preserving the original intent.',
    'Analyze the edited Postdoctoral Mentoring Plan for logical consistency (e.g., activities support integration), completeness (e.g., all required elements present), and compliance with PAPPG 2.E.7. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Postdoctoral Mentoring Plan as a strict NSF reviewer per PAPPG Chapter 2.E.7. Verify it details mentoring, development, and integration within one page. Reject if vague, exceeds the page limit, or omits required elements.',
    'Provide mentoring activities, professional development opportunities, and how postdocs integrate into the conference, if applicable.'
),

-- 12. Human Subjects (Conditionally Required, PAPPG 2.E.9)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Human Subjects',
    'Documentation for research involving human subjects, including IRB approval status, if applicable.',
    12,
    true,
    'pdf',
    'Generate a Human Subjects section for an NSF Conference Proposal per PAPPG Chapter 2.E.9. Include a description of any research involving human subjects, risks and protections, and IRB approval status (or exemption justification). Use the following information provided by the grant writer: Research description [User input], Risks and protections [User input], IRB status [User input]. Ensure compliance with federal regulations, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Human Subjects section for spelling, grammar, and clarity errors. Ensure research, risks, protections, and IRB status are detailed per PAPPG 2.E.9. Correct any issues while maintaining compliance.',
    'Analyze the edited Human Subjects section for logical consistency (e.g., protections address risks), completeness (e.g., IRB status included), and compliance with PAPPG 2.E.9 and federal regulations. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Human Subjects section as a strict NSF reviewer per PAPPG Chapter 2.E.9. Verify it includes research description, risks, protections, and IRB status, complying with federal regulations. Reject if incomplete, non-compliant, or unclear.',
    'Provide the human subjects research description, risks and protections, and IRB approval status, if applicable.'
),

-- 13. Vertebrate Animals (Conditionally Required, PAPPG 2.E.9)
(
    'd62b155b-805e-4fec-9fc9-1ab4c89f4b5f',
    'Vertebrate Animals',
    'Documentation for research involving vertebrate animals, including IACUC approval, if applicable.',
    13,
    true,
    'pdf',
    'Generate a Vertebrate Animals section for an NSF Conference Proposal per PAPPG Chapter 2.E.9. Include a description of any research involving vertebrate animals, justification for species and numbers, pain minimization, euthanasia methods, and IACUC approval status. Use the following information provided by the grant writer: Research description [User input], Justification [User input], Pain minimization [User input], Euthanasia methods [User input], IACUC status [User input]. Ensure compliance with PHS policy, formatted as a PDF-ready text document, and avoids hyperlinks unless permitted.',
    'Review the Vertebrate Animals section for spelling, grammar, and clarity errors. Ensure research, justification, pain minimization, euthanasia, and IACUC status are detailed per PAPPG 2.E.9. Correct any issues while maintaining compliance.',
    'Analyze the edited Vertebrate Animals section for logical consistency (e.g., justification supports research), completeness (e.g., all elements present), and compliance with PAPPG 2.E.9 and PHS policy. Flag any discrepancies or omissions.',
    NULL,
    'Evaluate the Vertebrate Animals section as a strict NSF reviewer per PAPPG Chapter 2.E.9. Verify it includes research description, justification, pain minimization, euthanasia methods, and IACUC status, complying with PHS policy. Reject if incomplete, non-compliant, or unclear.',
    'Provide the vertebrate animals research description, justification for species and numbers, pain minimization 방법을, euthanasia methods, and IACUC approval status, if applicable.'
);


