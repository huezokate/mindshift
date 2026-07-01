import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import EntryDetail from '@/components/journal/EntryDetail'
import { DEMO_ENTRY } from '@/components/__fixtures__/journal'

// Smoke story (T-022-04). EntryDetail calls useRouter() AND renders <AppHeader>
// transitively — so a clean mount also proves the @clerk/nextjs alias reaches
// NESTED imports (AppHeader's useUser/useClerk), not just top-level ones.
const meta: Meta<typeof EntryDetail> = {
  title: 'Journal/EntryDetail',
  component: EntryDetail,
  args: { entry: DEMO_ENTRY },
}
export default meta

type Story = StoryObj<typeof EntryDetail>

// Populated entry — two LensCards render, nested AppHeader mounts via the Clerk
// alias, ShareSheet/LensPickerSheet stay closed.
export const Default: Story = {}

// Entry with no lenses yet — the detail page's empty lens state (T-023-02).
export const NoLenses: Story = {
  args: { entry: { ...DEMO_ENTRY, lens_responses: [] } },
}
