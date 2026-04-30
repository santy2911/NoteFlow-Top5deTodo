export interface RankingItem {
  id: string;
  text: string;
  position: number;
}

export interface Ranking {
  id: string;
  title: string;
  category: string;
  items: [RankingItem, RankingItem, RankingItem, RankingItem, RankingItem];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}