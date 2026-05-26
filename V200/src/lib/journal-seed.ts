import type { SharePlatform } from './journal-types'

type SeedLens = {
  figure_id: string
  response_text: string
  is_favorite?: boolean
  shared_to?: SharePlatform[]
}

type SeedEntry = {
  vent_text: string
  theme?: 'cyberpunk' | 'kawaii' | 'notepad'
  is_public: boolean
  lenses: SeedLens[]
}

// 10-entry demo flow per the build spec.
// Entries are written to feel real — actual vent + lens-in-voice responses —
// so the journal is genuinely demoable.
export const DEMO_ENTRIES: SeedEntry[] = [
  // 1. Private, no lens
  {
    vent_text:
      "Couldn't sleep last night. Kept rerunning the conversation with my manager about the promo cycle in my head. I think I came across as defensive.",
    is_public: false,
    theme: 'cyberpunk',
    lenses: [],
  },

  // 2. Private, 3 lenses — 1 shared to Instagram
  {
    vent_text:
      "Third Tuesday in a row I've worked until 11. I love the project but I'm starting to resent the team for not pulling their weight. Or maybe I'm just bad at saying no.",
    is_public: false,
    theme: 'cyberpunk',
    lenses: [
      {
        figure_id: 'a-lincoln',
        response_text:
          "A man who works himself to the bone for those who will not share the load is not a partner — he is a draft horse. You have not failed at saying no; you have not yet practiced it. Begin with one Tuesday. Just one.",
        shared_to: ['instagram'],
      },
      {
        figure_id: 'm-gandhi',
        response_text:
          "Resentment grows quietly in the soil of unspoken needs. Speak. Not in anger, but plainly. The team you imagine — fair, sharing the load — cannot exist until someone names what is missing.",
      },
      {
        figure_id: 'dolly-parton',
        response_text:
          "Honey, you can love your work and still go home at six. That isn't quitting on it — that's keeping enough of yourself to come back tomorrow and love it again.",
      },
    ],
  },

  // 3. Private, 2 lenses — nothing shared
  {
    vent_text:
      "Mom asked again when I'm 'settling down.' I told her I am settled. She laughed. I'm 34. I have a job, a lease, two plants that are still alive.",
    is_public: false,
    theme: 'kawaii',
    lenses: [
      {
        figure_id: 'maya-angelou',
        response_text:
          "Your mother grew up inside a definition of 'settled' that did not include you. Her laugh is fear in disguise — fear that she will not recognize the shape your life is taking. You do not owe her the old shape. You owe her your honesty, which is harder.",
      },
      {
        figure_id: 'frida-kahlo',
        response_text:
          "Two living plants is more responsibility than half the world manages. Do not let her measure your life with a ruler made for someone else's house.",
      },
    ],
  },

  // 4. Private, 1 lens — saved to favorites
  {
    vent_text:
      "Got passed over for the team lead role. They went with someone external. I'm trying not to take it personally but I absolutely am taking it personally.",
    is_public: false,
    theme: 'cyberpunk',
    lenses: [
      {
        figure_id: 'a-lincoln',
        response_text:
          "I lost the Illinois legislature in 1832. The state senate in '54. The vice-presidential nomination in '56. The senate again in '58. They gave the work to other men, then to other men again. Take it personally — that means you wanted it. Then go back tomorrow and want it harder than the next person in the room.",
        is_favorite: true,
      },
    ],
  },

  // 5. Private, 3 lenses — 2 shared (1 Instagram, 1 TikTok)
  {
    vent_text:
      "I keep starting paintings and abandoning them at 60%. I have eleven half-finished canvases in the closet. I think I'm afraid of one of them being bad more than I'm afraid of never finishing.",
    is_public: false,
    theme: 'kawaii',
    lenses: [
      {
        figure_id: 'frida-kahlo',
        response_text:
          "A canvas at 60% is not unfinished — it is paused. The fear that you are pausing it forever is the truth you must paint *into*, not around. Pick the one you hate most and finish it badly. That is the only way.",
        shared_to: ['instagram'],
      },
      {
        figure_id: 'salvador-dali',
        response_text:
          "Eleven canvases! What a magnificent army of incomplete dreams. Sign them all today, even the ones you despise. A signature transforms a coward's abandonment into a deliberate work of refusal. You will be the only artist in history with an oeuvre of refusals.",
        shared_to: ['tiktok'],
      },
      {
        figure_id: 'chuck-norris',
        response_text:
          "Pick one. Set a timer for ninety minutes. Finish it. Bad is finished. Finished beats perfect every time. You don't have eleven art problems — you have one discipline problem.",
      },
    ],
  },

  // 6. Public, no lens
  {
    vent_text:
      "Quitting my corporate job in two weeks to go freelance full-time. Terrified. Excited. Mostly terrified. Writing this down so future me remembers I chose this.",
    is_public: true,
    theme: 'notepad',
    lenses: [],
  },

  // 7. Public, 3 lenses — 1 shared to Facebook
  {
    vent_text:
      "Spent the whole weekend with my dad. He's slower now, repeats himself. I caught myself getting impatient with him and I felt sick about it on the drive home.",
    is_public: true,
    theme: 'notepad',
    lenses: [
      {
        figure_id: 'maya-angelou',
        response_text:
          "The sickness on the drive home is the love speaking through the impatience. Both are true. You will not stop being impatient — you are a person, not a saint. But you will keep noticing. That noticing is the whole of grace.",
        shared_to: ['facebook'],
      },
      {
        figure_id: 'n-mandela',
        response_text:
          "He was patient with you for years when you had nothing to give back but need. The ledger does not need to be balanced this weekend. Sit with him again next weekend. Patience is a practice, not a virtue.",
      },
      {
        figure_id: 'dolly-parton',
        response_text:
          "Honey, my daddy repeated himself too. By the end I knew his stories better than my own. I'd give anything to hear him tell one of 'em wrong one more time. You're doing better than you think.",
      },
    ],
  },

  // 8. Public, 2 lenses — nothing shared
  {
    vent_text:
      "Two friends had a falling out and both of them are asking me to pick a side. I love them both. I don't want to lose either one but I'm exhausted from holding the middle.",
    is_public: true,
    theme: 'cyberpunk',
    lenses: [
      {
        figure_id: 'socrates',
        response_text:
          "What is the cost to each of them if you refuse to choose? And what is the cost to you if you do? Is the friendship that requires you to pick a side the same friendship you are trying to preserve?",
      },
      {
        figure_id: 'rosa-parks',
        response_text:
          "You are not the middle. You are a third person, with your own seat. Tell them, separately and clearly, that you will not be made to choose. If either friendship cannot survive that, the choice was already made for you.",
      },
    ],
  },

  // 9. Public, 1 lens — saved to favorites
  {
    vent_text:
      "My therapist said I 'speak about myself like a person I'm trying to manage.' That hit harder than anything she's said in two years.",
    is_public: true,
    theme: 'kawaii',
    lenses: [
      {
        figure_id: 'maya-angelou',
        response_text:
          "You are not the staff of your own life. Lay down the clipboard. The person you have been managing is asking, very quietly, to be loved instead. Start there. Everything else can wait.",
        is_favorite: true,
      },
    ],
  },

  // 10. Public, 3 lenses — 2 shared to Instagram
  {
    vent_text:
      "Pitched my startup idea at the demo night. The investor I most wanted to hear me asked one question and then went back to his phone. I don't know how to read that.",
    is_public: true,
    theme: 'cyberpunk',
    lenses: [
      {
        figure_id: 'd-trump',
        response_text:
          "He went back to his phone? That's a HUGE compliment, believe me. The ones who really hate it argue with you. The ones already calculating their check size go quiet. You don't know how to read it because you're reading him — read the room. Who else leaned in?",
        shared_to: ['instagram'],
      },
      {
        figure_id: 'ching-shih',
        response_text:
          "One investor's attention is not a market. You presented to a room — measure the room. Who approached you after? Who asked for follow-up? The phone-checker has told you everything: he is not your buyer. Stop spending strategic energy on him.",
        shared_to: ['instagram'],
      },
      {
        figure_id: 'napoleon',
        response_text:
          "You assaulted the wrong fortress. He is heavily defended and you sent your strongest pitch at his front gate. Identify the lieutenants — the partners, the scouts at the firm — and take them first. The general capitulates once the perimeter falls.",
      },
    ],
  },
]
