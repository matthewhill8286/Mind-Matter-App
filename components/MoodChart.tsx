import React, { useMemo } from "react";
import { View, Text } from "react-native";
import type { MoodCheckIn } from "@/lib/mood";

const moodScore: Record<MoodCheckIn["mood"], number> = {
  Great: 5,
  Good: 4,
  Okay: 3,
  Low: 2,
  Bad: 1,
};

function dayKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function labelFromKey(k: string) {
  const [y, m, d] = k.split("-").map((x) => x);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: "short" });
}

export default function MoodChart({ items }: Readonly<{ items: MoodCheckIn[] }>) {
  const data = useMemo(() => {
    const today = new Date();
    const keys: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      keys.push(dayKey(d.toISOString()));
    }

    const byDay = new Map<string, MoodCheckIn[]>();
    for (const it of items) {
      const k = dayKey(it.createdAt);
      byDay.set(k, [...(byDay.get(k) ?? []), it]);
    }

    return keys.map((k) => {
      const list = byDay.get(k) ?? [];
      if (!list.length) return { key: k, label: labelFromKey(k), moodAvg: null as number | null, stressAvg: null as number | null };

      const moodAvg = list.reduce((a, x) => a + moodScore[x.mood], 0) / list.length;
      const stressAvg = list.reduce((a, x) => a + x.stress, 0) / list.length;
      return { key: k, label: labelFromKey(k), moodAvg, stressAvg };
    });
  }, [items]);

  const maxMood = 5;
  const maxStress = 10;

  return (
    <View style={{ backgroundColor: "white", borderRadius: 18, padding: 14 }}>
      <Text style={{ fontWeight: "900" }}>Last 7 days</Text>
      <Text style={{ opacity: 0.7, marginTop: 6 }}>Mood (bars) • Stress (dots)</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
        {data.map((d) => {
          const h = d.moodAvg == null ? 6 : Math.max(6, (d.moodAvg / maxMood) * 72);
          const dotY = d.stressAvg == null ? null : Math.max(0, Math.min(72, (d.stressAvg / maxStress) * 72));
          return (
            <View key={d.key} style={{ alignItems: "center", width: 34 }}>
              <View style={{ height: 80, justifyContent: "flex-end", alignItems: "center" }}>
                {dotY == null ? null : (
                    <View
                        style={{
                          position: "absolute",
                          bottom: dotY,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#333",
                          opacity: 0.65,
                        }}
                    />
                )}
                <View
                  style={{
                    width: 14,
                    height: h,
                    borderRadius: 7,
                    backgroundColor: "#a07b55",
                    opacity: d.moodAvg == null ? 0.18 : 0.45,
                  }}
                />
              </View>
              <Text style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
