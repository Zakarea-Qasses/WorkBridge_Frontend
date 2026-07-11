const locationTranslations = [
  ['Damascus', '\u062f\u0645\u0634\u0642'],
  ['Rural Damascus', '\u0631\u064a\u0641 \u062f\u0645\u0634\u0642'],
  ['Aleppo', '\u062d\u0644\u0628'],
  ['Homs', '\u062d\u0645\u0635'],
  ['Hama', '\u062d\u0645\u0627\u0629'],
  ['Latakia', '\u0627\u0644\u0644\u0627\u0630\u0642\u064a\u0629'],
  ['Tartus', '\u0637\u0631\u0637\u0648\u0633'],
  ['Idlib', '\u0625\u062f\u0644\u0628'],
  ['Deir ez-Zor', '\u062f\u064a\u0631 \u0627\u0644\u0632\u0648\u0631'],
  ['Raqqa', '\u0627\u0644\u0631\u0642\u0629'],
  ['Hasakah', '\u0627\u0644\u062d\u0633\u0643\u0629'],
  ['Daraa', '\u062f\u0631\u0639\u0627'],
  ['As-Suwayda', '\u0627\u0644\u0633\u0648\u064a\u062f\u0627\u0621'],
  ['Quneitra', '\u0627\u0644\u0642\u0646\u064a\u0637\u0631\u0629'],
] as const;

const arabicToLatin: Record<string, string> = {
  '\u0621': '',
  '\u0622': 'a',
  '\u0623': 'a',
  '\u0624': 'w',
  '\u0625': 'i',
  '\u0626': 'y',
  '\u0627': 'a',
  '\u0628': 'b',
  '\u0629': 'a',
  '\u062a': 't',
  '\u062b': 'th',
  '\u062c': 'j',
  '\u062d': 'h',
  '\u062e': 'kh',
  '\u062f': 'd',
  '\u0630': 'dh',
  '\u0631': 'r',
  '\u0632': 'z',
  '\u0633': 's',
  '\u0634': 'sh',
  '\u0635': 's',
  '\u0636': 'd',
  '\u0637': 't',
  '\u0638': 'z',
  '\u0639': 'a',
  '\u063a': 'gh',
  '\u0640': '',
  '\u0641': 'f',
  '\u0642': 'q',
  '\u0643': 'k',
  '\u0644': 'l',
  '\u0645': 'm',
  '\u0646': 'n',
  '\u0647': 'h',
  '\u0648': 'w',
  '\u0649': 'a',
  '\u064a': 'y',
};

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function hasArabic(value: string) {
  return /[\u0600-\u06ff]/.test(value);
}

function transliterateArabic(value: string) {
  return value
    .split('')
    .map((char) => arabicToLatin[char] ?? char)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const enToAr = new Map(locationTranslations.map(([en, ar]) => [normalize(en), ar]));
const arToEn = new Map(locationTranslations.map(([en, ar]) => [normalize(ar), en]));

export function locationDisplayName(name: string | null | undefined, isEnglish: boolean) {
  if (!name) return '';

  const normalizedName = normalize(name);
  if (isEnglish) {
    return arToEn.get(normalizedName) || (hasArabic(name) ? transliterateArabic(name) : name);
  }

  return enToAr.get(normalizedName) || name;
}
