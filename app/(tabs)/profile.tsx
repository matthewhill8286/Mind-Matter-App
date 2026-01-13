import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

async function signOut() {
    await AsyncStorage.removeItem("auth:session:v1");
    router.replace("/(auth)/sign-in");
}

export default function Profile() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("auth:session:v1");
      if (raw) setEmail(JSON.parse(raw)?.email ?? null);
    })();
  }, []);



  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader title="Profile" subtitle={email ? `Signed in as ${email}` : "Not signed in"} />

      <Pressable onPress={() => router.push("/(tabs)/settings")} style={btn}>
        <Text style={{ fontWeight: "900" }}>Settings (selected categories)</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/help-center")} style={btn}>
        <Text style={{ fontWeight: "900" }}>Help Center</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(tabs)/utilities")} style={btn}>
        <Text style={{ fontWeight: "900" }}>Error & Other Utilities</Text>
      </Pressable>

      <Pressable onPress={signOut} style={[btn, { backgroundColor: "#ffe8e8" }]}>
        <Text style={{ fontWeight: "900" }}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const btn = { marginTop: 14, backgroundColor: "white", padding: 14, borderRadius: 18 };
