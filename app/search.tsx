import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useCallback, useEffect, useState} from "react";
import {ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";
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
import {useDebounce} from "@/hooks/useDebounce";
import {TestResponse, testsAPI} from "@/services/api";
import {handleApiError} from "@/utils/errorHandler";
import {formatDate} from "@/utils/formatDate";

function SearchEmptyState({
                            loading,
                            searched,
                            searchQuery,
                            resultCount,
                          }: {
  loading: boolean;
  searched: boolean;
  searchQuery: string;
  resultCount: number;
}) {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={BRAND_PRIMARY}/>
        <Text style={styles.emptyText}>Axtarılır...</Text>
      </View>
    );
  }

  if (searched && resultCount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={TEXT_TERTIARY}/>
        <Text style={styles.emptyTitle}>Nəticə tapılmadı</Text>
        <Text style={styles.emptyText}>
          {`"${searchQuery}" üçün heç bir test tapılmadı`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={TEXT_TERTIARY}/>
      <Text style={styles.emptyTitle}>Test axtarın</Text>
      <Text style={styles.emptyText}>
        Test adı və ya açıqlama üzrə axtarış edin
      </Text>
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearchQuery) {
      searchTests(debouncedSearchQuery);
    } else {
      setTests([]);
      setSearched(false);
    }
  }, [debouncedSearchQuery]);

  const searchTests = async (query: string) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await testsAPI.getTests({
        page: 0,
        size: 100,
        sortBy: "publishedAt",
        sortDir: "desc",
      });

      const lowerQuery = query.toLowerCase();
      const filtered = response.content.filter(
        (test) =>
          test.title.toLowerCase().includes(lowerQuery) ||
          test.description.toLowerCase().includes(lowerQuery)
      );

      setTests(filtered);
      setSearched(true);
    } catch (error: unknown) {
      handleApiError(error as import("@/utils/errorHandler").ApiError, "Axtarış zamanı xəta baş verdi");
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const renderTestCard = useCallback(
    ({item}: { item: TestResponse }) => (
      <TouchableOpacity
        style={styles.testCard}
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
    ),
    [router]
  );

  const listEmpty = useCallback(
    () => (
      <SearchEmptyState
        loading={loading}
        searched={searched}
        searchQuery={searchQuery}
        resultCount={tests.length}
      />
    ),
    [loading, searched, searchQuery, tests.length]
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
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={TEXT_SECONDARY}/>
          <TextInput
            style={styles.searchInput}
            placeholder="Test axtar..."
            placeholderTextColor={TEXT_TERTIARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={TEXT_SECONDARY}/>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searched && tests.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>{tests.length} nəticə tapıldı</Text>
        </View>
      )}

      <FlatList
        data={tests}
        keyExtractor={(item) => item.id}
        renderItem={renderTestCard}
        ListEmptyComponent={listEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BACKGROUND_PAGE,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: BACKGROUND_CARD,
  },
  resultsCount: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },
  listContent: {
    paddingVertical: 8,
  },
  testCard: {
    backgroundColor: BACKGROUND_CARD,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 1,
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
  },
});
