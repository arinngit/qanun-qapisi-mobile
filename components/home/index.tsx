import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Image
                source={require("../../assets/images/qanun.png")}
                style={{ width: 36, height: 36, resizeMode: "contain", borderRadius: 20 }}
                accessibilityLabel="qanun"
              />
            </View>
            <Text style={styles.headerTitle}>Qanun Qapısı</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Premium Banner */}
        <View style={styles.premiumBanner}>
          <View>
            <Text style={styles.bannerTitle}>Xoş gəlmisiniz, Aynur!</Text>
            <Text style={styles.bannerSubtitle}>
              Hazırlığınızı davam etdirin
            </Text>
          </View>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="checkmark" size={24} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="time-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Gözləyən</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>892</Text>
            <Text style={styles.statLabel}>Xal</Text>
          </View>
        </View>

        {/* Recent Tests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Testlər</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>Hamısını gör</Text>
            </TouchableOpacity>
          </View>

          {/* Test Card 1 */}
          <View style={styles.testCard}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>Mülki Hüquq Əsasları</Text>
              <View style={styles.premiumLabel}>
                <Text style={styles.premiumLabelText}>Premium</Text>
              </View>
            </View>
            <Text style={styles.testDescription}>
              Mülki hüququn əsas prinsipləri və qaydaları
            </Text>
            <View style={styles.testMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="help-circle-outline"
                  size={14}
                  color="#6B7280"
                />
                <Text style={styles.metaText}>25 sual</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="star-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>100 xal</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>45 dəq</Text>
              </View>
            </View>
            <View style={styles.testFooter}>
              <View style={styles.statusBadge}>
                <View
                  style={[styles.statusDot, { backgroundColor: "#10B981" }]}
                />
                <Text style={[styles.statusText, { color: "#10B981" }]}>
                  Tamamlandı
                </Text>
              </View>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Nəticələr</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Test Card 2 */}
          <View style={styles.testCard}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>Cinayət Hüququ</Text>
            </View>
            <Text style={styles.testDescription}>
              Cinayət hüququnun əsas anlayışları
            </Text>
            <View style={styles.testMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="help-circle-outline"
                  size={14}
                  color="#6B7280"
                />
                <Text style={styles.metaText}>30 sual</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="star-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>120 xal</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>60 dəq</Text>
              </View>
            </View>
            <View style={styles.testFooter}>
              <View style={styles.statusBadge}>
                <View
                  style={[styles.statusDot, { backgroundColor: "#F59E0B" }]}
                />
                <Text style={[styles.statusText, { color: "#F59E0B" }]}>
                  Yarımçıq
                </Text>
              </View>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Davam et</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Test Card 3 */}
          <View style={styles.testCard}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>Konstitusiya Hüququ</Text>
              <View style={styles.premiumLabel}>
                <Text style={styles.premiumLabelText}>Premium</Text>
              </View>
            </View>
            <Text style={styles.testDescription}>
              Konstitusiya və dövlət quruluşu
            </Text>
            <View style={styles.testMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="help-circle-outline"
                  size={14}
                  color="#6B7280"
                />
                <Text style={styles.metaText}>20 sual</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="star-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>80 xal</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>35 dəq</Text>
              </View>
            </View>
            <View style={styles.testFooter}>
              <View style={styles.statusBadge}>
                <View
                  style={[styles.statusDot, { backgroundColor: "#9CA3AF" }]}
                />
                <Text style={[styles.statusText, { color: "#6B7280" }]}>
                  Başlanmayıb
                </Text>
              </View>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Başla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tez Əməliyyatlar</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}
              >
                <Ionicons name="play" size={24} color="#7313e8" />
              </View>
              <Text style={styles.quickActionTitle}>Yeni Test</Text>
              <Text style={styles.quickActionSubtitle}>
                Hazırlığınızı başlayın
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#D1FAE5" }]}
              >
                <Ionicons name="stats-chart" size={24} color="#10B981" />
              </View>
              <Text style={styles.quickActionTitle}>Nəticələr</Text>
              <Text style={styles.quickActionSubtitle}>
                İrəliləyişi izləyin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <Ionicons name="bookmark" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionTitle}>Sevimlilər</Text>
              <Text style={styles.quickActionSubtitle}>Saxlanmış testlər</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#E9D5FF" }]}
              >
                <Ionicons name="school" size={24} color="#9333EA" />
              </View>
              <Text style={styles.quickActionTitle}>Müəllim</Text>
              <Text style={styles.quickActionSubtitle}>Əlaqə məlumatları</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: "#7313e8",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  premiumBanner: {
    backgroundColor: "#7313e8",
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#DBEAFE",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  seeAllButton: {
    fontSize: 14,
    color: "#7313e8",
    fontWeight: "600",
  },
  testCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  premiumLabel: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  premiumLabelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
  testDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  testMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  testFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#7313e8",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: "48%",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
});
