/** Minimalna treść gry do testów silnika — niezależna od folderu data/. */
import type { GameContent } from '../src/index.ts';

export function fixtureContent(): GameContent {
  return {
    campaign: {
      organization: {
        acronym: 'PACE',
        brand: 'Intermarium History',
        names: [{ from: '1951-Q1', full: 'Pan-Atlantic Commission for Experimentation' }],
      },
      start: { date: '1951-01-01', era: 'I' },
      indicators: { ZW: 55, SO: 60, PP: 50, WF: 70, NG: 4 },
      currencies: { UD: 6, KP: 3 },
    },
    factions: [
      {
        id: 'DPO',
        name: 'Dyrektoriat Programów Obronnych',
        influence: 4,
        summary: 's',
        wants: 'w',
        measuresSuccessBy: 'm',
        levers: ['l'],
        gifts: ['g'],
        agendas: [{ id: 'seria', title: 'Seria' }],
        startAgenda: 'seria',
        paradox: 'p',
        rivals: ['RN'],
      },
      {
        id: 'RN',
        name: 'Rada Naukowa',
        influence: 2,
        summary: 's',
        wants: 'w',
        measuresSuccessBy: 'm',
        levers: ['l'],
        gifts: ['g'],
        agendas: [{ id: 'nauka', title: 'Nauka' }],
        startAgenda: 'nauka',
        paradox: 'p',
        rivals: [],
      },
    ],
    traits: {
      visible: [{ id: 'pedant', name: 'Pedant', effect: 'e' }],
      hidden: [{ id: 'kret', name: 'Kret', effect: 'e' }],
    },
    characters: [
      {
        id: 'brandt',
        name: 'dr Emil Brandt',
        faction: 'RN',
        role: 'Przewodniczący',
        competence: 5,
        loyalty: -3,
        ambition: 4,
        traits: ['pedant'],
        hiddenTraits: ['kret'],
        dmNote: 'TAJNA NOTATKA',
        voice: { register: 'r', habits: [], neverSays: [] },
      },
    ],
    registry: [
      {
        id: 'R-0001',
        type: 'hook',
        title: 'Ukryty hak',
        knownBy: ['DPO'],
        hiddenFrom: ['anderson'],
        weight: 3,
        triggers: [],
        visibleToPlayer: false,
        dmNote: 'TAJNA NOTATKA REJESTRU',
      },
      {
        id: 'R-0002',
        type: 'secret',
        title: 'Jawna tajemnica',
        knownBy: ['anderson'],
        hiddenFrom: ['prasa'],
        weight: 2,
        pressure: 1,
        triggers: [],
        visibleToPlayer: true,
      },
    ],
  };
}
