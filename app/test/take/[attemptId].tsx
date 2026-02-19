import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SubmitAnswerRequest,
  TestDetailResponse,
  testsAPI,
} from "../../../services/api";

interface UserAnswer {
  questionId: string;
  selectedAnswerIds?: string[];
  openTextAnswer?: string;
}

export default function TestTakingScreen() {
  const router = useRouter();
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();

  const [test, setTest] = useState<TestDetailResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, UserAnswer>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTestData();
  }, [attemptId]);

  useEffect(() => {
    // Save answers to AsyncStorage whenever they change
    if (attemptId && userAnswers.size > 0) {
      saveAnswersToStorage();
    }
  }, [userAnswers]);

  const loadTestData = async () => {
    try {
      if (!attemptId) return;

      // Load test data - we need to get the test ID from the attempt
      // For now, we'll fetch from AsyncStorage or backend
      const storageKey = `test_attempt_${attemptId}`;
      const stored = await AsyncStorage.getItem(storageKey);

      if (stored) {
        const data = JSON.parse(stored);
        setTest(data.test);

        // Load saved answers, ensuring proper typing as Map<string, UserAnswer>
        const answersObj = data.answers || {};
        const savedAnswers = new Map<string, UserAnswer>(
          Object.entries(answersObj).map(([key, value]) => [
            key,
            value as UserAnswer,
          ])
        );
        setUserAnswers(savedAnswers);
      } else {
        // If not in storage, we need the test ID - this should come from the attempt
        // For this implementation, we'll need to enhance the API or pass testId
        Alert.alert("Xəta", "Test məlumatları tapılmadı");
        router.back();
      }
    } catch (error) {
      console.error("Error loading test data:", error);
      Alert.alert("Xəta", "Test məlumatlarını yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  };

  const saveAnswersToStorage = async () => {
    try {
      const storageKey = `test_attempt_${attemptId}`;
      const answersObj = Object.fromEntries(userAnswers);
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({ test, answers: answersObj })
      );
    } catch (error) {
      console.error("Error saving answers:", error);
    }
  };

  const handleAnswerSelect = (
    questionId: string,
    answerId: string,
    isMultiple: boolean
  ) => {
    const currentAnswer = userAnswers.get(questionId);

    if (isMultiple) {
      // Multiple selection
      const currentIds = currentAnswer?.selectedAnswerIds || [];
      const newIds = currentIds.includes(answerId)
        ? currentIds.filter((id) => id !== answerId)
        : [...currentIds, answerId];

      setUserAnswers(
        new Map(
          userAnswers.set(questionId, { questionId, selectedAnswerIds: newIds })
        )
      );
    } else {
      // Single selection
      setUserAnswers(
        new Map(
          userAnswers.set(questionId, {
            questionId,
            selectedAnswerIds: [answerId],
          })
        )
      );
    }
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    setUserAnswers(
      new Map(userAnswers.set(questionId, { questionId, openTextAnswer: text }))
    );
  };

  const handleNext = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      "Testi təsdiqləyin",
      "Testi təsdiq etmək istədiyinizdən əminsiniz? Bu əməliyyatdan sonra cavabları dəyişdirə bilməyəcəksiniz.",
      [
        { text: "Xeyr", style: "cancel" },
        { text: "Bəli, təsdiq edirəm", onPress: submitTest },
      ]
    );
  };

  const submitTest = async () => {
    try {
      setSubmitting(true);

      if (!test) return;

      // Convert userAnswers map to API format
      const answers: SubmitAnswerRequest[] = Array.from(
        userAnswers.values()
      ).map((answer) => ({
        questionId: answer.questionId,
        selectedAnswerIds: answer.selectedAnswerIds,
        openTextAnswer: answer.openTextAnswer,
      }));

      // Submit test
      const result = await testsAPI.submitTest(test.id, { answers });

      // Clear storage
      await AsyncStorage.removeItem(`test_attempt_${attemptId}`);

      // Navigate to results
      router.replace(`/test/results/${attemptId}` as any);
    } catch (error: any) {
      console.error("Error submitting test:", error);
      Alert.alert("Xəta", "Testi təsdiq etmək mümkün olmadı");
    } finally {
      setSubmitting(false);
    }
  };

  const formatQuestionText = (text: string): string => {
    // Add newlines before numbered list items (e.g., "1. ", "2. ") except the first one
    // and lettered list items (e.g., "A. ", "B. ") except the first one
    return text
      .replace(/(?<!\n)\s+(\d+\.\s)/g, "\n$1")
      .replace(/(?<!\n)\s+([A-Za-z]\.\s)/g, "\n$1");
  };

  const getAnsweredCount = () => {
    return userAnswers.size;
  };

  const isQuestionAnswered = (questionId: string) => {
    return userAnswers.has(questionId);
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

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Test sualları tapılmadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const currentAnswer = userAnswers.get(currentQuestion.id);
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const answeredCount = getAnsweredCount();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              "Testdən çıxın",
              "Testdən çıxmaq istədiyinizdən əminsiniz? İrəliləyişiniz saxlanılacaq.",
              [
                { text: "Xeyr", style: "cancel" },
                { text: "Bəli, çıx", onPress: () => router.back() },
              ]
            );
          }}
        >
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{test.title}</Text>
          <Text style={styles.headerSubtitle}>
            Sual {currentQuestionIndex + 1} / {test.questions.length}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={16} color="#7313e8" />
            <Text style={styles.timerText}>{test.estimatedMinutes} dəq</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          {/* Question Number Badge */}
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>
              Sual {currentQuestionIndex + 1}
            </Text>
            <View style={styles.scoreBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.scoreBadgeText}>
                {currentQuestion.score} xal
              </Text>
            </View>
          </View>

          {/* Question Text */}
          <Text style={styles.questionText}>
            {formatQuestionText(currentQuestion.questionText)}
          </Text>

          {/* Answer Options */}
          <View style={styles.answersContainer}>
            {currentQuestion.questionType === "OPEN_TEXT" ? (
              // Open text answer
              <View>
                <Text style={styles.answerLabel}>Cavabınız:</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={6}
                  placeholder="Cavabınızı buraya yazın..."
                  value={currentAnswer?.openTextAnswer || ""}
                  onChangeText={(text) =>
                    handleTextAnswer(currentQuestion.id, text)
                  }
                  textAlignVertical="top"
                />
              </View>
            ) : (
              // Multiple choice
              currentQuestion.answers.map((answer, index) => {
                const isSelected = currentAnswer?.selectedAnswerIds?.includes(
                  answer.id
                );
                const isMultiple =
                  currentQuestion.questionType === "CLOSED_MULTIPLE";

                return (
                  <TouchableOpacity
                    key={answer.id}
                    style={[
                      styles.answerOption,
                      isSelected && styles.answerOptionSelected,
                    ]}
                    onPress={() =>
                      handleAnswerSelect(
                        currentQuestion.id,
                        answer.id,
                        isMultiple
                      )
                    }
                  >
                    <View style={styles.answerOptionLeft}>
                      <View
                        style={[
                          isMultiple ? styles.checkbox : styles.radio,
                          isSelected &&
                            (isMultiple
                              ? styles.checkboxSelected
                              : styles.radioSelected),
                        ]}
                      >
                        {isSelected && (
                          <Ionicons
                            name={isMultiple ? "checkmark" : "ellipse"}
                            size={isMultiple ? 16 : 12}
                            color="#fff"
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.answerText,
                          isSelected && styles.answerTextSelected,
                        ]}
                      >
                        {answer.answerText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Question Type Hint */}
          {currentQuestion.questionType === "CLOSED_MULTIPLE" && (
            <View style={styles.hintContainer}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#6B7280"
              />
              <Text style={styles.hintText}>
                Bir neçə cavab seçə bilərsiniz
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {answeredCount} / {test.questions.length} cavablandı
          </Text>
          <View style={styles.progressDots}>
            {test.questions
              .slice(0, Math.min(10, test.questions.length))
              .map((q, i) => (
                <View
                  key={q.id}
                  style={[
                    styles.progressDot,
                    isQuestionAnswered(q.id) && styles.progressDotAnswered,
                    i === currentQuestionIndex && styles.progressDotCurrent,
                  ]}
                />
              ))}
            {test.questions.length > 10 && (
              <Text style={styles.progressDotsMore}>
                +{test.questions.length - 10}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentQuestionIndex === 0 ? "#9CA3AF" : "#111827"}
            />
            <Text
              style={[
                styles.navButtonText,
                currentQuestionIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Əvvəlki
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex === test.questions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Təsdiq et</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Text style={styles.navButtonText}>Növbəti</Text>
              <Ionicons name="chevron-forward" size={20} color="#111827" />
            </TouchableOpacity>
          )}
        </View>
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
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7313e8",
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#F3F4F6",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#7313e8",
  },
  content: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  questionBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  questionBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7313e8",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#111827",
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  questionImage: {
    width: "100%",
    height: 200,
  },
  answersContainer: {
    gap: 12,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 120,
  },
  answerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  answerOptionSelected: {
    backgroundColor: "#EEF2FF",
    borderColor: "#7313e8",
  },
  answerOptionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#7313e8",
    backgroundColor: "#7313e8",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    borderColor: "#7313e8",
    backgroundColor: "#7313e8",
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  answerTextSelected: {
    color: "#111827",
    fontWeight: "500",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  hintText: {
    fontSize: 12,
    color: "#6B7280",
  },
  bottomSpacer: {
    height: 20,
  },
  bottomNav: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressInfo: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  progressDotAnswered: {
    backgroundColor: "#10B981",
  },
  progressDotCurrent: {
    backgroundColor: "#7313e8",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDotsMore: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  navButtons: {
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  navButtonTextDisabled: {
    color: "#9CA3AF",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#7313e8",
    borderRadius: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
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
});
