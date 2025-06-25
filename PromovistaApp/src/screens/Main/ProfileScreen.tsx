import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getStoreProfile, updateStoreProfile, StoreProfile } from '../../services/profileService';
import { getQuickTips, QuickTip } from '../../services/contentService'; // Importăm serviciul și tipul pentru sfaturi
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../types/navigation';
import Markdown from 'react-native-markdown-display'; // Importăm componenta Markdown

type ProfileScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Profile'>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Partial<StoreProfile>>({});
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [address, setAddress] = useState('');
  const [iban, setIban] = useState('');

  const [loadingData, setLoadingData] = useState(false);
  const [savingData, setSavingData] = useState(false);

  const [quickTips, setQuickTips] = useState<QuickTip[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);

  const fetchProfileAndTipsData = useCallback(async () => {
    if (user) {
      setLoadingData(true);
      setLoadingTips(true);
      try {
        const profileDataPromise = getStoreProfile(user);
        const tipsDataPromise = getQuickTips();

        const [data, tips] = await Promise.all([profileDataPromise, tipsDataPromise]);

        if (data) {
          setProfile(data);
          setCompanyName(data.company_name || '');
          setVatNumber(data.vat_number || '');
          setRegNumber(data.registration_number || '');
          setAddress(data.address || '');
          setIban(data.iban || '');
        }
        setQuickTips(tips);

      } catch (error: any) {
        Alert.alert("Eroare la încărcarea datelor", error.message || "A apărut o problemă.");
      } finally {
        setLoadingData(false);
        setLoadingTips(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchProfileAndTipsData();
  }, [fetchProfileAndTipsData]);

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert("Eroare", "Utilizatorul nu este autentificat.");
      return;
    }
    setSavingData(true);
    try {
      const profileUpdates: Partial<StoreProfile> = {
        company_name: companyName,
        vat_number: vatNumber,
        registration_number: regNumber,
        address: address,
        iban: iban,
      };
      const updatedProfile = await updateStoreProfile(user, profileUpdates);
      if (updatedProfile) {
        setProfile(updatedProfile);
        Alert.alert("Succes", "Profilul a fost actualizat.");
      }
    } catch (error: any) {
      Alert.alert("Eroare la salvare", error.message || "Nu s-a putut salva profilul.");
    } finally {
      setSavingData(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert("Deconectat", "Ai fost deconectat cu succes.");
    } catch (error: any) {
      Alert.alert("Eroare la deconectare", error.message);
    }
  };

  if (authLoading || (loadingData && !Object.keys(profile).length) || loadingTips) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Se încarcă datele profilului...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Profilul Meu</Text>

        {user && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfo}>ID Utilizator: {user.id}</Text>
            <Text style={styles.userInfo}>Telefon: {user.phone}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
            <Button
                title="Vezi Portofelul Meu"
                onPress={() => navigation.navigate('Wallet')}
                color="#17a2b8"
            />
        </View>

        <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Date Firmă</Text>
            <TextInput style={styles.input} placeholder="Nume Firmă" value={companyName} onChangeText={setCompanyName} editable={!savingData} />
            <TextInput style={styles.input} placeholder="CUI / CIF (ex: RO123456)" value={vatNumber} onChangeText={setVatNumber} editable={!savingData} />
            <TextInput style={styles.input} placeholder="Nr. Reg. Com. (ex: J40/123/2022)" value={regNumber} onChangeText={setRegNumber} editable={!savingData} />
            <TextInput style={styles.input} placeholder="Adresă Sediu Social" value={address} onChangeText={setAddress} multiline numberOfLines={3} editable={!savingData} />
        </View>

        <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Date Bancare</Text>
            <TextInput style={styles.input} placeholder="IBAN (ex: RO00AAAA1B31007593840000)" value={iban} onChangeText={setIban} autoCapitalize="characters" editable={!savingData} />
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Sfaturi Rapide</Text>
          {quickTips.length > 0 ? (
            quickTips.map(tip => (
              <View key={tip.id} style={styles.tipContainer}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Markdown style={markdownStyles}>{tip.markdownContent}</Markdown>
              </View>
            ))
          ) : (
            <Text style={styles.noTipsText}>Momentan nu sunt sfaturi disponibile.</Text>
          )}
        </View>


        <View style={[styles.buttonContainer, { marginTop: 10 }]}>
          <Button
            title={savingData ? "Se salvează..." : "Salvează Modificările Profilului"}
            onPress={handleSaveProfile}
            disabled={savingData || loadingData}
            color="#28a745"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={authLoading ? "Deconectare..." : "Deconectare"}
            onPress={handleSignOut}
            color="#e74c3c"
            disabled={authLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const markdownStyles = { // Stiluri pentru componenta Markdown
  heading1: { color: '#2c3e50', marginBottom:5, marginTop:10, borderBottomWidth:1, borderColor: '#ecf0f1', paddingBottom:5 },
  heading2: { color: '#34495e', marginBottom:4, marginTop:8 },
  heading3: { color: '#7f8c8d', marginBottom:3, marginTop:6, fontWeight:'bold' },
  text: { color: '#34495e', fontSize: 15, lineHeight:22 },
  bullet_list_icon: { color: '#2980b9' },
  code_inline: { backgroundColor: '#ecf0f1', padding:2, borderRadius:3, color: '#c0392b' },
  blockquote: { backgroundColor: '#f9f9f9', borderLeftColor: '#3498db', borderLeftWidth: 5, padding: 10, marginVertical: 5 }
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    paddingBottom: 30, // Spațiu la finalul ScrollView
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 20, // Adăugat paddingTop aici
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  userInfoContainer:{
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  sectionBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal:15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#444',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 10, // Redus spațiul
    marginHorizontal:15,
    marginBottom:10, // Adăugat spațiu sub butoane
  },
  tipContainer: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9', // Albastru pentru titlurile sfaturilor
    marginBottom: 5,
  },
  noTipsText: {
    fontStyle: 'italic',
    color: '#7f8c8d',
  }
});

export default ProfileScreen;
