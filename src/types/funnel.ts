export type ChamberId = 'awareness' | 'interest' | 'consideration' | 'hire';

export interface ChamberInfo {
  id: ChamberId;
  number: string;
  name: string;
  subtitleTag: string;
  funnelStage: string;
  tagline: string;
  description: string;
  accentColor: 'amber' | 'teal' | 'coral';
  hexColor: string;
  depthZ: number;
}

export const CHAMBERS: ChamberInfo[] = [
  {
    id: 'awareness',
    number: '01',
    name: 'Chances I took',
    subtitleTag: 'THE FIRST SIGNAL',
    funnelStage: 'AWARENESS',
    tagline: 'On-device AI, static analysis SaaS, and building by voice.',
    description: '',
    accentColor: 'amber',
    hexColor: '#f59e0b',
    depthZ: -15,
  },
  {
    id: 'interest',
    number: '02',
    name: 'Mistake Museum',
    subtitleTag: 'THE PULL',
    funnelStage: 'INTEREST / A MISTAKE MUSEUM',
    tagline: 'Scroll through the room. Look closely.',
    description: '',
    accentColor: 'teal',
    hexColor: '#14b8a6',
    depthZ: -50,
  },
  {
    id: 'consideration',
    number: '03',
    name: 'What I built',
    subtitleTag: 'THE TURN',
    funnelStage: 'CONSIDERATION',
    tagline: 'Four products built from scratch.',
    description: '',
    accentColor: 'coral',
    hexColor: '#e05a47',
    depthZ: -85,
  },
  {
    id: 'hire',
    number: '04',
    name: 'Hire',
    subtitleTag: 'THE CLOSE',
    funnelStage: 'HIRE',
    tagline: 'Get in touch.',
    description: '',
    accentColor: 'amber',
    hexColor: '#f59e0b',
    depthZ: -125,
  },
];
