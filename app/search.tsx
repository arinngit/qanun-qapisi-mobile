import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { testsAPI, TestResponse } from "../services/api";
import { handleApiError } from "../utils/errorHandler";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
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
      // Backend doesn't have a dedicated search endpoint, so we'll use the getTests
      // and filter on the frontend. Ideally, backend should support title/description search.
      const response = await testsAPI.getTests({
        page: 0,
        size: 100, // Get more results for client-side filtering
        sortBy: "publishedAt",
        sortDir: "desc",
      });

      // Client-side filtering
      const lowerQuery = query.toLowerCase();
      const filtered = response.content.filter(
        (test) =>
          test.title.toLowerCase().includes(lowerQuery) ||
          test.description.toLowerCase().includes(lowerQuery)
      );

      setTests(filtered);
      setSearched(true);
    } catch (error: any) {
      handleApiError(error, "Axtarış zamanı xəta baş verdi");
      setTests([]);
    } finally {
      setLoading(false);
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
  );

  const ListEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
          <Text style={styles.emptyText}>Axtarılır...</Text>
        </View>
      );
    }

    if (searched && tests.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Nəticə tapılmadı</Text>
          <Text style={styles.emptyText}>
            "{searchQuery}" üçün heç bir test tapılmadı
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>Test axtarın</Text>
        <Text style={styles.emptyText}>
          Test adı və ya açıqlama üzrə axtarış edin
        </Text>
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
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Test axtar..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Count */}
      {searched && tests.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {tests.length} nəticə tapıldı
          </Text>
        </View>
      )}

      {/* Tests List */}
      <FlatList
        data={tests}
        keyExtractor={(item) => item.id}
        renderItem={renderTestCard}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  resultsCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  listContent: {
    paddingVertical: 8,
  },
  testCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
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
  },
});

