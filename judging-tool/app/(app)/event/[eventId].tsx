import { router, useLocalSearchParams } from 'expo-router';
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
import { getEventById } from '@/constants/mockData';

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
  highlight: '#F4E4DC',
};

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const event = eventId ? getEventById(eventId) : undefined;

  if (!event) {
    return (
      <ThemedView style={[styles.background, styles.centerContent]}>
        <Text style={styles.missingTitle}>Event not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.background}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.breadcrumb} onPress={() => router.back()}>
            <Text style={styles.breadcrumbText}>← Back to dashboard</Text>
          </Pressable>

          <View style={styles.hero}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>{event.status.toUpperCase()}</Text>
              <Text style={styles.heroTitle}>{event.theme}</Text>
              <Text style={styles.heroSubtitle}>{event.name}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaLabel}>Event dates</Text>
              <Text style={styles.heroMetaValue}>{event.dates}</Text>
              <Text style={styles.heroMetaLabel}>Location</Text>
              <Text style={styles.heroMetaValue}>{event.location}</Text>
            </View>
          </View>
          <Text style={styles.description}>{event.description}</Text>

          <Pressable
            style={styles.leaderboardBanner}
            onPress={() =>
              router.push({ pathname: '/(app)/leaderboard', params: { eventId: event.id } })
            }>
            <Text style={styles.leaderboardTitle}>Live scoring</Text>
            <Text style={styles.leaderboardCopy}>
              Track rubric averages, judge variance, and tie-breaker notes in real time.
            </Text>
            <Text style={styles.leaderboardLink}>View leaderboard</Text>
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Judging Bench</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.judgeRow}>
              {event.judges.map((judge) => (
                <View key={judge.id} style={styles.judgeCard}>
                  <View style={[styles.avatar, { backgroundColor: judge.avatarColor }]}>
                    <Text style={styles.avatarText}>
                      {judge.name
                        .split(' ')
                        .map((part) => part.charAt(0))
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={styles.judgeName}>
                    {judge.name}
                  </Text>
                  <Text numberOfLines={2} style={styles.judgeMeta}>
                    {judge.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Teams in this event</Text>
            <Text style={styles.sectionSubtitle}>{event.teams.length} teams</Text>
          </View>

          <View style={styles.teamList}>
            {event.teams.map((team) => (
              <Pressable
                key={team.id}
                style={styles.teamCard}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/team/[teamId]',
                    params: { teamId: team.id, eventId: event.id },
                  })
                }>
                <View style={styles.teamHeader}>
                  <View style={[styles.teamAvatar, { backgroundColor: team.avatarColor }]}>
                    <Text style={styles.teamAvatarText}>{team.alias}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamTrack}>{team.track}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Assigned</Text>
                  </View>
                </View>

                <Text style={styles.teamSummary}>{team.summary}</Text>

                <View style={styles.tagRow}>
                  {team.tags.map((tag) => (
                    <View key={tag} style={styles.chip}>
                      <Text style={styles.chipText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${team.progress * 100}%` }]} />
                  </View>
                  <Text style={styles.progressLabel}>{Math.round(team.progress * 100)}% rubric</Text>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>{team.lastUpdated}</Text>
                  <Text style={styles.footerText}>Focus: {team.focusQuestion}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resources</Text>
            {event.resources.map((resource) => (
              <View key={resource.label} style={styles.resourceRow}>
                <Text style={styles.resourceLabel}>{resource.label}</Text>
                <Text style={styles.resourceLink}>{resource.link}</Text>
              </View>
            ))}
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
    paddingBottom: 96,
    gap: 24,
  },
  breadcrumb: {
    alignSelf: 'flex-start',
  },
  breadcrumbText: {
    color: palette.textMuted,
    fontSize: 14,
  },
  hero: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    gap: 24,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroEyebrow: {
    color: palette.primary,
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  heroTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  heroSubtitle: {
    color: palette.textSecondary,
    fontSize: 16,
    marginTop: 6,
  },
  heroMeta: {
    width: 160,
    backgroundColor: palette.surfaceMuted,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  heroMetaLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  heroMetaValue: {
    color: palette.text,
    fontSize: 14,
  },
  description: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  leaderboardBanner: {
    backgroundColor: palette.highlight,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 8,
  },
  leaderboardTitle: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  leaderboardCopy: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  leaderboardLink: {
    color: palette.primary,
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionSubtitle: {
    color: palette.textMuted,
    fontSize: 13,
  },
  judgeRow: {
    marginHorizontal: -4,
  },
  judgeCard: {
    width: 140,
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 4,
    gap: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  judgeName: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  judgeMeta: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  teamList: {
    gap: 16,
  },
  teamCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  teamAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  teamName: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  teamTrack: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(80, 0, 0, 0.1)',
  },
  tagText: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  teamSummary: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: palette.surfaceMuted,
  },
  chipText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: palette.primary,
  },
  progressLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerText: {
    color: palette.textMuted,
    fontSize: 12,
    flex: 1,
  },
  resourceRow: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 6,
  },
  resourceLabel: {
    color: palette.text,
    fontWeight: '600',
    fontSize: 14,
  },
  resourceLink: {
    color: palette.primary,
    fontSize: 13,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  missingTitle: {
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#0F172A',
    fontWeight: '600',
  },
});
