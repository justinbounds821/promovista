import { supabase } from './supabaseClient'; // Vom folosi Supabase mai târziu
import { User } from '@supabase/supabase-js';

export interface Wallet {
  user_id: string;
  available_balance: number;
  pending_balance: number; // Puncte din campanii încă nevalidate final sau în așteptare antifraudă
  blocked_balance: number; // Puncte blocate pentru servicii solicitate
  updated_at: string;
}

export type TransactionType =
  | 'campaign_reward'
  | 'purchase_points' // Cumpărare puncte cu cardul
  | 'spend_on_service'
  | 'refund_for_service'
  | 'withdrawal_request'
  | 'withdrawal_fee'
  | 'withdrawal_completed'
  | 'bonus'
  | 'antifraud_hold'
  | 'antifraud_release';

export type TransactionStatus =
  | 'pending'       // Așteaptă procesare (ex: retragere)
  | 'completed'     // Finalizată cu succes
  | 'failed'        // Eșuată
  | 'blocked'       // Puncte blocate (pentru un serviciu)
  | 'on_hold_antifraud' // Puncte în așteptare 48h
  | 'cancelled';      // Anulată

export interface WalletTransaction {
  id: string;
  wallet_id: string; // Ar trebui să fie user_id
  type: TransactionType;
  amount: number; // Pozitiv pentru credit, negativ pentru debit
  status: TransactionStatus;
  description: string;
  related_entity_id?: string | null; // ex: campaign_id, service_id, stripe_charge_id
  created_at: string;
}

// Mock data - în realitate, aceasta ar fi în baza de date Supabase
export const MOCK_WALLETS: { [userId: string]: Wallet } = {}; // Exportat pentru a fi folosit de spendService
export const MOCK_TRANSACTIONS: WalletTransaction[] = []; // Exportat pentru a fi folosit de spendService

export const ensureWalletExists = (userId: string) => { // Exportat pentru a fi folosit de spendService
  if (!MOCK_WALLETS[userId]) {
    MOCK_WALLETS[userId] = {
      user_id: userId,
      available_balance: 10, // Pornim cu 10 puncte pentru testare
      pending_balance: 0,
      blocked_balance: 0,
      updated_at: new Date().toISOString(),
    };
  }
};

/**
 * Preia portofelul utilizatorului.
 */
