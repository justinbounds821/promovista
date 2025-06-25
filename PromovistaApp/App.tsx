import 'react-native-url-polyfill/auto'; // Important pentru Supabase
import React, { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider, useAuth } from './src/contexts/AuthContext'; // Importăm și useAuth
import *  as Notifications from 'expo-notifications';
import {
    registerForPushNotificationsAsync,
    // notificationReceivedListener, // Listener-ul e deja activat în notificationService.ts
    // notificationResponseListener // Listener-ul e deja activat în notificationService.ts
} from './src/services/notificationService';

// Este recomandat ca listenerii să fie adăugați la nivel global și o singură dată.
// notificationService.ts se ocupă de asta la import.

const AppContent: React.FC = () => {
  const { user, session } = useAuth(); // Obținem utilizatorul din context
  const notificationListenersAttached = useRef(false); // Pentru a ne asigura că atașăm o singură dată

  useEffect(() => {
    // Logica pentru înregistrarea token-ului PUSH când utilizatorul se autentifică
    if (user && session && !notificationListenersAttached.current) { // Verificăm și sesiunea pentru a fi siguri
      console.log("User autentificat, se încearcă înregistrarea pentru notificări push...");
      registerForPushNotificationsAsync(user); // Pasează obiectul user
      notificationListenersAttached.current = true; // Marcăm ca atașat pentru acest user/sesiune
    }
    // Dacă user-ul se deloghează, am putea dori să ștergem token-ul din backend,
    // dar `registerForPushNotificationsAsync` se va re-apela la următorul login.
    // Pentru a evita re-înregistrarea la fiecare focus al app-ului dacă user-ul e deja logat:
    // dependency array-ul [user, session] se ocupă de asta.
  }, [user, session]);

  // Listener pentru interacțiunea cu notificări - poate fi necesar aici dacă trebuie să accesezi navigația globală
  // useEffect(() => {
  //   const subscription = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log('App.tsx - Răspuns la notificare:', response);
  //     const data = response.notification.request.content.data;
  //     if (data && data.screen) {
  //       // Aici ai acces la `navigation` dacă AppNavigator este randat condiționat
  //       // și ai un ref la containerul de navigație.
  //       // Exemplu: navigationRef.current?.navigate(data.screen, data.params);
  //       Alert.alert("Navigare din Notificare (App.tsx)", `Spre: ${data.screen}`);
  //     }
  //   });
  //   return () => subscription.remove();
  // }, []);


  return <AppNavigator />;
};

export default function App() {
  return (
    <AuthProvider>
      {/* <ThemeProvider> */}
        <AppContent />
      {/* </ThemeProvider> */}
    </AuthProvider>
  );
}
// Nu mai avem nevoie de stilurile de aici
