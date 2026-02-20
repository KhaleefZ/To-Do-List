// App constants and theme configuration
import { Category, SortOption } from '../store/slices/taskSlice';

// Define types locally since types/index.ts might not export them properly
interface CategoryInfo {
  key: Category;
  label: string;
  icon: string;
  color: string;
}

interface PriorityInfo {
  key: 'High' | 'Medium' | 'Low';
  label: string;
  color: string;
  icon: string;
}

// Color palette - Modern gradient-inspired design
export const COLORS = {
  // Primary colors
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5541D7',
  
  // Secondary colors
  secondary: '#00CEC9',
  secondaryLight: '#81ECEC',
  
  // Accent colors
  accent: '#FD79A8',
  accentLight: '#FDCFE8',
  
  // Status colors
  success: '#00B894',
  successLight: '#55EFC4',
  warning: '#FDCB6E',
  warningLight: '#FFEAA7',
  danger: '#FF7675',
  dangerLight: '#FFB8B8',
  info: '#0984E3',
  infoLight: '#74B9FF',
  
  // Priority colors
  priorityHigh: '#FF6B6B',
  priorityMedium: '#FFD93D',
  priorityLow: '#6BCB77',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#2D3436',
  gray100: '#F8F9FE',
  gray200: '#E8E8E8',
  gray300: '#DFE6E9',
  gray400: '#B2BEC3',
  gray500: '#7F8C8D',
  gray600: '#636E72',
  
  // Background
  background: '#F8F9FE',
  cardBackground: '#FFFFFF',
  
  // Gradients (for reference)
  gradientPrimary: ['#6C5CE7', '#A29BFE'],
  gradientSuccess: ['#00B894', '#55EFC4'],
  gradientWarning: ['#FDCB6E', '#FFEAA7'],
  gradientDanger: ['#FF7675', '#FFB8B8'],
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
    title: 28,
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 25,
  round: 50,
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Categories configuration
export const CATEGORIES: CategoryInfo[] = [
  { key: 'All', label: 'All Tasks', icon: '📋', color: COLORS.primary },
  { key: 'Work', label: 'Work', icon: '💼', color: '#0984E3' },
  { key: 'Personal', label: 'Personal', icon: '👤', color: '#00B894' },
  { key: 'Shopping', label: 'Shopping', icon: '🛒', color: '#E17055' },
  { key: 'Health', label: 'Health', icon: '❤️', color: '#D63031' },
  { key: 'Study', label: 'Study', icon: '📚', color: '#6C5CE7' },
  { key: 'Other', label: 'Other', icon: '📌', color: '#636E72' },
];

// Priorities configuration
export const PRIORITIES: PriorityInfo[] = [
  { key: 'High', label: 'High Priority', color: COLORS.priorityHigh, icon: '🔴' },
  { key: 'Medium', label: 'Medium Priority', color: COLORS.priorityMedium, icon: '🟡' },
  { key: 'Low', label: 'Low Priority', color: COLORS.priorityLow, icon: '🟢' },
];

// Sort options
export const SORT_OPTIONS = [
  { key: 'smart', label: '🧠 Smart Sort', description: 'AI-powered sorting' },
  { key: 'priority', label: '⚡ Priority', description: 'High to Low' },
  { key: 'deadline', label: '📅 Deadline', description: 'Soonest first' },
  { key: 'alphabetical', label: '🔤 A-Z', description: 'Alphabetical order' },
] as const;

// Motivational quotes for empty states and celebrations
export const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
];

// Celebration messages when completing tasks
export const CELEBRATION_MESSAGES = [
  "🎉 Awesome job!",
  "⭐ You're on fire!",
  "🚀 Keep it up!",
  "💪 Crushing it!",
  "🌟 Fantastic work!",
  "🎯 Nailed it!",
  "✨ Brilliant!",
  "🏆 Champion!",
];

// App configuration
export const APP_CONFIG = {
  name: 'TaskMaster',
  version: '1.0.0',
  apiTimeout: 10000,
  maxTags: 5,
  maxTitleLength: 100,
  maxDescriptionLength: 500,
};
