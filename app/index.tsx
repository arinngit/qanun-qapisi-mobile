import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [index, setIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(true);

  // Проверяем статус онбординга при загрузке
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasOnBoarded = await AsyncStorage.getItem("hasOnBoarded");
      if (hasOnBoarded === "true") {
        router.replace("/(auth)/login");
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setIsChecking(false);
    }
  };

  const handlePress = async () => {
    if (index < 2) {
      setIndex((prev) => prev + 1);
    } else {
      await AsyncStorage.setItem("hasOnBoarded", "true");
      router.replace("/(auth)/login");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasOnBoarded", "true");
    router.replace("/(auth)/login");
  };

  const renderDots = () => (
    <>
      {[0, 1, 2].map((item, idx) => (
        <View
          key={idx}
          style={{
            backgroundColor: idx === index ? "#FFF" : "#8C8BA7",
            borderRadius: 16,
            height: 5,
            width: idx === index ? 18 : 8,
          }}
        />
      ))}
    </>
  );

  const slides = [
    {
      icon: "book-outline",
      title: "Qanunları öyrənin",
      description:
        "Azərbaycan qanunvericiliyini asan və effektiv şəkildə öyrənin. Hər bir qanun maddəsi aydın şəkildə izah olunur.",
      color: "#7313e8",
    },
    {
      icon: "bulb-outline",
      title: "Testlərlə praktika edin",
      description:
        "Minlərlə suallarla biliklərinizi yoxlayın. Hər sual düşündürücü və maraqlıdır. Hazırlaşın və uğur qazanın.",
      color: "#50C878",
    },
    {
      icon: "trophy-outline",
      title: "Uğura çatın!",
      description:
        "Öz nəticələrinizi izləyin və inkişaf edin. Hər addımda irəliləyin və məqsədinizə çatın.",
      color: "#FFD700",
    },
  ];

  // Показываем индикатор загрузки пока проверяем статус
  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7313e8" />
        <Text style={styles.loadingText}>Yüklənir...</Text>
      </View>
    );
  }

  const currentSlide = slides[index];

  return (
    <View style={styles.wrapper}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[currentSlide.color, "#0B101E"]}
        locations={[0, 0.7]}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#FFF" />
              <Text style={styles.logoText}>Qanun Qapısı</Text>
            </View>
            {/* Кнопка пропуска */}
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Keç</Text>
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${currentSlide.color}30` },
              ]}
            >
              <View
                style={[
                  styles.iconInner,
                  { backgroundColor: `${currentSlide.color}50` },
                ]}
              >
                <Ionicons
                  name={currentSlide.icon as any}
                  size={80}
                  color="#FFF"
                />
              </View>
            </View>

            {/* Dots */}
            <View style={styles.dotsContainer}>{renderDots()}</View>

            {/* Text Content */}
            <View style={styles.textContent}>
              <Text style={styles.title}>{currentSlide.title}</Text>
              <Text style={styles.description}>{currentSlide.description}</Text>
            </View>
          </View>

          {/* Bottom Button */}
          <Pressable style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>
              {index < 2 ? "Növbəti" : "Başlayaq"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#0A0F1D" />
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 114,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  logoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  textContent: {
    gap: 16,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  description: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: 0.5,
    lineHeight: 24,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    paddingVertical: 16,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#0A0F1D",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B101E",
  },
  loadingText: {
    color: "white",
    marginTop: 16,
    fontSize: 16,
  },
});
