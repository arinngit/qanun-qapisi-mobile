import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { testsAPI, TestResponse } from "../services/api";
import { bookmarksService } from "../services/bookmarks";
import { handleApiError, showSuccess } from "../utils/errorHandler";

export default function BookmarksScreen() {
  const router = useRouter();
  const [bookmarkedTests, setBookmarkedTests] = useState<TestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const loadBookmarks = async () => {
    try {
      const bookmarkIds = await bookmarksService.getBookmarks();

      if (bookmarkIds.length === 0) {
        setBookmarkedTests([]);
        return;
      }

      // Fetch test details for each bookmarked test
      const testPromises = bookmarkIds.map((id) => testsAPI.getTestById(id));
      const tests = await Promise.allSettled(testPromises);

      // Filter out failed requests
      const successfulTests = tests
        .filter((result) => result.status === "fulfilled")
        .map((result: any) => result.value);

      setBookmarkedTests(successfulTests);
    } catch (error: any) {
      handleApiError(error, "Sevimlilər yüklənə bilmədi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookmarks();
  };

  const handleRemoveBookmark = async (testId: string) => {
    try {
      await bookmarksService.removeBookmark(testId);
      setBookmarkedTests((prev) => prev.filter((test) => test.id !== testId));
      showSuccess("Test sevimlilərdən silindi");
    } catch (error: any) {
      handleApiError(error, "Test silinə bilmədi");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "İyun",
      "İyul",
      "Avqust",
      "Sentyabr",
      "Oktyabr",
      "Noyabr",
      "Dekabr",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const renderTestCard = ({ item }: { item: TestResponse }) => (
    <View style={styles.testCard}>
      <TouchableOpacity
        style={styles.testContent}
        onPress={() => router.push(`/test/${item.id}` as any)}
      >
        <View style={styles.testHeader}>
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
            <Text style={styles.publishDateText}>
              {formatDate(item.publishedAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveBookmark(item.id)}
      >
        <Ionicons name="heart" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const ListEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>Sevimli test yoxdur</Text>
        <Text style={styles.emptyText}>
          Test səhifələrində ürək ikonasına toxunaraq testləri sevimlilərə əlavə edin
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push("/(tabs)/tests")}
        >
          <Text style={styles.browseButtonText}>Testlərə bax</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Sevimlilər</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tests List */}
      <FlatList
        data={bookmarkedTests}
        keyExtractor={(item) => item.id}
        renderItem={renderTestCard}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#7313e8"]}
          />
        }
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
    width: 32,
  },
  listContent: {
    paddingVertical: 8,
  },
  testCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
  },
  testContent: {
    flex: 1,
    padding: 16,
  },
  testHeader: {
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
    marginBottom: 0,
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
  removeButton: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#7313e8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

