export interface RankingItem {
  id: string;
  text: string;
  position: number;
}

export interface Ranking {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  isFavorite: boolean;
  items: [RankingItem, RankingItem, RankingItem, RankingItem, RankingItem];
  createdAt: Date;
  updatedAt: Date;
}