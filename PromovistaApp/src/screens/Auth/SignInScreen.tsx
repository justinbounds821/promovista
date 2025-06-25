import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import { supabase } from '../../services/supabaseClient';

type SignInScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;

type Props = {
  navigation: SignInScreenNavigationProp;
};

const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!phone) {
      Alert.alert('Eroare', 'Vă rugăm introduceți numărul de telefon.');
      return;
    }
    setLoading(true);
    try {
      // Asigură-te că numărul de telefon este în format internațional, ex: +407xxxxxxxx
      // Supabase așteaptă formatul E.164
      let formattedPhone = phone.startsWith('+') ? phone : `+40${phone.replace(/^0/, '')}`;

      // Verificarea formatului este una simplistă, ar trebui îmbunătățită
      if (!/^\+[1-9]\d{6,14}$/.test(formattedPhone)) {
        Alert.alert('Număr invalid', 'Vă rugăm introduceți un număr de telefon valid în format internațional (ex: +40722123456).');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        console.error('Supabase signInWithOtp error:', error);
        Alert.alert('Eroare la autentificare', error.message);
      } else {
        Alert.alert('Succes', 'Codul OTP a fost trimis! Veți fi redirecționat.');
        console.log('Supabase signInWithOtp success data:', data);
        // Navighează către ecranul OTP, trimițând numărul de telefon
        navigation.navigate('Otp', { phone: formattedPhone });
      }
    } catch (err: any) {
      console.error('Catch signInWithOtp error:', err);
      Alert.alert('Eroare neașteptată', err.message || 'A apărut o problemă.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Autentificare</Text>
      <Text style={styles.label}>Introduceți numărul de telefon:</Text>
      <TextInput
        style={styles.input}
        placeholder="+40722123456"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoCapitalize="none"
        editable={!loading}
      />
      <Button
        title={loading ? 'Se trimite...' : 'Trimite Cod SMS'}
        onPress={handleSignIn}
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
    marginBottom: 30,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});

export default SignInScreen;
