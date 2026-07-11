import { WebOnlyStub } from '@/components/mindmap/web-only-stub';

// Mirrors /app/mindmap/map — the React Flow canvas has no RN equivalent yet
// (T-030-04 D7); Browse carries the area cards natively.
export default function MindmapMap() {
  return (
    <WebOnlyStub
      title="Your map"
      body="The full map canvas — your areas of life connected around the year's horizon — renders on the web. Browse shows the same areas as cards here."
    />
  );
}
