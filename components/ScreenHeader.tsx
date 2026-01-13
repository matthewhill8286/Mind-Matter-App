import React from "react";
import { View, Text } from "react-native";
import MenuButton from "./MenuButton";

export default function ScreenHeader({ title, subtitle }: Readonly<{ title: string; subtitle?: string }>) {
  return (
    <View style={{ marginTop: 26 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 26, fontWeight: "900" }}>{title}</Text>
        <MenuButton />
      </View>
      {subtitle ? <Text style={{ opacity: 0.7, marginTop: 8 }}>{subtitle}</Text> : null}
    </View>
  );
}
