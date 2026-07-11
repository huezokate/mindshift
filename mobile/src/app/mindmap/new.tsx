import { WebOnlyStub } from '@/components/mindmap/web-only-stub';

// Mirrors /app/mindmap/new — the 6-step WOOP wizard stays web-only (T-030-04 D7).
export default function MindmapNew() {
  return (
    <WebOnlyStub
      title="New mindmap"
      body="The guided wizard walks you through picking areas of life, naming a wish-outcome-obstacle plan, and building the year's milestones with AI help."
    />
  );
}
