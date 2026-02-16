import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function LegalScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const openLink = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        } catch (error) {
            console.error("Error opening link:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            {/* Header */}
            <View style={[styles.header]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hüquqi Məlumat</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Government Disclaimer Section */}
                <View style={[styles.section, styles.warningSection]}>
                    <View style={styles.warningHeader}>
                        <Ionicons name="warning" size={24} color="#B45309" />
                        <Text style={styles.warningTitle}>Vacib Bildiriş</Text>
                    </View>
                    <Text style={styles.warningText}>
                        "Qanun Qapısı" tətbiqi müstəqil bir layihədir və Azərbaycan Respublikasının heç bir dövlət orqanını, hökumət qurumunu və ya rəsmi təşkilatını təmsil etmir.
                    </Text>
                    <Text style={styles.warningText}>
                        Tətbiqdə təqdim olunan məlumatlar yalnız maarifləndirmə və imtahanlara hazırlıq məqsədi daşıyır.
                    </Text>
                </View>

                {/* Data Sources Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Məlumat Mənbələri</Text>
                    <Text style={styles.paragraph}>
                        Tətbiqdə istifadə olunan qanunvericilik aktları və hüquqi məlumatlar aşağıdakı rəsmi, açıq mənbələrdən əldə edilmişdir:
                    </Text>

                    <TouchableOpacity
                        style={styles.sourceLink}
                        onPress={() => openLink("https://e-qanun.az")}
                    >
                        <Ionicons name="link" size={20} color="#7313e8" />
                        <View style={styles.sourceContent}>
                            <Text style={styles.sourceTitle}>e-qanun.az</Text>
                            <Text style={styles.sourceDesc}>Azərbaycan Respublikasının Vahid Hüquqi Bazasını təşkil edən rəsmi internet resursu.</Text>
                        </View>
                        <Ionicons name="open-outline" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Privacy Policy Link */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Digər</Text>
                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => router.push("/privacy-policy")}
                    >
                        <Ionicons name="shield-checkmark-outline" size={22} color="#4B5563" />
                        <Text style={styles.linkText}>Məxfilik Siyasəti</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Qanun Qapısı (Unofficial)
                    </Text>
                    <Text style={styles.footerSubText}>
                        © 2026 Bütün hüquqlar qorunur
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    backButton: {
        padding: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111827",
        flex: 1,
        textAlign: "center",
        marginLeft: -40,
    },
    placeholder: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    warningSection: {
        backgroundColor: "#FFFBEB",
        borderColor: "#FCD34D",
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
    },
    warningHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#92400E",
    },
    warningText: {
        fontSize: 14,
        lineHeight: 22,
        color: "#92400E",
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 16,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: "#374151",
        marginBottom: 16,
    },
    sourceLink: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 12,
    },
    sourceContent: {
        flex: 1,
    },
    sourceTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    sourceDesc: {
        fontSize: 13,
        color: "#6B7280",
        lineHeight: 18,
    },
    linkItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 12,
    },
    linkText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: "#111827",
    },
    footer: {
        marginTop: 10,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        alignItems: "center",
    },
    footerText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4B5563",
        textAlign: "center",
    },
    footerSubText: {
        fontSize: 12,
        color: "#9CA3AF",
        textAlign: "center",
        marginTop: 4,
    },
});
