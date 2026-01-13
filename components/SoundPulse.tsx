import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function SoundPulse({ active }: Readonly<{ active: boolean }>) {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;

  function loop(anim: Animated.Value, delay: number) {
    anim.setValue(0);
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
  }

  useEffect(() => {
    if (!active) {
      a1.stopAnimation();
      a2.stopAnimation();
      return;
    }
    const l1 = loop(a1, 0);
    const l2 = loop(a2, 400);
    l1.start();
    l2.start();
    return () => {
      l1.stop();
      l2.stop();
    };
  }, [active]);

  const ringStyle = (anim: Animated.Value) => ({
    position: "absolute" as const,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: "rgba(160,123,85,0.35)",
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.3] }) }],
  });

  return (
    <View style={{ width: 200, height: 200, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={ringStyle(a1)} />
      <Animated.View style={ringStyle(a2)} />
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#a07b55", opacity: active ? 0.95 : 0.4 }} />
    </View>
  );
}
