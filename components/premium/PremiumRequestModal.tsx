import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PremiumRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

const PremiumRequestModal: React.FC<PremiumRequestModalProps> = ({
  visible,
  onClose,
}) => {
  const teacherPhone = "+994 51 355 51 83";
  const whatsappNumber = "994513555183";

  const handleWhatsAppPress = async () => {
    try {
      let whatsappUrl: string;

      if (Platform.OS === "android") {
        whatsappUrl = `whatsapp://send?phone=${whatsappNumber}`;
      } else {
        whatsappUrl = `https://wa.me/${whatsappNumber}`;
      }

      try {
        await Linking.openURL(whatsappUrl);
      } catch (whatsappError) {
        const alternativeUrl =
          Platform.OS === "android"
            ? `https://wa.me/${whatsappNumber}`
            : `whatsapp://send?phone=${whatsappNumber}`;

        try {
          await Linking.openURL(alternativeUrl);
        } catch (altError) {
          await Linking.openURL(`tel:${teacherPhone}`);
        }
      }
    } catch (error) {
      console.error("WhatsApp açma hatası:", error);

      try {
        await Linking.openURL(`tel:${teacherPhone}`);
      } catch (telError) {
        Alert.alert(
          "Xəta",
          "WhatsApp açıla bilmədi. Zəhmət olmasa WhatsApp-ı yükləyin və ya zəng düyməsini istifadə edin."
        );
      }
    }
  };

  const handleCallPress = () => {
    Linking.openURL(`tel:${teacherPhone}`).catch(() => {
      Alert.alert("Xəta", "Telefon nömrəsi açıla bilmədi");
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="star" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.modalTitle}>Premium Abunəlik</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.description}>
              Premium abunəliyə keçmək üçün müəllimlə əlaqə saxlayın:
            </Text>

            <View style={styles.teacherInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#7313e8" />
                <Text style={styles.infoText}>Fərid Qurbanov</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#7313e8" />
                <Text style={styles.infoText}>{teacherPhone}</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={handleWhatsAppPress}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                <Text style={styles.whatsappButtonText}>
                  WhatsApp ilə əlaqə
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallPress}
              >
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.callButtonText}>Zəng et</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Premium üstünlüklər:</Text>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.benefitText}>Bütün testlərə çıxış</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.benefitText}>
                  Sınaqları sınırsız dəfə verə bilərsiniz
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.benefitText}>Ətraflı statistika</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  teacherInfo: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  whatsappButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7313e8",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  benefitsContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 4,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: "#065F46",
    flex: 1,
  },
});

export default PremiumRequestModal;
