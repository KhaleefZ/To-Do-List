import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../api';

export type Category = 'All' | 'Work' | 'Personal' | 'Shopping' | 'Health' | 'Study' | 'Other';
export type SortOption = 'smart' | 'priority' | 'deadline' | 'alphabetical';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dateTime: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  isCompleted: boolean;
  tags: string[];
  category: Category;
}

interface TaskState {
  items: Task[];
  filteredItems: Task[];
  loading: boolean;
  selectedCategory: Category;
  sortBy: SortOption;
  searchQuery: string;
}

const initialState: TaskState = {
  items: [],
  filteredItems: [],
  loading: false,
  selectedCategory: 'All',
  sortBy: 'smart',
  searchQuery: '',
};

// Smart sorting algorithm: Priority + Deadline urgency + Time
const smartSort = (tasks: Task[]): Task[] => {
  const weights = { High: 3, Medium: 2, Low: 1 };
  const now = new Date().getTime();
  
  return [...tasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    
    const deadlineA = new Date(a.deadline).getTime();
    const deadlineB = new Date(b.deadline).getTime();
    
    // Urgency: how close is deadline (0-1, 1 being most urgent)
    const urgencyA = Math.max(0, Math.min(1, 1 - (deadlineA - now) / (7 * 24 * 60 * 60 * 1000)));
    const urgencyB = Math.max(0, Math.min(1, 1 - (deadlineB - now) / (7 * 24 * 60 * 60 * 1000)));
    
    // Combined score
    const scoreA = (weights[a.priority] / 3) * 0.5 + urgencyA * 0.35 + (deadlineA < now ? 0.15 : 0);
    const scoreB = (weights[b.priority] / 3) * 0.5 + urgencyB * 0.35 + (deadlineB < now ? 0.15 : 0);
    
    return scoreB - scoreA;
  });
};

const sortTasks = (tasks: Task[], sortBy: SortOption): Task[] => {
  const sorted = [...tasks];
  
  switch (sortBy) {
    case 'priority':
      const weights = { High: 3, Medium: 2, Low: 1 };
      return sorted.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return weights[b.priority] - weights[a.priority];
      });
    case 'deadline':
      return sorted.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    case 'alphabetical':
      return sorted.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return a.title.localeCompare(b.title);
      });
    case 'smart':
    default:
      return smartSort(sorted);
  }
};

const filterTasks = (items: Task[], category: Category, searchQuery: string, sortBy: SortOption): Task[] => {
  let filtered = items;
  
  if (category !== 'All') {
    filtered = filtered.filter(task => task.category === category);
  }
  
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return sortTasks(filtered, sortBy);
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { getState }) => {
  const response = await API.get('/tasks');
  return response.data;
});

export const createTask = createAsyncThunk('tasks/createTask', async (taskData: Omit<Task, '_id' | 'isCompleted'>) => {
  const response = await API.post('/tasks', taskData);
  return response.data;
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, data }: { id: string; data: Partial<Task> }) => {
  const response = await API.patch(`/tasks/${id}`, data);
  return response.data;
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id: string) => {
  await API.delete(`/tasks/${id}`);
  return id;
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<Category>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = filterTasks(state.items, action.payload, state.searchQuery, state.sortBy);
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
      state.filteredItems = filterTasks(state.items, state.selectedCategory, state.searchQuery, action.payload);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredItems = filterTasks(state.items, state.selectedCategory, action.payload, state.sortBy);
    },
    toggleTaskLocal: (state, action: PayloadAction<string>) => {
      const task = state.items.find(t => t._id === action.payload);
      if (task) {
        task.isCompleted = !task.isCompleted;
        state.filteredItems = filterTasks(state.items, state.selectedCategory, state.searchQuery, state.sortBy);
      }
    },
    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t._id !== action.payload);
      state.filteredItems = filterTasks(state.items, state.selectedCategory, state.searchQuery, state.sortBy);
    },
    addTaskLocal: (state, action: PayloadAction<Task>) => {
      state.items = [action.payload, ...state.items];
      state.filteredItems = filterTasks(state.items, state.selectedCategory, state.searchQuery, state.sortBy);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.items = action.payload;
        state.filteredItems = filterTasks(action.payload, state.selectedCategory, state.searchQuery, state.sortBy);
      })
      .addCase(fetchTasks.rejected, (state) => { state.loading = false; })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.items = [action.payload, ...state.items];
        state.filteredItems = filterTasks(state.items, state.selectedCategory, state.searchQuery, state.sortBy);
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.filteredItems = filterTasks(state.items, state.selectedCategory, state.searchQuery, state.sortBy);
        }
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(t => t._id !== action.payload);
        state.filteredItems = filterTasks(state.items, state.selectedCategory, state.searchQuery, state.sortBy);
      });
  },
});

export const { setCategory, setSortBy, setSearchQuery, toggleTaskLocal, deleteTaskLocal, addTaskLocal } = taskSlice.actions;
export default taskSlice.reducer;