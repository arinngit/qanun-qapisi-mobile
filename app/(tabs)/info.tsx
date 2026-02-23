import {ThemedText} from "@/components/theme/themed-text";
import {
  BACKGROUND_CARD,
  BACKGROUND_PAGE,
  BORDER_DEFAULT,
  BRAND_PRIMARY,
  BRAND_PRIMARY_LIGHT,
  BRAND_PRIMARY_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from "@/constants/colors";
import {Ionicons} from "@expo/vector-icons";
import React, {useCallback, useState} from "react";
import {Alert, Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View,} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const professorPhoto = require("@/assets/images/professor-photo.jpeg");

const PROFESSOR_DATA = {
  name: "Fərid Qurbanov",
  phone: "+994 51 355 51 83",
  phone2: "+994 55 605 54 55",
  email: "ferid.qurbanov.111@inbox.ru",
} as const;

export default function InfoScreen() {
  const [imageError, setImageError] = useState(false);
  const insets = useSafeAreaInsets();

  const handleCall = useCallback((phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert("Xəta", "Telefon nömrəsi açıla bilmədi");
    });
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL(`mailto:${PROFESSOR_DATA.email}`).catch(() => {
      Alert.alert("Xəta", "E-poçt açıla bilmədi");
    });
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{paddingBottom: Math.max(insets.bottom, 20)}}
      >
        <View style={styles.content}>
          <View style={styles.professorCard}>
            <View style={styles.photoWrapper}>
              <View style={styles.photoRing}>
                <View style={styles.photoContainer}>
                  {!imageError ? (
                    <Image
                      source={professorPhoto}
                      style={styles.professorPhoto}
                      resizeMode="cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <View
                      style={[
                        styles.professorPhoto,
                        styles.photoPlaceholder,
                        {backgroundColor: BRAND_PRIMARY_LIGHT},
                      ]}
                    >
                      <Ionicons name="person" size={80} color={BRAND_PRIMARY}/>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#000"/>
              </View>
            </View>

            <ThemedText type="title" style={styles.professorName}>
              {PROFESSOR_DATA.name}
            </ThemedText>
          </View>

          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleCall(PROFESSOR_DATA.phone)}
            >
              <View style={styles.quickActionIconContainer}>
                <Ionicons name="call" size={24} color="#fff"/>
              </View>
              <ThemedText style={styles.quickActionLabel}>Zəng et</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleEmail}
            >
              <View style={styles.quickActionIconContainer}>
                <Ionicons name="mail" size={24} color="#fff"/>
              </View>
              <ThemedText style={styles.quickActionLabel}>E-poçt</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleCall(PROFESSOR_DATA.phone2)}
            >
              <View style={styles.quickActionIconContainer}>
                <Ionicons name="chatbubbles" size={24} color="#fff"/>
              </View>
              <ThemedText style={styles.quickActionLabel}>Mesaj</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color={BRAND_PRIMARY}/>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Əlaqə məlumatları
              </ThemedText>
            </View>

            <View style={styles.contactCard}>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => handleCall(PROFESSOR_DATA.phone)}
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="call" size={22} color="#fff"/>
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactLabel}>
                    Əsas telefon
                  </ThemedText>
                  <ThemedText style={styles.contactValue}>
                    {PROFESSOR_DATA.phone}
                  </ThemedText>
                </View>
                <View style={styles.actionButton}>
                  <Ionicons name="arrow-forward" size={18} color="#fff"/>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => handleCall(PROFESSOR_DATA.phone2)}
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="phone-portrait" size={22} color="#fff"/>
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactLabel}>
                    Əlavə telefon
                  </ThemedText>
                  <ThemedText style={styles.contactValue}>
                    {PROFESSOR_DATA.phone2}
                  </ThemedText>
                </View>
                <View style={styles.actionButton}>
                  <Ionicons name="arrow-forward" size={18} color="#fff"/>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactItem, styles.contactItemLast]}
                onPress={handleEmail}
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="mail" size={22} color="#fff"/>
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactLabel}>
                    E-poçt ünvanı
                  </ThemedText>
                  <ThemedText style={styles.contactValue} numberOfLines={1}>
                    {PROFESSOR_DATA.email}
                  </ThemedText>
                </View>
                <View style={styles.actionButton}>
                  <Ionicons name="arrow-forward" size={18} color="#fff"/>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoNote}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={BRAND_PRIMARY}
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
    backgroundColor: BACKGROUND_PAGE,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    marginTop: 60,
  },
  professorCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    backgroundColor: BACKGROUND_CARD,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  photoWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  photoRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: BRAND_PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_PAGE,
  },
  photoContainer: {
    width: 132,
    height: 132,
    borderRadius: 66,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: BACKGROUND_CARD,
  },
  professorPhoto: {
    width: 132,
    height: 132,
    borderRadius: 66,
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
    borderColor: BACKGROUND_CARD,
    backgroundColor: BRAND_PRIMARY,
  },
  professorName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: TEXT_PRIMARY,
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
    backgroundColor: BACKGROUND_CARD,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
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
    backgroundColor: BRAND_PRIMARY,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_PRIMARY,
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
    color: TEXT_PRIMARY,
  },
  contactCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: BACKGROUND_CARD,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_DEFAULT,
  },
  contactItemLast: {
    borderBottomWidth: 0,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: BRAND_PRIMARY,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BRAND_PRIMARY,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    backgroundColor: BRAND_PRIMARY_MUTED,
    borderColor: `${BRAND_PRIMARY}30`,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_PRIMARY,
  },
});
