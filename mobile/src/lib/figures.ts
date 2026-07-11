import { API_URL } from '@/lib/config';
import type { ThemeMode } from '@/theme';

/**
 * Figure metadata, ported from V200/src/lib/figures.ts — WITHOUT systemPrompt.
 * The backend resolves the persona from figureId authoritatively (the web's
 * client-sent systemPrompt is only a fallback for unknown ids), so shipping
 * the prompts in the app binary buys nothing.
 */
export type Figure = {
  id: string;
  name: string;
  descriptor: string;
  era: string;
  quote: string;
  bio: string;
};

/**
 * Portraits are NOT bundled (45 PNGs ≈ 26MB) — they load from the deployed
 * web app's public assets, cached on disk by expo-image.
 */
export function portraitUrl(figureId: string, mode: ThemeMode): string {
  return `${API_URL}/portraits/${mode}/${figureId}.png`;
}

export function figureById(id: string): Figure | undefined {
  return FIGURES.find((f) => f.id === id);
}

export const FIGURES: Figure[] = [
  {
    id: 'socrates',
    name: 'Socrates',
    descriptor: 'Question everything',
    era: 'Ancient Greece',
    quote: 'The only true wisdom is in knowing you know nothing.',
    bio: 'Socrates never wrote a single word, yet his method of relentless questioning gave birth to Western philosophy. He was sentenced to death for it — and drank the hemlock without flinching.',
  },
  {
    id: 'a-lincoln',
    name: 'Abraham Lincoln',
    descriptor: 'Persistence & moral clarity',
    era: 'US President, 1809–1865',
    quote: 'Give me six hours to chop down a tree and I will spend the first four sharpening the axe.',
    bio: 'Lincoln led the United States through its bloodiest crisis and signed the Emancipation Proclamation — abolishing slavery — despite losing almost every election he entered before becoming president.',
  },
  {
    id: 'marilyn-monroe',
    name: 'Marilyn Monroe',
    descriptor: 'Reinvention & inner strength',
    era: 'Hollywood icon, 1926–1962',
    quote: "Imperfection is beauty, madness is genius, and it's better to be absolutely ridiculous than absolutely boring.",
    bio: "Born Norma Jeane and raised through a string of foster homes and an orphanage, Marilyn Monroe reinvented herself into the world's biggest star — then founded her own production company in 1955 to fight the studio system, winning better roles and pay at a time when almost no woman in Hollywood had that power.",
  },
  {
    id: 'maya-angelou',
    name: 'Maya Angelou',
    descriptor: 'Voice & expression',
    era: 'Poet & activist, 1928–2014',
    quote: 'You may not control all the events that happen to you, but you can decide not to be reduced by them.',
    bio: 'Maya Angelou survived childhood trauma that left her mute for five years — then became the first Black woman to have a non-fiction bestseller and read a poem at a presidential inauguration.',
  },
  {
    id: 'n-mandela',
    name: 'Nelson Mandela',
    descriptor: 'Patience & long-term vision',
    era: 'South African leader, 1918–2013',
    quote: "It always seems impossible until it's done.",
    bio: "Nelson Mandela spent 27 years in prison for fighting apartheid, then walked out and led South Africa's first fully democratic election — winning it, and becoming president without a trace of bitterness.",
  },
  {
    id: 'rosa-parks',
    name: 'Rosa Parks',
    descriptor: 'Strength & dignity',
    era: 'Civil rights activist, 1913–2005',
    quote: "When one's mind is made up, this diminishes fear.",
    bio: 'On December 1st, 1955, Rosa Parks refused to give up her seat on a Montgomery bus — a single quiet act that ignited the 381-day Montgomery Bus Boycott and reshaped the civil rights movement.',
  },
  {
    id: 'frida-kahlo',
    name: 'Frida Kahlo',
    descriptor: 'Art heals all',
    era: 'Mexican painter, 1907–1954',
    quote: 'I never painted dreams. I painted my own reality.',
    bio: 'After a near-fatal bus accident left her bedridden, Frida Kahlo taught herself to paint lying down using a mirror rigged above her bed — producing work that now sells for over $34 million.',
  },
  {
    id: 'che-guevara',
    name: 'Ernesto "Che" Guevara',
    descriptor: 'Radical conviction',
    era: 'Revolutionary, 1928–1967',
    quote: 'Be realistic, demand the impossible.',
    bio: 'Che Guevara was a trained physician who left a comfortable career to lead guerrilla revolutions across three continents — his face became the most reproduced image in the history of photography.',
  },
  {
    id: 'ching-shih',
    name: 'Ching Shih',
    descriptor: 'Command & strategy',
    era: 'Pirate admiral, 1775–1844',
    quote: 'The sea does not reward those who are too anxious, too greedy, or too impatient.',
    bio: 'Ching Shih commanded over 1,800 ships and 80,000 pirates — more than most world navies of her era — and negotiated her own retirement deal with the Chinese government rather than ever being defeated.',
  },
  {
    id: 'm-gandhi',
    name: 'Mahatma Gandhi',
    descriptor: 'Nonviolent resistance',
    era: 'Independence leader, 1869–1948',
    quote: 'Be the change you wish to see in the world.',
    bio: "Gandhi led a 240-mile march to the sea to make salt in defiance of British law — a single non-violent act that cracked the foundation of one of history's largest empires and inspired liberation movements worldwide.",
  },
  {
    id: 'napoleon',
    name: 'Napoleon Bonaparte',
    descriptor: 'Ambition & strategy',
    era: 'French Emperor, 1769–1821',
    quote: 'Impossible is a word found only in the dictionary of fools.',
    bio: 'Napoleon rose from Corsican obscurity to conquer most of Europe by age 35, personally overseeing battles using military tactics still studied in academies today — including a 47,000-troop pincer move at Austerlitz considered his masterpiece.',
  },
  {
    id: 'salvador-dali',
    name: 'Salvador Dalí',
    descriptor: 'The surreal is real',
    era: 'Surrealist painter, 1904–1989',
    quote: "Have no fear of perfection — you'll never reach it.",
    bio: 'Dalí turned his own paranoia into a painting method — the "paranoiac-critical" technique — producing The Persistence of Memory in just two hours on an afternoon when he had a headache and his wife went to the cinema.',
  },
  {
    id: 'chuck-norris',
    name: 'Chuck Norris',
    descriptor: 'Discipline & toughness',
    era: 'Martial artist & actor, born 1940',
    quote: "A lot of people give up just before they're about to make it.",
    bio: 'Chuck Norris held a 9-to-5 job loading aircraft at March Air Force Base while secretly training in Tang Soo Do — then went on to become the only Westerner in history to be awarded an 8th-degree Black Belt Grand Master in that discipline.',
  },
  {
    id: 'm-ali',
    name: 'Muhammad Ali',
    descriptor: 'Self-belief & conviction',
    era: 'Boxing champion, 1942–2016',
    quote: 'Float like a butterfly, sting like a bee.',
    bio: 'At the height of his career Muhammad Ali refused the Vietnam draft on moral and religious grounds — and was stripped of his heavyweight title and banned from boxing for over three prime years. He never backed down, was vindicated by a unanimous Supreme Court ruling, and came back to win the championship not once but twice more.',
  },
  {
    id: 'v-lenin',
    name: 'Vladimir Lenin',
    descriptor: 'Radical restructuring',
    era: 'Soviet leader, 1870–1924',
    quote: 'There are decades where nothing happens; and there are weeks where decades happen.',
    bio: "Lenin masterminded the October Revolution of 1917 in a single night, toppling the Russian Provisional Government and creating the world's first communist state — an event that reshaped the political map of the entire 20th century.",
  },
];
