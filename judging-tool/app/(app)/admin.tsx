import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { adminEvents, adminMetrics } from '@/constants/mockData';

const palette = {
  background: Colors.light.background,
  surface: Colors.light.surface,
  surfaceMuted: Colors.light.surfaceMuted,
  border: '#E1D2C6',
  primary: Colors.light.tint,
  accent: '#B08A57',
  text: Colors.light.text,
  textSecondary: '#6B504A',
  textMuted: '#9C857B',
};

export default function AdminScreen() {
  return (
    <ThemedView style={styles.background}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.breadcrumb} onPress={() => router.back()}>
            <Text style={styles.breadcrumbText}>← Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Admin console</Text>
            <Text style={styles.subtitle}>
              Launch events, monitor participation, and sync judge assignments from one place.
            </Text>
          </View>

          <View style={styles.metricRow}>
            {adminMetrics.map((metric) => (
              <View key={metric.label} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
                {metric.delta ? <Text style={styles.metricDelta}>{metric.delta}</Text> : null}
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Event portfolio</Text>
            <Pressable style={styles.createButton}>
              <Text style={styles.createButtonText}>+ New event</Text>
            </Pressable>
          </View>

          <View style={styles.eventList}>
            {adminEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventDates}>{event.dates}</Text>
                  </View>
                  <View style={[styles.statusBadge, getBadgeStyle(event.status)]}>
                    <Text style={[styles.statusText, getBadgeTextStyle(event.status)]}>
                      {event.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.eventStats}>
                  <View>
                    <Text style={styles.statValue}>{event.teams}</Text>
                    <Text style={styles.statLabel}>Teams registered</Text>
                  </View>
                  <View>
                    <Text style={styles.statValue}>{event.judges}</Text>
                    <Text style={styles.statLabel}>Judges assigned</Text>
                  </View>
                </View>

                <View style={styles.deliverable}>
                  <Text style={styles.deliverableLabel}>Next deadline</Text>
                  <Text style={styles.deliverableValue}>{event.deliverablesDue}</Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable style={[styles.actionButton, styles.ghostButton]}>
                    <Text style={styles.ghostButtonText}>Manage judges</Text>
                  </Pressable>
                  <Pressable style={[styles.actionButton, styles.primaryButton]}>
                    <Text style={styles.primaryButtonText}>Open dashboard</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function getBadgeStyle(status: 'Draft' | 'Open' | 'Judging' | 'Archived'): ViewStyle {
  switch (status) {
    case 'Judging':
      return { backgroundColor: 'rgba(80, 0, 0, 0.12)', borderColor: 'rgba(80, 0, 0, 0.45)' };
    case 'Open':
      return { backgroundColor: 'rgba(15, 122, 15, 0.12)', borderColor: 'rgba(15, 122, 15, 0.4)' };
    case 'Draft':
      return { backgroundColor: 'rgba(156, 133, 123, 0.14)', borderColor: 'rgba(156, 133, 123, 0.3)' };
    default:
      return { backgroundColor: 'rgba(148, 133, 120, 0.1)', borderColor: 'rgba(148, 133, 120, 0.28)' };
  }
}

function getBadgeTextStyle(status: 'Draft' | 'Open' | 'Judging' | 'Archived'): TextStyle {
  switch (status) {
    case 'Judging':
      return { color: Colors.light.tint };
    case 'Open':
      return { color: '#0F7A0F' };
    case 'Draft':
      return { color: '#6B504A' };
    default:
      return { color: '#9C857B' };
  }
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
  header: {
    gap: 12,
  },
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  metricLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
  },
  metricDelta: {
    color: palette.accent,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  eventList: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
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
    gap: 16,
  },
  eventName: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  eventDates: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventStats: {
    flexDirection: 'row',
    gap: 28,
  },
  statValue: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  deliverable: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: palette.border,
  },
  deliverableLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  deliverableValue: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  ghostButtonText: {
    color: palette.primary,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: palette.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
