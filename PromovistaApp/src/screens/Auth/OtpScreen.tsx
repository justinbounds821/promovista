import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types/navigation';
import { supabase } from '../../services/supabaseClient';
// Vom folosi AuthContext pentru a seta sesiunea după verificare
// import { useAuth } from '../../contexts/AuthContext';

type OtpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Otp'>;
type OtpScreenRouteProp = RouteProp<AuthStackParamList, 'Otp'>;

type Props = {
  navigation: OtpScreenNavigationProp;
  route: OtpScreenRouteProp;
};

const OtpScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phone } = route.params; // Primim numărul de telefon de la SignInScreen
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  // const { setSession } = useAuth(); // Vom decomenta când AuthContext e gata

  useEffect(() => {
    Alert.alert("Verificare necesară", `Un cod OTP a fost trimis la ${phone}. Introduceți-l mai jos.`);
  }, [phone]);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Eroare', 'Vă rugăm introduceți codul OTP.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms', // Sau 'phone_change' dacă e cazul, dar aici e login
      });

      if (error) {
        console.error('Supabase verifyOtp error:', error);
        Alert.alert('Eroare la verificare', error.message);
      } else if (data.session) {
        Alert.alert('Succes', 'Autentificare reușită!');
        console.log('Supabase verifyOtp success data:', data);
        // Aici vom seta sesiunea în contextul de autentificare
        // setSession(data.session);
        // Navigarea către MainStack va fi gestionată de AppNavigator pe baza stării din AuthContext
      } else {
        // Cazul în care nu există sesiune dar nici eroare - puțin probabil pentru OTP de login
        Alert.alert('Eroare', 'Nu s-a putut stabili sesiunea. Încercați din nou.');
         console.log('Supabase verifyOtp no session but no error:', data);
      }
    } catch (err: any) {
      console.error('Catch verifyOtp error:', err);
      Alert.alert('Eroare neașteptată', err.message || 'A apărut o problemă la verificare.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
        // Re-folosim funcția de signInWithOtp pentru a retrimite codul.
        // Supabase gestionează cooldown-ul pentru retrimiteri.
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) {
            Alert.alert('Eroare', `Nu s-a putut retrimite codul: ${error.message}`);
        } else {
            Alert.alert('Cod Retrimis', `Un nou cod a fost trimis la ${phone}.`);
        }
    } catch (err:any) {
        Alert.alert('Eroare neașteptată', err.message || 'A apărut o problemă la retrimitere.');
    } finally {
        setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificare Cod</Text>
      <Text style={styles.subtitle}>
        Introduceți codul de 6 cifre primit la numărul:
      </Text>
      <Text style={styles.phoneText}>{phone}</Text>
      <TextInput
        style={styles.input}
        placeholder="123456"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
      />
      <Button
        title={loading ? 'Se verifică...' : 'Verifică Cod'}
        onPress={handleVerifyOtp}
        disabled={loading}
      />
      <View style={styles.resendButtonContainer}>
        <Button
            title="Retrimite codul"
            onPress={handleResendOtp}
            disabled={loading}
            color="#555" // O culoare mai puțin proeminentă pentru acțiunea secundară
        />
      </View>
      <Button
        title="Înapoi la introducere număr"
        onPress={() => navigation.goBack()}
        color="#777"
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 5,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
   resendButtonContainer: {
    marginTop: 15,
    marginBottom: 25,
  },
});

export default OtpScreen;
