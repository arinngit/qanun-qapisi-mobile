import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import QuestionBuilder, { QuestionData } from "../../../../components/admin/QuestionBuilder";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";
import { adminAPI } from "../../../../services/api/admin";
import { handleApiError, showSuccess } from "../../../../utils/errorHandler";

export default function EditTestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const testId = Array.isArray(id) ? id[0] : id;

  const [initialLoading, setInitialLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (testId) {
      loadTest();
    }
  }, [testId]);

  const loadTest = async () => {
    try {
      setInitialLoading(true);
      const test = await adminAPI.getAdminTestById(testId);
      
      setTitle(test.title);
      setDescription(test.description);
      setIsPremium(test.isPremium);
      
      // Map backend questions to our format
      const mappedQuestions: QuestionData[] = test.questions.map((q: any) => ({
        id: q.id,
        questionType: q.questionType,
        questionText: q.questionText,
        score: q.score,
        orderIndex: q.orderIndex,
        correctAnswer: q.correctAnswer,
        answers: q.answers || [],
      }));
      
      setQuestions(mappedQuestions);
    } catch (error) {
      handleApiError(error, "Test yüklənərkən xəta baş verdi");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: QuestionData = {
      questionType: "CLOSED_SINGLE",
      questionText: "",
      score: 1,
      orderIndex: questions.length,
      answers: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index: number, updatedQuestion: QuestionData) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleRemoveQuestion = (index: number) => {
    Alert.alert(
      "Əminsiniz?",
      "Bu sualı silmək istədiyinizdən əminsiniz?",
      [
        { text: "Xeyr", style: "cancel" },
        {
          text: "Bəli",
          style: "destructive",
          onPress: () => {
            const newQuestions = questions.filter((_, idx) => idx !== index);
            // Recalculate order indices
            newQuestions.forEach((q, idx) => {
              q.orderIndex = idx;
            });
            setQuestions(newQuestions);
          },
        },
      ]
    );
  };

  const handleMoveQuestionUp = (index: number) => {
    if (index === 0) return;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    // Recalculate order indices
    newQuestions.forEach((q, idx) => {
      q.orderIndex = idx;
    });
    setQuestions(newQuestions);
  };

  const handleMoveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    // Recalculate order indices
    newQuestions.forEach((q, idx) => {
      q.orderIndex = idx;
    });
    setQuestions(newQuestions);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Test başlığı tələb olunur";
    } else if (title.length > 500) {
      newErrors.title = "Test başlığı 500 simvoldan çox ola bilməz";
    }

    if (!description.trim()) {
      newErrors.description = "Test təsviri tələb olunur";
    }

    questions.forEach((question, qIdx) => {
      if (!question.questionText.trim()) {
        newErrors[`question_${qIdx}_text`] = `Sual ${qIdx + 1} mətni tələb olunur`;
      }

      if (question.score < 1) {
        newErrors[`question_${qIdx}_score`] = `Sual ${qIdx + 1} balı minimum 1 olmalıdır`;
      }

      const isClosed = question.questionType === "CLOSED_SINGLE" || question.questionType === "CLOSED_MULTIPLE";

      if (isClosed) {
        if (question.answers.length < 2) {
          newErrors[`question_${qIdx}_answers`] = `Sual ${qIdx + 1} minimum 2 cavab olmalıdır`;
        }

        question.answers.forEach((answer, aIdx) => {
          if (!answer.answerText.trim()) {
            newErrors[`question_${qIdx}_answer_${aIdx}`] = `Sual ${qIdx + 1} cavab ${aIdx + 1} mətni tələb olunur`;
          }
        });

        const correctAnswers = question.answers.filter(a => a.isCorrect);

        if (question.questionType === "CLOSED_SINGLE" && correctAnswers.length !== 1) {
          newErrors[`question_${qIdx}_correct`] = `Sual ${qIdx + 1} dəqiq 1 düzgün cavab olmalıdır`;
        }

        if (question.questionType === "CLOSED_MULTIPLE" && correctAnswers.length < 1) {
          newErrors[`question_${qIdx}_correct`] = `Sual ${qIdx + 1} minimum 1 düzgün cavab olmalıdır`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      Alert.alert("Xəta", "Zəhmət olmasa bütün tələb olunan sahələri doldurun");
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        title: title.trim(),
        description: description.trim(),
        isPremium,
        questions: questions.map((q, qIdx) => ({
          questionType: q.questionType,
          questionText: q.questionText.trim(),
          score: q.score,
          orderIndex: qIdx, // Always use sequential index
          correctAnswer: q.correctAnswer,
          answers: q.answers.map((a, aIdx) => ({
            answerText: a.answerText.trim(),
            isCorrect: a.isCorrect,
            orderIndex: aIdx, // Always use sequential index
          })),
        })),
      };

      await adminAPI.updateTest(testId, requestData);
      showSuccess("Test uğurla yeniləndi");
      router.replace("/admin/tests");
    } catch (error) {
      handleApiError(error, "Test yenilənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Testi Redaktə Et</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
          <Text style={styles.loadingText}>Test yüklənir...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowCancelDialog(true)}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Testi Redaktə Et</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Əsas məlumat</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Test başlığı *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={title}
              onChangeText={setTitle}
              placeholder="Test başlığı"
              placeholderTextColor="#9CA3AF"
              maxLength={500}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Test təsviri *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={description}
              onChangeText={setDescription}
              placeholder="Test təsviri"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <TouchableOpacity
            style={styles.premiumToggle}
            onPress={() => setIsPremium(!isPremium)}
          >
            <View style={[styles.checkbox, isPremium && styles.checkboxChecked]}>
              {isPremium && <Ionicons name="checkmark" size={18} color="#fff" />}
            </View>
            <Text style={styles.premiumLabel}>Premium test</Text>
          </TouchableOpacity>
        </View>

        {/* Questions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suallar</Text>
            {questions.length > 0 && (
              <Text style={styles.questionCount}>{questions.length} sual</Text>
            )}
          </View>

          {questions.map((question, idx) => (
            <View key={idx}>
              <QuestionBuilder
                question={question}
                questionIndex={idx}
                onChange={handleQuestionChange}
                onRemove={handleRemoveQuestion}
                onMoveUp={handleMoveQuestionUp}
                onMoveDown={handleMoveQuestionDown}
                canMoveUp={idx > 0}
                canMoveDown={idx < questions.length - 1}
              />
              {Object.keys(errors).some(key => key.startsWith(`question_${idx}`)) && (
                <View style={styles.questionErrors}>
                  {Object.keys(errors)
                    .filter(key => key.startsWith(`question_${idx}`))
                    .map(key => (
                      <Text key={key} style={styles.errorText}>• {errors[key]}</Text>
                    ))}
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddQuestion}>
            <Ionicons name="add-circle" size={24} color="#7313e8" />
            <Text style={styles.addQuestionText}>Sual əlavə et</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Ləğv et</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.updateButton]}
            onPress={handleUpdate}
            disabled={loading || !title.trim() || !description.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>Yenilə</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showCancelDialog}
        title="Əminsiniz?"
        message="Dəyişikliklər yadda saxlanılmayacaq"
        confirmText="Çıx"
        cancelText="Davam et"
        confirmColor="#EF4444"
        onConfirm={() => {
          setShowCancelDialog(false);
          router.back();
        }}
        onCancel={() => setShowCancelDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: "#6B7280",
  },
  section: {
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
    fontWeight: "600",
    color: "#111827",
  },
  questionCount: {
    fontSize: 14,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  questionErrors: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 16,
    gap: 4,
  },
  premiumToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#7313e8",
    borderColor: "#7313e8",
  },
  premiumLabel: {
    fontSize: 15,
    color: "#111827",
  },
  addQuestionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#7313e8",
    borderStyle: "dashed",
    backgroundColor: "#F5F3FF",
  },
  addQuestionText: {
    fontSize: 15,
    color: "#7313e8",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  updateButton: {
    backgroundColor: "#7313e8",
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

