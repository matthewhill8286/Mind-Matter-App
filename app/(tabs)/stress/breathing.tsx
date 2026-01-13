import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import { useRouter } from "expo-router";

export default function Breathing() {
  const router = useRouter();
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycles, setCycles] = useState(0);

  const scale = useRef(new Animated.Value(0.75)).current;

  const plan = useMemo(() => {
    if (phase === "inhale") return { label: "Inhale", secs: 4 };
    if (phase === "hold") return { label: "Hold", secs: 7 };
    return { label: "Exhale", secs: 8 };
  }, [phase]);

  useEffect(() => {
    if (!running) return;

    setSecondsLeft(plan.secs);

    if (phase === "inhale") {
      Animated.timing(scale, { toValue: 1.05, duration: plan.secs * 1000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }).start();
    } else if (phase === "hold") {
      Animated.timing(scale, { toValue: 1.05, duration: plan.secs * 1000, useNativeDriver: true, easing: Easing.linear }).start();
    } else {
      Animated.timing(scale, { toValue: 0.75, duration: plan.secs * 1000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }).start();
    }

    const tick = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    const t = setTimeout(() => {
      clearInterval(tick);
      setPhase((p) => (p === "inhale" ? "hold" : p === "hold" ? "exhale" : "inhale"));
      if (phase === "exhale") setCycles((c) => c + 1);
    }, plan.secs * 1000);

    return () => {
      clearInterval(tick);
      clearTimeout(t);
    };
  }, [running, phase, plan.secs, scale]);

  function stop() {
    setRunning(false);
    setPhase("inhale");
    setSecondsLeft(4);
    Animated.timing(scale, { toValue: 0.75, duration: 220, useNativeDriver: true }).start();
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader
        title="Stress Management"
        subtitle="Quick tools for calming your body and clearing your mind."
      />
      <View style={{ flex: 1, marginTop: 14 }}>
        <View style={{ backgroundColor: "white", borderRadius: 18, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "900" }}>Breathing Coach (4–7–8)</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>
            Try 3–5 cycles. If you feel lightheaded, stop and breathe normally.
          </Text>
        </View>

        <View style={{ alignItems: "center", marginTop: 22 }}>
          <Animated.View
            style={{
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: "#efe6dd",
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale }],
            }}
          >
            <View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: "#a07b55", opacity: 0.25 }} />
          </Animated.View>

          <Text style={{ marginTop: 18, fontSize: 22, fontWeight: "900" }}>{plan.label}</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>{running ? `${secondsLeft}s` : "Ready"}</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>Cycles completed: {cycles}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 22 }}>
          {!running ? (
            <Pressable
              onPress={() => setRunning(true)}
              style={{ flex: 1, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>Start</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={stop}
              style={{ flex: 1, backgroundColor: "#333", padding: 16, borderRadius: 18, alignItems: "center" }}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>Stop</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              stop();
              router.back();
            }}
            style={{ flex: 1, backgroundColor: "#eee", padding: 16, borderRadius: 18, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "900" }}>Back</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
