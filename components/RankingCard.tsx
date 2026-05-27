import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Ranking } from '../types/index';
import { colors } from '../constants/theme';

const COLOR_FALLBACK = '#534AB7';

function getCategoryColor(category: string): string {
  const key = category.toLowerCase() as keyof typeof colors.categories;
  return colors.categories[key] ?? COLOR_FALLBACK;
}

interface RankingCardProps {
  ranking: Ranking;
  onPress: () => void;
  onToggleFavorite: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function RankingCard({ ranking, onPress, onToggleFavorite, style }: RankingCardProps) {
  const color = getCategoryColor(ranking.category);

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{ranking.title}</Text>
          {ranking.is_pinned && (
            <Ionicons name="pin" size={16} color="#A78BFA" style={styles.pinIcon} />
          )}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggleFavorite();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={ranking.is_favorite ? 'star' : 'star-outline'}
              size={20}
              color={ranking.is_favorite ? '#F59E42' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.badge, { backgroundColor: color + '33' }]}>
          <Text style={[styles.badgeText, { color }]}>
            {ranking.category}
          </Text>
        </View>

        {(ranking.items ?? []).slice(0, 3).map((item, index) => (
          <Text key={item.id} style={styles.item} numberOfLines={1}>
            {index + 1}. {item.name}
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
  colorBar: { height: 4, width: '100%' },
  content: { padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  pinIcon: { marginRight: 8 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: { fontSize: 12, fontWeight: '500' },
  item: { color: '#aaa', fontSize: 14, marginBottom: 3 },
});
