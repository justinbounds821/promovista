import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, ActivityIndicator, RefreshControl, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../contexts/AuthContext';
import {
    Wallet,
    WalletTransaction,
    getWallet,
    getWalletTransactions,
    requestWithdrawal,
    purchasePointsWithStripeMock,
    MOCK_WALLETS,
    MOCK_TRANSACTIONS
} from '../../../services/walletService';
import PointsProgressBar from '../../../components/PointsProgressBar';
import AchievementModal from '../../../components/AchievementModal';
import theme, { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../styles/theme'; // Importăm tema
import { MILESTONE_POINTS_TARGET_1, MILESTONE_BONUS_AMOUNT_1, MILESTONE_BONUS_LOTTIE } from '../../../config/gamification';

let hasReceivedMilestoneBonus = false;
const MAX_PURCHASE_AMOUNT_PER_TRANSACTION = 1000;

const WalletScreen: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [showMilestoneBonusModal, setShowMilestoneBonusModal] = useState(false);

  const checkForMilestoneBonus = useCallback((currentWallet: Wallet | null) => {
    if (currentWallet && user && currentWallet.available_balance >= MILESTONE_POINTS_TARGET_1 && !hasReceivedMilestoneBonus) {
      console.log("Prag de bonus atins!");
      MOCK_WALLETS[user.id].available_balance += MILESTONE_BONUS_AMOUNT_1;
      const bonusTransaction: WalletTransaction = {
        id: `txn_bonus_${Date.now()}`,
        wallet_id: user.id,
        type: 'bonus',
        amount: MILESTONE_BONUS_AMOUNT_1,
        status: 'completed',
        description: `Bonus: Atingere prag ${MILESTONE_POINTS_TARGET_1} puncte!`,
        created_at: new Date().toISOString(),
      };
      MOCK_TRANSACTIONS.unshift(bonusTransaction);

      hasReceivedMilestoneBonus = true;
      setShowMilestoneBonusModal(true);

      setWallet({ ...MOCK_WALLETS[user.id] });
      setTransactions([...MOCK_TRANSACTIONS.filter(t => t.wallet_id === user.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)]);
    }
  }, [user]);


  const loadWalletData = useCallback(async (showLoader = true) => {
    if (!user) return;
    if (showLoader) setIsLoading(true);
    try {
      const [walletData, transactionsData] = await Promise.all([
        getWallet(user),
        getWalletTransactions(user, 20)
      ]);
      setWallet(walletData);
      setTransactions(transactionsData);
      if (walletData) {
        checkForMilestoneBonus(walletData);
      }
    } catch (error: any) {
      Alert.alert('Eroare Portofel', `Nu s-au putut încărca datele portofelului: ${error.message}`);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [user, checkForMilestoneBonus]);

  useFocusEffect(useCallback(() => { loadWalletData(); }, [loadWalletData]));

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadWalletData(false);
    setIsRefreshing(false);
  }, [loadWalletData]);

  const handleRequestWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Suma Invalidă", "Te rugăm să introduci o sumă validă pentru retragere.");
      return;
    }
    // Aici s-ar putea adăuga o limită maximă de retragere per tranzacție (AML)
    if (!user) return;
    setIsWithdrawing(true);
    try {
      const result = await requestWithdrawal(user, amount);
      Alert.alert(result.success ? "Succes" : "Eroare", result.message);
      if (result.success) {
        setWithdrawAmount('');
        loadWalletData();
      }
    } catch (error: any) {
      Alert.alert("Eroare Retragere", error.message || "A apărut o problemă.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handlePurchasePoints = async () => {
    const points = parseInt(purchaseAmount, 10);
    if (isNaN(points) || points <= 0) {
      Alert.alert("Număr Invalid", "Te rugăm să introduci un număr valid de puncte.");
      return;
    }
    if (points > MAX_PURCHASE_AMOUNT_PER_TRANSACTION) {
      Alert.alert("Limită Depășită", `Puteți cumpăra maxim ${MAX_PURCHASE_AMOUNT_PER_TRANSACTION} de puncte per tranzacție.`);
      return;
    }
    if (!user) return;
    setIsPurchasing(true);
    try {
        const result = await purchasePointsWithStripeMock(user, points, "mock_stripe_placeholder_token");
        Alert.alert(result.success ? "Plată Reușită (Simulare)" : "Eroare Plată (Simulare)", result.message);
        if (result.success) {
            setPurchaseAmount('');
            loadWalletData();
        }
    } catch (e:any) {
        Alert.alert("Eroare Cumpărare (Simulare)", e.message);
    } finally {
        setIsPurchasing(false);
    }
  };

  const renderTransactionItem = ({ item }: { item: WalletTransaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      <View>
        <Text style={[styles.transactionAmount, item.amount > 0 ? styles.amountCredit : styles.amountDebit]}>
          {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)} Pcte
        </Text>
        <Text style={styles.transactionStatus}>{item.status.replace(/_/g, ' ')}</Text>
      </View>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.centeredLoader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Se încarcă portofelul...</Text>
      </View>
    );
  }

  if (!wallet) {
    return (
      <View style={styles.centeredLoader}>
        <Text>Nu s-au putut încărca datele portofelului.</Text>
        <Button title="Reîncearcă" onPress={() => loadWalletData()} />
      </View>
    );
  }

  return (
    <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      <View style={styles.balanceContainer}>
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>Disponibil</Text>
          <Text style={styles.balanceAmount}>{wallet.available_balance.toFixed(2)} Pcte</Text>
        </View>
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>În Așteptare</Text>
          <Text style={styles.balanceAmountSmall}>{wallet.pending_balance.toFixed(2)} Pcte</Text>
        </View>
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>Blocat</Text>
          <Text style={styles.balanceAmountSmall}>{wallet.blocked_balance.toFixed(2)} Pcte</Text>
        </View>
      </View>

      <View style={styles.sectionBox}>
        <PointsProgressBar
            currentPoints={wallet.available_balance}
            milestonePoints={MILESTONE_POINTS_TARGET_1}
        />
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Cumpără Puncte (1 Punct = 1 Leu)</Text>
        <TextInput
            style={styles.input}
            placeholder={`Nr. puncte (max ${MAX_PURCHASE_AMOUNT_PER_TRANSACTION})`}
            keyboardType="number-pad"
            value={purchaseAmount}
            onChangeText={setPurchaseAmount}
            editable={!isPurchasing}
            placeholderTextColor={COLORS.textSecondary}
        />
        <Button
            title={isPurchasing ? "Se procesează plata..." : "Cumpără Puncte"}
            onPress={handlePurchasePoints}
            disabled={isPurchasing || !purchaseAmount}
            color={COLORS.primary}
        />
        <Text style={styles.infoText}>Plată securizată prin Stripe (simulare). Limită per tranzacție aplicată.</Text>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Retragere Bani (1 Punct = 1 Leu)</Text>
        <TextInput
            style={styles.input}
            placeholder="Suma de retras (min. 100 Pcte)"
            keyboardType="numeric"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            editable={!isWithdrawing}
            placeholderTextColor={COLORS.textSecondary}
        />
        <Button
            title={isWithdrawing ? "Se procesează..." : "Solicită Retragere"}
            onPress={handleRequestWithdrawal}
            disabled={isWithdrawing || !withdrawAmount}
            color={COLORS.success}
        />
         <Text style={styles.infoText}>Comision retragere: 1%. Banii vor fi transferați în contul IBAN specificat în profil în ~3 zile lucrătoare.</Text>
      </View>

      <Text style={styles.mainSectionTitle}>Istoric Tranzacții</Text>
      {transactions.length === 0 ? (
        <Text style={styles.noTransactions}>Nu există tranzacții de afișat.</Text>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          style={styles.transactionListContainer} // Adăugat un container pentru listă
          scrollEnabled={false}
        />
      )}

      <AchievementModal
        isVisible={showMilestoneBonusModal}
        title="Bonus Deblocat!"
        message={`Felicitări! Ai atins pragul de ${MILESTONE_POINTS_TARGET_1} puncte și ai primit un bonus de ${MILESTONE_BONUS_AMOUNT_1} puncte!`}
        lottieSource={MILESTONE_BONUS_LOTTIE}
        onClose={() => setShowMilestoneBonusModal(false)}
        loopAnimation={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal:SPACING.md,
    ...SHADOWS.light,
  },
  balanceBox: {
    alignItems: 'center',
    paddingHorizontal:SPACING.sm,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: theme.FONT_WEIGHTS.bold,
    color: COLORS.success,
  },
  balanceAmountSmall: {
    fontSize: FONT_SIZES.lg,
    fontWeight: theme.FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  sectionBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    marginHorizontal:SPACING.md,
    ...SHADOWS.light,
  },
  input: {
    height: 45,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface, // Sau un gri foarte deschis dacă e pe un fundal alb
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  infoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  mainSectionTitle: { // Titlu pentru secțiuni principale ca Istoric Tranzacții
    fontSize: FONT_SIZES.xl,
    fontWeight: theme.FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
    paddingHorizontal:SPACING.md,
  },
  sectionTitle: { // Titlu în interiorul unui sectionBox
    fontSize: FONT_SIZES.lg,
    fontWeight: theme.FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  transactionListContainer: { // Container pentru FlatList pentru a aplica marginile corect
    marginHorizontal:SPACING.md,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal:SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface, // Poate fi redundant dacă sectionBox are deja
    borderRadius: BORDER_RADIUS.sm, // Poate fi scos dacă e în sectionBox
    marginBottom: SPACING.sm,
  },
  transactionDetails: {
    flex: 1,
    marginRight:SPACING.sm,
  },
  transactionDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: theme.FONT_WEIGHTS.medium,
  },
  transactionDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: theme.FONT_WEIGHTS.bold,
    textAlign: 'right',
  },
  amountCredit: {
    color: COLORS.success,
  },
  amountDebit: {
    color: COLORS.danger,
  },
  transactionStatus: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  noTransactions: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    paddingHorizontal:SPACING.md,
    fontSize: FONT_SIZES.md,
  }
});

export default WalletScreen;
