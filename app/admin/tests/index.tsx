import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { adminAPI } from "../../../services/api/admin";
import { handleApiError, showSuccess } from "../../../utils/errorHandler";
import EmptyState from "../../../components/admin/EmptyState";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";

interface TestItem {
  id: string;
  title: string;
  description: string;
  status: string;
  isPremium: boolean;
  questionCount: number;
  createdAt: string;
}

export default function TestManagementScreen() {
  const router = useRouter();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [premiumFilter, setPremiumFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Action dialogs
  const [deleteDialog, setDeleteDialog] = useState<{ visible: boolean; testId: string | null }>({
    visible: false,
    testId: null,
  });
  const [publishDialog, setPublishDialog] = useState<{ visible: boolean; testId: string | null }>({
    visible: false,
    testId: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTests = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        page: pageNum,
        size: 15,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter.toUpperCase();
      }

      if (premiumFilter === "premium") {
        params.isPremium = true;
      } else if (premiumFilter === "free") {
        params.isPremium = false;
      }

      const response = await adminAPI.getAdminTests(params);
      
      if (append) {
        setTests(prev => [...prev, ...response.content]);
      } else {
        setTests(response.content);
      }

      setHasMore(!response.last);
      setPage(pageNum);
    } catch (error) {
      handleApiError(error, "Testlər yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [statusFilter, premiumFilter]);

  useEffect(() => {
    fetchTests(0, false);
  }, [statusFilter, premiumFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTests(0, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTests(page + 1, true);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.testId) return;

    setActionLoading(true);
    try {
      await adminAPI.deleteTest(deleteDialog.testId);
      showSuccess("Test uğurla silindi");
      setDeleteDialog({ visible: false, testId: null });
      fetchTests(0, false);
    } catch (error) {
      handleApiError(error, "Test silinərkən xəta baş verdi");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!publishDialog.testId) return;

    setActionLoading(true);
    try {
      await adminAPI.publishTest(publishDialog.testId);
      showSuccess("Test uğurla nəşr edildi");
      setPublishDialog({ visible: false, testId: null });
      fetchTests(0, false);
    } catch (error) {
      handleApiError(error, "Test nəşr edilərkən xəta baş verdi");
    } finally {
      setActionLoading(false);
    }
  };

  const renderTestCard = ({ item }: { item: TestItem }) => (
    <View style={styles.testCard}>
      <View style={styles.cardHeader}>
        <View style={styles.badges}>
          <View style={[styles.badge, item.status === "PUBLISHED" ? styles.badgePublished : styles.badgeDraft]}>
            <Text style={[styles.badgeText, item.status === "PUBLISHED" ? styles.badgeTextPublished : styles.badgeTextDraft]}>
              {item.status === "PUBLISHED" ? "Nəşr edilib" : "Qaralama"}
            </Text>
          </View>
          {item.isPremium && (
            <View style={[styles.badge, styles.badgePremium]}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.badgeTextPremium}>Premium</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.testTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.testDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.testInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.questionCount} sual</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {new Date(item.createdAt).toLocaleDateString("az-AZ")}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => router.push(`/admin/tests/edit/${item.id}`)}
        >
          <Ionicons name="create-outline" size={18} color="#7313e8" />
          <Text style={styles.editButtonText}>Redaktə</Text>
        </TouchableOpacity>

        {item.status === "DRAFT" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.publishActionButton]}
            onPress={() => setPublishDialog({ visible: true, testId: item.id })}
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#10B981" />
            <Text style={styles.publishActionButtonText}>Nəşr et</Text>
          </TouchableOpacity>
        )}

        {item.status === "PUBLISHED" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.resultsButton]}
            onPress={() => {
              // Navigate to results (future implementation)
              Alert.alert("Məlumat", "Nəticələr səhifəsi tezliklə əlavə ediləcək");
            }}
          >
            <Ionicons name="stats-chart-outline" size={18} color="#3B82F6" />
            <Text style={styles.resultsButtonText}>Nəticələr</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => setDeleteDialog({ visible: true, testId: item.id })}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.filterButtons}>
          {["all", "draft", "published"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === status && styles.filterButtonTextActive,
                ]}
              >
                {status === "all" ? "Hamısı" : status === "draft" ? "Qaralama" : "Nəşr edilib"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Növ:</Text>
        <View style={styles.filterButtons}>
          {["all", "premium", "free"].map((premium) => (
            <TouchableOpacity
              key={premium}
              style={[
                styles.filterButton,
                premiumFilter === premium && styles.filterButtonActive,
              ]}
              onPress={() => setPremiumFilter(premium)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  premiumFilter === premium && styles.filterButtonTextActive,
                ]}
              >
                {premium === "all" ? "Hamısı" : premium === "premium" ? "Premium" : "Pulsuz"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color="#7313e8" />
          <Text style={styles.filterToggleText}>Filtrlər</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/admin/tests/create")}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Yeni Test</Text>
        </TouchableOpacity>
        </View>
      </View>

      {showFilters && renderFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
        </View>
      ) : tests.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="Test tapılmadı"
          message="Hələ ki test yoxdur. Yeni test yaratmaq üçün 'Yeni Test' düyməsinə klikləyin."
          actionLabel="Yeni Test Yarat"
          onAction={() => router.push("/admin/tests/create")}
        />
      ) : (
        <FlatList
          data={tests}
          renderItem={renderTestCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#7313e8"]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#7313e8" />
              </View>
            ) : null
          }
        />
      )}

      <ConfirmDialog
        visible={deleteDialog.visible}
        title="Testi sil"
        message="Bu testi silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
        confirmText="Sil"
        cancelText="Ləğv et"
        confirmColor="#EF4444"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ visible: false, testId: null })}
        loading={actionLoading}
      />

      <ConfirmDialog
        visible={publishDialog.visible}
        title="Testi nəşr et"
        message="Bu testi nəşr etmək istədiyinizdən əminsiniz? Nəşr edildikdən sonra test istifadəçilərə görünəcək."
        confirmText="Nəşr et"
        cancelText="Ləğv et"
        confirmColor="#10B981"
        onConfirm={handlePublish}
        onCancel={() => setPublishDialog({ visible: false, testId: null })}
        loading={actionLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7313e8",
    backgroundColor: "#F5F3FF",
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7313e8",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#7313e8",
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  filterButtonActive: {
    backgroundColor: "#EDE9FE",
    borderColor: "#7313e8",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#7313e8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  testCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeDraft: {
    backgroundColor: "#FEF3C7",
  },
  badgePublished: {
    backgroundColor: "#D1FAE5",
  },
  badgePremium: {
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badgeTextDraft: {
    color: "#92400E",
  },
  badgeTextPublished: {
    color: "#065F46",
  },
  badgeTextPremium: {
    color: "#92400E",
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  testDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  testInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: "#F5F3FF",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#7313e8",
  },
  publishActionButton: {
    backgroundColor: "#ECFDF5",
  },
  publishActionButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#10B981",
  },
  resultsButton: {
    backgroundColor: "#EFF6FF",
  },
  resultsButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3B82F6",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    flex: 0,
    minWidth: 40,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
});

