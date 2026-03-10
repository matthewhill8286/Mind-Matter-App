import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDates?: string[]; // ISO strings (YYYY-MM-DD)
}

export default function Calendar({ selectedDate, onSelectDate, markedDates = [] }: CalendarProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const monthData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    // Padding for first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [selectedDate]);

  const monthName = selectedDate.toLocaleString('default', { month: 'long' });
  const year = selectedDate.getFullYear();

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    onSelectDate(newDate);
  };

  const isSelected = (d: Date) =>
    d.getDate() === selectedDate.getDate() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getFullYear() === selectedDate.getFullYear();

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const hasMark = (d: Date) => {
    try {
      const iso = d.toISOString().split('T')[0];
      return markedDates.includes(iso);
    } catch (e) {
      return false;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Pressable onPress={() => changeMonth(-1)} style={styles.navBtn}>
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '900' }}>←</Text>
        </Pressable>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {monthName} {year}
        </Text>
        <Pressable onPress={() => changeMonth(1)} style={styles.navBtn}>
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '900' }}>→</Text>
        </Pressable>
      </View>

      <View style={styles.weekDays}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <Text key={i} style={[styles.weekDayText, { color: colors.mutedText }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {monthData.map((date, i) => {
          if (!date) return <View key={`empty-${i}`} style={styles.dayCell} />;

          const selected = isSelected(date);
          const today = isToday(date);
          const marked = hasMark(date);

          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => onSelectDate(date)}
              style={[
                styles.dayCell,
                selected && { backgroundColor: colors.primary, borderRadius: 12 },
                !selected &&
                  today && { borderColor: colors.primary, borderWidth: 1, borderRadius: 12 },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: selected ? colors.onPrimary : colors.text },
                  selected && { fontWeight: '900' },
                ]}
              >
                {date.getDate()}
              </Text>
              {marked && !selected && (
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: UI.radius.lg,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
