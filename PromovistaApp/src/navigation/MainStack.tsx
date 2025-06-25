import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Main/HomeScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import CampaignDetailsScreen from '../screens/Main/Campaigns/CampaignDetailsScreen';
import TaskCameraScreen from '../screens/Main/Tasks/TaskCameraScreen';
import WalletScreen from '../screens/Main/Wallet/WalletScreen'; // Importăm ecranul portofelului
import { MainStackParamList } from '../types/navigation';

const Stack = createStackNavigator<MainStackParamList>();

const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Promovista' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profilul Meu' }}
      />
      <Stack.Screen
        name="CampaignDetails"
        component={CampaignDetailsScreen}
        // Titlul este setat dinamic
      />
      <Stack.Screen
        name="TaskCamera"
        component={TaskCameraScreen}
        // Titlul este setat dinamic
      />
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: 'Portofelul Meu' }}
      />
      {/* Alte ecrane din Main flow aici */}
    </Stack.Navigator>
  );
};

export default MainStack;
