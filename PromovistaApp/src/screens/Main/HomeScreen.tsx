import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, FlatList, ActivityIndicator, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Campaign, AcceptedCampaign } from '../../types/campaign'; // Am adăugat AcceptedCampaign
import { ServiceItem } from '../../types/service';
import { getAvailableCampaigns, getMyActiveCampaigns } from '../../services/campaignService'; // Am adăugat getMyActiveCampaigns
import { getAvailableServices } from '../../services/spendService';
import CampaignCard from '../../components/CampaignCard';
import ServiceCard from '../../components/ServiceCard';
import AchievementModal from '../../components/AchievementModal'; // Importăm modalul

// Simulare stare pentru insignă - ar veni din profil/backend
let hasShownFirstCampaignBadge = false; // Simplu flag global pentru mock

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

type ActiveTab = 'earn' | 'spend';

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('earn');
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const [showFirstCampaignModal, setShowFirstCampaignModal] = useState(false);

  // Verifică dacă s-a completat prima campanie (simulat)
  const checkFirstCampaignAchievement = useCallback(async () => {
    if (user && !hasShownFirstCampaignBadge) {
      // Într-un scenariu real, am verifica un flag din user.profile sau user_achievements
      // Aici, vom simula pe baza numărului de campanii active/finalizate din mock.
      // Presupunem că `getMyActiveCampaigns` returnează și campaniile finalizate pentru această verificare.
      const myCampaigns = await getMyActiveCampaigns(user.id); // Modifică getMyActiveCampaigns în mock să includă și cele finalizate
      const completedCampaigns = myCampaigns.filter(c => c.status === 'finalizata' || c.status === 'validata'); // Adaugă 'finalizata' dacă e relevant

      // Pentru test, vom afișa dacă există cel puțin o campanie acceptată și are un status care ar putea duce la finalizare
      // De exemplu, dacă avem o campanie în 'asteptare_validare_poza' sau 'validata'
      // Acest logic ar trebui să fie mult mai robust și pe backend.
      const potentiallyCompleted = myCampaigns.find(c => c.status === 'validata' || c.status === 'asteptare_validata_poza');

      if (potentiallyCompleted && !hasShownFirstCampaignBadge) { // Verificăm flag-ul global
        console.log("Prima campanie (potențial) reușită detectată!");
        setShowFirstCampaignModal(true);
        hasShownFirstCampaignBadge = true; // Setăm flag-ul pentru a nu mai afișa
      }
    }
  }, [user]);


  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const fetchedCampaigns = await getAvailableCampaigns();
      setCampaigns(fetchedCampaigns);
      await checkFirstCampaignAchievement(); // Verifică realizarea după ce campaniile sunt încărcate/actualizate
    } catch (error: any) {
      Alert.alert("Eroare Campanii", "Nu s-au putut încărca campaniile: " + error.message);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [checkFirstCampaignAchievement]); // Adăugăm checkFirstCampaignAchievement ca dependență

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const fetchedServices = await getAvailableServices();
      setServices(fetchedServices);
    } catch (error: any) {
      Alert.alert("Eroare Servicii", "Nu s-au putut încărca serviciile: " + error.message);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'earn') {
      fetchCampaigns();
    } else if (activeTab === 'spend') {
      fetchServices();
    }
  }, [activeTab, fetchCampaigns, fetchServices]);


  const handleCampaignPress = (campaignId: string) => {
    navigation.navigate('CampaignDetails', { campaignId });
  };

  const handleServiceRequested = () => {
    Alert.alert("Info", "Solicitarea dvs. este procesată.");
  };


  const renderEarnContent = () => {
    if (loadingCampaigns) {
      return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
    }
    if (campaigns.length === 0) {
      return <Text style={styles.emptyMessage}>Momentan nu sunt campanii disponibile.</Text>;
    }
    return (
      <FlatList
        data={campaigns}
        renderItem={({ item }) => (
          <CampaignCard campaign={item} onPress={handleCampaignPress} />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderSpendContent = () => {
    if (loadingServices) {
      return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
    }
    if (services.length === 0) {
      return <Text style={styles.emptyMessage}>Momentan nu sunt servicii disponibile pentru cheltuirea punctelor.</Text>;
    }
    return (
      <FlatList
        data={services}
        renderItem={({ item }) => (
          <ServiceCard service={item} onServiceRequested={handleServiceRequested} />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeMessage}>
        Bun venit, {user?.phone || 'utilizator'}!
      </Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'earn' && styles.activeTabButton]}
          onPress={() => setActiveTab('earn')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'earn' && styles.activeTabButtonText]}>Câștigă Puncte</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'spend' && styles.activeTabButton]}
          onPress={() => setActiveTab('spend')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'spend' && styles.activeTabButtonText]}>Cheltuie Puncte</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'earn' ? renderEarnContent() : renderSpendContent()}

      <View style={styles.profileButtonContainer}>
        <Button
          title="Profilul Meu"
          onPress={() => navigation.navigate('Profile')}
          color="#6c757d"
        />
      </View>

      <AchievementModal
        isVisible={showFirstCampaignModal}
        title="Felicitări!"
        message="Ai finalizat cu succes prima ta campanie! Continuă tot așa pentru a debloca și mai multe recompense și bonusuri."
        lottieSource="https://assets3.lottiefiles.com/packages/lf20_touohxv0.json" // URL-ul pentru trofeu
        onClose={() => setShowFirstCampaignModal(false)}
        loopAnimation={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 20,
    backgroundColor: '#f8f9fa',
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 15,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  loader: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    marginTop: 50,
  },
  emptyMessage: {
    flex:1,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6c757d',
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileButtonContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  }
});

export default HomeScreen;
