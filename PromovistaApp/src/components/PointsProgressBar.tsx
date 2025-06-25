import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native'; // Presupunând că vrem o animație mică la umplere

interface PointsProgressBarProps {
  currentPoints: number;
  milestonePoints: number;
  barTitle?: string;
  bonusMessage?: string; // Mesaj afișat când bara e plină, înainte de modal
}

const PointsProgressBar: React.FC<PointsProgressBarProps> = ({
  currentPoints,
  milestonePoints,
  barTitle = "Progres către Următorul Bonus",
  bonusMessage = "Felicitări! Ai atins pragul!"
}) => {
  const progress = Math.min(currentPoints / milestonePoints, 1); // Progres între 0 și 1
  const progressPercent = Math.floor(progress * 100);
  const isMilestoneReached = currentPoints >= milestonePoints;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{barTitle}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barForeground, { width: `${progressPercent}%` }]}>
          {/* Animație Lottie subtilă pe bara de progres, dacă dorim */}
          {/* {progress > 0 && progress < 1 && (
            <LottieView
              source={{ uri: 'https://assets1.lottiefiles.com/packages/lf20_c6msmbnl.json' }} // O animație simplă de loading/progress
              autoPlay
              loop
              style={styles.lottieOnBar}
            />
          )} */}
        </View>
        <Text style={styles.progressText}>
            {isMilestoneReached ? `${milestonePoints}/${milestonePoints} Pcte` : `${currentPoints}/${milestonePoints} Pcte`} ({progressPercent}%)
        </Text>
      </View>
      {isMilestoneReached && bonusMessage && (
        <Text style={styles.milestoneReachedText}>{bonusMessage}</Text>
      )}
      {!isMilestoneReached && (
         <Text style={styles.pointsNeededText}>
            Mai ai nevoie de {milestonePoints - currentPoints} puncte pentru următorul bonus!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 5, // Redus pentru a se potrivi mai bine în WalletScreen
    // backgroundColor: '#f0f0f0',
    // borderRadius: 8,
    // marginBottom: 15,
  },
  title: {
    fontSize: 15, // Puțin mai mic
    fontWeight: '600', // Schimbat din bold
    color: '#444',
    marginBottom: 8,
    textAlign: 'center',
  },
  barBackground: {
    height: 30, // Mărit puțin
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center', // Centrează textul din interior
    position: 'relative', // Pentru textul absolut
  },
  barForeground: {
    height: '100%',
    backgroundColor: '#28a745', // Verde pentru progres
    borderRadius: 15, // Trebuie să fie același cu background-ul
    // justifyContent: 'center',
    // alignItems: 'flex-end', // Aliniază textul la dreapta barei umplute
  },
  // lottieOnBar: { // Dacă se adaugă animație pe bară
  //   width: 20,
  //   height: 20,
  //   position: 'absolute',
  //   right: 5,
  // },
  progressText: {
    position: 'absolute', // Suprapune textul peste bară
    width: '100%', // Ocupă toată lățimea
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff', // Text alb pentru contrast bun pe verde
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Umbră pentru lizibilitate pe fundal deschis
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  milestoneReachedText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
  },
   pointsNeededText: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  }
});

export default PointsProgressBar;
