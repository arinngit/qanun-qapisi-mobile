import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { testsAPI, TestResponse } from "../../services/api";
import { handleApiError } from "../../utils/errorHandler";

interface FilterItem {
  id: string;
  label: string;
}

type SortBy = "publishedAt" | "questionCount" | "totalPossibleScore";

export default function TestScreen() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("publishedAt");
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const router = useRouter();

  const filters: FilterItem[] = [
    { id: "all", label: "Hamısı" },
    { id: "premium", label: "Premium" },
    { id: "pulsuz", label: "Pulsuz" },
  ];

  const sortOptions = [
    { id: "publishedAt", label: "Tarix", icon: "calendar-outline" },
    { id: "questionCount", label: "Sual sayı", icon: "help-circle-outline" },
    { id: "totalPossibleScore", label: "Xal", icon: "star-outline" },
  ];

  useEffect(() => {
    loadTests(true);
  }, [selectedFilter, sortBy]);

  const loadTests = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const currentPage = reset ? 0 : page;
      
      // Build filter params
      const params: any = {
        page: currentPage,
        size: 10,
        sortBy,
        sortDir: "desc",
      };

      if (selectedFilter === "premium") {
        params.isPremium = true;
      } else if (selectedFilter === "pulsuz") {
        params.isPremium = false;
      }

      const response = await testsAPI.getTests(params);
      
      if (reset) {
        setTests(response.content);
      } else {
        setTests((prev) => [...prev, ...response.content]);
      }
      
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setPage(currentPage);
    } catch (error: any) {
      handleApiError(error, "Testləri yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTests(true);
  };

  const loadMore = () => {
    if (!loadingMore && page + 1 < totalPages) {
      setLoadingMore(true);
      setPage(page + 1);
      loadTests(false);
    }
  };

  const handleFilterSelect = (filterId: string) => {
      setSelectedFilter(filterId);
  };

  const handleSortSelect = (sortOption: SortBy) => {
    setSortBy(sortOption);
    setSortModalVisible(false);
  };

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.id === sortBy);
    return option ? option.label : "Sırala";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
      "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
    ];
    return `Nəşr tarixi: ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Оптимизированный компонент карточки
  const TestCard = React.memo(({ item }: { item: TestResponse }) => (
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
          <Text style={styles.metaText}>{item.questionCount} sual</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="star-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{item.totalPossibleScore} xal</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{item.estimatedMinutes} dəq</Text>
        </View>
      </View>

      <View style={styles.testFooter}>
        <View style={styles.publishDate}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.publishDateText}>{formatDate(item.publishedAt)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push(`/test/${item.id}` as any)}
      >
        <Text style={styles.startButtonText}>Testə başla</Text>
      </TouchableOpacity>
    </View>
  ));
  TestCard.displayName = "TestCard";

  const renderTestCard = ({ item }: { item: TestResponse }) => (
    <TestCard item={item} />
  );

  // Для горизонтального списка фильтров тоже используем FlatList
  const renderFilter = ({ item }: { item: FilterItem }) => {
    const isActive = selectedFilter === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && styles.filterButtonActive,
        ]}
        onPress={() => handleFilterSelect(item.id)}
      >
        <Text
          style={[
            styles.filterText,
            isActive && styles.filterTextActive,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.countText}>{totalElements} test tapıldı</Text>
      </View>
    </View>
  );

  const ListFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color="#7313e8" />
        </View>
      );
    }

    if (page + 1 < totalPages) {
      return (
        <View>
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
            <Text style={styles.loadMoreText}>Daha çox yüklə</Text>
          </TouchableOpacity>
          <View style={styles.bottomSpacer} />
        </View>
      );
    }

    return <View style={styles.bottomSpacer} />;
  };

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>Test tapılmadı</Text>
      <Text style={styles.emptyStateText}>
        Seçdiyiniz filtrə uyğun test mövcud deyil
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Testlər</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setSortModalVisible(true)}
          >
            <Ionicons name="swap-vertical" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push("/search" as any)}
          >
            <Ionicons name="search" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tests List */}
      <FlatList
        data={tests}
        keyExtractor={(item) => item.id}
        renderItem={renderTestCard}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#7313e8"]}
          />
        }
      />

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.sortModal}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sıralama</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => handleSortSelect(option.id as SortBy)}
              >
                <View style={styles.sortOptionLeft}>
                  <Ionicons name={option.icon as any} size={20} color="#7313e8" />
                  <Text style={styles.sortOptionText}>{option.label}</Text>
                </View>
                {sortBy === option.id && (
                  <Ionicons name="checkmark" size={24} color="#7313e8" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  bottomSpacer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sortModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  sortModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sortOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sortOptionText: {
    fontSize: 16,
    color: "#111827",
  },
});
