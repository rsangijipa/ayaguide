import { AMBIENT_ELEMENTS } from './ambientElements';
import { AudioPlayerElement } from './types';

export const CHAKRAS = [
  {
    id: 'root',
    name: 'Basico (Muladhara)',
    frequency: 396,
    hue: 0,
    color: 'bg-red-500',
    palette: { primary: '#ef4444', secondary: '#f87171', accent: '#fca5a5', soft: 'rgba(239, 68, 68, 0.15)' },
  },
  {
    id: 'sacral',
    name: 'Sacral (Svadhisthana)',
    frequency: 417,
    hue: 30,
    color: 'bg-orange-400',
    palette: { primary: '#fb923c', secondary: '#fdba74', accent: '#fed7aa', soft: 'rgba(251, 146, 60, 0.15)' },
  },
  {
    id: 'solar',
    name: 'Plexo Solar (Manipura)',
    frequency: 528,
    hue: 60,
    color: 'bg-yellow-400',
    palette: { primary: '#facc15', secondary: '#fde047', accent: '#fef3c7', soft: 'rgba(250, 204, 21, 0.15)' },
  },
  {
    id: 'heart',
    name: 'Cardiaco (Anahata)',
    frequency: 639,
    hue: 120,
    color: 'bg-green-400',
    palette: { primary: '#4ade80', secondary: '#86efac', accent: '#bbf7d0', soft: 'rgba(74, 222, 128, 0.15)' },
  },
  {
    id: 'throat',
    name: 'Laringeo (Vishuddha)',
    frequency: 741,
    hue: 210,
    color: 'bg-blue-400',
    palette: { primary: '#60a5fa', secondary: '#93c5fd', accent: '#bfdbfe', soft: 'rgba(96, 165, 250, 0.15)' },
  },
  {
    id: 'thirdeye',
    name: 'Frontal (Ajna)',
    frequency: 260,
    hue: 260,
    color: 'bg-indigo-400',
    palette: { primary: '#818cf8', secondary: '#a5b4fc', accent: '#c7d2fe', soft: 'rgba(129, 140, 248, 0.15)' },
  },
  {
    id: 'crown',
    name: 'Coronario (Sahasrara)',
    frequency: 963,
    hue: 280,
    color: 'bg-purple-400',
    palette: { primary: '#c084fc', secondary: '#d8b4fe', accent: '#e9d5ff', soft: 'rgba(192, 132, 252, 0.15)' },
  },
];

export const AMBIENT_SOUNDS = AMBIENT_ELEMENTS;

export const LOOP_ELEMENTS: AudioPlayerElement[] = AMBIENT_ELEMENTS.map((element) => ({
  id: element.id,
  name: element.name,
  url: element.url,
}));

export const TIMER_PRESETS = [
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
  { label: '1h', seconds: 3600 },
  { label: '2h', seconds: 7200 },
  { label: '4h', seconds: 14400 },
];
