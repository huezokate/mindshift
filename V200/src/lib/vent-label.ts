// Derived "smart header" for a written vent (Kate 2026-07-11): pull the first
// meaningful keyword and dress it — "Reflecting on career". Shared by the lens
// screen and the response screen so the label always tracks the state (the
// vent is WRITTEN by then; never show the empty-state "Dump it all here:").
const STOP = new Set(['i','a','the','is','it','and','or','but','to','my','me','you','we','they','am','are','was','be','have','has','had','do','does','did','will','would','could','should','of','in','on','at','for','with','by','from','up','out','that','this','an','not','what','so','all','as','just','about','if','there','when','who','which','than','then','into','can','how','more','their','your','its','our','her','his','im','ive','dont','keep','like','very','really','maybe','even','every','some','been','one','see','feel','get','got','know','think','want','need','much','also','still','going','make','always','never','something','anything','because','around','second'])

const PREFIXES = ['Contemplating', 'Ruminating on', 'Reflecting on']

export function getVentLabel(vent: string): string {
  const words = vent.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w))
  const keyword = [...new Set(words)][0]
  if (!keyword) return 'You vented:'
  const prefix = PREFIXES[vent.length % PREFIXES.length]
  return `${prefix} ${keyword}`
}
