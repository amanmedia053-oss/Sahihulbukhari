import { Hadith, BookGroup } from './types';

export const processHadiths = (allHadiths: Hadith[]): BookGroup[] => {
  const booksMap = new Map<string, BookGroup>();

  allHadiths.forEach((h) => {
    if (!booksMap.has(h.Book)) {
      booksMap.set(h.Book, {
        name: h.Book,
        pashtoName: h.Book_pashto,
        hadithCount: 0,
        chapters: [],
      });
    }

    const book = booksMap.get(h.Book)!;
    book.hadithCount++;

    let chapter = book.chapters.find((c) => c.name === h.Bab);
    if (!chapter) {
      chapter = {
        name: h.Bab,
        pashtoName: h.Bab_pashto,
        hadiths: [],
      };
      book.chapters.push(chapter);
    }
    chapter.hadiths.push(h);
  });

  return Array.from(booksMap.values());
};

export const THEME_COLORS = [
  { name: 'زمرد', color: '#065f46' },
  { name: 'شاهي آبي', color: '#1e3a8a' },
  { name: 'سور بخمل', color: '#7f1d1d' },
  { name: 'ارغواني', color: '#4c1d95' },
  { name: 'طلایي', color: '#78350f' },
  { name: 'فولادي', color: '#0f172a' },
  { name: 'تاریک ټیل', color: '#134e4a' },
  { name: 'ګلابي تیاره', color: '#881337' },
  { name: 'ځنګلي شین', color: '#14532d' },
  { name: 'سوځیدلی نارنجي', color: '#9a3412' },
];

export const DEFAULT_SETTINGS = {
  arabicFontSize: 24,
  pashtoFontSize: 18,
  lineSpacing: 1.8,
  animationsEnabled: true,
  themeColor: '#065f46',
};
