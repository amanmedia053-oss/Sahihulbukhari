export interface Hadith {
  TheNum: string;
  Arabics: string;
  Pashto: string;
  Bab: string;
  Bab_pashto: string;
  Book: string;
  Book_pashto: string;
}

export interface AppSettings {
  arabicFontSize: number;
  pashtoFontSize: number;
  lineSpacing: number;
  animationsEnabled: boolean;
  themeColor: string;
}

export interface BookGroup {
  name: string;
  pashtoName: string;
  hadithCount: number;
  chapters: ChapterGroup[];
}

export interface ChapterGroup {
  name: string;
  pashtoName: string;
  hadiths: Hadith[];
}
