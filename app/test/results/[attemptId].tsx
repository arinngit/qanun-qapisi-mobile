import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import {
  QuestionResultResponse,
  TestResultResponse,
  testsAPI,
} from "../../../services/api";

export default function TestResultsScreen() {
  const router = useRouter();
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const insets = useSafeAreaInsets();

  const [results, setResults] = useState<TestResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      if (!attemptId) return;

      const data = await testsAPI.getAttemptResults(attemptId as string);
      setResults(data);
    } catch (error) {
      console.error("Error loading results:", error);
      alert("Nəticələri yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleRetakeTest = () => {
    if (results) {
      router.replace(`/test/${results.testId}` as any);
    }
  };

  const handleBackToTests = () => {
    router.replace("/(tabs)/tests");
  };

  const getAnswerText = (
    questionResult: QuestionResultResponse,
    answerId: string
  ): string => {
    const answer = questionResult.allAnswers.find((a) => a.id === answerId);
    return answer?.answerText || "Naməlum cavab";
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

  if (!results) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Nəticələr tapılmadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  const percentage = Math.round(
    (results.totalScore / results.maxPossibleScore) * 100
  );
  const correctCount = results.questionResults.filter(
    (q) => q.isCorrect
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToTests}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Nəticələri</Text>
        {/* <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#111827" />
        </TouchableOpacity> */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <View
              style={[
                styles.scoreCircleInner,
                percentage >= 70
                  ? styles.scoreCircleSuccess
                  : percentage >= 50
                  ? styles.scoreCircleWarning
                  : styles.scoreCircleDanger,
              ]}
            >
              <Text style={styles.scorePercentage}>{percentage}%</Text>
              <Text style={styles.scoreLabel}>Uğur</Text>
            </View>
          </View>

          <Text style={styles.scoreTitle}>{results.testTitle}</Text>
          <Text style={styles.scoreSubtitle}>
            {results.totalScore} / {results.maxPossibleScore} xal
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{correctCount}</Text>
            <Text style={styles.statLabel}>Doğru</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>
              {results.questionResults.length - correctCount}
            </Text>
            <Text style={styles.statLabel}>Səhv</Text>
          </View>
        </View>

        {/* Question Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cavablarınız</Text>

          {results.questionResults
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((questionResult, index) => {
              const isExpanded = expandedQuestions.has(
                questionResult.questionId
              );

              return (
                <View
                  key={questionResult.questionId}
                  style={styles.questionCard}
                >
                  {/* Question Header */}
                  <TouchableOpacity
                    style={styles.questionHeader}
                    onPress={() =>
                      toggleQuestionExpanded(questionResult.questionId)
                    }
                  >
                    <View style={styles.questionHeaderLeft}>
                      <View
                        style={[
                          styles.questionNumber,
                          questionResult.isCorrect
                            ? styles.questionNumberCorrect
                            : styles.questionNumberIncorrect,
                        ]}
                      >
                        <Text style={styles.questionNumberText}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.questionHeaderInfo}>
                        <Text
                          style={styles.questionTitle}
                          numberOfLines={isExpanded ? undefined : 2}
                        >
                          {questionResult.questionText}
                        </Text>
                        <View style={styles.questionMeta}>
                          <Text
                            style={[
                              styles.questionStatus,
                              questionResult.isCorrect
                                ? styles.questionStatusCorrect
                                : styles.questionStatusIncorrect,
                            ]}
                          >
                            {questionResult.isCorrect ? "Doğru" : "Səhv"}
                          </Text>
                          <Text style={styles.questionScore}>
                            {questionResult.scoreEarned} /{" "}
                            {questionResult.score} xal
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>

                  {/* Question Details (Expanded) */}
                  {isExpanded && (
                    <View style={styles.questionDetails}>
                      {/* User's Answer */}
                      {questionResult.questionType === "OPEN_TEXT" ? (
                        <View style={styles.answerSection}>
                          <Text style={styles.answerSectionTitle}>
                            Sizin cavabınız:
                          </Text>
                          <View style={styles.openAnswerBox}>
                            <Text style={styles.openAnswerText}>
                              {questionResult.openTextAnswer ||
                                "Cavab verilməyib"}
                            </Text>
                          </View>

                          {!questionResult.isCorrect &&
                            questionResult.correctAnswer && (
                              <>
                                <Text
                                  style={[
                                    styles.answerSectionTitle,
                                    { marginTop: 12 },
                                  ]}
                                >
                                  Doğru cavab:
                                </Text>
                                <View
                                  style={[
                                    styles.openAnswerBox,
                                    styles.correctAnswerBox,
                                  ]}
                                >
                                  <Text style={styles.correctAnswerText}>
                                    {questionResult.correctAnswer}
                                  </Text>
                                </View>
                              </>
                            )}
                        </View>
                      ) : (
                        <View style={styles.answerSection}>
                          <Text style={styles.answerSectionTitle}>
                            Cavablar:
                          </Text>
                          {questionResult.allAnswers.map((answer) => {
                            const isSelected =
                              questionResult.selectedAnswerIds?.includes(
                                answer.id
                              );
                            const isCorrect =
                              questionResult.correctAnswerIds?.includes(
                                answer.id
                              );

                            return (
                              <View
                                key={answer.id}
                                style={[
                                  styles.answerOption,
                                  isSelected &&
                                    isCorrect &&
                                    styles.answerOptionCorrect,
                                  isSelected &&
                                    !isCorrect &&
                                    styles.answerOptionIncorrect,
                                  !isSelected &&
                                    isCorrect &&
                                    styles.answerOptionMissed,
                                ]}
                              >
                                <View style={styles.answerOptionLeft}>
                                  {isSelected && (
                                    <Ionicons
                                      name={
                                        isCorrect
                                          ? "checkmark-circle"
                                          : "close-circle"
                                      }
                                      size={20}
                                      color={isCorrect ? "#10B981" : "#EF4444"}
                                    />
                                  )}
                                  {!isSelected && isCorrect && (
                                    <Ionicons
                                      name="arrow-forward-circle"
                                      size={20}
                                      color="#F59E0B"
                                    />
                                  )}
                                  {!isSelected && !isCorrect && (
                                    <View style={styles.emptyCircle} />
                                  )}
                                  <Text
                                    style={[
                                      styles.answerOptionText,
                                      (isSelected || isCorrect) &&
                                        styles.answerOptionTextBold,
                                    ]}
                                  >
                                    {answer.answerText}
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomActions,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackToTests}
        >
          <Text style={styles.secondaryButtonText}>Testlərə qayıt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRetakeTest}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>Yenidən</Text>
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
  shareButton: {
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
  scoreCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  scoreCircle: {
    marginBottom: 20,
  },
  scoreCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
  },
  scoreCircleSuccess: {
    borderColor: "#10B981",
    backgroundColor: "#D1FAE5",
  },
  scoreCircleWarning: {
    borderColor: "#F59E0B",
    backgroundColor: "#FEF3C7",
  },
  scoreCircleDanger: {
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2",
  },
  scorePercentage: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#111827",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  scoreSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
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
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  questionHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  questionNumberCorrect: {
    backgroundColor: "#D1FAE5",
  },
  questionNumberIncorrect: {
    backgroundColor: "#FEE2E2",
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  questionHeaderInfo: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 6,
  },
  questionMeta: {
    flexDirection: "row",
    gap: 12,
  },
  questionStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  questionStatusCorrect: {
    color: "#10B981",
  },
  questionStatusIncorrect: {
    color: "#EF4444",
  },
  questionScore: {
    fontSize: 12,
    color: "#6B7280",
  },
  questionDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  questionImage: {
    width: "100%",
    height: 150,
  },
  answerSection: {
    marginTop: 8,
  },
  answerSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  openAnswerBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  openAnswerText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },
  correctAnswerBox: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  correctAnswerText: {
    fontSize: 14,
    color: "#065F46",
    lineHeight: 20,
    fontWeight: "500",
  },
  answerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  answerOptionCorrect: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  answerOptionIncorrect: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  answerOptionMissed: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  answerOptionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  answerOptionText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  answerOptionTextBold: {
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 120, // Bottom bar + safe area için yeterli alan
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#7313e8",
    borderRadius: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
