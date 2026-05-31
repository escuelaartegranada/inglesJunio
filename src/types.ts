export type Screen = 'home' | 'lessons' | 'tick-cross' | 'drag-drop' | 'arrows' | 'word-search' | 'drawing';

export interface VocabularyItem {
  id: string;
  en: string;
  es: string;
  icon: string;
}

export interface DirectionItem {
  id: string;
  en: string;
  es: string;
  icon: string;
}
