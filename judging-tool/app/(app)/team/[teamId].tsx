import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, useCallback, useMemo as useReactMemo } from 'react';
import {
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { getEventById, getTeamWithEvent } from '@/constants/mockData';

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
  success: '#0F7A0F',
};

export default function TeamDetailScreen() {
  const { teamId, eventId: eventIdFromParams } = useLocalSearchParams<{
    teamId: string;
    eventId?: string;
  }>();

  const teamEntry = teamId ? getTeamWithEvent(teamId) : undefined;
  const event =
    (eventIdFromParams && getEventById(eventIdFromParams)) ||
    (teamEntry ? getEventById(teamEntry.eventId) : undefined);

  const team = teamEntry?.team;
  const rubric = event?.rubric ?? [];
  const questions = event?.reflectionQuestions ?? [];

  const [scores, setScores] = useState<Record<string, number>>(() => {
    return rubric.reduce<Record<string, number>>((acc, criterion) => {
      acc[criterion.id] = Math.round(criterion.maxScore * 0.6);
      return acc;
    }, {});
  });
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [comments, setComments] = useState('');

  const handleScoreChange = useCallback((criterionId: string, value: number) => {
    setScores((current) => ({
      ...current,
      [criterionId]: value,
    }));
  }, []);

  const totalScore = useMemo(
    () => rubric.reduce((acc, criterion) => acc + (scores[criterion.id] ?? 0), 0),
    [rubric, scores],
  );
  const maxTotal = useMemo(
    () => rubric.reduce((acc, criterion) => acc + criterion.maxScore, 0),
    [rubric],
  );
  const averageTarget = rubric.length ? Math.round(maxTotal / rubric.length) : 0;

  if (!team || !event) {
    return (
      <ThemedView style={[styles.background, styles.centerContent]}>
        <Text style={styles.missingTitle}>Team not found</Text>
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
            <Text style={styles.breadcrumbText}>← Back to teams</Text>
          </Pressable>

          <View style={styles.hero}>
            <View style={[styles.teamAvatar, { backgroundColor: team.avatarColor }]}>
              <Text style={styles.teamAvatarText}>{team.alias}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamTrack}>{team.track}</Text>
              <Text style={styles.teamSummary}>{team.summary}</Text>
            </View>
          </View>

          <View style={styles.highlight}>
            <Text style={styles.highlightLabel}>This team is focusing on</Text>
            <Text style={styles.highlightValue}>{team.focusQuestion}</Text>
          </View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Rubric total</Text>
            <Text style={styles.scoreValue}>
              {totalScore} <Text style={styles.scoreMax}>/ {maxTotal}</Text>
            </Text>
            <Text style={styles.scoreHint}>These scores autosave while you judge.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rubric scoring</Text>
            {rubric.length ? (
              <View style={styles.sectionDescriptionRow}>
                <Text style={styles.sectionDescription}>
                  Slide to score each criterion. Hover near {averageTarget} to stay calibrated, then
                  leave notes so teams walk away with actionable feedback.
                </Text>
              </View>
            ) : null}
            <View style={styles.criterionList}>
              {rubric.map((criterion) => (
                <View key={criterion.id} style={styles.criterionCard}>
                  <View style={styles.criterionHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.criterionLabel}>{criterion.label}</Text>
                      <Text style={styles.criterionDescription}>{criterion.description}</Text>
                    </View>
                    <View style={styles.scoreBubble}>
                      <Text style={styles.scoreBubbleText}>{scores[criterion.id] ?? 0}</Text>
                      <Text style={styles.scoreBubbleMax}>/ {criterion.maxScore}</Text>
                    </View>
                  </View>
                  <RubricSlider
                    criterionId={criterion.id}
                    value={scores[criterion.id] ?? 0}
                    max={criterion.maxScore}
                    onChange={handleScoreChange}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reflection prompts</Text>
            <View style={styles.questionList}>
              {questions.map((question) => (
                <View key={question.id} style={styles.questionCard}>
                  <Text style={styles.questionPrompt}>{question.prompt}</Text>
                  {question.helperText ? (
                    <Text style={styles.questionHelper}>{question.helperText}</Text>
                  ) : null}
                  <TextInput
                    value={responses[question.id] ?? ''}
                    onChangeText={(text) =>
                      setResponses((current) => ({
                        ...current,
                        [question.id]: text,
                      }))
                    }
                    placeholder="Capture a quick impression or insight..."
                    placeholderTextColor="#64748B"
                    multiline
                    style={styles.textArea}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional comments</Text>
            <Text style={styles.sectionDescription}>
              Share anything that helps the team level up after Aggies Invent.
            </Text>
            <TextInput
              value={comments}
              onChangeText={setComments}
              placeholder="Highlights, blockers, or shout-outs for this team..."
              placeholderTextColor="#64748B"
              multiline
              style={[styles.textArea, { minHeight: 120 }]}
            />
          </View>

          <View style={styles.footerActions}>
            <Pressable style={[styles.footerButton, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>Save Draft</Text>
            </Pressable>
            <Pressable style={[styles.footerButton, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>Submit Scores</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// ✅ FIXED SLIDER (Type-safe, smooth dragging)
type RubricSliderProps = {
  value: number;
  max: number;
  criterionId: string;
  onChange: (id: string, value: number) => void;
};

function RubricSlider({ value, max, criterionId, onChange }: RubricSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  const handleGesture = useCallback(
    (relativeX: number) => {
      if (!max || !trackWidth) return;
      const ratio = Math.min(Math.max(relativeX / trackWidth, 0), 1);
      const rounded = Math.round(ratio * max);
      onChange(criterionId, rounded);
    },
    [trackWidth, max, criterionId, onChange],
  );

  const panResponder = useReactMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          handleGesture(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt) => {
          handleGesture(evt.nativeEvent.locationX);
        },
      }),
    [handleGesture],
  );

  const percentage = max ? (value / max) * 100 : 0;
  const midpoint = Math.round(max / 2);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width);
  }, []);

  return (
    <View style={styles.sliderContainer}>
      <View onLayout={handleLayout} style={styles.sliderTrack} {...panResponder.panHandlers}>
        <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
        <View style={[styles.sliderThumb, { left: `${percentage}%` }]} />
      </View>
      <View style={styles.sliderScale}>
        <Text style={styles.sliderScaleLabel}>0</Text>
        <Text style={styles.sliderScaleLabel}>{midpoint}</Text>
        <Text style={styles.sliderScaleLabel}>{max}</Text>
      </View>
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
  sliderContainer: {
    gap: 8,
  },
  sliderTrack: {
    height: 12,
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: 999,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: palette.primary,
    top: -6,
    transform: [{ translateX: -12 }],
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  hero: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
  },
  teamAvatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  teamName: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
  },
  teamTrack: {
    color: palette.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  teamSummary: {
    color: palette.textSecondary,
    fontSize: 15,
    marginTop: 10,
    lineHeight: 21,
  },
  highlight: {
    backgroundColor: palette.highlight,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 6,
  },
  highlightLabel: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  highlightValue: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  scoreCard: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  scoreLabel: {
    color: palette.textMuted,
    fontSize: 13,
  },
  scoreValue: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '700',
  },
  scoreMax: {
    color: palette.textMuted,
    fontSize: 14,
  },
  scoreHint: {
    color: palette.textMuted,
    fontSize: 12,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionDescriptionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionDescription: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  criterionList: {
    gap: 18,
  },
  criterionCard: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  criterionHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  criterionLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  criterionDescription: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  scoreBubble: {
    backgroundColor: 'rgba(80, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBubbleText: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  scoreBubbleMax: {
    color: palette.textMuted,
    fontSize: 12,
  },
  sliderScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderScaleLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  questionList: {
    gap: 16,
  },
  questionCard: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  questionPrompt: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
  },
  questionHelper: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  textArea: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    padding: 16,
    minHeight: 96,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.border,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: palette.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  missingTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: palette.primary,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  breadcrumb: {
    alignSelf: 'flex-start',
  },
  breadcrumbText: {
    color: palette.textMuted,
    fontSize: 14,
  },
});
