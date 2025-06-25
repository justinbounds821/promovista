import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { supabase } from './supabaseClient'; // Pentru a salva token-ul (în viitor)
import { User } from '@supabase/supabase-js';

// Setează handler-ul pentru notificări primite în foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Afișează alerta când aplicația e în prim-plan
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(user: User | null): Promise<string | null> {
  let token: string | null = null;
  if (!Device.isDevice) {
    Alert.alert("Atenție", "Notificările Push funcționează doar pe dispozitive fizice, nu în emulator/simulator.");
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permisiune Refuzată', 'Nu ați acordat permisiunea pentru notificări. Unele funcționalități ar putea fi limitate.');
      return null;
    }

    // Obține Expo Push Token
    // projectId trebuie să fie setat în app.json/app.config.js (eas.projectId) dacă nu e deja
    // Pentru proiecte mai vechi, s-ar putea să fie necesar Notifications.getExpoPushTokenAsync() fără projectId
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      // projectId: Constants.expoConfig?.extra?.eas.projectId, // Asigură-te că ai projectId în app.json/config
      // Dacă projectId nu e disponibil direct, Notifications.getExpoPushTokenAsync() ar trebui să funcționeze singur
      // în SDK-uri mai noi sau dacă Expo CLI îl poate infera.
      // Pentru SDK 49+, projectId este automat determinat.
    });
    token = expoPushToken.data;
    console.log('Expo Push Token:', token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (token && user) {
      // Aici ai trimite token-ul la backend-ul tău pentru a-l asocia cu utilizatorul
      // De ex., actualizează un câmp 'expo_push_token' în tabela 'store_profiles'
      console.log(`TODO: Trimite token-ul ${token} la backend pentru user ${user.id}`);
      // Exemplu cu Supabase (necesită politică RLS corespunzătoare):
      // const { error } = await supabase
      //   .from('store_profiles')
      //   .update({ push_token: token })
      //   .eq('id', user.id);
      // if (error) console.error('Eroare la salvarea token-ului push:', error);
      // else console.log('Token push salvat în profilul utilizatorului.');
      Alert.alert("Notificări Active", "Veți primi notificări relevante.");
    }
  } catch (e) {
    console.error("Eroare la înregistrarea pentru notificări push:", e);
    Alert.alert("Eroare Notificări", "Nu s-a putut configura primirea notificărilor.");
  }
  return token;
}


// Listener pentru notificări primite în timp ce aplicația este deschisă
export const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
  console.log('Notificare primită (foreground):', notification);
  // Aici poți actualiza UI-ul, contorul de notificări etc.
  // Alert.alert("Notificare Nouă!", notification.request.content.title || "Ați primit o notificare");
});

// Listener pentru interacțiunea cu o notificare (când utilizatorul apasă pe ea)
// Acest listener este apelat când aplicația este în foreground, background sau killed și utilizatorul interacționează cu notificarea
export const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
  console.log('Răspuns la notificare (interacțiune):', response);
  const notificationData = response.notification.request.content.data;
  // Exemplu: navigare la un ecran specific pe baza datelor din notificare
  if (notificationData && notificationData.screen) {
    console.log(`Se navighează la ecranul: ${notificationData.screen} cu parametrii:`, notificationData.params);
    // Aici ar trebui să folosești sistemul tău de navigație pentru a naviga
    // Exemplu: navigation.navigate(notificationData.screen, notificationData.params);
    // Acest lucru necesită acces la obiectul de navigație, deci ar putea fi mai bine gestionat în App.tsx
    Alert.alert("Notificare Interacționată", `Navigare către ${notificationData.screen}... (simulat)`);
  }
});
