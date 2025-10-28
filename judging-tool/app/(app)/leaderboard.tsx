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
import { events, getEventById, leaderboard } from '@/constants/mockData';

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

const trendCopy: Record<'up' | 'down' | 'steady', string> = {
  up: 'Trending up',
  down: 'Trending down',
  steady: 'Holding steady',
};

const trendColor: Record<'up' | 'down' | 'steady', string> = {
  up: '#0F7A0F',
  down: '#B91C1C',
  steady: palette.textMuted,
};

export default function LeaderboardScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const activeSnapshot = eventId ? leaderboard : leaderboard; // Placeholder for future filtering.
  const event = getEventById(activeSnapshot.eventId) ?? events[0];

  return (
    <ThemedView style={styles.background}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.breadcrumb} onPress={() => router.back()}>
            <Text style={styles.breadcrumbText}>← Back to event</Text>
          </Pressable>

          <View style={styles.hero}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>Scoring breakdown</Text>
              <Text style={styles.heroTitle}>{event?.theme}</Text>
              <Text style={styles.heroSubtitle}>{event?.name}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Last sync</Text>
              <Text style={styles.heroStatValue}>{activeSnapshot.updatedAt}</Text>
            </View>
          </View>

          <View style={styles.highlightCard}>
            <Text style={styles.highlightTitle}>What&apos;s new</Text>
            <Text style={styles.highlightCopy}>{activeSnapshot.highlight}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <Text style={styles.sectionSubtitle}>{activeSnapshot.rows.length} teams evaluated</Text>
          </View>

          <View style={styles.rowList}>
            {activeSnapshot.rows.map((row) => (
              <Pressable
                key={row.teamId}
                style={styles.rowCard}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/team/[teamId]',
                    params: { teamId: row.teamId, eventId: activeSnapshot.eventId },
                  })
                }>
                <View style={styles.rowHeader}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{row.ranking}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{row.teamName}</Text>
                    <Text style={[styles.trendLabel, { color: trendColor[row.trend] }]}>
                      {trendCopy[row.trend]}
                    </Text>
                  </View>
                  <View style={styles.scoreStack}>
                    <Text style={styles.averageScore}>{row.averageScore}</Text>
                    <Text style={styles.averageLabel}>Avg Score</Text>
                  </View>
                </View>

                <View style={styles.breakdownRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.breakdownTitle}>By rubric</Text>
                    <View style={styles.breakdownChips}>
                      {row.rubricBreakdown.map((item) => (
                        <View key={item.criterionId} style={styles.breakdownChip}>
                          <Text style={styles.breakdownChipLabel}>{item.criterion}</Text>
                          <Text style={styles.breakdownChipValue}>{item.score}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.breakdownRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.breakdownTitle}>Judge variance</Text>
                    <View style={styles.judgeList}>
                      {row.judgeBreakdown.map((judge) => (
                        <View key={judge.judgeId} style={styles.judgeBadge}>
                          <Text style={styles.judgeBadgeLabel}>{judge.judgeName}</Text>
                          <Text style={styles.judgeBadgeScore}>{judge.score}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </Pressable>
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
  hero: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
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
    marginTop: 6,
  },
  heroSubtitle: {
    color: palette.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  heroStat: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: palette.border,
  },
  heroStatLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  heroStatValue: {
    color: palette.text,
    fontSize: 14,
  },
  highlightCard: {
    backgroundColor: palette.highlight,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 6,
  },
  highlightTitle: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  highlightCopy: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 21,
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
  sectionSubtitle: {
    color: palette.textMuted,
    fontSize: 13,
  },
  rowList: {
    gap: 16,
  },
  rowCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  rowHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  rankBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(176, 138, 87, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(176, 138, 87, 0.4)',
  },
  rankText: {
    color: palette.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  teamName: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  trendLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  scoreStack: {
    alignItems: 'flex-end',
  },
  averageScore: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
  },
  averageLabel: {
    color: palette.textMuted,
    fontSize: 12,
  },
  breakdownRow: {
    gap: 10,
  },
  breakdownTitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  breakdownChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  breakdownChip: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  breakdownChipLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownChipValue: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  judgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  judgeBadge: {
    backgroundColor: 'rgba(80, 0, 0, 0.1)',
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  judgeBadgeLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  judgeBadgeScore: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
