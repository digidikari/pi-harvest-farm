function initializeFirebaseAuth() {
  auth.onAuthStateChanged(user => {
    if (user) {
      playerName = user.displayName || playerName;
      loadPlayerData();
    } else {
      auth.signInAnonymously().catch(e => console.error('Auth failed:', e));
    }
  });
}

function savePlayerData() {
  if (!auth.currentUser) return;
  db.collection('players').doc(auth.currentUser.uid).set({
    coins: coins,
    pi: pi,
    level: level,
    xp: xp,
    upgrades: upgrades,
    inventory: inventory,
    bag: bag,
    farmPlots: farmPlots,
    lastRewardClaim: lastRewardClaim,
    harvestCount: harvestCount,
    achievements: achievements
  }).catch(e => console.error('Save failed:', e));
}

function loadPlayerData() {
  if (!auth.currentUser) return;
  db.collection('players').doc(auth.currentUser.uid).get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        coins = data.coins || 100;
        pi = data.pi || 0;
        level = data.level || 1;
        xp = data.xp || 0;
        upgrades = data.upgrades || upgrades;
        inventory = data.inventory || [];
        bag = data.bag || [];
        farmPlots = data.farmPlots || farmPlots;
        lastRewardClaim = data.lastRewardClaim || 0;
        harvestCount = data.harvestCount || 0;
        achievements = data.achievements || achievements;
        updateWallet();
        updateLevelBar();
        renderFarm();
        renderBag();
        renderInventory();
        renderAchievements();
        checkDailyReward();
      }
    })
    .catch(e => console.error('Load failed:', e));
}