export const getWallet = async (user: User | null): Promise<Wallet | null> => {
  if (!user) throw new Error('Utilizator neautentificat.');
  ensureWalletExists(user.id);
  console.log(`WalletService: Getting wallet for user ${user.id}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_WALLETS[user.id] || null;
};

/**
 * Preia istoricul tranzacțiilor pentru portofelul utilizatorului.
 */
export const getWalletTransactions = async (
  user: User | null,
  limit: number = 20,
  offset: number = 0
): Promise<WalletTransaction[]> => {
  if (!user) throw new Error('Utilizator neautentificat.');
  ensureWalletExists(user.id);
  console.log(`WalletService: Getting transactions for user ${user.id}`);
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_TRANSACTIONS.filter(t => t.wallet_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(offset, offset + limit);
};

/**
 * Adaugă o recompensă de campanie (simulat).
 */
export const addCampaignReward = async (
  user: User | null,
  campaignId: string,
  points: number,
  campaignTitle: string
): Promise<WalletTransaction | null> => {
  if (!user) throw new Error('Utilizator neautentificat.');
  ensureWalletExists(user.id);
  console.log(`WalletService: Adding campaign reward for user ${user.id}, campaign ${campaignId}, points ${points}`);
  await new Promise(resolve => setTimeout(resolve, 500));

  const wallet = MOCK_WALLETS[user.id];
  wallet.pending_balance += points;
  wallet.updated_at = new Date().toISOString();

  const transaction: WalletTransaction = {
    id: `txn_camp_${Date.now()}`,
    wallet_id: user.id,
    type: 'campaign_reward',
    amount: points,
    status: 'on_hold_antifraud',
    description: `Recompensă campanie: ${campaignTitle}`,
    related_entity_id: campaignId,
    created_at: new Date().toISOString(),
  };
  MOCK_TRANSACTIONS.push(transaction);

  setTimeout(() => {
    const holdTx = MOCK_TRANSACTIONS.find(t => t.id === transaction.id && t.status === 'on_hold_antifraud');
    const currentWallet = MOCK_WALLETS[user.id];
    if (holdTx && currentWallet) {
      holdTx.status = 'completed';
      currentWallet.pending_balance -= points;
      currentWallet.available_balance += points;
      currentWallet.updated_at = new Date().toISOString();
      console.log(`WalletService: Antifraud hold released for txn ${holdTx.id}. Points moved to available.`);
    }
  }, 5000);

  return transaction;
};


/**
 * Simulează o cerere de retragere.
 */
export const requestWithdrawal = async (
  user: User | null,
  pointsToWithdraw: number
): Promise<{success: boolean; message: string; transaction?: WalletTransaction}> => {
  if (!user) return { success: false, message: 'Utilizator neautentificat.'};
  ensureWalletExists(user.id);

  const wallet = MOCK_WALLETS[user.id];
  const amountToWithdraw = Number(pointsToWithdraw);

  if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
    return { success: false, message: 'Suma pentru retragere este invalidă.' };
  }
  if (amountToWithdraw < 100) {
    return { success: false, message: 'Suma minimă pentru retragere este de 100 puncte.' };
  }
  if (wallet.available_balance < amountToWithdraw) {
    return { success: false, message: 'Fonduri insuficiente pentru retragere.' };
  }

  console.log(`WalletService: Requesting withdrawal for user ${user.id}, points ${amountToWithdraw}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const commission = amountToWithdraw * 0.01;
  const netAmountAfterCommission = amountToWithdraw - commission;

  wallet.available_balance -= amountToWithdraw;
  wallet.updated_at = new Date().toISOString();

  const withdrawalRequestTx: WalletTransaction = {
    id: `txn_wdreq_${Date.now()}`,
    wallet_id: user.id,
    type: 'withdrawal_request',
    amount: -amountToWithdraw,
    status: 'pending',
    description: `Cerere retragere ${amountToWithdraw} puncte (Net: ${netAmountAfterCommission} RON după comision 1%)`,
    created_at: new Date().toISOString(),
  };
  MOCK_TRANSACTIONS.push(withdrawalRequestTx);

  return {
    success: true,
    message: `Cererea de retragere pentru ${amountToWithdraw} puncte (Net: ${netAmountAfterCommission} RON) a fost înregistrată și este în curs de procesare.`,
    transaction: withdrawalRequestTx
  };
};

/**
 * Simulează cumpărarea de puncte.
 * Într-o implementare reală, `stripePaymentToken` ar fi folosit de backend pentru a procesa plata.
 */
export const purchasePointsWithStripeMock = async (
  user: User | null,
  pointsToPurchase: number,
  stripePaymentToken?: string // Token-ul de la Stripe (opțional pentru mock)
): Promise<{success: boolean; message: string; transaction?: WalletTransaction}> => {
  if (!user) return { success: false, message: 'Utilizator neautentificat.' };
  ensureWalletExists(user.id);

  const amountToPurchase = Number(pointsToPurchase);
  if (isNaN(amountToPurchase) || amountToPurchase <= 0) {
    return { success: false, message: 'Numărul de puncte este invalid.' };
  }

  // Presupunem 1 punct = 1 RON pentru costul de achiziție
  const costInRon = amountToPurchase;

  console.log(`WalletService: User ${user.id} purchasing ${amountToPurchase} points for ${costInRon} RON. Stripe token (simulated): ${stripePaymentToken || 'N/A'}`);

  // Simulare procesare plată Stripe (backend call)
  await new Promise(resolve => setTimeout(resolve, 1500));
  const paymentSuccess = Math.random() > 0.1; // 90% șansă de succes pentru simulare

  if (!paymentSuccess) {
    console.error('WalletService: Stripe payment failed (simulated).');
    return { success: false, message: 'Plata cu cardul a eșuat (simulare). Vă rugăm încercați din nou.' };
  }

  const wallet = MOCK_WALLETS[user.id];
  wallet.available_balance += amountToPurchase;
  wallet.updated_at = new Date().toISOString();

  const transaction: WalletTransaction = {
    id: `txn_purch_${Date.now()}`,
    wallet_id: user.id,
    type: 'purchase_points',
    amount: amountToPurchase,
    status: 'completed',
    description: `Cumpărare ${amountToPurchase} puncte (${costInRon} RON)`,
    related_entity_id: stripePaymentToken || `mock_stripe_${Date.now()}`, // ID-ul tranzacției Stripe
    created_at: new Date().toISOString(),
  };
  MOCK_TRANSACTIONS.push(transaction);

  console.log(`WalletService: ${amountToPurchase} points purchased successfully by user ${user.id}.`);
  return {
    success: true,
    message: `${amountToPurchase} puncte au fost adăugate cu succes în portofelul dvs.`,
    transaction
  };
};


export const processAntiFraudHolds = async () => {
    console.log("WalletService: Simulating processing of anti-fraud holds...");
};
