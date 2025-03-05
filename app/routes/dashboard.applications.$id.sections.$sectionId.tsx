import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import SectionEditor from '~/components/grant-wizard/SectionEditor';
import { useNavigate } from 'react-router-dom';

export default function SectionEditorPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  if (!sectionId) {
    return <div>No section ID provided</div>;
  }

  return (
    <div className="h-full">
      <SectionEditor sectionId={sectionId} />
    </div>
  );
} 