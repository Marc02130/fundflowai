<!-- 
R-Grant scrapping Notes
Required for all grant types - use ALL or list all
if there are no requirements (e.g. optional) do not insert
Scrape contents section - this has some requirements and has details on what is expected. link below has good detail on the sections. do we want to deal with expectations? if so how?
https://grants.nih.gov/grants/how-to-apply-application-guide/forms-e/general/g.400-phs-398-research-plan-form.htm
Scrape for type specific requirements (new, resubmission, renewal, etc). when these are mentioned it is for a requirement
 -->
<!-- PDF https://grants.nih.gov/grants/how-to-apply-application-guide/forms-i/research-forms-i.pdf -->
<!-- PDF https://grants.nih.gov/grants/how-to-apply-application-guide/forms-e/general/g.400-phs-398-research-plan-form.htm -->
<!-- used FOA consistently, NOFO (grant opportinity) used in PDF -->
<!-- Add field to grant sections to capture the description -->
<!-- Page limits come from the NIH Table of Page Limits unless otherwise specified in the opportunity, don't use this for the page limits -->
<!-- For format just list accepted file types -->
json
[
  <!-- required for grant types resubmission or revision - need to look for key words like application types for creating requirements-->
  <!-- optional for other types - look for key words only required for, do not create requirement unless it specifically applies to something -->
  <!-- can be over ridden by notices of funding opportunities (NOFOs - grant opportunity rules) -->
  <!-- not allowed for new or renewal grant types -->
  <!-- missed resubmission and revision specifics -->
  {
    "section": "Introduction to Application",
    "Required": ["Resubmission", "Revision"],
    "Optional": "",
    "Description": "An 'Introduction to Application' attachment is required only if the type of application is resubmission or revision or if the FOA specifies that one is needed.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": "Follow the page limits for the introduction in the NIH Table of Page Limits unless otherwise specified in the FOA."
  },
  <!-- Required for all grant types - use ALL or list all? -->
  <!-- can be over ridden by notices of funding opportunities (NOFOs - grant opportunity rules) -->
  <!-- missed no url or hyperlinks may not be used -->
  {
    "section": "Specific Aims",
    "Required": [],
    "Optional": "",
    "Description": "The 'Specific Aims' attachment is required unless otherwise specified in the FOA. State concisely the goals of the proposed research and summarize the expected outcome(s).",
    "Format": "Attach this information as a PDF file.",
    "Requirements": "Follow the page limits for the Specific Aims in the NIH Table of Page Limits unless otherwise specified in the FOA."
  },
  <!-- Required for all grant types - use ALL or list all? -->
  <!-- missed no url or hyperlinks may not be used -->
  <!-- missed Cite published experimental details in the Research Strategy attachment and provide the full reference in R.220 -->
  {
    "section": "Research Strategy",
    "Required": [],
    "Optional": "",
    "Description": "The 'Research Strategy' attachment is required. Organize the Research Strategy in the specified order and use the instructions provided below unless otherwise specified in the FOA.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": "Follow the page limits for the Research Strategy in the NIH Table of Page Limits, unless otherwise specified in the FOA."
  },
  {
    "section": "Progress Report Publication List",
    "Required": [],
    "Optional": "",
    "Description": "A 'Progress Report Publication List' attachment is required only if the type of application is renewal.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": ""
  },
  {
    "section": "Vertebrate Animals",
    "Required": [],
    "Optional": "",
    "Description": "Include a 'Vertebrate Animals' attachment if you answered 'Yes' to the question 'Are Vertebrate Animals Used?' on the R.220 - R&R Other Project Information Form.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": ""
  },
  {
    "section": "Select Agent Research",
    "Required": [],
    "Optional": "",
    "Description": "Include a 'Select Agent Research' attachment if your proposed activities involve the use of select agents at any time during the proposed project period.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": ""
  },
  {
    "section": "Multiple PD/PI Leadership Plan",
    "Required": [],
    "Optional": "",
    "Description": "Any applicant who designates multiple PD/PIs must include a Multiple PD/PI Leadership Plan.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": ""
  },
  {
    "section": "Consortium/Contractual Arrangements",
    "Required": [],
    "Optional": "",
    "Description": "Include a 'Consortium/Contractual Arrangements' attachment if you have consortiums/contracts in your budget.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": ""
  },
  {
    "section": "Letters of Support",
    "Required": [],
    "Optional": "",
    "Description": "Combine all letters of support into a single PDF file and attach this information here.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": ""
  },
  {
    "section": "Resource Sharing Plan(s)",
    "Required": [],
    "Optional": "",
    "Description": "Attach this information as a PDF file. Sharing Model Organisms and Research Tools should be included.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": ""
  },
  {
    "section": "Other Plan(s)",
    "Required": [],
    "Optional": "",
    "Description": "Refer to the list of NIH activity codes subject to the DMS Policy and your Funding Opportunity Announcement to determine if your application is required to provide an attachment.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": ""
  },
  {
    "section": "Authentication of Key Biological and/or Chemical Resources",
    "Required": [],
    "Optional": "",
    "Description": "If applicable to the proposed science, briefly describe methods to ensure the identity and validity of key biological and/or chemical resources used in the proposed studies.",
    "Format": "Attach this information as a PDF file.",
    "Requirements": "A maximum of one page is suggested."
  },
  {
    "section": "Appendix",
    "Required": [],
    "Optional": "",
    "Description": "Refer to the FOA to determine whether there are any special appendix instructions for your application.",
    "Format": "A maximum of 10 PDF attachments is allowed in the Appendix.",
    "Requirements": ""