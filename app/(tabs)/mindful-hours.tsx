import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, Animated, Easing } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch, showAlert } from "@/store";

const PRESETS = [
  { label: "1 min", value: 60 },
  { label: "5 min", value: 300 },
  { label: "10 min", value: 600 },
  { label: "15 min", value: 900 },
];

export default function MindfulHours() {
  const dispatch = useDispatch<AppDispatch>();
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 4000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      if (secondsRemaining === 0 && isActive) {
        setIsActive(false);
        dispatch(showAlert({ title: "Session Complete", message: "Great job! You've completed your mindful session." }));
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dispatch, isActive, pulseAnim, secondsRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (secs: number) => {
    setIsActive(false);
    setSecondsRemaining(secs);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader title="Mindful Hours" subtitle="Take a moment to breathe and center yourself." />

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
        <Animated.View
          style={{
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 3,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Text style={{ fontSize: 48, fontWeight: "900", color: "#a07b55" }}>
            {formatTime(secondsRemaining)}
          </Text>
          <Text style={{ opacity: 0.5, fontWeight: "600", marginTop: 4 }}>
            {isActive ? "Focusing..." : "Ready"}
          </Text>
        </Animated.View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 40 }}>
          {PRESETS.map((p) => (
            <Pressable
              key={p.value}
              onPress={() => resetTimer(p.value)}
              disabled={isActive}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: secondsRemaining === p.value ? "#a07b55" : "white",
              }}
            >
              <Text style={{ fontWeight: "900", color: secondsRemaining === p.value ? "white" : "#111" }}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 16, marginTop: 30 }}>
          <Pressable
            onPress={toggleTimer}
            style={{
              flex: 1,
              backgroundColor: isActive ? "#333" : "#a07b55",
              paddingVertical: 18,
              paddingHorizontal: 32,
              borderRadius: 20,
              alignItems: "center",
              minWidth: 140,
            }}
          >
            <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>
              {isActive ? "Pause" : "Start"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => resetTimer(300)}
            style={{
              backgroundColor: "#eee",
              paddingVertical: 18,
              paddingHorizontal: 24,
              borderRadius: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "900", fontSize: 16 }}>Reset</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/resources-tab")}
          style={{ marginTop: 40, backgroundColor: "white", padding: 16, borderRadius: 18, width: "100%", alignItems: "center" }}
        >
          <Text style={{ fontWeight: "900" }}>Emergency Resources</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
