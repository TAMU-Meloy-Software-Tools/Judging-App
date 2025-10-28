import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

const palette = {
  background: Colors.light.background,
  surface: Colors.light.surface,
  surfaceMuted: Colors.light.surfaceMuted,
  border: '#E1D2C6',
  primary: Colors.light.tint,
  text: Colors.light.text,
  textSecondary: '#6B504A',
  textMuted: '#9C857B',
};

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <ThemedView style={styles.background}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.breadcrumb} onPress={() => router.back()}>
            <Text style={styles.breadcrumbText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Settings & Preferences</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AP</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>Aaron Patel</Text>
                <Text style={styles.profileMeta}>Chevron Technology Ventures • Judge</Text>
              </View>
              <Pressable>
                <Text style={styles.link}>Edit</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.list}>
              <SettingRow
                label="Push notifications"
                description="Score reminders, event announcements, and leaderboard updates."
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
              <SettingRow
                label="Judge briefing reminders"
                description="Send an SMS an hour before check-ins or pitch rounds."
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Display</Text>
            <View style={styles.list}>
              <SettingRow
                label="Dark mode"
                description="Prefer dark UI during on-site judging."
                value={darkMode}
                onValueChange={setDarkMode}
              />
              <Pressable style={styles.row}>
                <View>
                  <Text style={styles.rowLabel}>Text size</Text>
                  <Text style={styles.rowDescription}>Default</Text>
                </View>
                <Text style={styles.link}>Change</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.list}>
              <Pressable style={styles.row}>
                <View>
                  <Text style={styles.rowLabel}>Help center</Text>
                  <Text style={styles.rowDescription}>Guides for judges and admins.</Text>
                </View>
                <Text style={styles.link}>Open</Text>
              </Pressable>
              <Pressable style={styles.row}>
                <View>
                  <Text style={styles.rowLabel}>Contact Meloy team</Text>
                  <Text style={styles.rowDescription}>Share feedback or request new features.</Text>
                </View>
                <Text style={styles.link}>Email</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Log out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type SettingRowProps = {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingRow({ label, description, value, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.surfaceMuted, true: 'rgba(80, 0, 0, 0.35)' }}
        thumbColor={value ? palette.primary : '#C4B6AA'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: palette.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 120,
    gap: 24,
  },
  breadcrumb: {
    alignSelf: 'flex-start',
  },
  breadcrumbText: {
    color: palette.textMuted,
    fontSize: 14,
  },
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: '700',
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  profileName: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '600',
  },
  profileMeta: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  list: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  rowLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
  },
  rowDescription: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  link: {
    color: palette.primary,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  logoutButtonText: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});
