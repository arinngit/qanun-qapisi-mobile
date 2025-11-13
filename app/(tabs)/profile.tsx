import GBottomSheet from "@/components/common/GBottomSheet";
import PremiumRequestModal from "@/components/premium/PremiumRequestModal";
import { ThemedText } from "@/components/theme/themed-text";
import { translations } from "@/constants/translations";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useTheme } from "@/context/theme-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { profileAPI } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const { user, logout, refreshUser, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { themeMode, isDark, colors, setThemeMode } = useTheme();
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const [editProfileModal, setEditProfileModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [changeEmailModal, setChangeEmailModal] = useState(false);
  const [verifyEmailModal, setVerifyEmailModal] = useState(false);
  const [premiumRequestModal, setPremiumRequestModal] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
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
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
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

      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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
        mediaTypes: ["images"],
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
        style={[styles.container, { backgroundColor: "#f5f5f5" }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Header with light background */}
        <View style={styles.headerLight}>
          <View style={styles.headerContent}>
            {/* Avatar with ring */}
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarRing, { borderColor: "#7313e8" }]}>
                <View style={styles.avatarContainer}>
                  {user?.profilePicture ? (
                    <Image
                      source={{ uri: user.profilePicture }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person-circle" size={90} color="#7313e8" />
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

            <ThemedText type="title" style={styles.nameLight}>
              {user ? `${user.firstName} ${user.lastName}` : translations.user}
            </ThemedText>
            <ThemedText style={styles.emailLight}>{user?.email}</ThemedText>

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
        </View>

        {/* Statistics cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#fff" }]}>
            <Ionicons name="calendar-outline" size={24} color="#7313e8" />
            <ThemedText type="subtitle" style={styles.statNumber}>
              {user ? formatDate(user.createdAt) : "-"}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Qeydiyyat Tarixi</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#fff" }]}>
            <Ionicons
              name={user?.isPremium ? "star" : "star-outline"}
              size={24}
              color={user?.isPremium ? "#F59E0B" : "#9CA3AF"}
            />
            <ThemedText type="subtitle" style={styles.statNumber}>
              {user?.isPremium ? "Premium" : "Standart"}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Abunəlik</ThemedText>
          </View>
        </View>

        {/* Premium Request Button - Only for non-premium users */}
        {!user?.isPremium && (
          <View style={styles.premiumSection}>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => setPremiumRequestModal(true)}
            >
              <View style={styles.premiumButtonContent}>
                <View style={styles.premiumIconContainer}>
                  <Ionicons name="star" size={24} color="#F59E0B" />
                </View>
                <View style={styles.premiumTextContainer}>
                  <ThemedText style={styles.premiumButtonTitle}>
                    Premium Abunəlik
                  </ThemedText>
                  <ThemedText style={styles.premiumButtonSubtitle}>
                    Bütün testlərə giriş əldə edin
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Tənzimləmələr
          </ThemedText>

          <View style={[styles.menuCard, { backgroundColor: "#fff" }]}>
            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: "#E5E7EB", borderBottomWidth: 1 },
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
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: "#E5E7EB", borderBottomWidth: 1 },
              ]}
              onPress={handleChangePassword}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#7313e8" }]}
              >
                <Ionicons name="lock-closed-outline" size={22} color="#fff" />
              </View>
              <ThemedText style={styles.menuText}>Şifrəni Dəyiş</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: "#E5E7EB", borderBottomWidth: 1 },
              ]}
              onPress={handleChangeEmail}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#7313e8" }]}
              >
                <Ionicons name="mail-outline" size={22} color="#fff" />
              </View>
              <ThemedText style={styles.menuText}>E-poçtu Dəyiş</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: "#E5E7EB", borderBottomWidth: 1 },
              ]}
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
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity> */}

            {/* Dark Mode Toggle */}
            {/* <View
              style={[
                styles.menuItem,
                { borderBottomColor: "#E5E7EB", borderBottomWidth: 1 },
              ]}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#7313e8" }]}
              >
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={22}
                  color="#fff"
                />
              </View>
              <ThemedText style={styles.menuText}>
                {isDark ? t.lightMode : t.darkMode}
              </ThemedText>
              <Switch
                value={isDark}
                onValueChange={(value) =>
                  setThemeMode(value ? "dark" : "light")
                }
                trackColor={{ false: "#D1D5DB", true: "#7313e8" }}
                thumbColor="#fff"
                ios_backgroundColor="#D1D5DB"
              />
            </View> */}

            {/* Language Selector */}
            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setLanguage(language === "az" ? "en" : "az")}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#7313e8" }]}
              >
                <Ionicons name="language-outline" size={22} color="#fff" />
              </View>
              <ThemedText style={styles.menuText}>{t.language}</ThemedText>
              <View style={styles.languageBadge}>
                <Text style={styles.languageText}>
                  {language === "az" ? "AZ" : "EN"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Additional section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Əlavə
          </ThemedText>

          <View style={[styles.menuCard, { backgroundColor: "#fff" }]}>
            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: "#E5E7EB", borderBottomWidth: 1 },
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
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: "#E5E7EB", borderBottomWidth: 1 },
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
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#FEE2E2" }]}
              >
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              </View>
              <ThemedText style={[styles.menuText, { color: "#EF4444" }]}>
                {translations.logout}
              </ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Version 1.0.0</ThemedText>
        </View>
      </ScrollView>

      {/* Edit Profile BottomSheet */}
      <GBottomSheet
        visible={editProfileModal}
        onClose={() => setEditProfileModal(false)}
        title="Profili Redaktə Et"
        type="form"
      >
        <View style={styles.modalBody}>
          <ThemedText style={styles.inputLabel}>Ad</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Adınızı daxil edin"
            placeholderTextColor={colors.placeholder}
          />

          <ThemedText style={styles.inputLabel}>Soyad</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Soyadınızı daxil edin"
            placeholderTextColor={colors.placeholder}
          />

          <TouchableOpacity
            style={[styles.modalButton, loading && styles.modalButtonDisabled]}
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
      </GBottomSheet>

      {/* Change Password BottomSheet */}
      <GBottomSheet
        visible={changePasswordModal}
        onClose={() => setChangePasswordModal(false)}
        title="Şifrəni Dəyiş"
        type="form"
      >
        <View style={styles.modalBody}>
          <ThemedText style={styles.inputLabel}>Cari Şifrə</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Cari şifrənizi daxil edin"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
          />

          <ThemedText style={styles.inputLabel}>Yeni Şifrə</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Yeni şifrənizi daxil edin"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
          />

          <ThemedText style={styles.inputLabel}>Şifrəni Təsdiqlə</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Yeni şifrəni təkrar daxil edin"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.modalButton, loading && styles.modalButtonDisabled]}
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
      </GBottomSheet>

      {/* Change Email BottomSheet */}
      <GBottomSheet
        visible={changeEmailModal}
        onClose={() => setChangeEmailModal(false)}
        title="E-poçtu Dəyiş"
        type="form"
      >
        <View style={styles.modalBody}>
          <ThemedText style={styles.inputLabel}>Yeni E-poçt Ünvanı</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="Yeni e-poçt ünvanınızı daxil edin"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ThemedText style={styles.infoText}>
            Təsdiq kodu yeni e-poçt ünvanınıza göndəriləcək
          </ThemedText>

          <TouchableOpacity
            style={[styles.modalButton, loading && styles.modalButtonDisabled]}
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
      </GBottomSheet>

      {/* Verify Email Change BottomSheet */}
      <GBottomSheet
        visible={verifyEmailModal}
        onClose={() => setVerifyEmailModal(false)}
        title="E-poçtu Təsdiqlə"
        type="form"
      >
        <View style={styles.modalBody}>
          <ThemedText style={styles.inputLabel}>Təsdiq Kodu</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="6 rəqəmli kodu daxil edin"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            maxLength={6}
          />

          <ThemedText style={styles.infoText}>
            {newEmail} ünvanına göndərilən təsdiq kodunu daxil edin
          </ThemedText>

          <TouchableOpacity
            style={[styles.modalButton, loading && styles.modalButtonDisabled]}
            onPress={handleVerifyEmailChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.modalButtonText}>Təsdiqlə</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </GBottomSheet>

      {/* Premium Request Modal */}
      <PremiumRequestModal
        visible={premiumRequestModal}
        onClose={() => setPremiumRequestModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLight: {
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#fff",
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
    backgroundColor: "#f5f5f5",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
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
  nameLight: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  email: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 8,
  },
  emailLight: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 16,
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
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
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
    color: "#111827",
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
    borderBottomWidth: 0,
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
    color: "#111827",
  },
  languageBadge: {
    backgroundColor: "#7313e8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  languageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
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
    color: "#111827",
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
    color: "#111827",
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
    color: "#6B7280",
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
  premiumSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  premiumButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  premiumButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  premiumIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  premiumButtonSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
});
