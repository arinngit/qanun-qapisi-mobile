import { ThemedText } from "@/components/theme/themed-text";
import { translations } from "@/constants/translations";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function InfoScreen() {
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const cardBackgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const [imageError, setImageError] = React.useState(false);

  const professorData = {
    name: "Fərid Qurbanov",
    phone: "+994 51 355 51 83",
    phone2: "+994 55 605 54 55",
    email: "ferid.qurbanov.111@inbox.ru",
    photo: require("@/assets/images/professor-photo.jpeg"),
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert(translations.error, "Telefon nömrəsi açıla bilmədi");
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${professorData.email}`).catch(() => {
      Alert.alert(translations.error, "E-poçt açıla bilmədi");
    });
  };

  const handleImageError = () => {
    console.log("Professor image failed to load");
    setImageError(true);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={["#7313e8", `#7313e8`, `#7313e8`]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Ionicons
              name="school-outline"
              size={40}
              color="#fff"
              style={styles.headerIcon}
            />
            <ThemedText type="title" style={styles.headerTitle}>
              {translations.professorInfo}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Əlaqə məlumatları
            </ThemedText>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Professor Card with Photo */}
          <View
            style={[
              styles.professorCard,
              { backgroundColor: cardBackgroundColor },
            ]}
          >
            {/* Photo with gradient ring */}
            <View style={styles.photoWrapper}>
              <LinearGradient
                colors={["#7313e8", `#7313e8`, "#7313e8"]}
                style={styles.photoGradientRing}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.photoInnerRing, { backgroundColor }]}>
                  {!imageError ? (
                    <Image
                      source={
                        typeof professorData.photo === "string"
                          ? { uri: professorData.photo }
                          : professorData.photo
                      }
                      style={styles.professorPhoto}
                      resizeMode="cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <View
                      style={[
                        styles.professorPhoto,
                        styles.photoPlaceholder,
                        { backgroundColor: `${tintColor}20` },
                      ]}
                    >
                      <Ionicons name="person" size={80} color={tintColor} />
                    </View>
                  )}
                </View>
              </LinearGradient>

              {/* Status Badge */}
              <View
                style={[styles.statusBadge, { backgroundColor: "#7313e8" }]}
              >
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
              </View>
            </View>

            {/* Professor Info */}
            <ThemedText type="title" style={styles.professorName}>
              {professorData.name}
            </ThemedText>

            <View
              style={[styles.roleBadge, { backgroundColor: `${tintColor}15` }]}
            >
              <Ionicons name="briefcase-outline" size={14} color={"#7313e8"} />
              <ThemedText style={[styles.roleText, { color: "#7313e8" }]}>
                Professor
              </ThemedText>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: cardBackgroundColor },
              ]}
              onPress={() => handleCall(professorData.phone)}
            >
              <LinearGradient
                colors={["#7313e8", "#7313e8"]}
                style={styles.quickActionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="call" size={24} color="#fff" />
              </LinearGradient>
              <ThemedText style={styles.quickActionLabel}>Zəng et</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: cardBackgroundColor },
              ]}
              onPress={handleEmail}
            >
              <LinearGradient
                colors={["#7313e8", "#7313e8"]}
                style={styles.quickActionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="mail" size={24} color="#fff" />
              </LinearGradient>
              <ThemedText style={styles.quickActionLabel}>E-poçt</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: cardBackgroundColor },
              ]}
              onPress={() => handleCall(professorData.phone2)}
            >
              <LinearGradient
                colors={["#7313e8", "#7313e8"]}
                style={styles.quickActionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="chatbubbles" size={24} color="#fff" />
              </LinearGradient>
              <ThemedText style={styles.quickActionLabel}>Mesaj</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Contact Details Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color={tintColor} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Əlaqə məlumatları
              </ThemedText>
            </View>

            <View
              style={[
                styles.contactCard,
                { backgroundColor: cardBackgroundColor },
              ]}
            >
              {/* Phone 1 */}
              <TouchableOpacity
                style={[
                  styles.contactItem,
                  { borderBottomColor: `${borderColor}20` },
                ]}
                onPress={() => handleCall(professorData.phone)}
              >
                <View
                  style={[
                    styles.contactIconContainer,
                    { backgroundColor: "#7313e8" },
                  ]}
                >
                  <Ionicons name="call" size={22} color="#fff" />
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactLabel}>
                    Əsas telefon
                  </ThemedText>
                  <ThemedText style={styles.contactValue}>
                    {professorData.phone}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#7313e8" },
                  ]}
                >
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* Phone 2 */}
              <TouchableOpacity
                style={[
                  styles.contactItem,
                  { borderBottomColor: `${borderColor}20` },
                ]}
                onPress={() => handleCall(professorData.phone2)}
              >
                <View
                  style={[
                    styles.contactIconContainer,
                    { backgroundColor: "#7313e8" },
                  ]}
                >
                  <Ionicons name="phone-portrait" size={22} color="#fff" />
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactLabel}>
                    Əlavə telefon
                  </ThemedText>
                  <ThemedText style={styles.contactValue}>
                    {professorData.phone2}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#7313e8" },
                  ]}
                >
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                style={styles.contactItem}
                onPress={handleEmail}
              >
                <View
                  style={[
                    styles.contactIconContainer,
                    { backgroundColor: "#7313e8" },
                  ]}
                >
                  <Ionicons name="mail" size={22} color="#fff" />
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactLabel}>
                    E-poçt ünvanı
                  </ThemedText>
                  <ThemedText style={styles.contactValue} numberOfLines={1}>
                    {professorData.email}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#7313e8" },
                  ]}
                >
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Note */}
          <View
            style={[
              styles.infoNote,
              {
                backgroundColor: `${tintColor}10`,
                borderColor: `${tintColor}30`,
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={tintColor}
            />
            <ThemedText style={styles.infoNoteText}>
              Suallarınız olduqda, istənilən vaxt əlaqə saxlaya bilərsiniz
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerIcon: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
  },
  content: {
    padding: 20,
    marginTop: -20,
  },
  professorCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  photoWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  photoGradientRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  photoInnerRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  professorPhoto: {
    width: 126,
    height: 126,
    borderRadius: 63,
  },
  photoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  professorName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  contactCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
