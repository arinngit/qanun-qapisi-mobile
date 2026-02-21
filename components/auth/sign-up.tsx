import { useLanguage } from "@/context/language-context";
import { authAPI } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpScreen() {
  const { language, setLanguage, t } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const router = useRouter();

  // Локальная функция для оценки силы пароля
  const estimatePasswordStrength = (password: string) => {
    let score = 0;
    const suggestions = [];

    // Длина пароля
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Наличие цифр
    if (/\d/.test(password)) score += 1;

    // Наличие букв в разных регистрах
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;

    // Наличие специальных символов
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    const levels = ["Çox zəif", "Zəif", "Orta", "Güclü", "Çox güclü"];
    const crackTimes = [
      "Bir neçə saniyə",
      "Bir neçə dəqiqə",
      "Bir neçə saat",
      "Bir neçə gün",
      "Bir neçə il",
    ];

    return {
      score,
      level: levels[score] || "Zəif",
      message: "Şifrənin gücü",
      suggestions:
        score < 3
          ? [
              "Şifrəni gücləndirmək üçün rəqəm, böyük hərf və xüsusi simvollar əlavə edin",
            ]
          : [],
      crackTime: crackTimes[score] || "Bir neçə dəqiqə",
    };
  };

  // Check password strength in real-time (только локальная проверка)
  const handlePasswordChange = (text: string) => {
    setPassword(text);

    if (text.length >= 3) {
      // Используем только локальную оценку
      const localStrength = estimatePasswordStrength(text);
      setPasswordStrength(localStrength);
    } else {
      setPasswordStrength(null);
    }
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert("Xəta", "Adınızı daxil edin");
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert("Xəta", "Soyadınızı daxil edin");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Xəta", "E-poçt ünvanınızı daxil edin");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Xəta", "Düzgün e-poçt ünvanı daxil edin");
      return false;
    }
    if (password.length < 8) {
      Alert.alert("Xəta", "Şifrə ən azı 8 simvoldan ibarət olmalıdır");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Xəta", "Şifrələr uyğun gəlmir");
      return false;
    }
    if (!agreeToTerms) {
      Alert.alert("Xəta", "İstifadə şərtlərini qəbul etməlisiniz");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authAPI.signup({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      router.push({
        pathname: "/(auth)/verify-code",
        params: { email: email.trim() },
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      const errorMessage =
        error.response?.data?.message || "Qeydiyyat zamanı xəta baş verdi";
      Alert.alert("Xəta", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return "#E0E0E0";
    const level = passwordStrength.level.toLowerCase();
    if (level.includes("zəif")) return "#EF4444";
    if (level.includes("orta")) return "#F59E0B";
    if (level.includes("güclü")) return "#10B981";
    return "#E0E0E0";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/farid-logo.jpg")}
              style={{
                width: 40,
                height: 40,
                resizeMode: "contain",
                borderRadius: 40,
              }}
              accessibilityLabel="qanun-new"
            />
          </View>
          <Text style={styles.headerTitle}>Fərid Qurbanovun Testləri</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Hesab Yaradın</Text>
          <Text style={styles.heroSubtitle}>
            Hüquq sahəsində biliklərinizi test etməyə başlayın
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Ad</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Adınızı daxil edin"
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Soyad</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Soyadınızı daxil edin"
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>E-poçt ünvanı</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Şifrə</Text>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ən azı 8 simvol"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {passwordStrength && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${(passwordStrength.score / 4) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    { color: getPasswordStrengthColor() },
                  ]}
                >
                  {passwordStrength.level} - {passwordStrength.crackTime}
                </Text>
                {passwordStrength.suggestions.length > 0 && (
                  <Text style={styles.suggestionText}>
                    {passwordStrength.suggestions[0]}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Şifrəni təkrarlayın</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Şifrəni təkrar daxil edin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            disabled={loading}
          >
            <View
              style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
            >
              {agreeToTerms && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              İstifadə şərtləri və{" "}
              <Text style={styles.link}>Məxfilik siyasəti</Text> ilə razıyam
            </Text>
          </TouchableOpacity>

          {/* Language Selector */}
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "az" && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage("az")}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === "az" && styles.languageButtonTextActive,
                ]}
              >
                Azərbaycanca
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "en" && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage("en")}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === "en" && styles.languageButtonTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.signUpButton,
              (!agreeToTerms || loading) && styles.buttonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={!agreeToTerms || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>{t.createAccount} →</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Artıq hesabınız var? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              disabled={loading}
            >
              <Text style={styles.signInLink}>Giriş edin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Nə əldə edəcəksiniz?</Text>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <View
                style={[styles.featureIcon, { backgroundColor: "#E3F2FD" }]}
              >
                <Ionicons name="clipboard-outline" size={24} color="#1976D2" />
              </View>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Geniş Test Bazası</Text>
              <Text style={styles.featureDescription}>
                Müxtəlif hüquq sahələrində yüzlərlə test
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <View
                style={[styles.featureIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={24}
                  color="#388E3C"
                />
              </View>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>İrəliləyiş Təhlili</Text>
              <Text style={styles.featureDescription}>
                Nəticələrinizi izləyin və analiz edin
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <View
                style={[styles.featureIcon, { backgroundColor: "#FFF3E0" }]}
              >
                <Ionicons name="diamond-outline" size={24} color="#F57C00" />
              </View>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Premium Məzmun</Text>
              <Text style={styles.featureDescription}>
                Eksklüziv testlər və əlavə materiallar
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7313e8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: "#000",
  },
  heroSection: {
    backgroundColor: "#7313e8",
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#F5F5F5",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  suggestionText: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#7313e8",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#7313e8",
  },
  checkboxText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  link: {
    color: "#7313e8",
    fontWeight: "500",
  },
  languageContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  languageButtonActive: {
    borderColor: "#7313e8",
    backgroundColor: "#F3E8FF",
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  languageButtonTextActive: {
    color: "#7313e8",
  },
  signUpButton: {
    backgroundColor: "#7313e8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  signInText: {
    fontSize: 14,
    color: "#666",
  },
  signInLink: {
    fontSize: 14,
    color: "#7313e8",
    fontWeight: "600",
  },
  featuresSection: {
    backgroundColor: "#F8F9FA",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  featureIconContainer: {
    marginRight: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});
