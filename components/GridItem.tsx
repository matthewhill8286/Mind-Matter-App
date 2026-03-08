import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UI, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GridItemProps {
  title: string;
  icon: any; // MaterialIcons name
  onPress: () => void;
  style?: any;
}

export const GridItem = ({ title, icon, onPress, style }: GridItemProps) => {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <Pressable onPress={onPress} style={[styles.gridItem, { backgroundColor: colors.card }, style]}>
      <MaterialIcons name={icon} size={32} color={colors.primary} />
      <Text style={[styles.gridLabel, { color: colors.text }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    flex: 1,
    padding: 20,
    borderRadius: UI.radius.xl,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
});
