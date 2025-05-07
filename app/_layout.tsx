import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StatusBar } from 'react-native';

import { Stack, useRouter, Slot } from 'expo-router';
import { useGlobalContext } from '@/app/(auth)/AuthContext';
import GlobalProvider from '@/app/(auth)/AuthContext';
import { ToastProvider } from './ToastContext';
import Toast from 'react-native-toast-message';
import './globals.css';

const RootLayoutInner = () => {
  const { loading, isLogged } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isLogged) {
        router.push('/(tabs)');
        Toast.show({
          type: 'success',
          text1: 'Welcome back!'
        });
      } else {
        router.push('/(auth)/LoginScreen');
      }
    }
  }, [loading, isLogged]);

  if (loading) {
    return (
      <View className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E50914" />
          <Text className="mt-4 text-dark-100">Checking your session...</Text>
        </View>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

const RootLayout = () => {
  return (
    <GlobalProvider>
      <ToastProvider>
        <StatusBar hidden={true} />
        <RootLayoutInner />
        <Toast visibilityTime={1000} topOffset={0} />
      </ToastProvider>
    </GlobalProvider>
  );
};

export default RootLayout;
