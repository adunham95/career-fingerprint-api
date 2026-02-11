type NormalizeOptions = {
  maxTokens?: number;
  minTokenLen?: number;
  dedupeTokens?: boolean;
};

const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'it',
  'its',
  'this',
  'that',
  'these',
  'those',
  'i',
  'me',
  'my',
  'mine',
  'we',
  'us',
  'our',
  'ours',
  'you',
  'your',
  'yours',
  'he',
  'him',
  'his',
  'she',
  'her',
  'hers',
  'they',
  'them',
  'their',
  'theirs',
  'and',
  'or',
  'but',
  'so',
  'because',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'into',
  'of',
  'on',
  'onto',
  'to',
  'with',
  'within',
  'over',
  'under',
  'about',
  'around',
  'is',
  'am',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'do',
  'does',
  'did',
  'doing',
  'have',
  'has',
  'had',
  'having',
  'will',
  'would',
  'can',
  'could',
  'should',
  'may',
  'might',
  'must',
  'just',
  'very',
  'really',
  'basically',
  'actually',
  'literally',
  'then',
  'than',
  'also',
  'too',
  'however',
]);

// Keep negations — don’t remove these even if you expand stopwords later
const KEEP = new Set(['no', 'not', 'never', 'without']);

export function normalizeSearchText(
  input: string,
  opts: NormalizeOptions = {},
) {
  const { maxTokens = 120, minTokenLen = 2, dedupeTokens = true } = opts;

  // Lowercase
  let s = (input ?? '').toLowerCase();

  // Replace any non-alphanumeric with spaces
  s = s.replace(/[^a-z0-9]+/g, ' ');

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();
  if (!s) return { searchText: '', tokens: [] as string[] };

  let tokens = s.split(' ').filter(Boolean);

  // Remove stopwords + short tokens
  tokens = tokens.filter((t) => {
    if (KEEP.has(t)) return true;
    if (STOPWORDS.has(t)) return false;
    if (t.length < minTokenLen) return false;
    return true;
  });

  if (dedupeTokens) {
    const seen = new Set<string>();
    tokens = tokens.filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
  }

  if (maxTokens > 0 && tokens.length > maxTokens) {
    tokens = tokens.slice(0, maxTokens);
  }

  return { searchText: tokens.join(' '), tokens };
}
