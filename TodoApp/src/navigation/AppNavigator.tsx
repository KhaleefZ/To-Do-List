import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store';
import { setLogin } from '../store/slices/authSlice';
import { COLORS } from '../constants';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  AddTask: { task?: any } | undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          dispatch(setLogin({ token }));
        }
      } catch (error) {
        console.log('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Show splash screen for at least 2 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    checkAuth();
    
    return () => clearTimeout(splashTimer);
  }, [dispatch]);

  // Show splash screen during initial load
  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                animationTypeForReplace: 'pop',
              }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{
                gestureEnabled: true,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{
                animationTypeForReplace: 'push',
              }}
            />
            <Stack.Screen 
              name="AddTask" 
              component={AddTaskScreen}
              options={{ 
                presentation: 'modal',
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}