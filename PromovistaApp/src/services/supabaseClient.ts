import 'react-native-url-polyfill/auto'; // Necesare pentru Supabase pe React Native
import { createClient } from '@supabase/supabase-js';

// ATENȚIE: Aceste valori sunt placeholder!
// Într-o aplicație de producție, acestea ar trebui încărcate din variabile de mediu
// configurate prin EAS Build secrets sau un mecanism similar, nu hardcodate.
// Exemplu: const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Exemplu: https://xyzcompany.supabase.co
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Exemplu: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.warn(
    'Supabase URL nu este configurat corespunzător. ' +
    'Actualizați src/services/supabaseClient.ts cu valorile corecte ' +
    'sau configurați variabile de mediu (recomandat pentru producție).'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    'Supabase Anon Key nu este configurată corespunzător. ' +
    'Actualizați src/services/supabaseClient.ts cu valorile corecte ' +
    'sau configurați variabile de mediu (recomandat pentru producție).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // storage: AsyncStorage, // AsyncStorage din react-native este depreciat.
    // Pentru Expo, SecureStore sau expo-storage pot fi alternative, sau lasă Supabase să gestioneze cu default-ul.
    // Supabase JS v2 folosește implicit localStorage/sessionStorage în browser și AsyncStorage în React Native (dacă disponibil și configurat).
    // Pentru o persistență mai robustă în Expo, se poate considera integrarea explicită cu expo-secure-store.
    autoRefreshToken: true,
    persistSession: true, // Important pentru a menține sesiunea utilizatorului
    detectSessionInUrl: false, // De obicei false pentru aplicații mobile
  },
});
