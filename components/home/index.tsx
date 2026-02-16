import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
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
import { useAuth } from "../../context/auth-context";
import {
  TestAttemptResponse,
  TestResponse,
  testsAPI,
} from "../../services/api";
import { handleApiError } from "../../utils/errorHandler";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentTests, setRecentTests] = useState<TestResponse[]>([]);
  const [attemptsByTest, setAttemptsByTest] = useState<
    Map<string, TestAttemptResponse>
  >(new Map());
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    totalScore: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch recent published tests
      const testsResponse = await testsAPI.getTests({
        page: 0,
        size: 10,
        sortBy: "publishedAt",
        sortDir: "desc",
      });
      const tests = testsResponse.content;
      setRecentTests(tests.slice(0, 3)); // Take first 3 for display

      // Fetch attempts for each test to determine status
      const attemptsMap = new Map<string, TestAttemptResponse>();
      let completedCount = 0;
      let inProgressCount = 0;
      let totalScore = 0;

      for (const test of tests) {
        try {
          const attempts = await testsAPI.getTestAttempts(test.id);
          if (attempts && attempts.length > 0) {
            // Get the most recent attempt
            const latestAttempt = attempts[0];
            attemptsMap.set(test.id, latestAttempt);

            if (latestAttempt.status === "COMPLETED") {
              completedCount++;
              totalScore += latestAttempt.totalScore;
            } else if (latestAttempt.status === "IN_PROGRESS") {
              inProgressCount++;
            }
          }
        } catch (error) {
          // Test not attempted yet, continue
        }
      }

      setAttemptsByTest(attemptsMap);
      setStats({
        completed: completedCount,
        inProgress: inProgressCount,
        totalScore,
      });
    } catch (error: any) {
      handleApiError(error, "Ana səhifə məlumatlarını yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getTestStatus = (testId: string) => {
    const attempt = attemptsByTest.get(testId);
    if (!attempt) {
      return { status: "NOT_STARTED", color: "#9CA3AF", text: "Başlanmayıb" };
    }
    if (attempt.status === "COMPLETED") {
      return { status: "COMPLETED", color: "#10B981", text: "Tamamlandı" };
    }
    return { status: "IN_PROGRESS", color: "#F59E0B", text: "Yarımçıq" };
  };

  const handleTestPress = async (testId: string) => {
    const attempt = attemptsByTest.get(testId);
    if (!attempt) {
      // Start new test
      try {
        // First fetch full test details
        const testDetails = await testsAPI.getTestById(testId);
        const newAttempt = await testsAPI.startTest(testId);

        // Save test data to AsyncStorage
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        const storageKey = `test_attempt_${newAttempt.id}`;
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify({ test: testDetails, answers: {} })
        );

        router.push(`/test/take/${newAttempt.id}` as any);
      } catch (error: any) {
        handleApiError(error, "Testi başlatmaq mümkün olmadı");
      }
    } else if (attempt.status === "COMPLETED") {
      // View results
      router.push(`/test/results/${attempt.id}` as any);
    } else {
      // Continue test
      router.push(`/test/take/${attempt.id}` as any);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "new-test":
        router.push("/(tabs)/tests");
        break;
      case "results":
        router.push("/(tabs)/tests");
        break;
      case "bookmarks":
        router.push("/bookmarks" as any);
        break;
      case "teacher":
        router.push("/(tabs)/info");
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#7313e8"]}
          />
        }
        contentContainerStyle={{ paddingTop: Math.max(insets.top, 16) }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Image
                source={require("../../assets/images/qanun-new.png")}
                style={{
                  width: 36,
                  height: 36,
                  resizeMode: "contain",
                  borderRadius: 20,
                }}
                accessibilityLabel="qanun-new"
              />
            </View>
            <Text style={styles.headerTitle}>Qanun Qapısı</Text>
          </View>
        </View>

        {/* Premium Banner */}
        <View style={styles.premiumBanner}>
          <View>
            <Text style={styles.bannerTitle}>
              Xoş gəlmisiniz, {user?.firstName || "İstifadəçi"}!
            </Text>
            <Text style={styles.bannerSubtitle}>
              Hazırlığınızı davam etdirin
            </Text>
          </View>
          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="checkmark" size={24} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="time-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statNumber}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>Gözləyən</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{stats.totalScore}</Text>
            <Text style={styles.statLabel}>Xal</Text>
          </View>
        </View>

        {/* Recent Tests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Testlər</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/tests")}>
              <Text style={styles.seeAllButton}>Hamısını gör</Text>
            </TouchableOpacity>
          </View>

          {recentTests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#9CA3AF"
              />
              <Text style={styles.emptyStateText}>Hələ test yoxdur</Text>
            </View>
          ) : (
            recentTests.map((test) => {
              const status = getTestStatus(test.id);
              const attempt = attemptsByTest.get(test.id);

              return (
                <View key={test.id} style={styles.testCard}>
                  <TouchableOpacity
                    onPress={() => router.push(`/test/${test.id}` as any)}
                  >
                    <View style={styles.testHeader}>
                      <Text style={styles.testTitle}>{test.title}</Text>
                      {test.isPremium && (
                        <View style={styles.premiumLabel}>
                          <Text style={styles.premiumLabelText}>Premium</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.testDescription} numberOfLines={2}>
                      {test.description}
                    </Text>
                    <View style={styles.testMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="help-circle-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.metaText}>
                          {test.questionCount} sual
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="star-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.metaText}>
                          {test.totalPossibleScore} xal
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.metaText}>
                          {test.estimatedMinutes} dəq
                        </Text>
                      </View>
                    </View>
                    <View style={styles.testFooter}>
                      <View style={styles.statusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: status.color },
                          ]}
                        />
                        <Text
                          style={[styles.statusText, { color: status.color }]}
                        >
                          {status.text}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={
                          status.status === "COMPLETED"
                            ? styles.secondaryButton
                            : styles.primaryButton
                        }
                        onPress={() => handleTestPress(test.id)}
                      >
                        <Text
                          style={
                            status.status === "COMPLETED"
                              ? styles.secondaryButtonText
                              : styles.primaryButtonText
                          }
                        >
                          {status.status === "COMPLETED"
                            ? "Nəticələr"
                            : status.status === "IN_PROGRESS"
                            ? "Davam et"
                            : "Başla"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tez Əməliyyatlar</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction("new-test")}
            >
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

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction("results")}
            >
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

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction("bookmarks")}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <Ionicons name="bookmark" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionTitle}>Sevimlilər</Text>
              <Text style={styles.quickActionSubtitle}>Saxlanmış testlər</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleQuickAction("teacher")}
            >
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
    paddingBottom: 16,
    paddingTop: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
});
