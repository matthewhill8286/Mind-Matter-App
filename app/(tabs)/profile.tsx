import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, UI } from "@/constants/theme";

async function signOut() {
    await AsyncStorage.removeItem("auth:session:v1");
    router.replace("/(auth)/sign-in");
}

export default function Profile() {
  const [email, setEmail] = useState<string | null>(null);
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("auth:session:v1");
      if (raw) setEmail(JSON.parse(raw)?.email ?? null);
    })();
  }, []);

  const btnStyle = {
    marginTop: 14,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: UI.radius.lg,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: UI.spacing.xl, paddingTop: 18 }}>
      <ScreenHeader title="Profile" subtitle={email ? `Signed in as ${email}` : "Not signed in"} />

      <Pressable onPress={() => router.push("/(tabs)/settings")} style={btnStyle}>
        <Text style={{ fontWeight: "900", color: colors.text }}>Settings (selected categories)</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/help-center")} style={btnStyle}>
        <Text style={{ fontWeight: "900", color: colors.text }}>Help Center</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/utilities")} style={btnStyle}>
        <Text style={{ fontWeight: "900", color: colors.text }}>Error & Other Utilities</Text>
      </Pressable>

      <Pressable onPress={signOut} style={[btnStyle, { backgroundColor: theme === "light" ? "#ffe8e8" : "#442222" }]}>
        <Text style={{ fontWeight: "900", color: theme === "light" ? "#b22" : "#f88" }}>Sign out</Text>
      </Pressable>
    </View>
  );
}
