import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Məxfilik Siyasəti</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <Text style={styles.lastUpdated}>Son yenilənmə: 11 Avqust 2025</Text>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giriş</Text>
          <Text style={styles.paragraph}>
            Bu Məxfilik Siyasəti, Qanun Qapısı tətbiqini istifadə etdiyiniz
            zaman məlumatlarınızın toplanması, istifadəsi və açıqlanması ilə
            bağlı siyasətimizi təsvir edir. Xidmətimizdən istifadə etməklə, bu
            Məxfilik Siyasətinə uyğun olaraq məlumatların toplanması və
            istifadəsinə razılaşırsınız.
          </Text>
        </View>

        {/* Data Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toplanan Məlumatlar</Text>
          <Text style={styles.paragraph}>
            Xidmətimizi təmin etmək üçün aşağıdakı şəxsi məlumatları toplayırıq:
          </Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>E-poçt ünvanı</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Ad və soyad</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Cihaz məlumatları (IP ünvanı, cihaz növü, brauzer tipi)
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                İstifadə məlumatları (test nəticələri, irəliləyiş məlumatları)
              </Text>
            </View>
          </View>
        </View>

        {/* Data Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Məlumatların İstifadəsi</Text>
          <Text style={styles.paragraph}>
            Toplanan məlumatlarınızı aşağıdakı məqsədlər üçün istifadə edirik:
          </Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Xidmətimizi təmin etmək və təkmilləşdirmək
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Hesabınızı idarə etmək və qorumaq
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Test nəticələrinizi və irəliləyişinizi izləmək
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Xidmətimizlə bağlı məlumatlandırma göndərmək
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Xidmətimizin təhlükəsizliyini təmin etmək
              </Text>
            </View>
          </View>
        </View>

        {/* Data Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Məlumatların Paylaşılması</Text>
          <Text style={styles.paragraph}>
            Şəxsi məlumatlarınızı yalnız aşağıdakı hallarda paylaşırıq:
          </Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Xidmət təminatçıları ilə (yalnız xidməti təmin etmək üçün)
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Qanuni öhdəlikləri yerinə yetirmək üçün
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>Sizin açıq razılığınızla</Text>
            </View>
          </View>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Məlumatların Təhlükəsizliyi</Text>
          <Text style={styles.paragraph}>
            Məlumatlarınızın təhlükəsizliyi bizim üçün vacibdir. Məlumatlarınızı
            qorumaq üçün sənaye standartlarına uyğun təhlükəsizlik tədbirləri
            tətbiq edirik. Lakin internet üzərindən məlumat ötürməsi və ya
            elektron saxlama 100% təhlükəsiz deyil.
          </Text>
        </View>

        {/* Data Retention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Məlumatların Saxlanması</Text>
          <Text style={styles.paragraph}>
            Şəxsi məlumatlarınızı yalnız bu Məxfilik Siyasətində göstərilən
            məqsədlər üçün lazım olduğu müddətdə saxlayırıq. Qanuni öhdəlikləri
            yerinə yetirmək və mübahisələri həll etmək üçün lazım olduqda
            məlumatları daha uzun müddət saxlaya bilərik.
          </Text>
        </View>

        {/* User Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İstifadəçi Hüquqları</Text>
          <Text style={styles.paragraph}>
            Sizin aşağıdakı hüquqlarınız var:
          </Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Şəxsi məlumatlarınıza daxil olmaq
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Məlumatlarınızı düzəltmək və yeniləmək
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Məlumatlarınızı silməyi tələb etmək
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                Məlumatların emalına etiraz etmək
              </Text>
            </View>
          </View>
        </View>

        {/* Children's Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uşaqların Məxfilik Siyasəti</Text>
          <Text style={styles.paragraph}>
            Xidmətimiz 13 yaşından kiçik uşaqlara yönəldilməyib. 13 yaşından
            kiçik uşaqlardan qəsdən şəxsi məlumat toplamırıq. Əgər valideyn və
            ya qəyyum olduğunuzu və uşağınızın bizə şəxsi məlumat verdiyini
            bilirsinizsə, zəhmət olmasa bizimlə əlaqə saxlayın.
          </Text>
        </View>

        {/* Changes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dəyişikliklər</Text>
          <Text style={styles.paragraph}>
            Bu Məxfilik Siyasətini vaxtaşırı yeniləyə bilərik. Dəyişiklikləri bu
            səhifədə yerləşdirəcəyik və "Son yenilənmə" tarixini yeniləyəcəyik.
            Dəyişiklikləri dəqiqləşdirmək üçün bu səhifəni müntəzəm olaraq
            yoxlamanızı tövsiyə edirik.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Əlaqə</Text>
          <Text style={styles.paragraph}>
            Bu Məxfilik Siyasəti ilə bağlı suallarınız varsa, bizimlə əlaqə
            saxlayın:
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={18} color="#7313e8" />
              <Text style={styles.contactText}>fakhri.gezalov24@gmail.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={18} color="#7313e8" />
              <Text style={styles.contactText}>+994 50 988 89 72</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Qanun Qapısı. Bütün hüquqlar qorunur.
          </Text>
        </View>
      </ScrollView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    textAlign: "center",
    marginLeft: -40,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 12,
  },
  list: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 16,
    color: "#7313e8",
    marginRight: 12,
    fontWeight: "bold",
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },
  contactInfo: {
    marginTop: 12,
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: "#7313e8",
    fontWeight: "500",
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
