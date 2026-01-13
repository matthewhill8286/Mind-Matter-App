import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  useEffect(() => {
    (async () => {
      const onboardingSeen = await AsyncStorage.getItem("onboarding:seen:v1");
      const authed = await AsyncStorage.getItem("auth:session:v1");
      const assessment = await AsyncStorage.getItem("assessment:v1");
      const profile = await AsyncStorage.getItem("profile:v1");
      const selectedIssues = await AsyncStorage.getItem("selectedIssues:v1");

      if (!onboardingSeen) return router.replace("/(onboarding)/splash-loading");
      if (!authed) return router.replace("/(auth)/sign-in");

      if (!assessment) return router.replace("/(onboarding)/assessment");
      if (!profile) return router.replace("/(onboarding)/profile-setup");
      if (!selectedIssues) return router.replace("/(onboarding)/suggested-categories");

      return router.replace("/(tabs)/home");
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
