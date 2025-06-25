export type AuthStackParamList = {
  SignIn: undefined;
  Otp: { phone: string };
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  CampaignDetails: { campaignId: string };
  TaskCamera: { acceptedCampaignId: string; campaignTitle: string; };
  Wallet: undefined; // Adăugat ecranul pentru portofel
  // Alte ecrane principale
};

// Poți adăuga și alte tipuri de parametri pentru rute aici
