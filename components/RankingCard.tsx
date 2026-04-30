import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Ranking } from '../types/index';
import { useTheme } from '../constants/theme';

interface RankingCardProps {
  ranking: Ranking;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export default function RankingCard({ ranking, onPress, onToggleFavorite }: RankingCardProps) {
  const { colors, spacing, borderRadius, typography } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.colorBar, { backgroundColor: ranking.categoryColor }]} />
      <View style={[styles.content, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary, fontSize: typography.sizes.lg }]}>
            {ranking.title}
          </Text>
          <TouchableOpacity
            onPress={onToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AntDesign
              name={ranking.isFavorite ? ('star' as any) : ('staro' as any)}
              size={20}
              color={ranking.isFavorite ? '#F59E42' : colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.badge, { backgroundColor: ranking.categoryColor + '33', borderRadius: borderRadius.sm, marginBottom: spacing.sm }]}>
          <Text style={[styles.badgeText, { color: ranking.categoryColor, fontSize: typography.sizes.xs }]}>
            {ranking.category}
          </Text>
        </View>

        {ranking.items.slice(0, 3).map((item, index) => (
          <Text
            key={item.id}
            style={[styles.item, { color: colors.text.secondary, fontSize: typography.sizes.md }]}
            numberOfLines={1}
          >
            {index + 1}. {item.text}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  colorBar: {
    height: 4,
    width: '100%',
  },
  content: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontWeight: '500',
  },
  item: {
    marginBottom: 3,
  },
});