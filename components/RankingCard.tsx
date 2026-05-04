import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ranking } from '../types/index';

interface RankingCardProps {
  ranking: Ranking;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export default function RankingCard({ ranking, onPress, onToggleFavorite }: RankingCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.colorBar, { backgroundColor: ranking.categoryColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{ranking.title}</Text>
          <TouchableOpacity
            onPress={onToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={ranking.isFavorite ? 'star' : 'star-outline'}
              size={20}
              color={ranking.isFavorite ? '#F59E42' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.badge, { backgroundColor: ranking.categoryColor + '33' }]}>
          <Text style={[styles.badgeText, { color: ranking.categoryColor }]}>
            {ranking.category}
          </Text>
        </View>

        {ranking.items.slice(0, 3).map((item, index) => (
          <Text key={item.id} style={styles.item} numberOfLines={1}>
            {index + 1}. {item.text}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#242424',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  colorBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  item: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 3,
  },
});