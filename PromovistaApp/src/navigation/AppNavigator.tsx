import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../styles/theme'; // Importăm culorile din temă

const LOADING_LOTTIE = "https://assets6.lottiefiles.com/packages/lf20_usmfx6bp.json";

const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
            source={{ uri: LOADING_LOTTIE }}
            autoPlay
            loop
            style={styles.lottieLoader}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session && session.user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface, // Folosim culoarea de fundal din temă
  },
  lottieLoader: {
      width: 150,
      height: 150,
  }
});

export default AppNavigator;
