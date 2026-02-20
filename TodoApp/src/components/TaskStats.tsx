import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants';

interface TaskStatsType {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  todayTasks: number;
  completionRate: number;
}

const { width } = Dimensions.get('window');

interface TaskStatsProps {
  stats: TaskStatsType;
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: stats.completionRate,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [stats.completionRate]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Main Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressSubtitle}>
              {stats.completed} of {stats.total} tasks completed
            </Text>
          </View>
          <View style={styles.percentageCircle}>
            <Text style={styles.percentageText}>
              {Math.round(stats.completionRate)}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: progressWidth },
            ]}
          />
        </View>

        {/* Motivational message */}
        <Text style={styles.motivationalText}>
          {stats.completionRate === 100
            ? "🎉 All done! You're amazing!"
            : stats.completionRate >= 75
            ? "🔥 Almost there! Keep going!"
            : stats.completionRate >= 50
            ? "💪 Great progress! You got this!"
            : stats.completionRate > 0
            ? "🚀 Good start! Let's crush it!"
            : "✨ Ready to start? You can do it!"}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatItem
          icon="📝"
          value={stats.pending}
          label="Pending"
          color={COLORS.warning}
        />
        <StatItem
          icon="✅"
          value={stats.completed}
          label="Done"
          color={COLORS.success}
        />
        <StatItem
          icon="⚠️"
          value={stats.overdue}
          label="Overdue"
          color={COLORS.danger}
        />
        <StatItem
          icon="📅"
          value={stats.todayTasks}
          label="Today"
          color={COLORS.primary}
        />
      </View>
    </Animated.View>
  );
};

interface StatItemProps {
  icon: string;
  value: number;
  label: string;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statItem,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.large,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  percentageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  motivationalText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 2,
  },
});

export default TaskStats;
