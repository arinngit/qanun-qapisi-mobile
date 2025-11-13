import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  adminAPI,
  TestAttemptAdminResponse,
  TestDetailResponse,
  testsAPI,
  TestStatisticsResponse,
} from "../../services/api";
import { bookmarksService } from "../../services/bookmarks";
import { showSuccess } from "../../utils/errorHandler";

export default function TestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [test, setTest] = useState<TestDetailResponse | null>(null);
  const [statistics, setStatistics] = useState<TestStatisticsResponse | null>(
    null
  );
  const [recentResults, setRecentResults] = useState<
    TestAttemptAdminResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadTestData();
    checkBookmarkStatus();
  }, [id]);

  const checkBookmarkStatus = async () => {
    if (!id) return;
    const bookmarked = await bookmarksService.isBookmarked(id as string);
    setIsBookmarked(bookmarked);
  };

  const loadTestData = async () => {
    try {
      if (!id) return;

      // Load test details
      const testData = await testsAPI.getTestById(id as string);
      setTest(testData);

      // Load statistics
      try {
        const stats = await testsAPI.getTestStatistics(id as string);
        setStatistics(stats);
      } catch (error) {
        console.log("Could not load statistics:", error);
      }

      // Load recent results (admin only)
      if (user?.role === "ADMIN") {
        try {
          const resultsResponse = await adminAPI.getTestResults(id as string, {
            page: 0,
            size: 5,
            sortBy: "submittedAt",
            sortDir: "desc",
          });
          setRecentResults(resultsResponse.content);
        } catch (error) {
          console.log("Could not load results:", error);
        }
      }
    } catch (error) {
      console.error("Error loading test data:", error);
      alert("Test məlumatlarını yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!id) return;

    try {
      const newStatus = await bookmarksService.toggleBookmark(id as string);
      setIsBookmarked(newStatus);
      showSuccess(
        newStatus
          ? "Test sevimlilərə əlavə edildi"
          : "Test sevimlilərdən silindi"
      );
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleStartTest = async () => {
    try {
      if (!id || !test) return;

      const attempt = await testsAPI.startTest(id as string);

      // Save test data and attempt to AsyncStorage for test-taking screen
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      const storageKey = `test_attempt_${attempt.id}`;
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({ test, answers: {} })
      );

      router.push(`/test/take/${attempt.id}` as any);
    } catch (error: any) {
      console.error("Error starting test:", error);

      // Check if premium test and user not premium
      if (error.response?.status === 403) {
        alert("Bu test yalnız Premium istifadəçilər üçündür");
      } else {
        alert("Testi başlatmaq mümkün olmadı");
      }
    }
  };

  const getQuestionTypeName = (type: string): string => {
    switch (type) {
      case "CLOSED_SINGLE":
        return "Tək seçimli";
      case "CLOSED_MULTIPLE":
        return "Çoxlu seçimli";
      case "OPEN_TEXT":
        return "Açıq cavab";
      default:
        return type;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} dəqiqə əvvəl`;
    } else if (diffHours < 24) {
      return `${diffHours} saat əvvəl`;
    } else if (diffDays === 1) {
      return "1 gün əvvəl";
    } else if (diffDays < 7) {
      return `${diffDays} gün əvvəl`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} həftə əvvəl`;
    } else {
      return date.toLocaleDateString("az-AZ");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Təfərrüatları</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
        </View>
      </SafeAreaView>
    );
  }

  if (!test) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Təfərrüatları</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Test tapılmadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Təfərrüatları</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleToggleBookmark}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isBookmarked ? "#7313e8" : "#111827"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.titleRow}>
              <Text style={styles.heroTitle}>{test.title}</Text>
              {test.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroDescription}>{test.description}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="help-circle-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.statLabel}>Sual sayı</Text>
                <Text style={styles.statValue}>{test.questionCount}</Text>
              </View>

              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="star-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.statLabel}>Maksimum xal</Text>
                <Text style={styles.statValue}>{test.totalPossibleScore}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="time-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.infoValue}>{test.estimatedMinutes}</Text>
            <Text style={styles.infoLabel}>Dəqiqə</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="people-outline" size={24} color="#D97706" />
            </View>
            <Text style={styles.infoValue}>
              {statistics?.totalParticipants || 0}
            </Text>
            <Text style={styles.infoLabel}>İştirakçı</Text>
          </View>
        </View>

        {/* Test About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Haqqında</Text>
          <Text style={styles.aboutText}>{test.description}</Text>
        </View>

        {/* Question Types */}
        {test.questionTypeCounts && test.questionTypeCounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sual Növləri</Text>
            <View style={styles.questionTypes}>
              {test.questionTypeCounts.map((typeCount, index) => (
                <View key={index} style={styles.questionTypeCard}>
                  <Ionicons
                    name={
                      typeCount.questionType === "OPEN_TEXT"
                        ? "create-outline"
                        : "list-outline"
                    }
                    size={24}
                    color={
                      typeCount.questionType === "OPEN_TEXT"
                        ? "#059669"
                        : "#2563EB"
                    }
                  />
                  <View style={styles.questionTypeInfo}>
                    <Text style={styles.questionTypeLabel}>
                      {getQuestionTypeName(typeCount.questionType)}
                    </Text>
                    <Text style={styles.questionTypeCount}>
                      {typeCount.count} sual
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Admin: Recent Results */}
        {user?.role === "ADMIN" && recentResults.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Son Nəticələr</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Hamısı</Text>
              </TouchableOpacity>
            </View>

            {recentResults.map((result, index) => {
              const percentage = Math.round(
                (result.totalScore / result.maxPossibleScore) * 100
              );

              return (
                <View key={result.id} style={styles.resultCard}>
                  <View style={styles.resultAvatar}>
                    <Text style={styles.resultAvatarText}>
                      {result.userFirstName?.charAt(0) || "?"}
                    </Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>
                      {result.userFirstName} {result.userLastName}
                    </Text>
                    <Text style={styles.resultDate}>
                      {result.submittedAt
                        ? formatTimeAgo(result.submittedAt)
                        : "Yarımçıq"}
                    </Text>
                  </View>
                  <View style={styles.resultScore}>
                    <Text style={styles.resultScoreText}>
                      {result.totalScore}/{result.maxPossibleScore}
                    </Text>
                    <Text style={styles.resultPercentage}>{percentage}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Admin Actions */}
        {user?.role === "ADMIN" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İdarəetmə</Text>
            <View style={styles.adminActions}>
              <TouchableOpacity
                style={styles.adminActionButton}
                onPress={() => router.push(`/admin/tests/edit/${id}` as any)}
              >
                <Ionicons name="create-outline" size={20} color="#2563EB" />
                <Text style={styles.adminActionText}>Redaktə et</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.adminActionButton,
                  styles.adminActionButtonDanger,
                ]}
                onPress={async () => {
                  if (confirm("Bu testi silmək istədiyinizdən əminsiniz?")) {
                    try {
                      await adminAPI.deleteTest(id as string);
                      alert("Test silindi");
                      router.back();
                    } catch (error) {
                      alert("Test silinə bilmədi");
                    }
                  }
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
                <Text style={[styles.adminActionText, { color: "#DC2626" }]}>
                  Sil
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color="#D97706" />
            <Text style={styles.tipsTitle}>Tövsiyələr</Text>
          </View>
          <Text style={styles.tipsText}>
            Bu testi başlamazdan əvvəl aşağıdakıları nəzərə alın:
          </Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Sakit bir mühitdə test verin</Text>
            <Text style={styles.tipItem}>
              • İnternet bağlantınızın sabit olduğundan əmin olun
            </Text>
            <Text style={styles.tipItem}>
              • Test başladıqdan sonra vaxtınız {test.estimatedMinutes}{" "}
              dəqiqədir
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.bottomBarInfo}>
          <Text style={styles.bottomBarTitle}>Testi başlamağa hazırsınız?</Text>
          <Text style={styles.bottomBarSubtitle}>
            {test.estimatedMinutes} dəqiqə müddətiniz olacaq
          </Text>
        </View>
        <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Başla</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 12,
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
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  heroSection: {
    backgroundColor: "#7313e8",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  heroContent: {
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  premiumBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
  },
  heroDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  infoCardsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7313e8",
  },
  aboutText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  questionTypes: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  questionTypeCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    minWidth: 150,
  },
  questionTypeInfo: {
    flex: 1,
  },
  questionTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  questionTypeCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7313e8",
    alignItems: "center",
    justifyContent: "center",
  },
  resultAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  resultDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  resultScore: {
    alignItems: "flex-end",
  },
  resultScoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 2,
  },
  resultPercentage: {
    fontSize: 12,
    color: "#6B7280",
  },
  adminActions: {
    flexDirection: "row",
    gap: 12,
  },
  adminActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
  },
  adminActionButtonDanger: {
    backgroundColor: "#FEE2E2",
  },
  adminActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  tipsContainer: {
    backgroundColor: "#FFFBEB",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
  },
  tipsText: {
    fontSize: 13,
    color: "#78350F",
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 120, // Bottom bar + safe area için yeterli alan
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  bottomBarInfo: {
    flex: 1,
  },
  bottomBarTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  bottomBarSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  startButton: {
    backgroundColor: "#7313e8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
