
UPDATE grant_sections set ai_generator_prompt = ai_generator_prompt || ' 
Grant Funder: ' || ( 
select gorg.name 
from grants g, organizations gorg 
where gorg.id = g.organization_id and 
    g.id = grant_sections.grant_id) || '
Grant: ' || ( 
select CONCAT(code, ': ', url) 
from grants 
where id = grant_sections.grant_id) || '
Grant Requirements: ' || ( 
select STRING_AGG('(' || requirement || ': ' || gr.url || ') ', ', ') AS requirements_list
from grants g, grant_requirements gr
where g.id = grant_sections.grant_id and 
    gr.grant_id = g.id) || '
Organization Requirements: ' || ( 
SELECT STRING_AGG('(' || requirement || ': ' || gogr.url || ') ', ', ') AS requirements_list
FROM organization_grant_requirements gogr, grants g
WHERE gogr.active = TRUE and 
	gogr.organization_id = g.organization_id and
	g.id = grant_sections.grant_id)
where ai_generator_prompt is not null;

UPDATE grant_sections set ai_requirements_prompt = ai_requirements_prompt || ' 
Grant Funder: ' || ( 
select gorg.name 
from grants g, organizations gorg 
where gorg.id = g.organization_id and 
    g.id = grant_sections.grant_id) || '
Grant: ' || ( 
select CONCAT(code, ': ', url) 
from grants 
where id = grant_sections.grant_id) || '
Grant Requirements: ' || ( 
select STRING_AGG('(' || requirement || ': ' || gr.url || ') ', ', ') AS requirements_list
from grants g, grant_requirements gr
where g.id = grant_sections.grant_id and 
    gr.grant_id = g.id) || '
Organization Requirements: ' || ( 
SELECT STRING_AGG('(' || requirement || ': ' || gogr.url || ') ', ', ') AS requirements_list
FROM organization_grant_requirements gogr, grants g
WHERE gogr.active = TRUE and 
	gogr.organization_id = g.organization_id and
	g.id = grant_sections.grant_id)
where ai_requirements_prompt is not null;