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
import { useAuth } from "../context/auth-context";
import { TestAttemptResponse, testsAPI } from "../services/api";
import { handleApiError } from "../utils/errorHandler";

interface TestAttemptWithTest extends TestAttemptResponse {
  testTitle: string;
}

export default function StatisticsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attempts, setAttempts] = useState<TestAttemptWithTest[]>([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    completedAttempts: 0,
    averageScore: 0,
    totalScore: 0,
    totalPossibleScore: 0,
    bestScore: 0,
    worstScore: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Since we don't have a dedicated user statistics endpoint,
      // we'll need to fetch all published tests and their attempts
      const testsResponse = await testsAPI.getTests({ page: 0, size: 100 });
      const tests = testsResponse.content;

      let allAttempts: TestAttemptWithTest[] = [];

      // Fetch attempts for each test
      for (const test of tests) {
        try {
          const testAttempts = await testsAPI.getTestAttempts(test.id);
          const attemptsWithTitle = testAttempts.map((attempt) => ({
            ...attempt,
            testTitle: test.title,
          }));
          allAttempts = [...allAttempts, ...attemptsWithTitle];
        } catch (error) {
          // Test not attempted, continue
        }
      }

      // Sort by submission date (most recent first)
      allAttempts.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      });

      setAttempts(allAttempts);

      // Calculate statistics
      const completedAttempts = allAttempts.filter(
        (attempt) => attempt.status === "COMPLETED"
      );

      const totalScore = completedAttempts.reduce(
        (sum, attempt) => sum + attempt.totalScore,
        0
      );

      const totalPossible = completedAttempts.reduce(
        (sum, attempt) => sum + attempt.maxPossibleScore,
        0
      );

      const scores = completedAttempts.map((attempt) => attempt.totalScore);
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

      setStats({
        totalAttempts: allAttempts.length,
        completedAttempts: completedAttempts.length,
        averageScore:
          completedAttempts.length > 0
            ? Math.round(totalScore / completedAttempts.length)
            : 0,
        totalScore,
        totalPossibleScore: totalPossible,
        bestScore,
        worstScore,
      });
    } catch (error: any) {
      handleApiError(error, "Statistika yüklənə bilmədi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Yarımçıq";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return "Bugün";
    } else if (diffDays === 1) {
      return "Dünən";
    } else if (diffDays < 7) {
      return `${diffDays} gün əvvəl`;
    } else {
      return date.toLocaleDateString("az-AZ");
    }
  };

  const getPercentage = (score: number, maxScore: number): number => {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 70) return "#10B981";
    if (percentage >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const renderAttemptCard = (attempt: TestAttemptWithTest) => {
    const percentage = getPercentage(
      attempt.totalScore,
      attempt.maxPossibleScore
    );
    const scoreColor = getScoreColor(percentage);

    return (
      <TouchableOpacity
        key={attempt.id}
        style={styles.attemptCard}
        onPress={() => {
          if (attempt.status === "COMPLETED") {
            router.push(`/test/results/${attempt.id}` as any);
          } else {
            router.push(`/test/take/${attempt.id}` as any);
          }
        }}
      >
        <View style={styles.attemptHeader}>
          <View style={styles.attemptInfo}>
            <Text style={styles.attemptTitle}>{attempt.testTitle}</Text>
            <Text style={styles.attemptDate}>
              {formatDate(attempt.submittedAt)}
            </Text>
          </View>

          {attempt.status === "COMPLETED" ? (
            <View
              style={[styles.attemptScore, { backgroundColor: scoreColor }]}
            >
              <Text style={styles.attemptScoreText}>{percentage}%</Text>
            </View>
          ) : (
            <View style={styles.attemptStatusBadge}>
              <Text style={styles.attemptStatusText}>Yarımçıq</Text>
            </View>
          )}
        </View>

        {attempt.status === "COMPLETED" && (
          <View style={styles.attemptFooter}>
            <Text style={styles.attemptScoreDetail}>
              {attempt.totalScore} / {attempt.maxPossibleScore} xal
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistika</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
        </View>
      </SafeAreaView>
    );
  }

  const overallPercentage =
    stats.totalPossibleScore > 0
      ? Math.round((stats.totalScore / stats.totalPossibleScore) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistika</Text>
        <View style={styles.headerRight} />
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
        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Ümumi Nəticə</Text>
          <View style={styles.overviewScoreContainer}>
            <Text style={styles.overviewScore}>{overallPercentage}%</Text>
            <Text style={styles.overviewLabel}>Orta uğur faizi</Text>
          </View>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>
                {stats.totalAttempts}
              </Text>
              <Text style={styles.overviewStatLabel}>Cəhd</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>
                {stats.completedAttempts}
              </Text>
              <Text style={styles.overviewStatLabel}>Tamamlanan</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{stats.averageScore}</Text>
              <Text style={styles.overviewStatLabel}>Orta xal</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.bestScore}</Text>
            <Text style={styles.statLabel}>Ən yaxşı nəticə</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="trending-down" size={24} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{stats.worstScore}</Text>
            <Text style={styles.statLabel}>Ən aşağı nəticə</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="calculator" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.totalScore}</Text>
            <Text style={styles.statLabel}>Toplam xal</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E9D5FF" }]}>
              <Ionicons name="checkmark-done" size={24} color="#9333EA" />
            </View>
            <Text style={styles.statValue}>
              {stats.completedAttempts > 0
                ? `${Math.round(
                    (stats.completedAttempts / stats.totalAttempts) * 100
                  )}%`
                : "0%"}
            </Text>
            <Text style={styles.statLabel}>Tamamlanma</Text>
          </View>
        </View>

        {/* Recent Attempts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Cəhdlər</Text>
          {attempts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="stats-chart-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>
                Hələ test cəhdiniz yoxdur
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push("/(tabs)/tests")}
              >
                <Text style={styles.browseButtonText}>Testlərə bax</Text>
              </TouchableOpacity>
            </View>
          ) : (
            attempts.map((attempt) => renderAttemptCard(attempt))
          )}
        </View>

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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overviewCard: {
    backgroundColor: "#7313e8",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
  },
  overviewScoreContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  overviewScore: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  overviewLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  overviewStat: {
    alignItems: "center",
  },
  overviewStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "48%",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  attemptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  attemptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  attemptInfo: {
    flex: 1,
  },
  attemptTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  attemptDate: {
    fontSize: 13,
    color: "#6B7280",
  },
  attemptScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attemptScoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  attemptStatusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attemptStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D97706",
  },
  attemptFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  attemptScoreDetail: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#7313e8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomSpacer: {
    height: 20,
  },
});
