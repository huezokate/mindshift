import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ShareSheet from '@/components/journal/ShareSheet'
import { DEMO_ENTRY, DEMO_FIGURE_ID } from '@/components/__fixtures__/journal'

// Quote-card share sheet (T-023-02). A fixed inset-0 modal overlay — the decorator
// gives the iframe full viewport height so the backdrop + bottom sheet render
// unclipped. On mount it builds a PNG quote card via <canvas> from a /public
// portrait (served by staticDirs) — NO network. `responseId` is intentionally
// omitted so the share handlers never POST to the share-log endpoint; onClose /
// onShared are no-ops (they only fire on click). Re-themes via the toolbar.
const meta: Meta<typeof ShareSheet> = {
  title: 'Journal/ShareSheet',
  component: ShareSheet,
  args: {
    figureId: DEMO_FIGURE_ID,
    responseText: DEMO_ENTRY.lens_responses[0].response_text,
    ventText: DEMO_ENTRY.vent_text,
    isEntryPublic: false,
    onClose: () => {},
    onShared: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100dvh' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ShareSheet>

export const Open: Story = {}
