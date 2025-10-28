import React from 'react';
import { StyleSheet, TouchableOpacity, Alert, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { ThemedView } from '@/components/theme/themed-view';
import { ThemedText } from '@/components/theme/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { translations } from '@/constants/translations';
import { LinearGradient } from 'expo-linear-gradient';

export default function Profile() {
  const { user, logout } = useAuth();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleLogout = async () => {
    Alert.alert(
      translations.logout,
      translations.logoutConfirmation,
      [
        {
          text: translations.cancel,
          style: 'cancel',
        },
        {
          text: translations.logout,
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Header с градиентом */}
      <LinearGradient
        colors={[tintColor, `${tintColor}80`]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          {/* Аватар с кольцом */}
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarRing, { borderColor: 'rgba(255,255,255,0.3)' }]}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={90} color="#fff" />
              </View>
            </View>
          </View>
          
          <ThemedText type="title" style={styles.name}>
            {user ? `${user.name} ${user.surname}` : translations.user}
          </ThemedText>
          <ThemedText style={styles.email}>
            {user?.email}
          </ThemedText>
          {user?.role && (
            <View style={styles.roleBadge}>
              <ThemedText style={styles.roleText}>
                {user.role}
              </ThemedText>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Статистика карточки */}
      <View style={styles.statsContainer}>

      </View>

      {/* Меню секции */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Настройки
        </ThemedText>
        
        <View style={[styles.menuCard, { backgroundColor }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: `${borderColor}20` }]} 
          >
            <View style={[styles.iconContainer, { backgroundColor: `${tintColor}15` }]}>
              <Ionicons name="settings-outline" size={22} color={tintColor} />
            </View>
            <ThemedText style={styles.menuText}>
              {translations.settings}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color={borderColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: `${borderColor}20` }]} 
          >
            <View style={[styles.iconContainer, { backgroundColor: '#4CAF5015' }]}>
              <Ionicons name="notifications-outline" size={22} color="#4CAF50" />
            </View>
            <ThemedText style={styles.menuText}>
              Уведомления
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color={borderColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: `${borderColor}20` }]} 
          >
            <View style={[styles.iconContainer, { backgroundColor: '#2196F315' }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#2196F3" />
            </View>
            <ThemedText style={styles.menuText}>
              Приватность
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color={borderColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FF980015' }]}>
              <Ionicons name="help-circle-outline" size={22} color="#FF9800" />
            </View>
            <ThemedText style={styles.menuText}>
              {translations.helpAndSupport}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color={borderColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Дополнительная секция */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Дополнительно
        </ThemedText>
        
        <View style={[styles.menuCard, { backgroundColor }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: `${borderColor}20` }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${borderColor}15` }]}>
              <Ionicons name="information-circle-outline" size={22} color={borderColor} />
            </View>
            <ThemedText style={styles.menuText}>
              О приложении
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color={borderColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FF3B3015' }]}>
              <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            </View>
            <ThemedText style={[styles.menuText, { color: '#FF3B30' }]}>
              {translations.logout}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Version 1.0.0
        </ThemedText>
      </View>
    </ScrollView>
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
    alignItems: 'center',
  },
  avatarWrapper: {
    marginBottom: 16,
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  email: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.4,
  },
});