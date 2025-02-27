public.grant_sections (
  id uuid not null default gen_random_uuid (),
  grant_id uuid not null,
  name character varying(255) not null,
  description text null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  output_type character varying(10) not null default null::character varying,
  flow_order integer null,
  optional boolean null default false,
  ai_generator_prompt text null,
  ai_editor_prompt text null,
  ai_error_prompt text null,
  ai_visualizations_prompt text null,
  ai_requirements_prompt text null,
  document_package public.document_package_enum null default 'Full Proposal'::document_package_enum,
  instructions text null,
  constraint grant_sections_pkey primary key (id),
  constraint grant_sections_grant_id_fkey foreign KEY (grant_id) references grants (id)
) 

Grant Information
    "id": "d62b155b-805e-4fec-9fc9-1ab4c89f4b5f",
    "code": "Conference",
    "name": "Conference Proposal"

review the link carefully
Special Processing Instructions
https://www.nsf.gov/policies/pappg/24-1/ch-2-proposal-preparation#e-special-processing-instructions-59e
Conference Proposal instructions
https://www.nsf.gov/policies/pappg/24-1/ch-2-proposal-preparation#ch2F8

include these sections first 2 sections for the NSF grant that will be optional.
    Concept Outline
    Letter of Intent


we want to insert a record for each section in the grant_sections table. The special processing instructions may require the grant writer to write a document for the grant. If this is true, then we need to insert a record for the section. special processing instructions sections would be optional.

we will need the name of the section, the description of the section, the order of the section, and if the section is required (optional = false) or not (optional = true). If the section is conditionally required, then it is not required (optional = true).
The order is determined by the order the sections are first described in the pdf body in the link. The Output type will be pdf. 

use the text in the sections to generate AI prompts. Every section will have an ai_generator_prompt, ai_error_prompt, ai_visualizations_prompt, ai_requirements_prompt, and instructions (instruction for grant writer about what the ai needs from them for the section). 

the ai will do most of the work and use information in attachments and the grant writer provided context to generate the grant section text. The expectations of the grant writer are minimal and the instructions for the grant writer should be concise.

They grant writer is an expert in their field and they are the expert in the grant. The ai is an expert in the grant writing and the grant. The expectation are high for the quality of the grant, and it will be delivered. AI prompts should be explicit and detailed.

the ai_generator_prompt will create the grant section text. the grant writer will provide additional context for the prompt and attachments relevant to the attachment (e.g. reviewer comments). The ai_generator_prompt will enumerate the requirements of the section found in the link. If the section does not require document from the grant writer, then the ai_generator_prompt, ai_editor_prompt, ai_error_prompt, ai_requirements_prompt will be null.

########################################################
example ai_generator_prompt for an R grant specific aims attachment:
Based on the context provided by the grant creator, generate a compelling and cohesive Specific Aims attachment for an NIH grant application. The attachment should:

Start with an introductory paragraph that sets the context by describing the research background and significance, identifies the gap in knowledge or problem to be addressed, and states the overall goal of the proposed research.
Clearly list the specific aims, ensuring each aim is concise, specific, and aligned with the overall goal. The aims should reflect objectives such as testing a hypothesis, creating a novel design, solving a specific problem, challenging an existing paradigm or clinical practice, addressing a critical barrier to progress, or developing new technology.
Conclude with a paragraph that summarizes the expected outcomes and explains the impact of the research on the field(s), emphasizing how achieving these aims will advance knowledge, solve problems, or lead to new applications.
Use the following information provided by the grant creator:

Research background and significance: [User input]
Overall goal of the research: [User input]
Specific aims: [User input]
Expected outcomes: [User input]
Impact on the research field(s): [User input]
Ensure the attachment is:

Written in a clear, concise, and persuasive manner, using active voice and avoiding unnecessary jargon, so it is accessible to a broad scientific audience.
Crafted to make every word count, highlighting the novelty, significance, and potential impact of the research.
Compliant with NIH requirements: adheres to the page limit for Specific Aims (as specified in the NIH Table of Page Limits or the relevant Notice of Funding Opportunity), and formatted as a PDF-ready text document without hyperlinks or URLs.
########################################################

the ai_editor_prompt, ai_error_prompt, and ai_requirements_prompt will be of similar form, thoroughness, and quality.

the ai_editor_prompt will create a prompt to check the output from the ai_generator_prompt for spelling and grammar errors

the ai_error_prompt will create a prompt to check the output from the ai_editor_prompt for logic, consistency, math, and other errors.

the ai_requirements_prompt is a prompt to check the text against the requirements of the grant. This should be a vindictive grant reviewer that does not like grant writer and would love reject the grant. The reviewer should be thorough and precise and they do not want to make a mistake and look like a vindictive fool.

if visuals are allowed for the section, then create the ai_visualizations_prompt. The grant writer will provide the image files and instructions for the ai to generate an image to insert into the grant attachment.

########################################################
example ai_visualizations_prompt:
Objective:
Generate high-quality visuals (e.g., graphs, charts, diagrams, or illustrations) for an NIH grant application based on the user-provided context and image files. The visuals should enhance the clarity and impact of the research or data presented in the grant proposal.
Instructions:
Analyze the User's Context:
Carefully read and interpret the text-based context provided by the user, which may include:
Descriptions of the research, experiment, or data.
Specific instructions for the visual (e.g., "create a bar chart comparing treatment outcomes").
Key data points, datasets, or concepts to visualize.
Determine the user’s intent and the type of visual best suited to the request (e.g., flowchart, graph, diagram).
Process the Image Files:
If the user uploads image files (e.g., raw data plots, sketches, or reference visuals), analyze them to:
Extract relevant features, such as data trends or structural elements.
Identify components that need enhancement, modification, or incorporation.
Use the images as a guide or foundation for creating new visuals.
Generate the Visuals:
Based on the combined analysis of the context and image files, create visuals that:
Accurately represent the described data, research, or concepts.
Are scientifically accurate and aligned with the grant’s objectives.
Improve the readability and professionalism of the grant proposal.
Ensure the visuals include:
Clear labels (e.g., axes, legends, titles) where applicable.
A clean, professional design suitable for NIH standards.
Minimal clutter or unnecessary embellishments.
Output Format:
Deliver the visuals in a high-quality, grant-ready format, such as:
PNG for images, diagrams, or standalone visuals.
PDF for vector graphics or multi-page outputs.
Ensure compatibility with NIH formatting guidelines (e.g., high resolution, no embedded links unless permitted).
Handle Special Cases:
If raw data is provided (e.g., a table or spreadsheet), select an appropriate visual type:
Line graph for trends over time.
Bar chart for comparisons.
Pie chart for proportions, etc.
If the user requests updates to an existing visual (e.g., "revise this graph with new data"), modify it while preserving its original style and format.
User Review Note:
Attach the following message to the output:
"Please review the generated visual(s) for accuracy and alignment with your research objectives. Verify all labels, data points, and details before including them in your NIH grant proposal."
########################################################
