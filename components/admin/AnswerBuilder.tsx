import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface AnswerData {
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface AnswerBuilderProps {
  answer: AnswerData;
  answerIndex: number;
  questionType: string;
  allAnswers: AnswerData[];
  onChange: (index: number, answer: AnswerData) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function AnswerBuilder({
  answer,
  answerIndex,
  questionType,
  allAnswers,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: AnswerBuilderProps) {
  const handleCorrectToggle = () => {
    if (questionType === "CLOSED_SINGLE") {
      // For single choice, uncheck all others and check this one
      onChange(answerIndex, { ...answer, isCorrect: true });
    } else {
      // For multiple choice, just toggle this one
      onChange(answerIndex, { ...answer, isCorrect: !answer.isCorrect });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orderControls}>
          <TouchableOpacity
            onPress={() => onMoveUp(answerIndex)}
            disabled={!canMoveUp}
            style={[styles.orderButton, !canMoveUp && styles.orderButtonDisabled]}
          >
            <Ionicons name="chevron-up" size={16} color={canMoveUp ? "#7313e8" : "#9CA3AF"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onMoveDown(answerIndex)}
            disabled={!canMoveDown}
            style={[styles.orderButton, !canMoveDown && styles.orderButtonDisabled]}
          >
            <Ionicons name="chevron-down" size={16} color={canMoveDown ? "#7313e8" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Cavab {answerIndex + 1}</Text>

        <TouchableOpacity
          onPress={() => onRemove(answerIndex)}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          value={answer.answerText}
          onChangeText={(text) =>
            onChange(answerIndex, { ...answer, answerText: text })
          }
          placeholder="Cavab mətni"
          placeholderTextColor="#9CA3AF"
          multiline
        />

        <TouchableOpacity
          style={styles.correctToggle}
          onPress={handleCorrectToggle}
        >
          <View style={[styles.checkbox, answer.isCorrect && styles.checkboxChecked]}>
            {answer.isCorrect && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
          <Text style={styles.correctLabel}>Düzgün cavab</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  orderControls: {
    flexDirection: "row",
    gap: 4,
  },
  orderButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderButtonDisabled: {
    opacity: 0.4,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  removeButton: {
    padding: 4,
  },
  content: {
    gap: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 44,
  },
  correctToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  correctLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
});

