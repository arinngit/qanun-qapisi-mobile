import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authAPI } from "../../services/api";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState((params.email as string) || "");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert("Xəta", "E-poçt ünvanınızı daxil edin");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Xəta", "Düzgün e-poçt ünvanı daxil edin");
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ email: email.trim() });
      Alert.alert("Uğurlu", "Şifrə yeniləmə kodu e-poçtunuza göndərildi", [
        { text: "OK", onPress: () => setStep("confirm") },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Xəta baş verdi";
      Alert.alert("Xəta", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetCode.trim()) {
      Alert.alert("Xəta", "Təsdiq kodunu daxil edin");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Xəta", "Şifrə ən azı 8 simvoldan ibarət olmalıdır");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Xəta", "Şifrələr uyğun gəlmir");
      return;
    }

    setLoading(true);
    try {
      await authAPI.confirmResetPassword({
        email: email.trim(),
        token: resetCode.trim(),
        newPassword,
      });

      Alert.alert("Uğurlu!", "Şifrəniz uğurla yeniləndi", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Kod yanlışdır və ya vaxtı bitib";
      Alert.alert("Xəta", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <Ionicons
              name={step === "request" ? "key-outline" : "lock-closed-outline"}
              size={48}
              color="#7313e8"
            />
          </View>
          <Text style={styles.title}>
            {step === "request" ? "Şifrəni Yenilə" : "Yeni Şifrə"}
          </Text>
          <Text style={styles.subtitle}>
            {step === "request"
              ? "E-poçtunuza şifrə yeniləmə kodu göndərəcəyik"
              : "Yeni şifrənizi daxil edin"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {step === "request" ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-poçt ünvanı</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleRequestReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Kod Göndər</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Təsdiq Kodu</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Kodu daxil edin"
                    placeholderTextColor="#9CA3AF"
                    value={resetCode}
                    onChangeText={setResetCode}
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni Şifrə</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ən azı 8 simvol"
                    placeholderTextColor="#9CA3AF"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifrəni Təkrarla</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Şifrəni təkrar daxil edin"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleConfirmReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Şifrəni Yenilə</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendContainer}
                onPress={handleRequestReset}
                disabled={loading}
              >
                <Text style={styles.resendText}>Kod almadınız? </Text>
                <Text style={styles.resendLink}>Yenidən göndər</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Back to Login */}
        <View style={styles.loginContainer}>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            disabled={loading}
          >
            <Text style={styles.loginLink}>← Girişə qayıt</Text>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
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
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  submitButton: {
    backgroundColor: "#7313e8",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
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
  loginContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  loginLink: {
    fontSize: 16,
    color: "#7313e8",
    fontWeight: "600",
  },
});
