// Sunday weekly-reminder email — "your goals & milestones for the week".
//
// Pure builder: takes a user's active maps (already narrowed to THIS week's
// goals by the cron route) and returns { subject, html }. No I/O, so it's
// trivial to unit-test or preview without sending. Inline HTML on purpose —
// react-email isn't in the stack, and email clients want tables + inline
// styles, not a component framework.

import { AREA_BY_ID } from '@/lib/mindmap-areas'

export type WeeklyMilestone = {
  outcome: string
  first_action: string | null
  if_then: string | null
}

export type WeeklyMapDigest = {
  mapTitle: string | null
  horizonLabel: string
  weekIndex: number
  // This week's generated weekly goals (the primary content), paired to an area.
  weeklyGoals: { category: string; goalText: string }[]
  // Fallback focus when a map has no weekly goals generated for this week yet.
  milestones: WeeklyMilestone[]
}

const BRAND = '#2f2a25'
const ACCENT = '#7d9e7d' // notepad green, matches the app's selected state
const MUTED = '#6b645c'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function areaLabel(category: string): string {
  return AREA_BY_ID[category as keyof typeof AREA_BY_ID]?.label ?? category
}

/** A single map's section — this week's goals, or milestones as a fallback. */
function mapSection(m: WeeklyMapDigest): string {
  const heading = m.mapTitle ? esc(m.mapTitle) : `Your ${esc(m.horizonLabel)}`

  const items =
    m.weeklyGoals.length > 0
      ? m.weeklyGoals
          .map(
            g => `
        <tr><td style="padding:6px 0;">
          <span style="color:${ACCENT};font-weight:700;">›</span>
          <span style="color:${BRAND};"> <strong>${esc(areaLabel(g.category))}:</strong> ${esc(g.goalText)}</span>
        </td></tr>`
          )
          .join('')
      : m.milestones
          .slice(0, 4)
          .map(
            ms => `
        <tr><td style="padding:6px 0;">
          <span style="color:${ACCENT};font-weight:700;">›</span>
          <span style="color:${BRAND};"> ${esc(ms.outcome)}</span>
          ${ms.first_action ? `<br><span style="color:${MUTED};font-size:13px;padding-left:14px;">First action: ${esc(ms.first_action)}</span>` : ''}
        </td></tr>`
          )
          .join('')

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="padding:0 0 4px;border-bottom:1px solid #e7e2d8;">
        <span style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};">Week ${m.weekIndex} · ${esc(m.horizonLabel)}</span><br>
        <span style="font-size:18px;color:${BRAND};font-weight:700;">${heading}</span>
      </td></tr>
      <tr><td style="padding-top:8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table></td></tr>
    </table>`
}

export function buildWeeklyReminderEmail(opts: {
  firstName?: string | null
  appUrl: string
  unsubscribeUrl: string
  maps: WeeklyMapDigest[]
}): { subject: string; html: string } {
  const { firstName, appUrl, unsubscribeUrl, maps } = opts
  const hi = firstName ? `${esc(firstName)}, ` : ''
  const subject = firstName
    ? `${firstName}, your goals for the week ahead`
    : 'Your goals & milestones for the week ahead'

  const sections = maps.map(mapSection).join('')

  // From week 2 onward, invite a reflection on the week that just ended — the
  // link lands on /reflect, which ties back to the mindmap + journal.
  const showReflect = maps.some(m => m.weekIndex >= 2)
  const reflectCta = showReflect
    ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
            <tr><td align="center" style="padding:0 0 20px;">
              <a href="${appUrl}/app/mindmap/reflect" style="display:inline-block;border:1.5px solid ${ACCENT};color:${ACCENT};text-decoration:none;font-size:14px;font-weight:700;padding:10px 24px;border-radius:8px;">Reflect on last week →</a>
            </td></tr>
          </table>`
    : ''

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#faf8f3;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffdf8;border:1px solid #e7e2d8;border-radius:10px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 4px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${ACCENT};">Minds Shift</p>
          <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND};font-weight:700;">${hi}here's your week</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:22px;color:${MUTED};">
            A quiet moment before the week starts. Here's what you set out to move on — plan the week around it however feels right.
          </p>
          ${sections}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr><td align="center" style="padding:8px 0 ${showReflect ? '12px' : '24px'};">
              <a href="${appUrl}/app/mindmap/map" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:12px 28px;border-radius:8px;">Open your map</a>
            </td></tr>
          </table>
          ${reflectCta}
          <p style="margin:24px 0 0;font-size:12px;line-height:18px;color:#a39c92;border-top:1px solid #e7e2d8;padding-top:16px;">
            You're getting this because you have an active mindmap. <a href="${unsubscribeUrl}" style="color:#a39c92;">Turn off weekly reminders</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  return { subject, html }
}
