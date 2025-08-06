
export enum GameState {
  Welcome,
  Loading,
  Playing,
  Revealed,
  Error
}

export interface Story {
  titulo: string;
  intro: string;
  solucion: string;
  imageBase64: string;
}

export interface ChatMessage {
  id: number;
  author: 'user' | 'ai' | 'system';
  text: string;
}
