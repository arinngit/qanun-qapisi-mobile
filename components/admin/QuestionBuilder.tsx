import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AnswerBuilder, { AnswerData } from "./AnswerBuilder";
import { adminAPI } from "../../services/api/admin";

export interface QuestionData {
  id?: string;
  questionType: string;
  questionText: string;
  imageUrl?: string;
  score: number;
  orderIndex: number;
  correctAnswer?: string;
  answers: AnswerData[];
}

interface QuestionBuilderProps {
  question: QuestionData;
  questionIndex: number;
  onChange: (index: number, question: QuestionData) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function QuestionBuilder({
  question,
  questionIndex,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: QuestionBuilderProps) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const questionTypes = [
    { value: "CLOSED_SINGLE", label: "Tək seçimli" },
    { value: "CLOSED_MULTIPLE", label: "Çox seçimli" },
    { value: "OPEN_TEXT", label: "Açıq cavab" },
  ];

  const isClosed = question.questionType === "CLOSED_SINGLE" || question.questionType === "CLOSED_MULTIPLE";

  const handleAddAnswer = () => {
    const newAnswer: AnswerData = {
      answerText: "",
      isCorrect: false,
      orderIndex: question.answers.length,
    };
    onChange(questionIndex, {
      ...question,
      answers: [...question.answers, newAnswer],
    });
  };

  const handleAnswerChange = (answerIndex: number, updatedAnswer: AnswerData) => {
    const newAnswers = [...question.answers];
    
    // For single choice, if this answer is being marked correct, unmark all others
    if (question.questionType === "CLOSED_SINGLE" && updatedAnswer.isCorrect) {
      newAnswers.forEach((ans, idx) => {
        if (idx !== answerIndex) {
          ans.isCorrect = false;
        }
      });
    }
    
    newAnswers[answerIndex] = updatedAnswer;
    onChange(questionIndex, { ...question, answers: newAnswers });
  };

  const handleRemoveAnswer = (answerIndex: number) => {
    const newAnswers = question.answers.filter((_, idx) => idx !== answerIndex);
    // Recalculate order indices
    newAnswers.forEach((ans, idx) => {
      ans.orderIndex = idx;
    });
    onChange(questionIndex, { ...question, answers: newAnswers });
  };

  const handleMoveAnswerUp = (answerIndex: number) => {
    if (answerIndex === 0) return;
    const newAnswers = [...question.answers];
    [newAnswers[answerIndex], newAnswers[answerIndex - 1]] = [newAnswers[answerIndex - 1], newAnswers[answerIndex]];
    // Recalculate order indices
    newAnswers.forEach((ans, idx) => {
      ans.orderIndex = idx;
    });
    onChange(questionIndex, { ...question, answers: newAnswers });
  };

  const handleMoveAnswerDown = (answerIndex: number) => {
    if (answerIndex === question.answers.length - 1) return;
    const newAnswers = [...question.answers];
    [newAnswers[answerIndex], newAnswers[answerIndex + 1]] = [newAnswers[answerIndex + 1], newAnswers[answerIndex]];
    // Recalculate order indices
    newAnswers.forEach((ans, idx) => {
      ans.orderIndex = idx;
    });
    onChange(questionIndex, { ...question, answers: newAnswers });
  };

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Xəta", "Şəkil kitabxanasına giriş icazəsi tələb olunur");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        // Store URI temporarily, will be uploaded when question is saved
        onChange(questionIndex, { ...question, imageUrl: uri });
      }
    } catch (error) {
      Alert.alert("Xəta", "Şəkil seçilərkən xəta baş verdi");
    }
  };

  const handleRemoveImage = () => {
    onChange(questionIndex, { ...question, imageUrl: undefined });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orderControls}>
          <TouchableOpacity
            onPress={() => onMoveUp(questionIndex)}
            disabled={!canMoveUp}
            style={[styles.orderButton, !canMoveUp && styles.orderButtonDisabled]}
          >
            <Ionicons name="chevron-up" size={20} color={canMoveUp ? "#7313e8" : "#9CA3AF"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onMoveDown(questionIndex)}
            disabled={!canMoveDown}
            style={[styles.orderButton, !canMoveDown && styles.orderButtonDisabled]}
          >
            <Ionicons name="chevron-down" size={20} color={canMoveDown ? "#7313e8" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Sual {questionIndex + 1}</Text>

        <TouchableOpacity
          onPress={() => onRemove(questionIndex)}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Question Type Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Sual növü *</Text>
          <View style={styles.typeSelector}>
            {questionTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeOption,
                  question.questionType === type.value && styles.typeOptionActive,
                ]}
                onPress={() =>
                  onChange(questionIndex, {
                    ...question,
                    questionType: type.value,
                    answers: type.value.startsWith("CLOSED") ? question.answers : [],
                  })
                }
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    question.questionType === type.value && styles.typeOptionTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Question Text */}
        <View style={styles.field}>
          <Text style={styles.label}>Sual mətni *</Text>
          <TextInput
            style={styles.textArea}
            value={question.questionText}
            onChangeText={(text) =>
              onChange(questionIndex, { ...question, questionText: text })
            }
            placeholder="Sual mətnini daxil edin"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Score */}
        <View style={styles.field}>
          <Text style={styles.label}>Bal *</Text>
          <TextInput
            style={styles.input}
            value={question.score.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 1;
              onChange(questionIndex, { ...question, score: Math.max(1, num) });
            }}
            placeholder="1"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
          />
        </View>

        {/* Image Upload */}
        <View style={styles.field}>
          <Text style={styles.label}>Şəkil (isteğe bağlı)</Text>
          <View style={styles.imageInfoBox}>
            <Ionicons name="information-circle-outline" size={16} color="#7313e8" />
            <Text style={styles.imageInfoText}>
              Şəkil yükləmə funksiyası hazırda mövcud deyil. Testlər şəkilsiz yaradıla bilər.
            </Text>
          </View>
          {question.imageUrl && question.imageUrl.startsWith('http') && (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: question.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* For OPEN_TEXT, show correct answer field */}
        {question.questionType === "OPEN_TEXT" && (
          <View style={styles.field}>
            <Text style={styles.label}>Düzgün cavab (məlumat üçün)</Text>
            <TextInput
              style={styles.input}
              value={question.correctAnswer || ""}
              onChangeText={(text) =>
                onChange(questionIndex, { ...question, correctAnswer: text })
              }
              placeholder="Nümunə cavab"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* For CLOSED types, show answers */}
        {isClosed && (
          <View style={styles.field}>
            <Text style={styles.label}>Cavablar *</Text>
            {question.answers.map((answer, idx) => (
              <AnswerBuilder
                key={idx}
                answer={answer}
                answerIndex={idx}
                questionType={question.questionType}
                allAnswers={question.answers}
                onChange={handleAnswerChange}
                onRemove={handleRemoveAnswer}
                onMoveUp={handleMoveAnswerUp}
                onMoveDown={handleMoveAnswerDown}
                canMoveUp={idx > 0}
                canMoveDown={idx < question.answers.length - 1}
              />
            ))}
            <TouchableOpacity style={styles.addAnswerButton} onPress={handleAddAnswer}>
              <Ionicons name="add-circle-outline" size={20} color="#7313e8" />
              <Text style={styles.addAnswerText}>Cavab əlavə et</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  orderControls: {
    flexDirection: "row",
    gap: 4,
  },
  orderButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderButtonDisabled: {
    opacity: 0.4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  removeButton: {
    padding: 4,
  },
  content: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#F3F4F6",
    alignItems: "center",
  },
  typeOptionActive: {
    backgroundColor: "#EDE9FE",
    borderColor: "#7313e8",
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  typeOptionTextActive: {
    color: "#7313e8",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 80,
    textAlignVertical: "top",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    backgroundColor: "#F9FAFB",
  },
  uploadText: {
    fontSize: 15,
    color: "#7313e8",
    fontWeight: "500",
  },
  imagePreview: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addAnswerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7313e8",
    backgroundColor: "#F5F3FF",
  },
  addAnswerText: {
    fontSize: 14,
    color: "#7313e8",
    fontWeight: "500",
  },
  imageInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#F5F3FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  imageInfoText: {
    flex: 1,
    fontSize: 13,
    color: "#7313e8",
    lineHeight: 18,
  },
});

