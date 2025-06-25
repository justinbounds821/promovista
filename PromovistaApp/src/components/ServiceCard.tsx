import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { ServiceItem } from '../types/service';
import { useAuth } from '../contexts/AuthContext';
import { requestService } from '../services/spendService'; // Importăm funcția de solicitare
import { getWallet } from '../services/walletService'; // Pentru a verifica soldul înainte de confirmare

interface ServiceCardProps {
  service: ServiceItem;
  onServiceRequested?: () => void; // Callback opțional după solicitare (ex: pentru refresh listă sau portofel)
  // onPressDetails?: (serviceId: string) => void; // Dacă am avea un ecran de detalii
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onServiceRequested }) => {
  const { user } = useAuth();
  const [isRequesting, setIsRequesting] = React.useState(false);

  const handleRequestService = async () => {
    if (!user) {
      Alert.alert("Eroare", "Trebuie să fiți autentificat pentru a solicita un serviciu.");
      return;
    }

    // Verificare rapidă a soldului înainte de a afișa dialogul de confirmare
    // Aceasta este o verificare pe client, validarea finală se face în `requestService` (backend/service layer)
    const currentWallet = await getWallet(user);
    if (!currentWallet || currentWallet.available_balance < service.pointsCost) {
        Alert.alert(
            "Fonduri Insuficiente",
            `Nu aveți suficiente puncte disponibile (${currentWallet?.available_balance.toFixed(0) || 0} Pcte) pentru a solicita acest serviciu (${service.pointsCost} Pcte). Puteți câștiga mai multe puncte participând la campanii sau cumpărând puncte.`,
            [{ text: "OK" }]
        );
        return;
    }


    Alert.alert(
      "Confirmare Solicitare",
      `Doriți să solicitați serviciul "${service.title}" pentru ${service.pointsCost} puncte? Punctele vor fi blocate până la livrarea serviciului.`,
      [
        { text: "Anulează", style: "cancel" },
        {
          text: "Confirmă",
          onPress: async () => {
            setIsRequesting(true);
            try {
              const result = await requestService(user, service.id);
              Alert.alert(result.success ? "Succes" : "Eroare", result.message);
              if (result.success && onServiceRequested) {
                onServiceRequested(); // Apelează callback-ul dacă există
              }
            } catch (error: any) {
              Alert.alert("Eroare Necunoscută", error.message || "A apărut o problemă la solicitarea serviciului.");
            } finally {
              setIsRequesting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {service.imageUrl && (
        <Image source={{ uri: service.imageUrl }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{service.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {service.description}
        </Text>
        {service.providerInfo && <Text style={styles.provider}>Oferit de: {service.providerInfo}</Text>}
        <View style={styles.footer}>
          <Text style={styles.pointsCost}>{service.pointsCost} Puncte</Text>
          <TouchableOpacity
            style={[styles.requestButton, isRequesting && styles.requestButtonDisabled]}
            onPress={handleRequestService}
            disabled={isRequesting}
          >
            <Text style={styles.requestButtonText}>{isRequesting ? "Se procesează..." : "Solicită"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  provider: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#777',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  },
  pointsCost: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#007AFF', // Albastru pentru cost
  },
  requestButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20, // Mai rotunjit
  },
  requestButtonDisabled: {
    backgroundColor: '#a5d6a7', // Verde mai deschis pentru disabled
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default ServiceCard;
