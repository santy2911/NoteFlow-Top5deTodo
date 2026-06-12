import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Ranking } from '../types/index';
import { palette, getCategoryColor, medalEmojis } from '../constants/theme';

interface RankingCardProps {
  ranking: Ranking;
  onPress: () => void;
  onToggleFavorite: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function RankingCard({ ranking, onPress, onToggleFavorite, style }: RankingCardProps) {
  const color = getCategoryColor(ranking.category);
  const items = ranking.items ?? [];

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.82}>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.title} numberOfLines={1}>{ranking.title}</Text>
            <View style={[styles.badge, { backgroundColor: color + '33' }]}>
              <Text style={[styles.badgeText, { color }]}>{ranking.category}</Text>
            </View>
          </View>
          {ranking.is_pinned && <Ionicons name="pin" size={16} color={palette.purpleLight} style={styles.pinIcon} />}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggleFavorite();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={ranking.is_favorite ? 'star' : 'star-outline'}
              size={23}
              color={ranking.is_favorite ? palette.gold : '#73737e'}
            />
          </TouchableOpacity>
        </View>
        {items.slice(0, 3).map((item, index) => (
          <Text key={item.id ?? `item-${index}`} style={styles.item} numberOfLines={1}>
            {medalEmojis[index]} {item.name}
          </Text>
        ))}
        {items.length > 3 && <Text style={styles.more}>+{items.length - 3} más...</Text>}
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
    borderWidth: 1,
    borderColor: '#2a2a4a55',
  },
  colorBar: { height: 4, width: '100%' },
  content: { padding: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleGroup: { flex: 1, gap: 7, marginRight: 10 },
  title: { color: palette.text, fontSize: 16, fontWeight: '700' },
  pinIcon: { marginRight: 8, marginTop: 3 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  item: { color: '#c4c1d8', fontSize: 14, marginBottom: 3, lineHeight: 19 },
  more: { color: palette.textMuted, fontSize: 13, marginTop: 1 },
});
