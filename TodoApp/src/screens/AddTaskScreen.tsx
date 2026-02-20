import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { createTask, Category } from '../store/slices/taskSlice';
import DateTimePicker from '@react-native-community/datetimepicker';

type Priority = 'High' | 'Medium' | 'Low';

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: 'Work', label: 'Work', icon: '💼', color: '#0984E3' },
  { key: 'Personal', label: 'Personal', icon: '👤', color: '#00B894' },
  { key: 'Shopping', label: 'Shopping', icon: '🛒', color: '#E17055' },
  { key: 'Health', label: 'Health', icon: '❤️', color: '#D63031' },
  { key: 'Study', label: 'Study', icon: '📚', color: '#6C5CE7' },
  { key: 'Other', label: 'Other', icon: '📌', color: '#636E72' },
];

const PRIORITIES: { key: Priority; label: string; color: string; icon: string }[] = [
  { key: 'High', label: 'High', color: '#FF6B6B', icon: '🔴' },
  { key: 'Medium', label: 'Medium', color: '#FFD93D', icon: '🟡' },
  { key: 'Low', label: 'Low', color: '#6BCB77', icon: '🟢' },
];

const AddTaskScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Personal');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [deadline, setDeadline] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (title.trim().length < 3) {
      Alert.alert('Error', 'Title must be at least 3 characters');
      return;
    }

    if (deadline < dateTime) {
      Alert.alert('Error', 'Deadline cannot be before the task date');
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dateTime: dateTime.toISOString(),
        deadline: deadline.toISOString(),
        priority,
        category,
        tags,
      })).unwrap();

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            placeholderTextColor="#A0A0A0"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add some details..."
            placeholderTextColor="#A0A0A0"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryOption,
                  category === cat.key && { backgroundColor: cat.color, borderColor: cat.color },
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={styles.optionIcon}>{cat.icon}</Text>
                <Text style={[
                  styles.optionText,
                  category === cat.key && styles.optionTextActive,
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.priorityOption,
                  priority === p.key && { backgroundColor: p.color, borderColor: p.color },
                ]}
                onPress={() => setPriority(p.key)}
              >
                <Text style={styles.priorityIcon}>{p.icon}</Text>
                <Text style={[
                  styles.priorityText,
                  priority === p.key && styles.priorityTextActive,
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date & Time</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateTimeBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeIcon}>📅</Text>
              <Text style={styles.dateTimeText}>{formatDate(dateTime)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateTimeBtn}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeIcon}>⏰</Text>
              <Text style={styles.dateTimeText}>{formatTime(dateTime)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Deadline */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deadline</Text>
          <TouchableOpacity
            style={styles.deadlineBtn}
            onPress={() => setShowDeadlinePicker(true)}
          >
            <Text style={styles.deadlineIcon}>🎯</Text>
            <View style={styles.deadlineInfo}>
              <Text style={styles.deadlineText}>{formatDate(deadline)}</Text>
              <Text style={styles.deadlineSubtext}>
                {Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days from now
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags (max 5)</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a tag..."
              placeholderTextColor="#A0A0A0"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              maxLength={20}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
              <Text style={styles.addTagIcon}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(index)}>
                  <Text style={styles.removeTagIcon}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Creating...' : 'Create Task ✨'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={dateTime}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              const newDate = new Date(dateTime);
              newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setDateTime(newDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={dateTime}
          mode="time"
          display="default"
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) {
              const newDate = new Date(dateTime);
              newDate.setHours(date.getHours(), date.getMinutes());
              setDateTime(newDate);
            }
          }}
        />
      )}

      {showDeadlinePicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowDeadlinePicker(false);
            if (date) {
              setDeadline(date);
            }
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backIcon: {
    fontSize: 24,
    color: '#2D3436',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFF',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
  },
  priorityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '600',
  },
  priorityTextActive: {
    color: '#FFF',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  dateTimeIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '500',
  },
  deadlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  deadlineIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '600',
  },
  deadlineSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  addTagBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagIcon: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '300',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  removeTagIcon: {
    fontSize: 18,
    color: '#6C5CE7',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default AddTaskScreen;
