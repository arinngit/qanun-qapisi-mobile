import {Ionicons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useLocalSearchParams, useRouter} from "expo-router";
import React, {useRef, useState} from "react";
import {ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {BACKGROUND_PAGE, BRAND_PRIMARY} from "@/constants/colors";
import {authAPI, profileAPI} from "@/services/api";

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const router = useRouter();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, CODE_LENGTH);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (text && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join("");
      if (fullCode.length === CODE_LENGTH) {
        submitVerification(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitVerification = async (verificationCode: string) => {
    if (verificationCode.length !== CODE_LENGTH) {
      Alert.alert("Xəta", `${CODE_LENGTH} rəqəmli kodu daxil edin`);
      return;
    }

    setLoading(true);
    try {
      await authAPI.verify({
        email,
        code: parseInt(verificationCode),
      });

      try {
        const profileData = await profileAPI.getProfile();
        const userData = {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          role: profileData.role,
          verified: profileData.verified,
          isPremium: profileData.isPremium,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      } catch (profileError) {
        console.error("Error fetching profile after verification:", profileError);
      }

      Alert.alert("Təbriklər!", "E-poçtunuz uğurla təsdiqləndi", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosError.response?.data?.message ||
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
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosError.response?.data?.message || "Kod göndərilərkən xəta baş verdi";
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
          <Ionicons name="arrow-back" size={24} color="#111827"/>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={48} color={BRAND_PRIMARY}/>
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
            (loading || code.join("").length !== CODE_LENGTH) && styles.buttonDisabled,
          ]}
          onPress={() => submitVerification(code.join(""))}
          disabled={loading || code.join("").length !== CODE_LENGTH}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF"/>
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
              <ActivityIndicator size="small" color={BRAND_PRIMARY}/>
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
    backgroundColor: BACKGROUND_PAGE,
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
    color: BRAND_PRIMARY,
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
    borderColor: BRAND_PRIMARY,
    backgroundColor: "#EFF6FF",
  },
  verifyButton: {
    backgroundColor: BRAND_PRIMARY,
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
    color: BRAND_PRIMARY,
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
