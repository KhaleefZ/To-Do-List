// Type definitions for the TodoApp
// This file contains all TypeScript interfaces and types used across the app

export type Priority = 'High' | 'Medium' | 'Low';
export type Category = 'All' | 'Work' | 'Personal' | 'Shopping' | 'Health' | 'Study' | 'Other';
export type SortOption = 'smart' | 'priority' | 'deadline' | 'alphabetical';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dateTime: string;
  deadline: string;
  priority: Priority;
  isCompleted: boolean;
  tags: string[];
  category: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  email: string;
  createdAt?: string;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface TaskState {
  items: Task[];
  filteredItems: Task[];
  loading: boolean;
  selectedCategory: Category;
  sortBy: SortOption;
  searchQuery: string;
  stats: TaskStats;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  todayTasks: number;
  weekTasks: number;
}

export interface CategoryInfo {
  key: Category;
  label: string;
  icon: string;
  color: string;
}

export interface PriorityInfo {
  key: Priority;
  label: string;
  color: string;
  icon: string;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  AddTask: { editTask?: Task } | undefined;
  TaskDetail: { taskId: string };
  Profile: undefined;
};

// API Response types
export interface AuthResponse {
  access_token: string;
  userId: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
