import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { adminAPI } from "../../../services/api/admin";
import { handleApiError, showSuccess } from "../../../utils/errorHandler";
import EmptyState from "../../../components/admin/EmptyState";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { useAuth } from "../../../context/auth-context";

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  verified: boolean;
  isPremium: boolean;
  profilePictureUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface EditFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isPremium: boolean;
}

export default function UserManagementScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    email: "",
    firstName: "",
    lastName: "",
    role: "CUSTOMER",
    isActive: true,
    isPremium: false,
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{ visible: boolean; userId: string | null }>({
    visible: false,
    userId: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async (pageNum: number = 0, append: boolean = false, search?: string) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        page: pageNum,
        size: 20,
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter !== "all") {
        params.role = roleFilter.toUpperCase();
      }

      if (statusFilter === "active") {
        params.isActive = true;
      } else if (statusFilter === "inactive") {
        params.isActive = false;
      }

      const response = await adminAPI.getUsers(params);
      
      if (append) {
        setUsers(prev => [...prev, ...response.content]);
      } else {
        setUsers(response.content);
      }

      setHasMore(!response.last);
      setPage(pageNum);
    } catch (error) {
      handleApiError(error, "İstifadəçilər yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(0, false, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, roleFilter, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers(0, false, searchQuery);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUsers(page + 1, true, searchQuery);
    }
  };

  const handleEditUser = (user: UserItem) => {
    if (user.id === currentUser?.id) {
      Alert.alert("Xəbərdarlıq", "Öz hesabınızı redaktə edə bilməzsiniz");
      return;
    }

    setEditingUser(user);
    setEditForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isPremium: user.isPremium,
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    // Validation
    if (!editForm.email.trim() || !editForm.firstName.trim() || !editForm.lastName.trim()) {
      Alert.alert("Xəta", "Zəhmət olmasa bütün tələb olunan sahələri doldurun");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      Alert.alert("Xəta", "Düzgün email ünvanı daxil edin");
      return;
    }

    setEditLoading(true);
    try {
      await adminAPI.updateUser(editingUser.id, {
        email: editForm.email.trim(),
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        role: editForm.role,
        isActive: editForm.isActive,
        isPremium: editForm.isPremium,
      });
      
      showSuccess("İstifadəçi uğurla yeniləndi");
      setEditModalVisible(false);
      setEditingUser(null);
      fetchUsers(0, false, searchQuery);
    } catch (error) {
      handleApiError(error, "İstifadəçi yenilənərkən xəta baş verdi");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.userId) return;

    if (deleteDialog.userId === currentUser?.id) {
      Alert.alert("Xəbərdarlıq", "Öz hesabınızı silə bilməzsiniz");
      setDeleteDialog({ visible: false, userId: null });
      return;
    }

    setDeleteLoading(true);
    try {
      await adminAPI.deleteUser(deleteDialog.userId);
      showSuccess("İstifadəçi uğurla silindi");
      setDeleteDialog({ visible: false, userId: null });
      fetchUsers(0, false, searchQuery);
    } catch (error) {
      handleApiError(error, "İstifadəçi silinərkən xəta baş verdi");
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderUserCard = ({ item }: { item: UserItem }) => {
    const isSelf = item.id === currentUser?.id;

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            {item.profilePictureUrl ? (
              <Image source={{ uri: item.profilePictureUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.firstName} {item.lastName}
              {isSelf && <Text style={styles.selfBadge}> (Siz)</Text>}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>

        <View style={styles.badges}>
          <View style={[styles.badge, item.role === "ADMIN" ? styles.badgeAdmin : styles.badgeCustomer]}>
            <Text style={[styles.badgeText, item.role === "ADMIN" ? styles.badgeTextAdmin : styles.badgeTextCustomer]}>
              {item.role === "ADMIN" ? "Admin" : "İstifadəçi"}
            </Text>
          </View>
          
          <View style={[styles.badge, item.isActive ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={[styles.badgeText, item.isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
              {item.isActive ? "Aktiv" : "Qeyri-aktiv"}
            </Text>
          </View>

          <View style={[styles.badge, item.verified ? styles.badgeVerified : styles.badgeUnverified]}>
            <Text style={[styles.badgeText, item.verified ? styles.badgeTextVerified : styles.badgeTextUnverified]}>
              {item.verified ? "Təsdiqlənib" : "Təsdiqlənməyib"}
            </Text>
          </View>

          {item.isPremium && (
            <View style={[styles.badge, styles.badgePremium]}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={styles.badgeTextPremium}>Premium</Text>
            </View>
          )}
        </View>

        <View style={styles.userMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              Qeydiyyat: {new Date(item.createdAt).toLocaleDateString("az-AZ")}
            </Text>
          </View>
          {item.lastLoginAt && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                Son giriş: {new Date(item.lastLoginAt).toLocaleDateString("az-AZ")}
              </Text>
            </View>
          )}
        </View>

        {!isSelf && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditUser(item)}
            >
              <Ionicons name="create-outline" size={18} color="#7313e8" />
              <Text style={styles.editButtonText}>Redaktə</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => setDeleteDialog({ visible: true, userId: item.id })}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Rol:</Text>
        <View style={styles.filterButtons}>
          {["all", "admin", "customer"].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterButton,
                roleFilter === role && styles.filterButtonActive,
              ]}
              onPress={() => setRoleFilter(role)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  roleFilter === role && styles.filterButtonTextActive,
                ]}
              >
                {role === "all" ? "Hamısı" : role === "admin" ? "Admin" : "İstifadəçi"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.filterButtons}>
          {["all", "active", "inactive"].map((status) => (
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
                {status === "all" ? "Hamısı" : status === "active" ? "Aktiv" : "Qeyri-aktiv"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>İstifadəçini Redaktə Et</Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={styles.modalClose}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Ad *</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.firstName}
                onChangeText={(text) => setEditForm({ ...editForm, firstName: text })}
                placeholder="Ad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Soyad *</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.lastName}
                onChangeText={(text) => setEditForm({ ...editForm, lastName: text })}
                placeholder="Soyad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Rol *</Text>
              <View style={styles.roleSelector}>
                {["CUSTOMER", "ADMIN"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      editForm.role === role && styles.roleOptionActive,
                    ]}
                    onPress={() => setEditForm({ ...editForm, role })}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        editForm.role === role && styles.roleOptionTextActive,
                      ]}
                    >
                      {role === "CUSTOMER" ? "İstifadəçi" : "Admin"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <TouchableOpacity
                style={styles.toggle}
                onPress={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
              >
                <View style={[styles.toggleSwitch, editForm.isActive && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleCircle, editForm.isActive && styles.toggleCircleActive]} />
                </View>
                <Text style={styles.toggleLabel}>Aktiv</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formField}>
              <TouchableOpacity
                style={styles.toggle}
                onPress={() => setEditForm({ ...editForm, isPremium: !editForm.isPremium })}
              >
                <View style={[styles.toggleSwitch, editForm.isPremium && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleCircle, editForm.isPremium && styles.toggleCircleActive]} />
                </View>
                <Text style={styles.toggleLabel}>Premium</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setEditModalVisible(false)}
              disabled={editLoading}
            >
              <Text style={styles.modalCancelButtonText}>Ləğv et</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton]}
              onPress={handleSaveEdit}
              disabled={editLoading}
            >
              {editLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalSaveButtonText}>Yadda saxla</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Email və ya ad ilə axtar..."
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color="#7313e8" />
        </TouchableOpacity>
      </View>

      {showFilters && renderFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7313e8" />
        </View>
      ) : users.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="İstifadəçi tapılmadı"
          message="Axtarış kriteriyasına uyğun istifadəçi yoxdur."
        />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
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

      {renderEditModal()}

      <ConfirmDialog
        visible={deleteDialog.visible}
        title="İstifadəçini sil"
        message="Bu istifadəçini silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
        confirmText="Sil"
        cancelText="Ləğv et"
        confirmColor="#EF4444"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteDialog({ visible: false, userId: null })}
        loading={deleteLoading}
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
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  filterToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#7313e8",
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
  userCard: {
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
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7313e8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  selfBadge: {
    fontSize: 13,
    color: "#7313e8",
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeAdmin: {
    backgroundColor: "#EDE9FE",
  },
  badgeCustomer: {
    backgroundColor: "#EFF6FF",
  },
  badgeActive: {
    backgroundColor: "#D1FAE5",
  },
  badgeInactive: {
    backgroundColor: "#FEE2E2",
  },
  badgeVerified: {
    backgroundColor: "#D1FAE5",
  },
  badgeUnverified: {
    backgroundColor: "#FEF3C7",
  },
  badgePremium: {
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badgeTextAdmin: {
    color: "#7313e8",
  },
  badgeTextCustomer: {
    color: "#3B82F6",
  },
  badgeTextActive: {
    color: "#065F46",
  },
  badgeTextInactive: {
    color: "#991B1B",
  },
  badgeTextVerified: {
    color: "#065F46",
  },
  badgeTextUnverified: {
    color: "#92400E",
  },
  badgeTextPremium: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "600",
  },
  userMeta: {
    gap: 6,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
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
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#F5F3FF",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7313e8",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF4444",
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  formField: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  roleSelector: {
    flexDirection: "row",
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#F3F4F6",
    alignItems: "center",
  },
  roleOptionActive: {
    backgroundColor: "#EDE9FE",
    borderColor: "#7313e8",
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  roleOptionTextActive: {
    color: "#7313e8",
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#7313e8",
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  toggleCircleActive: {
    alignSelf: "flex-end",
  },
  toggleLabel: {
    fontSize: 15,
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  modalCancelButton: {
    backgroundColor: "#F3F4F6",
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalSaveButton: {
    backgroundColor: "#7313e8",
  },
  modalSaveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

