import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

const roles = ['Judge', 'Admin'];

const palette = {
  background: Colors.light.background,
  surface: Colors.light.surface,
  surfaceMuted: Colors.light.surfaceMuted,
  primary: Colors.light.tint,
  primaryDark: Colors.light.accent,
  border: '#E4D8C8',
  text: Colors.light.text,
  textSecondary: '#6B504A',
  textMuted: '#9C857B',
  gold: '#B08A57',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(roles[0]);

  const handleContinue = () => {
    router.replace('/(app)/dashboard');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.brandBlock}>
              <View style={styles.brandTag}>
                <Text style={styles.brandTagText}>Aggies Invent</Text>
              </View>
              <Text style={styles.headline}>Meloy Judging Tool</Text>
              <Text style={styles.subHeadline}>
                Power through scoring, capture richer feedback, and share results instantly.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sign in</Text>
              <Text style={styles.cardSubtitle}>
                Use your Texas A&M email. We&apos;ll route you to the right workspace.
              </Text>

              <Text style={styles.label}>Role</Text>
              <View style={styles.roleGroup}>
                {roles.map((role) => {
                  const selected = role === selectedRole;
                  return (
                    <Pressable
                      key={role}
                      onPress={() => setSelectedRole(role)}
                      style={[styles.rolePill, selected && styles.rolePillSelected]}>
                      <Text style={[styles.rolePillText, selected && styles.rolePillTextSelected]}>
                        {role}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Texas A&M Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="your.name@tamu.edu"
                placeholderTextColor={palette.textMuted}
                autoCapitalize="none"
                style={styles.input}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={palette.textMuted}
                secureTextEntry
                style={styles.input}
              />

              <Pressable style={styles.primaryButton} onPress={handleContinue}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Create Account</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Questions? Reach out to the Meloy Innovation Team.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  brandBlock: {
    marginBottom: 32,
  },
  brandTag: {
    alignSelf: 'flex-start',
    backgroundColor: palette.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  brandTagText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 8,
  },
  subHeadline: {
    fontSize: 16,
    color: palette.textSecondary,
    lineHeight: 22,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
  },
  cardSubtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
    marginTop: 12,
  },
  roleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
  },
  rolePillSelected: {
    borderColor: palette.primary,
    backgroundColor: 'rgba(80, 0, 0, 0.12)',
  },
  rolePillText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  rolePillTextSelected: {
    color: palette.primary,
  },
  input: {
    marginTop: 6,
    backgroundColor: palette.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: palette.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: palette.textMuted,
    fontSize: 13,
  },
});
