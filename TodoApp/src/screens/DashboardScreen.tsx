import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchTasks,
  deleteTask,
  updateTask,
  setCategory,
  setSortBy,
  setSearchQuery,
  Task,
  Category,
  SortOption,
} from '../store/slices/taskSlice';
import { logout } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, CATEGORIES, SORT_OPTIONS, RADIUS, SHADOWS } from '../constants';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { filteredItems, loading, selectedCategory, sortBy, searchQuery } = useSelector(
    (state: RootState) => state.tasks
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchTasks());
    setRefreshing(false);
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    dispatch(deleteTask(id));
  };

  const handleToggleComplete = async (task: Task) => {
    dispatch(updateTask({ id: task._id, data: { isCompleted: !task.isCompleted } }));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    dispatch(logout());
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

  const renderTask = ({ item }: { item: Task }) => {
    const timeInfo = getTimeRemaining(item.deadline);
    
    return (
      <TouchableOpacity
        style={[styles.taskCard, item.isCompleted && styles.completedTask]}
        onPress={() => handleToggleComplete(item)}
        activeOpacity={0.8}
      >
        {/* Priority indicator */}
        <View style={[styles.priorityBar, { backgroundColor: getPriorityColor(item.priority) }]} />
        
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            {/* Checkbox */}
            <TouchableOpacity
              style={[styles.checkbox, item.isCompleted && styles.checkboxChecked]}
              onPress={() => handleToggleComplete(item)}
            >
              {item.isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            
            <View style={styles.taskTitleContainer}>
              <Text style={[styles.taskTitle, item.isCompleted && styles.completedText]}>
                {item.title}
              </Text>
              {item.description && (
                <Text style={styles.taskDescription} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
            </View>
            
            {/* Category icon */}
            <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          </View>
          
          <View style={styles.taskFooter}>
            {/* Tags */}
            <View style={styles.tagsContainer}>
              {item.tags?.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
            
            {/* Deadline */}
            <View style={[styles.deadlineBadge, { backgroundColor: timeInfo.color + '20' }]}>
              <Text style={[styles.deadlineText, { color: timeInfo.color }]}>
                {timeInfo.urgent && '⚠️ '}{timeInfo.text}
              </Text>
            </View>
            
            {/* Delete button */}
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const completedCount = filteredItems.filter(t => t.isCompleted).length;
  const pendingCount = filteredItems.filter(t => !t.isCompleted).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello there! 👋</Text>
          <Text style={styles.headerTitle}>Your Tasks</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.profileBtn} 
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.success }]}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.info }]}>
          <Text style={styles.statNumber}>{filteredItems.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks, tags..."
          placeholderTextColor="#A0A0A0"
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Text style={styles.sortIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      {showSortOptions && (
        <View style={styles.sortOptionsContainer}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.sortOption, sortBy === option.key && styles.sortOptionActive]}
              onPress={() => {
                dispatch(setSortBy(option.key));
                setShowSortOptions(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortBy === option.key && styles.sortOptionTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryChip,
              selectedCategory === cat.key && { backgroundColor: cat.color },
            ]}
            onPress={() => dispatch(setCategory(cat.key))}
          >
            <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat.key && styles.categoryChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task List */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No tasks found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try a different search' : 'Tap + to add your first task'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          renderItem={renderTask}
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.9}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  logoutBtn: {
    backgroundColor: COLORS.danger + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    marginBottom: 15,
    ...SHADOWS.small,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.black,
  },
  sortButton: {
    padding: 8,
  },
  sortIcon: {
    fontSize: 20,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  sortOptionTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    ...SHADOWS.small,
  },
  categoryChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  priorityBar: {
    width: 5,
  },
  taskContent: {
    flex: 1,
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray500,
  },
  taskDescription: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 4,
  },
  categoryIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
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
    fontSize: 18,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.gray500,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
});

export default DashboardScreen;