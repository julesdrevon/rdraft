export interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  image: ChampionImage;
  tags: string[];
  partype: string;
  stats: Record<string, number>; 
}

export interface DraftSelection {
  name: string;      
  imageUrl: string;  
  playerName: string | null;
  lane: string | null;
}
