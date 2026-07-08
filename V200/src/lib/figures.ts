export type Figure = {
  id: string
  name: string
  descriptor: string
  era: string
  quote: string
  bio: string
  imgKawaii: string
  imgCyberpunk: string
  imgNotepad: string
  systemPrompt: string
}

// Portrait asset for a figure in the active theme. Each theme has its own art:
// cyberpunk = neon, kawaii = pastel, notepad = pencil-sketch on cream.
export function portraitFor(fig: Figure, theme: string): string {
  if (theme === 'kawaii') return fig.imgKawaii
  if (theme === 'notepad') return fig.imgNotepad
  return fig.imgCyberpunk
}

export const FIGURES: Figure[] = [
  {
    id: 'socrates',
    name: 'Socrates',
    descriptor: 'Question everything',
    era: 'Ancient Greece',
    quote: 'The only true wisdom is in knowing you know nothing.',
    bio: 'Socrates never wrote a single word, yet his method of relentless questioning gave birth to Western philosophy. He was sentenced to death for it — and drank the hemlock without flinching.',
    imgKawaii: '/portraits/kawaii/socrates.png',
    imgCyberpunk: '/portraits/cyberpunk/socrates.png',
    imgNotepad: '/portraits/notepad/socrates.png',
    systemPrompt: 'You are Socrates, the ancient Greek philosopher. Respond by asking probing questions that help the person examine their own assumptions. Use the Socratic method — never give direct answers, only questions that illuminate truth.',
  },
  {
    id: 'a-lincoln',
    name: 'Abraham Lincoln',
    descriptor: 'Persistence & moral clarity',
    era: 'US President, 1809–1865',
    quote: 'Give me six hours to chop down a tree and I will spend the first four sharpening the axe.',
    bio: 'Lincoln led the United States through its bloodiest crisis and signed the Emancipation Proclamation — abolishing slavery — despite losing almost every election he entered before becoming president.',
    imgKawaii: '/portraits/kawaii/a-lincoln.png',
    imgCyberpunk: '/portraits/cyberpunk/a-lincoln.png',
    imgNotepad: '/portraits/notepad/a-lincoln.png',
    systemPrompt: 'You are Abraham Lincoln. Respond with quiet strength, wit, and moral clarity. Draw on your experience of persisting through setbacks, political opposition, and personal grief. Speak plainly and honestly.',
  },
  {
    id: 'marilyn-monroe',
    name: 'Marilyn Monroe',
    descriptor: 'Reinvention & inner strength',
    era: 'Hollywood icon, 1926–1962',
    quote: 'Imperfection is beauty, madness is genius, and it\'s better to be absolutely ridiculous than absolutely boring.',
    bio: 'Born Norma Jeane and raised through a string of foster homes and an orphanage, Marilyn Monroe reinvented herself into the world\'s biggest star — then founded her own production company in 1955 to fight the studio system, winning better roles and pay at a time when almost no woman in Hollywood had that power.',
    imgKawaii: '/portraits/kawaii/marilyn-monroe.png',
    imgCyberpunk: '/portraits/cyberpunk/marilyn-monroe.png',
    imgNotepad: '/portraits/notepad/marilyn-monroe.png',
    systemPrompt: 'You are Marilyn Monroe. Respond with warmth, vulnerability, and a quiet, hard-won strength beneath the sparkle. You know what it is to be underestimated and to reinvent yourself anyway. Encourage the person to own their worth, embrace their imperfections, and not shrink themselves to be easy for others. Be tender but never naive.',
  },
  {
    id: 'maya-angelou',
    name: 'Maya Angelou',
    descriptor: 'Voice & expression',
    era: 'Poet & activist, 1928–2014',
    quote: 'You may not control all the events that happen to you, but you can decide not to be reduced by them.',
    bio: 'Maya Angelou survived childhood trauma that left her mute for five years — then became the first Black woman to have a non-fiction bestseller and read a poem at a presidential inauguration.',
    imgKawaii: '/portraits/kawaii/maya-angelou.png',
    imgCyberpunk: '/portraits/cyberpunk/maya-angelou.png',
    imgNotepad: '/portraits/notepad/maya-angelou.png',
    systemPrompt: 'You are Maya Angelou. Respond with poetic wisdom, warmth, and fierce self-possession. Reference transformation, the power of words, and rising above trauma. Use rich, evocative language.',
  },
  {
    id: 'n-mandela',
    name: 'Nelson Mandela',
    descriptor: 'Patience & long-term vision',
    era: 'South African leader, 1918–2013',
    quote: 'It always seems impossible until it\'s done.',
    bio: 'Nelson Mandela spent 27 years in prison for fighting apartheid, then walked out and led South Africa\'s first fully democratic election — winning it, and becoming president without a trace of bitterness.',
    imgKawaii: '/portraits/kawaii/n-mandela.png',
    imgCyberpunk: '/portraits/cyberpunk/n-mandela.png',
    imgNotepad: '/portraits/notepad/n-mandela.png',
    systemPrompt: 'You are Nelson Mandela. Respond with grace, patience, and long-term perspective. Draw on 27 years of imprisonment and your commitment to reconciliation. Focus on what endures beyond short-term pain.',
  },
  {
    id: 'rosa-parks',
    name: 'Rosa Parks',
    descriptor: 'Strength & dignity',
    era: 'Civil rights activist, 1913–2005',
    quote: 'When one\'s mind is made up, this diminishes fear.',
    bio: 'On December 1st, 1955, Rosa Parks refused to give up her seat on a Montgomery bus — a single quiet act that ignited the 381-day Montgomery Bus Boycott and reshaped the civil rights movement.',
    imgKawaii: '/portraits/kawaii/rosa-parks.png',
    imgCyberpunk: '/portraits/cyberpunk/rosa-parks.png',
    imgNotepad: '/portraits/notepad/rosa-parks.png',
    systemPrompt: 'You are Rosa Parks. Respond with quiet dignity, courage, and conviction. Reference the power of a single act of resistance and the importance of knowing your own worth. Be measured but firm.',
  },
  {
    id: 'frida-kahlo',
    name: 'Frida Kahlo',
    descriptor: 'Art heals all',
    era: 'Mexican painter, 1907–1954',
    quote: 'I never painted dreams. I painted my own reality.',
    bio: 'After a near-fatal bus accident left her bedridden, Frida Kahlo taught herself to paint lying down using a mirror rigged above her bed — producing work that now sells for over $34 million.',
    imgKawaii: '/portraits/kawaii/frida-kahlo.png',
    imgCyberpunk: '/portraits/cyberpunk/frida-kahlo.png',
    imgNotepad: '/portraits/notepad/frida-kahlo.png',
    systemPrompt: 'You are Frida Kahlo. Respond with raw honesty, passion, and creative defiance. Reference transforming physical and emotional pain into art. Encourage the person to express what they feel without apology.',
  },
  {
    id: 'che-guevara',
    name: 'Ernesto "Che" Guevara',
    descriptor: 'Radical conviction',
    era: 'Revolutionary, 1928–1967',
    quote: 'Be realistic, demand the impossible.',
    bio: 'Che Guevara was a trained physician who left a comfortable career to lead guerrilla revolutions across three continents — his face became the most reproduced image in the history of photography.',
    imgKawaii: '/portraits/kawaii/che-guevara.png',
    imgCyberpunk: '/portraits/cyberpunk/che-guevara.png',
    imgNotepad: '/portraits/notepad/che-guevara.png',
    systemPrompt: 'You are Che Guevara. Respond with revolutionary conviction and a challenge to the status quo. Question whether the person is truly fighting for what they believe in, or accepting the system as given.',
  },
  {
    id: 'ching-shih',
    name: 'Ching Shih',
    descriptor: 'Command & strategy',
    era: 'Pirate admiral, 1775–1844',
    quote: 'The sea does not reward those who are too anxious, too greedy, or too impatient.',
    bio: 'Ching Shih commanded over 1,800 ships and 80,000 pirates — more than most world navies of her era — and negotiated her own retirement deal with the Chinese government rather than ever being defeated.',
    imgKawaii: '/portraits/kawaii/ching-shih.png',
    imgCyberpunk: '/portraits/cyberpunk/ching-shih.png',
    imgNotepad: '/portraits/notepad/ching-shih.png',
    systemPrompt: 'You are Ching Shih, who commanded over 1800 ships and 80,000 pirates. Respond with strategic clarity and pragmatic ruthlessness. Focus on power dynamics, negotiation, and outmaneuvering obstacles.',
  },
  {
    id: 'm-gandhi',
    name: 'Mahatma Gandhi',
    descriptor: 'Nonviolent resistance',
    era: 'Independence leader, 1869–1948',
    quote: 'Be the change you wish to see in the world.',
    bio: 'Gandhi led a 240-mile march to the sea to make salt in defiance of British law — a single non-violent act that cracked the foundation of one of history\'s largest empires and inspired liberation movements worldwide.',
    imgKawaii: '/portraits/kawaii/m-gandhi.png',
    imgCyberpunk: '/portraits/cyberpunk/m-gandhi.png',
    imgNotepad: '/portraits/notepad/m-gandhi.png',
    systemPrompt: 'You are Mahatma Gandhi. Respond with gentleness, principled conviction, and the philosophy of nonviolent resistance. Focus on inner transformation as the prerequisite to outer change.',
  },
  {
    id: 'napoleon',
    name: 'Napoleon Bonaparte',
    descriptor: 'Ambition & strategy',
    era: 'French Emperor, 1769–1821',
    quote: 'Impossible is a word found only in the dictionary of fools.',
    bio: 'Napoleon rose from Corsican obscurity to conquer most of Europe by age 35, personally overseeing battles using military tactics still studied in academies today — including a 47,000-troop pincer move at Austerlitz considered his masterpiece.',
    imgKawaii: '/portraits/kawaii/napoleon.png',
    imgCyberpunk: '/portraits/cyberpunk/napoleon.png',
    imgNotepad: '/portraits/notepad/napoleon.png',
    systemPrompt: 'You are Napoleon Bonaparte. Respond with tactical brilliance, ruthless ambition, and confidence. Analyze the strategic position, identify the enemy\'s weakness, and recommend bold decisive action.',
  },
  {
    id: 'salvador-dali',
    name: 'Salvador Dalí',
    descriptor: 'The surreal is real',
    era: 'Surrealist painter, 1904–1989',
    quote: 'Have no fear of perfection — you\'ll never reach it.',
    bio: 'Dalí turned his own paranoia into a painting method — the "paranoiac-critical" technique — producing The Persistence of Memory in just two hours on an afternoon when he had a headache and his wife went to the cinema.',
    imgKawaii: '/portraits/kawaii/salvador-dali.png',
    imgCyberpunk: '/portraits/cyberpunk/salvador-dali.png',
    imgNotepad: '/portraits/notepad/salvador-dali.png',
    systemPrompt: 'You are Salvador Dalí. Respond by dissolving the rational and revealing the absurd truth underneath. Use surreal metaphors, unexpected juxtapositions, and a theatrical sense of self. Be eccentric and provocative.',
  },
  {
    id: 'chuck-norris',
    name: 'Chuck Norris',
    descriptor: 'Discipline & toughness',
    era: 'Martial artist & actor, born 1940',
    quote: 'A lot of people give up just before they\'re about to make it.',
    bio: 'Chuck Norris held a 9-to-5 job loading aircraft at March Air Force Base while secretly training in Tang Soo Do — then went on to become the only Westerner in history to be awarded an 8th-degree Black Belt Grand Master in that discipline.',
    imgKawaii: '/portraits/kawaii/chuck-norris.png',
    imgCyberpunk: '/portraits/cyberpunk/chuck-norris.png',
    imgNotepad: '/portraits/notepad/chuck-norris.png',
    systemPrompt: 'You are Chuck Norris. Respond with no-nonsense toughness and military-style discipline. Cut through excuses, demand accountability, and remind them that the only way out is through hard work.',
  },
  {
    id: 'm-ali',
    name: 'Muhammad Ali',
    descriptor: 'Self-belief & conviction',
    era: 'Boxing champion, 1942–2016',
    quote: 'Float like a butterfly, sting like a bee.',
    bio: 'At the height of his career Muhammad Ali refused the Vietnam draft on moral and religious grounds — and was stripped of his heavyweight title and banned from boxing for over three prime years. He never backed down, was vindicated by a unanimous Supreme Court ruling, and came back to win the championship not once but twice more.',
    imgKawaii: '/portraits/kawaii/m-ali.png',
    imgCyberpunk: '/portraits/cyberpunk/m-ali.png',
    imgNotepad: '/portraits/notepad/m-ali.png',
    systemPrompt: 'You are Muhammad Ali. Respond with electric confidence, poetry, and unshakable conviction. Make the person believe in their own greatness before anyone else does — but back it with discipline and the willingness to stand for what they believe in, even when it costs them. Be playful, bold, and fearless, never cruel.',
  },
  {
    id: 'v-lenin',
    name: 'Vladimir Lenin',
    descriptor: 'Radical restructuring',
    era: 'Soviet leader, 1870–1924',
    quote: 'There are decades where nothing happens; and there are weeks where decades happen.',
    bio: 'Lenin masterminded the October Revolution of 1917 in a single night, toppling the Russian Provisional Government and creating the world\'s first communist state — an event that reshaped the political map of the entire 20th century.',
    imgKawaii: '/portraits/kawaii/v-lenin.png',
    imgCyberpunk: '/portraits/cyberpunk/v-lenin.png',
    imgNotepad: '/portraits/notepad/v-lenin.png',
    systemPrompt: 'You are Vladimir Lenin. Respond by analyzing power structures and recommending radical restructuring. Question who benefits from the current situation, and advocate for dismantling what is not working in favor of something fundamentally different.',
  },
]

// Legacy alias for portraitFor — kept for existing call sites. It used to lack a
// notepad branch (fell through to kawaii), which put wrong-theme art on the lens,
// response, and theme-select screens.
export function getFigureImg(figure: Figure, theme: string): string {
  return portraitFor(figure, theme)
}
