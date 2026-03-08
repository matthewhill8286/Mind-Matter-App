import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UI, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardProps {
  title: string;
  description?: string;
  icon: any; // MaterialIcons name
  children?: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export const ActionCard = ({ title, description, icon, children, onPress, style }: CardProps) => {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const content = (
    <View style={[styles.card, { backgroundColor: colors.card }, style]}>
      <View style={styles.cardHeader}>
        <MaterialIcons name={icon} size={24} color={colors.primary} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {description && (
        <Text style={[styles.cardDescription, { color: colors.mutedText }]}>{description}</Text>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => <View style={{ opacity: pressed ? 0.9 : 1 }}>{content}</View>}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: UI.radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
});
