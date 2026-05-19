export interface RankingItem {
  id: string;
  name: string;
  position: number;
}

export interface Ranking {
  id: string;
  title: string;
  category: string;
  is_favorite: boolean;
  items: [RankingItem, RankingItem, RankingItem, RankingItem, RankingItem];
  created_at: string;
  updated_at: string;
}