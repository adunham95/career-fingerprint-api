import { randomBytes, randomInt } from 'crypto';

const ADJECTIVES = [
  'brisk',
  'bright',
  'calm',
  'clever',
  'crisp',
  'eager',
  'fair',
  'gentle',
  'keen',
  'merry',
  'neat',
  'noble',
  'plucky',
  'quick',
  'smart',
  'spry',
  'sturdy',
  'sunny',
  'tidy',
  'true',
  'bold',
  'cheerful',
  'daring',
  'fearless',
  'graceful',
  'honest',
  'jolly',
  'kind',
  'lively',
  'modest',
  'polite',
  'quiet',
  'reliable',
  'sincere',
  'talented',
  'upbeat',
  'vivid',
  'warm',
  'witty',
  'zesty',
  'elegant',
  'brave',
  'loyal',
  'curious',
  'humble',
  'shiny',
  'swift',
  'steady',
  'vibrant',
  'wise',
];

const NOUNS = [
  'otter',
  'falcon',
  'panda',
  'tiger',
  'lynx',
  'eagle',
  'coral',
  'maple',
  'cedar',
  'ember',
  'comet',
  'orbit',
  'delta',
  'harbor',
  'meadow',
  'canyon',
  'ridge',
  'aurora',
  'pixel',
  'quartz',
  'wolf',
  'lion',
  'bear',
  'hawk',
  'fox',
  'dolphin',
  'whale',
  'seal',
  'owl',
  'swan',
  'elm',
  'oak',
  'pine',
  'willow',
  'rose',
  'ivy',
  'fern',
  'bamboo',
  'reed',
  'lotus',
  'river',
  'lake',
  'ocean',
  'storm',
  'cloud',
  'flame',
  'stone',
  'peak',
  'valley',
  'glacier',
];

export function randInt(max: number): number {
  if (typeof randomInt === 'function') {
    // Node 14+ has crypto.randomInt
    return randomInt(0, max);
  }
  // Fallback for older Node versions using crypto.randomBytes
  const buf = randomBytes(4); // 4 bytes = 32-bit integer
  const num = buf.readUInt32BE(0);
  return num % max;
}

export function generateInviteString(): string {
  while (true) {
    const adj = ADJECTIVES[randInt(ADJECTIVES.length)];
    const noun = NOUNS[randInt(NOUNS.length)];
    const digits = String(randInt(100)).padStart(2, '0');
    const code = `${adj}-${noun}-${digits}`; // e.g., "brisk-otter-42"
    return code;
  }
}
