import { ThemedText } from "@/components/theme/themed-text";
import { translations } from "@/constants/translations";
import { useAuth } from "@/context/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { profileAPI } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { user, logout, refreshUser, updateUser } = useAuth();
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [changeEmailModal, setChangeEmailModal] = useState(false);
  const [verifyEmailModal, setVerifyEmailModal] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState(user?.name || "");
  const [lastName, setLastName] = useState(user?.surname || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(translations.logout, translations.logoutConfirmation, [
      {
        text: translations.cancel,
        style: "cancel",
      },
      {
        text: translations.logout,
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Xəta", "Çıxış zamanı xəta baş verdi");
          }
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error("Error refreshing profile:", error);
      Alert.alert("Xəta", "Profil məlumatları yenilənərkən xəta baş verdi");
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    setFirstName(user?.name || "");
    setLastName(user?.surname || "");
    setEditProfileModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Xəta", "Ad və soyadı daxil edin");
      return;
    }

    setLoading(true);
    try {
      await profileAPI.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Update local user state
      updateUser({
        name: firstName.trim(),
        surname: lastName.trim(),
      });

      Alert.alert("Uğurlu", "Profil məlumatları yeniləndi");
      setEditProfileModal(false);
      await refreshUser();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Xəta",
        error.response?.data?.message || "Profil yenilənərkən xəta baş verdi"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangePasswordModal(true);
  };

  const handleSubmitPasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Xəta", "Bütün xanaları doldurun");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Xəta", "Yeni şifrələr uyğun gəlmir");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Xəta", "Şifrə ən azı 6 simvol olmalıdır");
      return;
    }

    setLoading(true);
    try {
      await profileAPI.changePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert("Uğurlu", "Şifrə uğurla dəyişdirildi");
      setChangePasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      Alert.alert(
        "Xəta",
        error.response?.data?.message || "Şifrə dəyişdirilərkən xəta baş verdi"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setNewEmail("");
    setChangeEmailModal(true);
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim()) {
      Alert.alert("Xəta", "Yeni e-poçt ünvanını daxil edin");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert("Xəta", "Düzgün e-poçt ünvanı daxil edin");
      return;
    }

    setLoading(true);
    try {
      await profileAPI.requestEmailChange({ newEmail: newEmail.trim() });

      Alert.alert("Uğurlu", "Təsdiq kodu yeni e-poçt ünvanınıza göndərildi");
      setChangeEmailModal(false);
      setVerifyEmailModal(true);
    } catch (error: any) {
      console.error("Error requesting email change:", error);
      Alert.alert(
        "Xəta",
        error.response?.data?.message ||
          "E-poçt dəyişdirilməsi sorğusu göndərilərkən xəta baş verdi"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!verificationCode.trim()) {
      Alert.alert("Xəta", "Təsdiq kodunu daxil edin");
      return;
    }

    const code = parseInt(verificationCode.trim());
    if (isNaN(code)) {
      Alert.alert("Xəta", "Düzgün təsdiq kodu daxil edin");
      return;
    }

    setLoading(true);
    try {
      await profileAPI.verifyEmailChange({ code });

      Alert.alert("Uğurlu", "E-poçt ünvanı uğurla dəyişdirildi");
      setVerifyEmailModal(false);
      setVerificationCode("");
      setNewEmail("");
      await refreshUser();
    } catch (error: any) {
      console.error("Error verifying email change:", error);
      Alert.alert(
        "Xəta",
        error.response?.data?.message || "Təsdiq kodu yanlışdır"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Xəta", "Şəkil kitabxanasına giriş icazəsi tələb olunur");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);

        const formData = new FormData();
        const imageUri = result.assets[0].uri;
        const filename = imageUri.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("file", {
          uri: imageUri,
          name: filename,
          type,
        } as any);

        const response = await profileAPI.uploadProfilePicture(formData);

        updateUser({ profilePicture: response.imageUrl });
        Alert.alert("Uğurlu", "Profil şəkli yeniləndi");
        await refreshUser();
      }
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      Alert.alert(
        "Xəta",
        error.response?.data?.message || "Şəkil yüklənərkən xəta baş verdi"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    Alert.alert(
      "Əminsiniz?",
      "Profil şəklini silmək istədiyinizdən əminsiniz?",
      [
        { text: "Xeyr", style: "cancel" },
        {
          text: "Bəli",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await profileAPI.deleteProfilePicture();
              updateUser({ profilePicture: undefined });
              Alert.alert("Uğurlu", "Profil şəkli silindi");
              await refreshUser();
            } catch (error: any) {
              console.error("Error deleting profile picture:", error);
              Alert.alert(
                "Xəta",
                error.response?.data?.message ||
                  "Şəkil silinərkən xəta baş verdi"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Tarix məlum deyil";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("az-AZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Tarix məlum deyil";
    }
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={["#7313e8", "#8a2de8"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            {/* Avatar with ring */}
            <View style={styles.avatarWrapper}>
              <View
                style={[
                  styles.avatarRing,
                  { borderColor: "rgba(255,255,255,0.3)" },
                ]}
              >
                <View style={styles.avatarContainer}>
                  {user?.profilePicture ? (
                    <Image
                      source={{ uri: user.profilePicture }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person-circle" size={90} color="#fff" />
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={handleUploadProfilePicture}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera-outline" size={16} color="#fff" />
                )}
              </TouchableOpacity>
              {user?.profilePicture && (
                <TouchableOpacity
                  style={styles.deleteAvatarButton}
                  onPress={handleDeleteProfilePicture}
                  disabled={loading}
                >
                  <Ionicons name="trash-outline" size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <ThemedText type="title" style={styles.name}>
              {user ? `${user.name} ${user.surname}` : translations.user}
            </ThemedText>
            <ThemedText style={styles.email}>{user?.email}</ThemedText>

            <View style={styles.verificationBadge}>
              <Ionicons
                name={user?.verified ? "checkmark-circle" : "time-outline"}
                size={16}
                color="#fff"
              />
              <ThemedText style={styles.verificationText}>
                {user?.verified ? "Təsdiqlənmiş" : "Təsdiqlənməmiş"}
              </ThemedText>
            </View>

            {user?.role && (
              <View style={styles.roleBadge}>
                <ThemedText style={styles.roleText}>
                  {user.role === "USER"
                    ? "İstifadəçi"
                    : user.role.toLowerCase()}
                </ThemedText>
              </View>
            )}

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={16} color="#7313e8" />
              <ThemedText style={styles.editProfileText}>
                Profili Redaktə Et
              </ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Statistics cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor }]}>
            <Ionicons name="calendar-outline" size={24} color={tintColor} />
            <ThemedText type="subtitle" style={styles.statNumber}>
              {user ? formatDate(user.createdAt) : "-"}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Qeydiyyat Tarixi</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor }]}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={tintColor}
            />
            <ThemedText type="subtitle" style={styles.statNumber}>
              {user?.verified ? "Bəli" : "Xeyr"}
            </ThemedText>
            <ThemedText style={styles.statLabel}>E-poçt Təsdiqli</ThemedText>
          </View>
        </View>

        {/* Settings section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Tənzimləmələr
          </ThemedText>

          <View style={[styles.menuCard, { backgroundColor }]}>
            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: `${borderColor}20` },
              ]}
              onPress={handleEditProfile}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: `#7313e8` }]}
              >
                <Ionicons name="person-outline" size={22} color={"#fff"} />
              </View>
              <ThemedText style={styles.menuText}>
                Profil Məlumatları
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color={borderColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: `${borderColor}20` },
              ]}
              onPress={handleChangePassword}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#7313e8" }]}
              >
                <Ionicons name="lock-closed-outline" size={22} color="#fff" />
              </View>
              <ThemedText style={styles.menuText}>Şifrəni Dəyiş</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={borderColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: `${borderColor}20` },
              ]}
              onPress={handleChangeEmail}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#7313e8" }]}
              >
                <Ionicons name="mail-outline" size={22} color="#fff" />
              </View>
              <ThemedText style={styles.menuText}>E-poçtu Dəyiş</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={borderColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  "Xəbərdarlıq",
                  "Bu funksiya hazırlanma prosesindədir"
                )
              }
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#7313e8" }]}
              >
                <Ionicons name="notifications-outline" size={22} color="#fff" />
              </View>
              <ThemedText style={styles.menuText}>Bildirişlər</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={borderColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Əlavə
          </ThemedText>

          <View style={[styles.menuCard, { backgroundColor }]}>
            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: `${borderColor}20` },
              ]}
              onPress={() =>
                Alert.alert(
                  "Xəbərdarlıq",
                  "Bu funksiya hazırlanma prosesindədir"
                )
              }
            >
              <View
                style={[styles.iconContainer, { backgroundColor: `#7313e8` }]}
              >
                <Ionicons name="help-circle-outline" size={22} color={"#fff"} />
              </View>
              <ThemedText style={styles.menuText}>Kömək və Dəstək</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={borderColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: `${borderColor}20` },
              ]}
              onPress={() =>
                Alert.alert(
                  "Tətbiq Haqqında",
                  "Qanun Qapısı v1.0.0\nHüquq testləri tətbiqi"
                )
              }
            >
              <View
                style={[styles.iconContainer, { backgroundColor: `#7313e8` }]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={"#fff"}
                />
              </View>
              <ThemedText style={styles.menuText}>Tətbiq Haqqında</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={borderColor} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#FF3B3015" }]}
              >
                <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
              </View>
              <ThemedText style={[styles.menuText, { color: "#FF3B30" }]}>
                {translations.logout}
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Version 1.0.0</ThemedText>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Profili Redaktə Et
              </ThemedText>
              <TouchableOpacity onPress={() => setEditProfileModal(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.inputLabel}>Ad</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: `${borderColor}10`, color: textColor },
                ]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Adınızı daxil edin"
                placeholderTextColor={`${textColor}60`}
              />

              <ThemedText style={styles.inputLabel}>Soyad</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: `${borderColor}10`, color: textColor },
                ]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Soyadınızı daxil edin"
                placeholderTextColor={`${textColor}60`}
              />

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  loading && styles.modalButtonDisabled,
                ]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.modalButtonText}>
                    Yadda saxla
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setChangePasswordModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Şifrəni Dəyiş
              </ThemedText>
              <TouchableOpacity onPress={() => setChangePasswordModal(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.inputLabel}>Cari Şifrə</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: `${borderColor}10`, color: textColor },
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Cari şifrənizi daxil edin"
                placeholderTextColor={`${textColor}60`}
                secureTextEntry
              />

              <ThemedText style={styles.inputLabel}>Yeni Şifrə</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: `${borderColor}10`, color: textColor },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Yeni şifrənizi daxil edin"
                placeholderTextColor={`${textColor}60`}
                secureTextEntry
              />

              <ThemedText style={styles.inputLabel}>
                Şifrəni Təsdiqlə
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: `${borderColor}10`, color: textColor },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Yeni şifrəni təkrar daxil edin"
                placeholderTextColor={`${textColor}60`}
                secureTextEntry
              />

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  loading && styles.modalButtonDisabled,
                ]}
                onPress={handleSubmitPasswordChange}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.modalButtonText}>
                    Şifrəni Dəyiş
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Email Modal */}
      <Modal
        visible={changeEmailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setChangeEmailModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                E-poçtu Dəyiş
              </ThemedText>
              <TouchableOpacity onPress={() => setChangeEmailModal(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.inputLabel}>
                Yeni E-poçt Ünvanı
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: `${borderColor}10`, color: textColor },
                ]}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Yeni e-poçt ünvanınızı daxil edin"
                placeholderTextColor={`${textColor}60`}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <ThemedText style={styles.infoText}>
                Təsdiq kodu yeni e-poçt ünvanınıza göndəriləcək
              </ThemedText>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  loading && styles.modalButtonDisabled,
                ]}
                onPress={handleRequestEmailChange}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.modalButtonText}>
                    Təsdiq Kodu Göndər
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Verify Email Change Modal */}
      <Modal
        visible={verifyEmailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setVerifyEmailModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                E-poçtu Təsdiqlə
              </ThemedText>
              <TouchableOpacity onPress={() => setVerifyEmailModal(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.inputLabel}>Təsdiq Kodu</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: `${borderColor}10`, color: textColor },
                ]}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="6 rəqəmli kodu daxil edin"
                placeholderTextColor={`${textColor}60`}
                keyboardType="number-pad"
                maxLength={6}
              />

              <ThemedText style={styles.infoText}>
                {newEmail} ünvanına göndərilən təsdiq kodunu daxil edin
              </ThemedText>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  loading && styles.modalButtonDisabled,
                ]}
                onPress={handleVerifyEmailChange}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.modalButtonText}>
                    Təsdiqlə
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  avatarWrapper: {
    marginBottom: 16,
    position: "relative",
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#7313e8",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  deleteAvatarButton: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "#FF3B30",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  email: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  verificationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  roleText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  editProfileText: {
    color: "#7313e8",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  infoText: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 12,
    marginBottom: 8,
    lineHeight: 18,
  },
  modalButton: {
    backgroundColor: "#7313e8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
