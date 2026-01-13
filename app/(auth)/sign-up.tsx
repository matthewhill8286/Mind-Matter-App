import React, { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  async function onCreate() {
    await AsyncStorage.setItem("auth:session:v1", JSON.stringify({ email, createdAt: new Date().toISOString() }));
    router.replace("/(onboarding)/assessment");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#6f6660", padding: 24, justifyContent: "center" }}>
      <View style={{ backgroundColor: "white", borderRadius: 28, padding: 26 }}>
        <Text style={{ fontSize: 26, fontWeight: "900" }}>Sign up</Text>
        <Text style={{ opacity: 0.7, marginTop: 8 }}>Placeholder screen (design route).</Text>

        <Text style={{ marginTop: 18, fontWeight: "900" }}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="you@email.com" style={input} autoCapitalize="none" />

        <Text style={{ marginTop: 14, fontWeight: "900" }}>Password</Text>
        <TextInput value={pass} onChangeText={setPass} placeholder="Create a password" style={input} secureTextEntry />

        <Pressable onPress={onCreate} style={primaryBtn}>
          <Text style={primaryBtnText}>Create account</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ textAlign: "center", fontWeight: "800", opacity: 0.75 }}>Back to sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const input = { marginTop: 8, padding: 12, borderRadius: 16, backgroundColor: "#f2f2f2" };
const primaryBtn = { marginTop: 18, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" };
const primaryBtnText = { color: "white", fontWeight: "900" };
