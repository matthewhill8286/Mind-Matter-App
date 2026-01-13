import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    ImageSourcePropType,
    SafeAreaView,
} from "react-native";

type Slide = {
    step: string;   // "Step Five"
    title: string;  // "You're not alone here"
    text: string;   // description
};

type Props = {
    slideIndex: number;                 // 0-based (0..N-1)
    slides: Slide[];                    // your SLIDES
    illustration: ImageSourcePropType;  // require(...) or { uri: ... }
    onNext?: () => void;
    onBack?: () => void;
};

export default function Welcome({
                                            slideIndex,
                                            slides,
                                            illustration,
                                            onNext,
                                            onBack,
                                        }: Readonly<Props>) {
    const total = slides.length || 1;
    const safeIndex = Math.max(0, Math.min(slideIndex, total - 1));
    const slide = slides[safeIndex];

    const progress = useMemo(() => {
        // Step 5 of 6 => (4+1)/6 = 0.8333
        return (safeIndex + 1) / total;
    }, [safeIndex, total]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.screen}>
                {/* Optional back (not visible in your screenshot, but useful) */}
                {onBack ? (
                    <Pressable onPress={onBack} style={styles.backHit} accessibilityRole="button" accessibilityLabel="Back">
                        <Text style={styles.backText}>‹</Text>
                    </Pressable>
                ) : (
                    <View style={styles.backSpacer} />
                )}

                {/* Step label */}
                <Text style={styles.step}>{slide?.step ?? `Step ${safeIndex + 1}`}</Text>

                {/* Illustration */}
                <View style={styles.illustrationWrap}>
                    <Image source={illustration} style={styles.illustration} resizeMode="contain" />
                </View>

                {/* Bottom content row */}
                <View style={styles.bottomRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headline}>{slide?.title ?? ""}</Text>
                        <Text style={styles.body}>{slide?.text ?? ""}</Text>
                    </View>

                    <Pressable
                        onPress={onNext}
                        style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.98 }] }]}
                        accessibilityRole="button"
                        accessibilityLabel="Next"
                    >
                        {/* Arrow */}
                        <View style={styles.arrowStem} />
                        <View style={styles.arrowHead} />
                    </Pressable>
                </View>

                {/* Bottom progress indicator */}
                <View style={styles.progressTrack} accessibilityRole="progressbar">
                    <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
                </View>

                {/* Optional "Step x of N" text (hidden by default — enable if you want) */}
                {/* <Text style={styles.progressText}>{safeIndex + 1} / {total}</Text> */}
            </View>
        </SafeAreaView>
    );
}

const BG = "#F6F4F2";
const INK = "#1A1A1A";
const MUTED = "rgba(0,0,0,0.55)";
const BROWN = "#9C7A57";

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    screen: {
        flex: 1,
        paddingHorizontal: 22,
        paddingTop: 14,
        paddingBottom: 18,
    },

    backSpacer: { height: 36 },
    backHit: {
        height: 36,
        width: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    backText: { fontSize: 26, fontWeight: "900", color: INK, marginTop: -2 },

    step: {
        textAlign: "center",
        fontSize: 14,
        fontWeight: "800",
        color: INK,
        marginTop: 6,
        letterSpacing: 0.2,
    },

    illustrationWrap: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
        marginBottom: 12,
    },
    illustration: {
        width: "92%",
        height: "78%",
    },

    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        paddingHorizontal: 2,
        marginBottom: 12,
    },

    headline: {
        fontSize: 20,
        fontWeight: "900",
        color: BROWN,
        lineHeight: 24,
    },
    body: {
        marginTop: 6,
        fontSize: 13,
        lineHeight: 18,
        color: "rgba(0,0,0,0.55)",
        fontWeight: "600",
    },

    cta: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: BROWN,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
    },

    // Arrow icon (no deps)
    arrowStem: {
        width: 18,
        height: 2.5,
        backgroundColor: "white",
        borderRadius: 2,
        transform: [{ translateX: 2 }],
    },
    arrowHead: {
        position: "absolute",
        right: 18,
        width: 10,
        height: 10,
        borderRightWidth: 2.5,
        borderTopWidth: 2.5,
        borderColor: "white",
        transform: [{ rotate: "45deg" }],
    },

    progressTrack: {
        alignSelf: "center",
        width: 86,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(0,0,0,0.15)",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: MUTED,
    },

    // progressText: { textAlign: "center", marginTop: 8, opacity: 0.5, fontWeight: "700" },
});
