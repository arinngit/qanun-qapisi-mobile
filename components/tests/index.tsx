import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TestItem {
  id: number;
  title: string;
  description: string;
  questions: number;
  points: number;
  duration: number;
  publishDate: string;
  isPremium: boolean;
}

interface FilterItem {
  id: string;
  label: string;
}

const testsData: TestItem[] = [
  {
    id: 1,
    title: "Mülki Hüquq Əsasları",
    description:
      "Mülki hüququn əsas prinsipləri, şəxsiyyət hüquqları və əmlak münasibətləri haqqında...",
    questions: 25,
    points: 100,
    duration: 45,
    publishDate: "Nəşr tarixi: 15 Oktyabr 2024",
    isPremium: true,
  },
  {
    id: 2,
    title: "Cinayət Hüququ Əsasları",
    description:
      "Cinayət hüququnun əsas anlayışları, cinayət və cəza anlayışları",
    questions: 30,
    points: 120,
    duration: 50,
    publishDate: "Nəşr tarixi: 12 Oktyabr 2024",
    isPremium: false,
  },
  {
    id: 3,
    title: "Konstitusiya Hüququ",
    description:
      "Azərbaycan Respublikasının Konstitusiyası və dövlət quruluşu əsasları",
    questions: 20,
    points: 80,
    duration: 35,
    publishDate: "Nəşr tarixi: 10 Oktyabr 2024",
    isPremium: true,
  },
  {
    id: 4,
    title: "İnzibati Hüquq",
    description: "İnzibati hüququn əsasları və dövlət idarəetməsi prinsipləri",
    questions: 28,
    points: 112,
    duration: 40,
    publishDate: "Nəşr tarixi: 8 Oktyabr 2024",
    isPremium: false,
  },
  {
    id: 5,
    title: "Əmək Hüququ",
    description: "Əmək münasibətləri, əmək müqaviləsi və əmək hüquqları",
    questions: 22,
    points: 88,
    duration: 30,
    publishDate: "Nəşr tarixi: 5 Oktyabr 2024",
    isPremium: true,
  },
  {
    id: 6,
    title: "Ailə Hüququ",
    description: "Ailə münasibətləri, nikah və boşanma prosedurları",
    questions: 18,
    points: 72,
    duration: 25,
    publishDate: "Nəşr tarixi: 3 Oktyabr 2024",
    isPremium: false,
  },
];

export default function TestScreen() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters: FilterItem[] = [
    { id: "all", label: "Hamısı" },
    { id: "premium", label: "Premium" },
    { id: "pulsuz", label: "Pulsuz" },
    { id: "sirala", label: "⚡ Sırala" },
  ];

  // Оптимизированный компонент карточки
  const TestCard = React.memo(({ item }: { item: TestItem }) => (
    <View style={styles.testCard}>
      <View style={styles.testCardHeader}>
        <Text style={styles.testTitle}>{item.title}</Text>
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      <Text style={styles.testDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.testMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="help-circle-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{item.questions} sual</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="star-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{item.points} xal</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{item.duration} dəq</Text>
        </View>
      </View>

      <View style={styles.testFooter}>
        <View style={styles.publishDate}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.publishDateText}>{item.publishDate}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Testə başla</Text>
      </TouchableOpacity>
    </View>
  ));

  const renderTestCard = ({ item }: { item: TestItem }) => (
    <TestCard item={item} />
  );

  // Для горизонтального списка фильтров тоже используем FlatList
  const renderFilter = ({ item }: { item: FilterItem }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.id && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <Text
        style={[
          styles.filterText,
          selectedFilter === item.id && styles.filterTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item.id}
          renderItem={renderFilter}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        />
      </View>

      {/* Test Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>32 test tapıldı</Text>
      </View>
    </View>
  );

  const ListFooter = () => (
    <View>
      <TouchableOpacity style={styles.loadMoreButton}>
        <Text style={styles.loadMoreText}>Daha çox yüklə</Text>
      </TouchableOpacity>
      <View style={styles.bottomSpacer} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Testlər</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tests List */}
      <FlatList
        data={testsData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTestCard}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
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
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#7313e8",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  countText: {
    fontSize: 13,
    color: "#6B7280",
  },
  testCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
  },
  testCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  premiumBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
  testDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 12,
  },
  testMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  testFooter: {
    marginBottom: 12,
  },
  publishDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  publishDateText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  startButton: {
    backgroundColor: "#7313e8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadMoreButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7313e8",
  },
  bottomSpacer: {
    height: 20,
  },
});
