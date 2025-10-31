import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authAPI } from "../../services/api";

export default function VerifyScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const router = useRouter();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Инициализируем refs массив
  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (text && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerify();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      Alert.alert("Xəta", "6 rəqəmli kodu daxil edin");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verify({
        email,
        code: parseInt(verificationCode),
      });

      // Save tokens
      await AsyncStorage.setItem("accessToken", response.accessToken);
      await AsyncStorage.setItem("refreshToken", response.refreshToken);

      Alert.alert("Təbriklər!", "E-poçtunuz uğurla təsdiqləndi", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Təsdiq kodu yanlışdır və ya vaxtı bitib";
      Alert.alert("Xəta", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resend(email);
      Alert.alert("Uğurlu", "Təsdiq kodu yenidən göndərildi");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Kod göndərilərkən xəta baş verdi";
      Alert.alert("Xəta", errorMessage);
    } finally {
      setResending(false);
    }
  };

  const renderCodeInputs = () => {
    const inputs = [];
    for (let i = 0; i < 6; i++) {
      inputs.push(
        <TextInput
          key={i}
          ref={(ref) => {
            inputRefs.current[i] = ref;
          }}
          style={[styles.codeInput, code[i] && styles.codeInputFilled]}
          value={code[i]}
          onChangeText={(text) => handleCodeChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          editable={!loading && !resending}
          selectTextOnFocus
        />
      );
    }
    return inputs;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={48} color="#7313e8" />
          </View>
          <Text style={styles.title}>E-poçtu Təsdiqlə</Text>
          <Text style={styles.subtitle}>
            Göndərdiyimiz 6 rəqəmli kodu daxil edin
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Code Input */}
        <View style={styles.codeContainer}>{renderCodeInputs()}</View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (loading || code.join("").length !== 6) && styles.buttonDisabled,
          ]}
          onPress={handleVerify}
          disabled={loading || code.join("").length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Təsdiqlə</Text>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Kod almadınız? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resending || loading}
          >
            {resending ? (
              <ActivityIndicator size="small" color="#7313e8" />
            ) : (
              <Text style={styles.resendLink}>Yenidən göndər</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#6B7280"
          />
          <Text style={styles.infoText}>Kod 15 dəqiqə ərzində etibarlıdır</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#7313e8",
    fontWeight: "600",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  codeInputFilled: {
    borderColor: "#7313e8",
    backgroundColor: "#EFF6FF",
  },
  verifyButton: {
    backgroundColor: "#7313e8",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resendLink: {
    fontSize: 14,
    color: "#7313e8",
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
});
