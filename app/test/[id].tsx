import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TopicItem {
  title: string;
  subtitle: string;
}

interface ResultItem {
  name: string;
  score: string;
  percentage: string;
  date: string;
}

export default function TestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const test = {
    id,
    title: "Mülki Hüquq Əsasları",
    description:
      "Mülki hüququn əsas prinsipləri, şəxsiyyət hüquqları və əmlak münasibətləri haqqında ətraflı test materialları",
    questions: 25,
    points: 100,
    duration: 45,
    isPremium: true,
  };

  const topics: TopicItem[] = [
    {
      title: "Mülki hüququn əsas prinsipləri",
      subtitle: "Hüquq subyektləri və obyektləri",
    },
    {
      title: "Əmlak hüquqları",
      subtitle: "Mülkiyyət və digər əmlak hüquqları",
    },
    {
      title: "Müqavilə hüququ",
      subtitle: "Müqavilələrin bağlanması və icra edilməsi",
    },
  ];

  const results: ResultItem[] = [
    {
      name: "Əli Məmmədov",
      score: "85/100",
      percentage: "85%",
      date: "2 gün əvvəl",
    },
    {
      name: "Leyla Həsənova",
      score: "72/100",
      percentage: "72%",
      date: "3 gün əvvəl",
    },
    {
      name: "Rəşad Quliyev",
      score: "91/100",
      percentage: "91%",
      date: "1 həftə əvvəl",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Təfərrüatları</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.titleRow}>
              <Text style={styles.heroTitle}>
                {test?.title || "Mülki Hüquq Əsasları"}
              </Text>
              {test?.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroDescription}>
              {test?.description ||
                "Mülki hüququn əsas prinsipləri, şəxsiyyət hüquqları və əmlak münasibətləri haqqında ətraflı test materialları"}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="help-circle-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.statLabel}>Sual sayı</Text>
                <Text style={styles.statValue}>{test?.questions || 25}</Text>
              </View>

              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="star-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.statLabel}>Maksimum xal</Text>
                <Text style={styles.statValue}>{test?.points || 100}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="time-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.infoValue}>{test?.duration || 45}</Text>
            <Text style={styles.infoLabel}>Dəqiqə</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="people-outline" size={24} color="#D97706" />
            </View>
            <Text style={styles.infoValue}>1.2k</Text>
            <Text style={styles.infoLabel}>İştirakçı</Text>
          </View>
        </View>

        {/* Test About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Haqqında</Text>
          <Text style={styles.aboutText}>
            Bu test Azərbaycan Respublikasının Mülki Məcəlləsi əsasında
            hazırlanmışdır. Test mülki hüququn əsas prinsiplərini, şəxsiyyət
            hüquqlarını, əmlak münasibətlərini və müqavilə hüququnu əhatə edir.
          </Text>

          <View style={styles.topicsList}>
            {topics.map((topic, index) => (
              <View key={index} style={styles.topicItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#7313e8"
                  style={styles.topicIcon}
                />
                <View style={styles.topicContent}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Question Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sual Növləri</Text>
          <View style={styles.questionTypes}>
            <View style={styles.questionTypeCard}>
              <Ionicons name="list-outline" size={24} color="#2563EB" />
              <View style={styles.questionTypeInfo}>
                <Text style={styles.questionTypeLabel}>Çoxvariantlı</Text>
                <Text style={styles.questionTypeCount}>20 sual</Text>
              </View>
            </View>

            <View style={styles.questionTypeCard}>
              <Ionicons name="create-outline" size={24} color="#059669" />
              <View style={styles.questionTypeInfo}>
                <Text style={styles.questionTypeLabel}>Açıq cavab</Text>
                <Text style={styles.questionTypeCount}>5 sual</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Nəticələr</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Hamısı</Text>
            </TouchableOpacity>
          </View>

          {results.map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <View style={styles.resultAvatar}>
                <Text style={styles.resultAvatarText}>
                  {result.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{result.name}</Text>
                <Text style={styles.resultDate}>{result.date}</Text>
              </View>
              <View style={styles.resultScore}>
                <Text style={styles.resultScoreText}>{result.score}</Text>
                <Text style={styles.resultPercentage}>{result.percentage}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color="#D97706" />
            <Text style={styles.tipsTitle}>Tövsiyələr</Text>
          </View>
          <Text style={styles.tipsText}>
            Bu testi başlamazdan əvvəl aşağıdakıları nəzərə alın:
          </Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Sakit bir mühitdə test verin</Text>
            <Text style={styles.tipItem}>
              • İnternet bağlantınızın sabit olduğundan əmin olun
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInfo}>
          <Text style={styles.bottomBarTitle}>Testi başlamağa hazırsınız?</Text>
          <Text style={styles.bottomBarSubtitle}>
            {test?.duration || 45} dəqiqə müddətiniz olacaq
          </Text>
        </View>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            console.log("Start test");
          }}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Başla</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  heroSection: {
    backgroundColor: "#7313e8",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  heroContent: {
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  premiumBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
  },
  heroDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  infoCardsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7313e8",
  },
  aboutText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  topicsList: {
    gap: 12,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  topicIcon: {
    marginTop: 2,
  },
  topicContent: {
    flex: 1,
    marginLeft: 8,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  topicSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  questionTypes: {
    flexDirection: "row",
    gap: 12,
  },
  questionTypeCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  questionTypeInfo: {
    flex: 1,
  },
  questionTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  questionTypeCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7313e8",
    alignItems: "center",
    justifyContent: "center",
  },
  resultAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  resultDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  resultScore: {
    alignItems: "flex-end",
  },
  resultScoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 2,
  },
  resultPercentage: {
    fontSize: 12,
    color: "#6B7280",
  },
  tipsContainer: {
    backgroundColor: "#FFFBEB",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
  },
  tipsText: {
    fontSize: 13,
    color: "#78350F",
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  bottomBarInfo: {
    flex: 1,
  },
  bottomBarTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  bottomBarSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  startButton: {
    backgroundColor: "#7313e8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
