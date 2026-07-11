const categoryTranslations = [
  ['Programming', '\u0628\u0631\u0645\u062c\u0629'],
  ['Web Development', '\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0648\u064a\u0628'],
  ['Mobile Development', '\u062a\u0637\u0648\u064a\u0631 \u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0627\u0644\u0645\u0648\u0628\u0627\u064a\u0644'],
  ['Artificial Intelligence', '\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a'],
  ['Machine Learning', '\u062a\u0639\u0644\u0645 \u0627\u0644\u0622\u0644\u0629'],
  ['Cyber Security', '\u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u0633\u064a\u0628\u0631\u0627\u0646\u064a'],
  ['Networking', '\u0627\u0644\u0634\u0628\u0643\u0627\u062a'],
  ['Cloud Computing', '\u0627\u0644\u062d\u0648\u0633\u0628\u0629 \u0627\u0644\u0633\u062d\u0627\u0628\u064a\u0629'],
  ['DevOps', '\u062f\u064a\u0641 \u0623\u0648\u0628\u0633'],
  ['Databases', '\u0642\u0648\u0627\u0639\u062f \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a'],
  ['Software Engineering', '\u0647\u0646\u062f\u0633\u0629 \u0627\u0644\u0628\u0631\u0645\u062c\u064a\u0627\u062a'],
  ['Algorithms & Data Structures', '\u0627\u0644\u062e\u0648\u0627\u0631\u0632\u0645\u064a\u0627\u062a \u0648\u0647\u064a\u0627\u0643\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a'],
  ['Operating Systems', '\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644'],
  ['UI/UX Design', '\u062a\u0635\u0645\u064a\u0645 \u0648\u0627\u062c\u0647\u0627\u062a \u0648\u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645'],
  ['API Development', '\u062a\u0637\u0648\u064a\u0631 \u0648\u0627\u062c\u0647\u0627\u062a API'],
  ['Testing & QA', '\u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631 \u0648\u0636\u0645\u0627\u0646 \u0627\u0644\u062c\u0648\u062f\u0629'],
  ['Linux & Servers', '\u0644\u064a\u0646\u0643\u0633 \u0648\u0627\u0644\u062e\u0648\u0627\u062f\u0645'],
  ['Career & Interview', '\u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0647\u0646\u064a \u0648\u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0627\u062a'],
  ['Tech News', '\u0623\u062e\u0628\u0627\u0631 \u0627\u0644\u062a\u0642\u0646\u064a\u0629'],
  ['Design', '\u062a\u0635\u0645\u064a\u0645'],
  ['Marketing', '\u062a\u0633\u0648\u064a\u0642'],
  ['Writing', '\u0643\u062a\u0627\u0628\u0629'],
  ['Translation', '\u062a\u0631\u062c\u0645\u0629'],
  ['Consulting', '\u0627\u0633\u062a\u0634\u0627\u0631\u0627\u062a'],
  ['Services', '\u062e\u062f\u0645\u0627\u062a'],
  ['Maintenance', '\u0635\u064a\u0627\u0646\u0629'],
  ['Education', '\u062a\u0639\u0644\u064a\u0645'],
] as const;

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

const enToAr = new Map(categoryTranslations.map(([en, ar]) => [normalize(en), ar]));
const arToEn = new Map(categoryTranslations.map(([en, ar]) => [normalize(ar), en]));

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

export function categoryDisplayName(name: string | null | undefined, isEnglish: boolean) {
  if (!name) return '';

  const normalizedName = normalize(name);
  if (isEnglish) {
    return arToEn.get(normalizedName) || (hasArabic(name) ? transliterateArabic(name) : name);
  }

  return enToAr.get(normalizedName) || name;
}
