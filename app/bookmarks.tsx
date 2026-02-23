import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect, useRouter} from "expo-router";
import React, {useCallback, useState} from "react";
import {ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {
  BACKGROUND_CARD,
  BACKGROUND_PAGE,
  BORDER_LIGHT,
  BRAND_PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
} from "@/constants/colors";
import {TestResponse, testsAPI} from "@/services/api";
import {bookmarksService} from "@/services/bookmarks";
import {ApiError, handleApiError, showSuccess} from "@/utils/errorHandler";
import {formatDate} from "@/utils/formatDate";

function BookmarksEmptyState({
                               loading,
                               onBrowse,
                             }: {
  loading: boolean;
  onBrowse: () => void;
}) {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={BRAND_PRIMARY}/>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color={TEXT_TERTIARY}/>
      <Text style={styles.emptyTitle}>Sevimli test yoxdur</Text>
      <Text style={styles.emptyText}>
        Test səhifələrində ürək ikonasına toxunaraq testləri sevimlilərə əlavə
        edin
      </Text>
      <TouchableOpacity style={styles.browseButton} onPress={onBrowse}>
        <Text style={styles.browseButtonText}>Testlərə bax</Text>
      </TouchableOpacity>
    </View>
  );
}

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

      const testPromises = bookmarkIds.map((id) => testsAPI.getTestById(id));
      const tests = await Promise.allSettled(testPromises);

      const successfulTests = tests
        .filter(
          (result): result is PromiseFulfilledResult<TestResponse> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      setBookmarkedTests(successfulTests);
    } catch (error: unknown) {
      handleApiError(error as ApiError, "Sevimlilər yüklənə bilmədi");
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
    } catch (error: unknown) {
      handleApiError(error as ApiError, "Test silinə bilmədi");
    }
  };

  const renderTestCard = useCallback(
    ({item}: { item: TestResponse }) => (
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
              <Ionicons name="help-circle-outline" size={14} color={TEXT_SECONDARY}/>
              <Text style={styles.metaText}>{item.questionCount} sual</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star-outline" size={14} color={TEXT_SECONDARY}/>
              <Text style={styles.metaText}>{item.totalPossibleScore} xal</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={TEXT_SECONDARY}/>
              <Text style={styles.metaText}>{item.estimatedMinutes} dəq</Text>
            </View>
          </View>

          <View style={styles.testFooter}>
            <View style={styles.publishDate}>
              <Ionicons name="calendar-outline" size={14} color={TEXT_TERTIARY}/>
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
          <Ionicons name="heart" size={24} color="#EF4444"/>
        </TouchableOpacity>
      </View>
    ),
    [router]
  );

  const listEmpty = useCallback(
    () => (
      <BookmarksEmptyState
        loading={loading}
        onBrowse={() => router.push("/(tabs)/tests")}
      />
    ),
    [loading, router]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sevimlilər</Text>
        <View style={styles.headerRight}/>
      </View>

      <FlatList
        data={bookmarkedTests}
        keyExtractor={(item) => item.id}
        renderItem={renderTestCard}
        ListEmptyComponent={listEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_PRIMARY]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PAGE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BACKGROUND_CARD,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: TEXT_PRIMARY,
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
    backgroundColor: BACKGROUND_CARD,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
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
    color: TEXT_PRIMARY,
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
    color: TEXT_SECONDARY,
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
    color: TEXT_SECONDARY,
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
    color: TEXT_TERTIARY,
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
    color: TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: BRAND_PRIMARY,
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
