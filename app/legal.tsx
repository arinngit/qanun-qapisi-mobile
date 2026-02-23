import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useCallback} from "react";
import {Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {
    BACKGROUND_CARD,
    BACKGROUND_PAGE,
    BORDER_DEFAULT,
    BORDER_LIGHT,
    BRAND_PRIMARY,
    GRAY,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    TEXT_TERTIARY,
    WARNING_BG,
    WARNING_BORDER,
    WARNING_TEXT,
} from "@/constants/colors";

export default function LegalScreen() {
  const router = useRouter();

  const openLink = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      // Silently fail - link could not be opened
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hüquqi Məlumat</Text>
        <View style={styles.placeholder}/>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, styles.warningSection]}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={24} color="#B45309"/>
            <Text style={styles.warningTitle}>Vacib Bildiriş</Text>
          </View>
          <Text style={styles.warningText}>
            {'"Fərid Qurbanovun Testləri" tətbiqi müstəqil bir layihədir və Azərbaycan Respublikasının heç bir dövlət orqanını, hökumət qurumunu və ya rəsmi təşkilatını təmsil etmir.'}
          </Text>
          <Text style={styles.warningText}>
            Tətbiqdə təqdim olunan məlumatlar yalnız maarifləndirmə və imtahanlara hazırlıq məqsədi daşıyır.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Məlumat Mənbələri</Text>
          <Text style={styles.paragraph}>
            Tətbiqdə istifadə olunan qanunvericilik aktları və hüquqi məlumatlar aşağıdakı rəsmi, açıq mənbələrdən əldə
            edilmişdir:
          </Text>

          <TouchableOpacity
            style={styles.sourceLink}
            onPress={() => openLink("https://e-qanun.az")}
          >
            <Ionicons name="link" size={20} color={BRAND_PRIMARY}/>
            <View style={styles.sourceContent}>
              <Text style={styles.sourceTitle}>e-qanun.az</Text>
              <Text style={styles.sourceDesc}>Azərbaycan Respublikasının Vahid Hüquqi Bazasını təşkil edən rəsmi
                internet resursu.</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={TEXT_TERTIARY}/>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Digər</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => router.push("/privacy-policy")}
          >
            <Ionicons name="shield-checkmark-outline" size={22} color={GRAY[600]}/>
            <Text style={styles.linkText}>Məxfilik Siyasəti</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_TERTIARY}/>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Fərid Qurbanovun Testləri
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
    backgroundColor: BACKGROUND_PAGE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: BACKGROUND_CARD,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  backButton: {
    padding: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: TEXT_PRIMARY,
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
    backgroundColor: WARNING_BG,
    borderColor: WARNING_BORDER,
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
    color: WARNING_TEXT,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 22,
    color: WARNING_TEXT,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: GRAY[700],
    marginBottom: 16,
  },
  sourceLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BACKGROUND_CARD,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    gap: 12,
  },
  sourceContent: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  sourceDesc: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BACKGROUND_CARD,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: TEXT_PRIMARY,
  },
  footer: {
    marginTop: 10,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: BORDER_DEFAULT,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: GRAY[600],
    textAlign: "center",
  },
  footerSubText: {
    fontSize: 12,
    color: TEXT_TERTIARY,
    textAlign: "center",
    marginTop: 4,
  },
});
