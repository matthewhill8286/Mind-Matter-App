import React from "react";
import { View, Text } from "react-native";
import MenuButton from "./MenuButton";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function ScreenHeader({ title, subtitle }: Readonly<{ title: string; subtitle?: string }>) {
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  return (
    <View style={{ marginTop: 26 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 26, fontWeight: "900", color: colors.text }}>{title}</Text>
        <MenuButton />
      </View>
      {subtitle ? <Text style={{ color: colors.mutedText, marginTop: 8 }}>{subtitle}</Text> : null}
    </View>
  );
}
