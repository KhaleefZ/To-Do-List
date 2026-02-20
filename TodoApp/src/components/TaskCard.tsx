import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS, CATEGORIES } from '../constants';
import { Task } from '../store/slices/taskSlice';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (id: string) => void;
  onPress?: (task: Task) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onPress,
  index,
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handleToggleComplete = () => {
    // Bounce animation when completing
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleComplete(task);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return COLORS.priorityHigh;
      case 'Medium':
        return COLORS.priorityMedium;
      default:
        return COLORS.priorityLow;
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.key === category);
    return cat?.icon || '📌';
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff < 0) return { text: 'Overdue', color: COLORS.danger, urgent: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0 && hours <= 6) return { text: `${hours}h left`, color: COLORS.danger, urgent: true };
    if (days === 0) return { text: `${hours}h left`, color: COLORS.warning, urgent: false };
    if (days === 1) return { text: 'Tomorrow', color: COLORS.warning, urgent: false };
    if (days <= 3) return { text: `${days} days`, color: COLORS.warning, urgent: false };
    return { text: `${days} days`, color: COLORS.success, urgent: false };
  };

  const timeInfo = getTimeRemaining(task.deadline);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, task.isCompleted && styles.completedCard]}
        onPress={() => onPress?.(task)}
        activeOpacity={0.8}
      >
        {/* Priority indicator */}
        <View style={[styles.priorityBar, { backgroundColor: getPriorityColor(task.priority) }]} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            {/* Checkbox */}
            <TouchableOpacity
              style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}
              onPress={handleToggleComplete}
            >
              {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            {/* Title & Description */}
            <View style={styles.titleContainer}>
              <Text
                style={[styles.title, task.isCompleted && styles.completedText]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {task.description}
                </Text>
              )}
            </View>

            {/* Category icon */}
            <Text style={styles.categoryIcon}>{getCategoryIcon(task.category)}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Tags */}
            <View style={styles.tagsContainer}>
              {task.tags?.slice(0, 2).map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {task.tags?.length > 2 && (
                <Text style={styles.moreTagsText}>+{task.tags.length - 2}</Text>
              )}
            </View>

            {/* Deadline */}
            <View style={[styles.deadlineBadge, { backgroundColor: timeInfo.color + '20' }]}>
              <Text style={[styles.deadlineText, { color: timeInfo.color }]}>
                {timeInfo.urgent && '⚠️ '}{timeInfo.text}
              </Text>
            </View>

            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(task._id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  priorityBar: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray500,
  },
  description: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 4,
  },
  categoryIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: COLORS.primaryLight + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: COLORS.gray500,
    marginLeft: 4,
  },
  deadlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 10,
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 5,
  },
  deleteIcon: {
    fontSize: 16,
  },
});

export default TaskCard;
