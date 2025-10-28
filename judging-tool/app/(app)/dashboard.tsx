import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { events } from '@/constants/mockData';

const palette = {
  background: Colors.light.background,
  surface: Colors.light.surface,
  surfaceAlt: '#F3ECE2',
  surfaceMuted: Colors.light.surfaceMuted,
  border: '#E1D2C6',
  primary: Colors.light.tint,
  primaryDark: Colors.light.accent,
  text: Colors.light.text,
  textSecondary: '#6B504A',
  textMuted: '#9C857B',
  accent: '#B08A57',
  successSoft: '#E3F3E3',
};

const activeEvents = events.filter((event) => event.status !== 'Closed');

export default function DashboardScreen() {
  return (
    <ThemedView style={styles.background}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>Howdy, Judge!</Text>
              <Text style={styles.title}>Your Aggies Invent weekend</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(app)/settings')}
              style={styles.profileBadge}>
              <Text style={styles.profileText}>AP</Text>
            </Pressable>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>You&apos;re on deck for judging</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{activeEvents.length}</Text>
                <Text style={styles.summaryLabel}>Active events</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {activeEvents.reduce((acc, event) => acc + event.teams.length, 0)}
                </Text>
                <Text style={styles.summaryLabel}>Teams to score</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Next pitch</Text>
                <Text style={[styles.summaryValue, styles.summaryTime]}>12:00 PM</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Events you&apos;re judging</Text>
          <View style={styles.list}>
            {activeEvents.map((event) => (
              <Pressable
                key={event.id}
                style={styles.eventCard}
                onPress={() =>
                  router.push({ pathname: '/(app)/event/[eventId]', params: { eventId: event.id } })
                }>
                <View style={styles.eventHeader}>
                  <View style={styles.eventHeaderLeft}>
                    <Text style={styles.eventTheme}>{event.theme}</Text>
                    <Text style={styles.eventName}>{event.name}</Text>
                  </View>
                  <View style={styles.statusGroup}>
                    <Text style={styles.statusLabel}>Status</Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{event.status.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.eventMeta}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Dates</Text>
                    <Text style={styles.metaValue}>{event.dates}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Location</Text>
                    <Text style={styles.metaValue}>{event.location}</Text>
                  </View>
                </View>
                <Text style={styles.eventDescription}>{event.description}</Text>

                <View style={styles.eventFooter}>
                  <View>
                    <Text style={styles.eventMetricValue}>{event.teams.length}</Text>
                    <Text style={styles.eventMetricLabel}>Teams assigned</Text>
                  </View>
                  <View>
                    <Text style={styles.eventMetricValue}>{event.judges.length}</Text>
                    <Text style={styles.eventMetricLabel}>Judges total</Text>
                  </View>
                  <View>
                    <Text style={styles.eventMetricValue}>All rubric</Text>
                    <Text style={styles.eventMetricLabel}>Synced</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.quickActions}>
            <Pressable
              style={[styles.quickCard, styles.quickAdmin]}
              onPress={() => router.push('/(app)/admin')}>
              <Text style={styles.quickTitle}>Admin console</Text>
              <Text style={styles.quickSubtitle}>Create events, assign judges, export reports.</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
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
    paddingBottom: 80,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  kicker: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 6,
  },
  profileBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  summaryTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: palette.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  summaryValue: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
  },
  summaryTime: {
    fontSize: 20,
  },
  summaryLabel: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: -8,
  },
  list: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  eventHeaderLeft: {
    flex: 1,
    minWidth: '60%',
    gap: 6,
  },
  eventTheme: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  eventName: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statusGroup: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 6,
  },
  statusLabel: {
    color: palette.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(176, 138, 87, 0.16)',
    alignSelf: 'flex-end',
  },
  statusPillText: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  eventMeta: {
    gap: 10,
  },
  metaRow: {
    gap: 4,
  },
  metaLabel: {
    color: palette.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  metaValue: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  eventDescription: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventMetricValue: {
    color: palette.text,
    fontWeight: '700',
    fontSize: 16,
  },
  eventMetricLabel: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  quickCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: palette.border,
  },
  quickAdmin: {
    backgroundColor: '#F1D9C9',
  },
  quickTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '700',
  },
  quickSubtitle: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
