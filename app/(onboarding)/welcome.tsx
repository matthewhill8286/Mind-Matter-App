import React, { useRef, useState } from "react";
import { View, Text, FlatList, Dimensions, Pressable } from "react-native";
import { router } from "expo-router";
import CarouselDots from "../../src/components/CarouselDots";

const SLIDES = [
  { step: "Step One", title: "Welcome to MindMate", text: "Calm, personalised mental health support." },
  { step: "Step Two", title: "Gently personalised", text: "Support shaped around how you feel." },
  { step: "Step Three", title: "Notice how you're feeling", text: "A short check-in helps tailor suggestions." },
  { step: "Step Four", title: "Talk, reflect, and unwind", text: "Chat or speak at your own pace." },
  { step: "Step Five", title: "Moments of calm and clarity", text: "Tools for grounding and clarity." },
  { step: "Step Six", title: "You're not alone here", text: "Get started when you're ready." },
];

const { width } = Dimensions.get("window");

export default function Welcome() {
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  return (
    <View style={{ flex: 1, backgroundColor: "#6f6660" }}>
      <View style={{ paddingTop: 52, paddingHorizontal: 24 }}>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "800" }}>Welcome</Text>
      </View>

      <FlatList
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={SLIDES}
        keyExtractor={(it) => it.step}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, padding: 24, justifyContent: "center" }}>
            <View style={{ backgroundColor: "white", borderRadius: 28, padding: 26, alignItems: "center" }}>
              <Text style={{ opacity: 0.6, fontWeight: "800" }}>{item.step}</Text>

              <View
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  backgroundColor: "#eee",
                  marginTop: 18,
                  marginBottom: 18,
                }}
              />

              <Text style={{ fontSize: 24, fontWeight: "900", textAlign: "center" }}>{item.title}</Text>
              <Text style={{ opacity: 0.7, marginTop: 10, textAlign: "center" }}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      <CarouselDots count={SLIDES.length} active={index} />

      <View style={{ padding: 24 }}>
        <Pressable
          onPress={() => {
            if (index === SLIDES.length - 1) router.replace("/(onboarding)/assessment");
            else ref.current?.scrollToIndex({ index: index + 1, animated: true });
          }}
          style={{ backgroundColor: "#a07b55", padding: 16, borderRadius: 16, alignItems: "center" }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>{index === SLIDES.length - 1 ? "Get started" : "Next"}</Text>
        </Pressable>

        <Pressable onPress={() => router.replace("/(onboarding)/assessment")} style={{ marginTop: 12 }}>
          <Text style={{ color: "white", opacity: 0.7, textAlign: "center" }}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
