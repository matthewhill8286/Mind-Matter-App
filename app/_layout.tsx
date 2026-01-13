import { Stack } from "expo-router";
import { AlertModal } from "@/components/AlertModal";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" options={{ presentation: "modal" }} />
        <Stack.Screen name="menu" options={{ presentation: "modal" }} />
        <Stack.Screen name="resources" />
        <Stack.Screen name="(utils)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <AlertModal />
    </Provider>
  );
}
