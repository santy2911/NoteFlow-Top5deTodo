import React, { ReactNode, useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const ACTION_WIDTH = 72;
const ACTIONS_WIDTH = ACTION_WIDTH * 2;

interface SwipeableActionsProps {
  children: ReactNode;
  pinned: boolean;
  onTogglePinned: () => void;
  onDelete: () => void;
}

export default function SwipeableActions({
  children,
  pinned,
  onTogglePinned,
  onDelete,
}: SwipeableActionsProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentX = useRef(0);

  const animateTo = (toValue: number) => {
    currentX.current = toValue;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      tension: 90,
      friction: 12,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        const nextX = Math.max(-ACTIONS_WIDTH, Math.min(0, currentX.current + gesture.dx));
        translateX.setValue(nextX);
      },
      onPanResponderRelease: (_, gesture) => {
        const nextX = currentX.current + gesture.dx;
        animateTo(nextX < -ACTION_WIDTH ? -ACTIONS_WIDTH : 0);
      },
      onPanResponderTerminate: () => animateTo(currentX.current),
    })
  ).current;

  const handleTogglePinned = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTogglePinned();
    animateTo(0);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete();
    animateTo(0);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.action, styles.pinAction]}
          onPress={handleTogglePinned}
          activeOpacity={0.85}
        >
          <Ionicons name={pinned ? 'pin' : 'pin-outline'} size={21} color="#fff" />
          <Text style={styles.actionText}>{pinned ? 'Soltar' : 'Anclar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, styles.deleteAction]}
          onPress={handleDelete}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={21} color="#fff" />
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.foreground, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 12,
  },
  actions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#242424',
  },
  action: {
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pinAction: {
    backgroundColor: '#534AB7',
  },
  deleteAction: {
    backgroundColor: '#dc2626',
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  foreground: {
    borderRadius: 12,
  },
});
