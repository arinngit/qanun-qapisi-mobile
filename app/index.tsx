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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [index, setIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(true);

  // Animation values
  const slideOpacity = useSharedValue(1);
  const slideTranslateX = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const iconOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(1);
  const textTranslateY = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  // Initialize animations on mount
  useEffect(() => {
    setIsChecking(false);

    // Initial mount animation - fade in from bottom
    slideOpacity.value = 0;
    slideTranslateX.value = 0;
    iconScale.value = 0.8;
    iconOpacity.value = 0;
    textOpacity.value = 0;
    textTranslateY.value = 30;

    // Animate in
    slideOpacity.value = withTiming(1, { duration: 400 });
    iconScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    iconOpacity.value = withTiming(1, { duration: 400 });
    // Text animation with delay
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 400 });
      textTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, 150);
  }, []);

  const handlePress = async () => {
    // Button press animation
    buttonScale.value = withSpring(0.95, { damping: 10, stiffness: 200 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }, 100);

    if (index < 2) {
      // Animate out
      slideOpacity.value = withTiming(0, { duration: 200 });
      slideTranslateX.value = withTiming(-50, { duration: 200 });
      iconScale.value = withTiming(0.8, { duration: 200 });
      iconOpacity.value = withTiming(0, { duration: 200 });
      textOpacity.value = withTiming(0, { duration: 200 });
      textTranslateY.value = withTiming(20, { duration: 200 });

      // After animation, change index and animate in
      setTimeout(() => {
        setIndex((prev) => prev + 1);
        // Reset and animate in
        slideTranslateX.value = 50;
        slideOpacity.value = 0;
        iconScale.value = 0.8;
        iconOpacity.value = 0;
        textOpacity.value = 0;
        textTranslateY.value = 20;

        // Animate in
        slideOpacity.value = withTiming(1, { duration: 300 });
        slideTranslateX.value = withSpring(0, { damping: 15, stiffness: 100 });
        iconScale.value = withSpring(1, { damping: 10, stiffness: 100 });
        iconOpacity.value = withTiming(1, { duration: 300 });
        // Text animation with slight delay
        setTimeout(() => {
          textOpacity.value = withTiming(1, { duration: 300 });
          textTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        }, 100);
      }, 200);
    } else {
      await AsyncStorage.setItem("hasOnBoarded", "true");
      router.replace("/(auth)/login");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasOnBoarded", "true");
    router.replace("/(auth)/login");
  };

  // Animated styles
  const slideAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: slideOpacity.value,
      transform: [{ translateX: slideTranslateX.value }],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: iconOpacity.value,
      transform: [{ scale: iconScale.value }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  // Dot animations
  const dotWidths = [useSharedValue(18), useSharedValue(8), useSharedValue(8)];
  const dotOpacities = [
    useSharedValue(1),
    useSharedValue(0.6),
    useSharedValue(0.6),
  ];

  // Create animated styles for each dot at component level (not inside map)
  const dot0AnimatedStyle = useAnimatedStyle(() => {
    return {
      width: dotWidths[0].value,
      opacity: dotOpacities[0].value,
    };
  });

  const dot1AnimatedStyle = useAnimatedStyle(() => {
    return {
      width: dotWidths[1].value,
      opacity: dotOpacities[1].value,
    };
  });

  const dot2AnimatedStyle = useAnimatedStyle(() => {
    return {
      width: dotWidths[2].value,
      opacity: dotOpacities[2].value,
    };
  });

  // Update dot animations when index changes
  useEffect(() => {
    [0, 1, 2].forEach((idx) => {
      const isActive = idx === index;
      dotWidths[idx].value = withSpring(isActive ? 18 : 8, {
        damping: 15,
        stiffness: 100,
      });
      dotOpacities[idx].value = withTiming(isActive ? 1 : 0.6, {
        duration: 200,
      });
    });
  }, [index]);

  const renderDots = () => {
    const dotStyles = [dot0AnimatedStyle, dot1AnimatedStyle, dot2AnimatedStyle];

    return (
      <>
        {[0, 1, 2].map((idx) => {
          const isActive = idx === index;
          return (
            <Animated.View
              key={idx}
              style={[
                {
                  backgroundColor: isActive ? "#FFF" : "#8C8BA7",
                  borderRadius: 16,
                  height: 5,
                },
                dotStyles[idx],
              ]}
            />
          );
        })}
      </>
    );
  };

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
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#FFF" />
              <Text style={styles.logoText}>Qanun Qapısı (Unofficial)</Text>
            </View>
            {/* Кнопка пропуска */}
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Keç</Text>
            </Pressable>
          </View>

          {/* Content */}
          <Animated.View style={[styles.content, slideAnimatedStyle]}>
            {/* Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { backgroundColor: `${currentSlide.color}30` },
                iconAnimatedStyle,
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
            </Animated.View>

            {/* Dots */}
            <View style={styles.dotsContainer}>{renderDots()}</View>

            {/* Text Content */}
            <Animated.View style={[styles.textContent, textAnimatedStyle]}>
              <Text style={styles.title}>{currentSlide.title}</Text>
              <Text style={styles.description}>{currentSlide.description}</Text>
            </Animated.View>
          </Animated.View>

          {/* Bottom Button */}
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable style={styles.button} onPress={handlePress}>
              <Text style={styles.buttonText}>
                {index < 2 ? "Növbəti" : "Başlayaq"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#0A0F1D" />
            </Pressable>
          </Animated.View>

          <Text style={styles.disclaimerText}>
            Dövlət qurumları ilə əlaqəli deyil (Not affiliated with government)
          </Text>
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
  disclaimerText: {
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
    marginTop: 12,
    fontSize: 10,
  },
});
