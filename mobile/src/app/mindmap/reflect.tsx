import { WebOnlyStub } from '@/components/mindmap/web-only-stub';

// Mirrors /app/mindmap/reflect — still sample-data-only on web too; the real
// reflect loop ships with the weekly push notifications (T-030-05).
export default function MindmapReflect() {
  return (
    <WebOnlyStub
      title="Reflect"
      body="The weekly reflection — evidence, friction, meaning — is being finished on the web first and will land here with push reminders."
    />
  );
}
