import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { fetchTasks } from '../store/slices/taskSlice';
import { COLORS, RADIUS, SHADOWS, MOTIVATIONAL_QUOTES } from '../constants';
import Card from '../components/ui/Card';

interface MenuItem {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: tasks } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [quote] = useState(() => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    return randomQuote.text;
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(fetchTasks());
    
    Animated.sequence([
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: { isCompleted: boolean }) => t.isCompleted).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = totalTasks - completedTasks;

  // Calculate streak (mock - in real app, track daily completion)
  const currentStreak = Math.min(completedTasks, 7);

  // Level system
  const experience = completedTasks * 10;
  const level = Math.floor(experience / 100) + 1;
  const expToNextLevel = 100 - (experience % 100);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (experience % 100) / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [experience]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            dispatch(logout());
            // Navigation will be handled automatically by AppNavigator
            // based on isAuthenticated state change
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: '📊',
      label: 'Statistics',
      subtitle: 'View detailed analytics',
      onPress: () => Alert.alert('Coming Soon', 'Detailed statistics will be available soon!'),
    },
    {
      icon: '🔔',
      label: 'Notifications',
      subtitle: 'Manage reminders',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon!'),
    },
    {
      icon: '🎨',
      label: 'Appearance',
      subtitle: 'Theme & colors',
      onPress: () => Alert.alert('Coming Soon', 'Theme customization will be available soon!'),
    },
    {
      icon: '🔐',
      label: 'Privacy & Security',
      subtitle: 'Password & data',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon!'),
    },
    {
      icon: '❓',
      label: 'Help & Support',
      subtitle: 'FAQs & contact',
      onPress: () => Alert.alert('Need Help?', 'Contact us at support@taskmaster.app'),
    },
    {
      icon: '🚪',
      label: 'Logout',
      onPress: handleLogout,
      danger: true,
    },
  ];

  const StatBox = ({ value, label, icon }: { value: string | number; label: string; icon: string }) => (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient effect */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Avatar */}
          <Animated.View 
            style={[
              styles.avatarContainer, 
              { transform: [{ scale: avatarScale }] }
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{level}</Text>
            </View>
          </Animated.View>

          {/* User info */}
          <Animated.View 
            style={[
              styles.userInfo,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@email.com'}</Text>
            
            {/* Rank badge */}
            <View style={styles.rankBadge}>
              <Text style={styles.rankIcon}>🏆</Text>
              <Text style={styles.rankText}>
                {level >= 10 ? 'Task Master' : level >= 5 ? 'Pro Achiever' : 'Rising Star'}
              </Text>
            </View>
          </Animated.View>

          {/* XP Progress bar */}
          <Animated.View style={[styles.xpContainer, { opacity: fadeAnim }]}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>Experience</Text>
              <Text style={styles.xpValue}>{experience % 100}/100 XP</Text>
            </View>
            <View style={styles.xpBarBg}>
              <Animated.View 
                style={[
                  styles.xpBarFill, 
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]} 
              />
            </View>
            <Text style={styles.xpInfo}>{expToNextLevel} XP to Level {level + 1}</Text>
          </Animated.View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats grid */}
        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
          <StatBox value={totalTasks} label="Total Tasks" icon="📋" />
          <StatBox value={completedTasks} label="Completed" icon="✅" />
          <StatBox value={`${completionRate}%`} label="Success Rate" icon="📈" />
          <StatBox value={currentStreak} label="Day Streak" icon="🔥" />
        </Animated.View>

        {/* Motivational quote */}
        <Animated.View style={[styles.quoteCard, { opacity: fadeAnim }]}>
          <Text style={styles.quoteIcon}>💭</Text>
          <Text style={styles.quoteText}>"{quote}"</Text>
        </Animated.View>

        {/* Menu items */}
        <Animated.View style={[styles.menuContainer, { opacity: fadeAnim }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[
                  styles.menuIconContainer,
                  item.danger && styles.menuIconDanger
                ]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[
                    styles.menuLabel,
                    item.danger && styles.menuLabelDanger
                  ]}>
                    {item.label}
                  </Text>
                  {item.subtitle && (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* App version */}
        <Text style={styles.version}>TaskMaster v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.primaryLight,
    marginBottom: 12,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  rankIcon: {
    fontSize: 14,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  xpContainer: {
    width: '80%',
    marginTop: 20,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 12,
    color: COLORS.primaryLight,
  },
  xpValue: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  xpBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  xpInfo: {
    fontSize: 11,
    color: COLORS.primaryLight,
    marginTop: 6,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 4,
  },
  quoteCard: {
    backgroundColor: COLORS.primaryLight + '20',
    padding: 20,
    borderRadius: RADIUS.lg,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  quoteIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 15,
    color: COLORS.primary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconDanger: {
    backgroundColor: COLORS.danger + '15',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  menuLabelDanger: {
    color: COLORS.danger,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.gray400,
    fontWeight: '300',
  },
  version: {
    textAlign: 'center',
    color: COLORS.gray500,
    fontSize: 13,
    marginBottom: 30,
  },
});

export default ProfileScreen;
