import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  useEffect(() => {
    (async () => {
      const assessment = await AsyncStorage.getItem("assessment:v1");
      const profile = await AsyncStorage.getItem("profile:v1");
      const selectedIssues = await AsyncStorage.getItem("selectedIssues:v1");

      if (!assessment) return router.replace("/(onboarding)/welcome");
      if (!profile) return router.replace("/(onboarding)/profile-setup");
      if (!selectedIssues) return router.replace("/(onboarding)/suggested-categories");

      return router.replace("/(app)/home");
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
