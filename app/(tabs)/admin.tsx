import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/auth-context";
import { adminAPI, DashboardStatsResponse } from "../../services/api";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Only load if user is admin
    if (user?.role === "ADMIN") {
      loadDashboardStats();
    } else {
      // Redirect non-admin users
      router.replace("/(tabs)/tests");
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      alert("Statistika məlumatlarını yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardStats();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#7313e8"]}
          />
        }
      >
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="shield-checkmark" size={32} color="#7313e8" />
          </View>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              Xoş gəlmisiniz, {user?.firstName || "Admin"}!
            </Text>
            <Text style={styles.welcomeSubtitle}>İdarəetmə paneli</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Ümumi Statistika</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="people" size={28} color="#2563EB" />
              </View>
              <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Ümumi İstifadəçi</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
                <Ionicons name="document-text" size={28} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{stats?.totalTests || 0}</Text>
              <Text style={styles.statLabel}>Ümumi Test</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="checkmark-circle" size={28} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{stats?.publishedTests || 0}</Text>
              <Text style={styles.statLabel}>Dərc edilmiş</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#E9D5FF" }]}>
                <Ionicons name="create" size={28} color="#9333EA" />
              </View>
              <Text style={styles.statValue}>{stats?.draftTests || 0}</Text>
              <Text style={styles.statLabel}>Qaralama</Text>
            </View>

            <View style={styles.statCardWide}>
              <View style={[styles.statIcon, { backgroundColor: "#FECACA" }]}>
                <Ionicons name="list" size={28} color="#DC2626" />
              </View>
              <Text style={styles.statValue}>{stats?.totalAttempts || 0}</Text>
              <Text style={styles.statLabel}>Ümumi Cəhdlər</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tez Əməliyyatlar</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/admin/tests/create" as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="add-circle" size={32} color="#2563EB" />
              </View>
              <Text style={styles.actionTitle}>Test Yarat</Text>
              <Text style={styles.actionSubtitle}>Yeni test əlavə et</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/admin/tests" as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#D1FAE5" }]}>
                <Ionicons name="list" size={32} color="#10B981" />
              </View>
              <Text style={styles.actionTitle}>Testləri İdarə Et</Text>
              <Text style={styles.actionSubtitle}>Bütün testlər</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/admin/users" as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="people" size={32} color="#F59E0B" />
              </View>
              <Text style={styles.actionTitle}>İstifadəçilər</Text>
              <Text style={styles.actionSubtitle}>İdarəetmə</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/statistics" as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E9D5FF" }]}>
                <Ionicons name="stats-chart" size={32} color="#9333EA" />
              </View>
              <Text style={styles.actionTitle}>Statistika</Text>
              <Text style={styles.actionSubtitle}>Tam hesabat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Users */}
        {stats?.recentUsers && stats.recentUsers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Son İstifadəçilər</Text>
              <TouchableOpacity
                onPress={() => router.push("/admin/users" as any)}
              >
                <Text style={styles.seeAllText}>Hamısı</Text>
              </TouchableOpacity>
            </View>

            {stats.recentUsers.slice(0, 5).map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => router.push(`/admin/users/${user.id}` as any)}
              >
                <View style={styles.userAvatar}>
                  {user.profilePictureUrl ? (
                    <View style={styles.userAvatarPlaceholder}>
                      <Text style={styles.userAvatarText}>
                        {user.firstName?.charAt(0) || "?"}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.userAvatarPlaceholder}>
                      <Text style={styles.userAvatarText}>
                        {user.firstName?.charAt(0) || "?"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={styles.userBadges}>
                  {user.role === "ADMIN" && (
                    <View style={[styles.badge, styles.badgeAdmin]}>
                      <Text style={styles.badgeText}>Admin</Text>
                    </View>
                  )}
                  {user.isPremium && (
                    <View style={[styles.badge, styles.badgePremium]}>
                      <Text style={styles.badgeText}>Premium</Text>
                    </View>
                  )}
                  {user.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7313e8",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  welcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7313e8",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "48%",
  },
  statCardWide: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "48%",
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  userAvatar: {
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7313e8",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
  },
  userBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeAdmin: {
    backgroundColor: "#DBEAFE",
  },
  badgePremium: {
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  bottomSpacer: {
    height: 20,
  },
});
