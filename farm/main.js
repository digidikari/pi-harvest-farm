let vegetables = [];
let langData = {};
let currentLang = 'en';
let farmCoins = 0;
let pi = 0;
let water = 10;
let farmPlots = [];
let inventory = [];
let bag = [];
let upgrades = {
  wateringCan: false,
  extraPlot: 0,
  yieldBoost: false
};
let level = 1;
let xp = 0;
let playerName = 'Player' + Math.floor(Math.random() * 1000);
let achievements = JSON.parse(localStorage.getItem('achievements')) || {
  harvest10: false,
  pi10: false
};
let harvestCount = JSON.parse(localStorage.getItem('harvestCount')) || 0;
let lastRewardClaim = JSON.parse(localStorage.getItem('lastRewardClaim')) || 0;

let musicVolume = localStorage.getItem('musicVolume') ? parseInt(localStorage.getItem('musicVolume')) : 50;
let voiceVolume = localStorage.getItem('voiceVolume') ? parseInt(localStorage.getItem('voiceVolume')) : 50;

const plotCount = 36;
const xpPerLevel = 100;
const dailyRewardCooldown = 24 * 60 * 60 * 1000;
const piToFarmRate = 1000;

const fallbackLangData = {
  "en": {
    "title": "Pi Harvest Farm",
    "startBtn": "Start Game",
    "farmTab": "Farm",
    "shopTab": "Shop",
    "upgradesTab": "Upgrades",
    "inventoryTab": "Inventory",
    "exchangeTab": "Exchange",
    "leaderboardTab": "Leaderboard",
    "achievementsTab": "Achievements",
    "coinLabel": "Farm Coins",
    "buyLabel": "Buy",
    "emptyBag": "Bag is empty!",
    "emptyInventory": "Inventory is empty!",
    "notEnoughMoney": "Not enough money!",
    "notEnoughWater": "Not enough water!",
    "bought": "Bought",
    "harvested": "Harvested",
    "upgradeBought": "Upgrade bought",
    "levelUp": "Level up to",
    "claimRewardBtn": "Claim Daily Reward",
    "rewardClaimed": "Daily Reward Claimed!",
    "rewardCooldown": "Reward Available Tomorrow!",
    "achievementHarvest10": "Harvest 10 Plants",
    "achievementPi10": "Collect 10 Pi",
    "achievementUnlocked": "Achievement Unlocked!",
    "convertSuccess": "Exchange successful!",
    "exchangeBtn": "Exchange"
  },
  "id": {
    "title": "Pi Harvest Farm",
    "startBtn": "Mulai Permainan",
    "farmTab": "Ladang",
    "shopTab": "Toko",
    "upgradesTab": "Peningkatan",
    "inventoryTab": "Inventaris",
    "exchangeTab": "Penukaran",
    "leaderboardTab": "Papan Peringkat",
    "achievementsTab": "Pencapaian",
    "coinLabel": "Koin Ladang",
    "buyLabel": "Beli",
    "emptyBag": "Tas kosong!",
    "emptyInventory": "Inventaris kosong!",
    "notEnoughMoney": "Uang tidak cukup!",
    "notEnoughWater": "Air tidak cukup!",
    "bought": "Dibeli",
    "harvested": "Dipanen",
    "upgradeBought": "Peningkatan dibeli",
    "levelUp": "Naik level ke",
    "claimRewardBtn": "Klaim Hadiah Harian",
    "rewardClaimed": "Hadiah Harian Diklaim!",
    "rewardCooldown": "Hadiah Tersedia Besok!",
    "achievementHarvest10": "Panen 10 Tanaman",
    "achievementPi10": "Kumpulkan 10 Pi",
    "achievementUnlocked": "Pencapaian Dibuka!",
    "convertSuccess": "Penukaran berhasil!",
    "exchangeBtn": "Tukar"
  }
};

const fallbackVegetables = [
  { id: "beet", name: { en: "Beet", id: "Bit" }, farmPrice: 50, piPrice: 0.1, growthTime: 10, frames: 13, yield: 15, image: "assets/img/plant/beet/beet_13.png" },
  { id: "cabbage", name: { en: "Cabbage", id: "Kol" }, farmPrice: 100, piPrice: 0.2, growthTime: 12, frames: 20, yield: 25, image: "assets/img/plant/cabbage/cabbage_20.png" },
  { id: "carrot", name: { en: "Carrot", id: "Wortel" }, farmPrice: 75, piPrice: 0.15, growthTime: 8, frames: 16, yield: 20, image: "assets/img/plant/carrot/carrot_16.png" },
  { id: "corn", name: { en: "Corn", id: "Jagung" }, farmPrice: 125, piPrice: 0.25, growthTime: 15, frames: 20, yield: 30, image: "assets/img/plant/corn/corn_20.png" },
  { id: "cucumber", name: { en: "Cucumber", id: "Timun" }, farmPrice: 90, piPrice: 0.18, growthTime: 10, frames: 20, yield: 22, image: "assets/img/plant/cucumber/cucumber_20.png" },
  { id: "eggplant", name: { en: "Eggplant", id: "Terong" }, farmPrice: 110, piPrice: 0.22, growthTime: 12, frames: 9, yield: 28, image: "assets/img/plant/eggplant/eggplant_9.png" },
  { id: "lettuce", name: { en: "Lettuce", id: "Selada" }, farmPrice: 75, piPrice: 0.15, growthTime: 8, frames: 7, yield: 20, image: "assets/img/plant/lettuce/lettuce_7.png" },
  { id: "onion", name: { en: "Onion", id: "Bawang" }, farmPrice: 60, piPrice: 0.12, growthTime: 7, frames: 6, yield: 18, image: "assets/img/plant/onion/onion_6.png" },
  { id: "peas", name: { en: "Peas", id: "Kacang Polong" }, farmPrice: 80, piPrice: 0.16, growthTime: 9, frames: 8, yield: 20, image: "assets/img/plant/peas/peas_8.png" },
  { id: "pepper", name: { en: "Pepper", id: "Paprika" }, farmPrice: 100, piPrice: 0.2, growthTime: 11, frames: 12, yield: 25, image: "assets/img/plant/pepper/pepper_12.png" },
  { id: "potato", name: { en: "Potato", id: "Kentang" }, farmPrice: 90, piPrice: 0.18, growthTime: 10, frames: 7, yield: 22, image: "assets/img/plant/potato/potato_7.png" },
  { id: "pumpkin", name: { en: "Pumpkin", id: "Labu" }, farmPrice: 150, piPrice: 0.3, growthTime: 15, frames: 20, yield: 35, image: "assets/img/plant/pumpkin/pumpkin_20.png" },
  { id: "radish", name: { en: "Radish", id: "Lobak" }, farmPrice: 60, piPrice: 0.12, growthTime: 7, frames: 8, yield: 18, image: "assets/img/plant/radish/radish_8.png" },
  { id: "spinach", name: { en: "Spinach", id: "Bayam" }, farmPrice: 50, piPrice: 0.1, growthTime: 6, frames: 5, yield: 15, image: "assets/img/plant/spinach/spinach_5.png" },
  { id: "tomato", name: { en: "Tomato", id: "Tomat" }, farmPrice: 90, piPrice: 0.18, growthTime: 10, frames: 20, yield: 22, image: "assets/img/plant/tomato/tomato_20.png" },
  { id: "watermelon", name: { en: "Watermelon", id: "Semangka" }, farmPrice: 175, piPrice: 0.35, growthTime: 18, frames: 19, yield: 40, image: "assets/img/plant/watermelon/watermelon_19.png" },
  { id: "wheat", name: { en: "Wheat", id: "Gandum" }, farmPrice: 110, piPrice: 0.22, growthTime: 12, frames: 7, yield: 28, image: "assets/img/plant/wheat/wheat_7.png" },
  { id: "water", name: { en: "Water", id: "Air" }, farmPrice: 10, piPrice: 0.02, amount: 10 }
];

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  try {
    const startText = document.getElementById('start-text');
    const langToggle = document.getElementById('lang-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const claimRewardBtn = document.getElementById('claim-reward-btn');

    if (!startText) throw new Error('Start text element not found');
    if (!langToggle) throw new Error('Language toggle button not found');
    if (!settingsBtn) throw new Error('Settings button not found');
    if (!claimRewardBtn) throw new Error('Claim reward button not found');

    startText.removeEventListener('click', startGame);
    langToggle.removeEventListener('click', toggleLanguage);
    settingsBtn.removeEventListener('click', openSettings);
    claimRewardBtn.removeEventListener('click', claimDailyReward);

    startText.addEventListener('click', startGame);
    langToggle.addEventListener('click', toggleLanguage);
    settingsBtn.addEventListener('click', openSettings);
    claimRewardBtn.addEventListener('click', claimDailyReward);

    console.log('Event listeners attached for start, lang, settings, and claim reward');

    document.querySelectorAll('.tab-btn').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      btn.removeEventListener('click', () => switchTab(tab));
      btn.addEventListener('click', () => switchTab(tab));
    });
    console.log('Tab button listeners attached');

    try {
      initializeFirebaseAuth();
      console.log('Firebase initialized successfully');
    } catch (e) {
      console.error('Firebase initialization failed:', e.message);
      alert('Firebase initialization failed. Game may not work properly.');
    }

    loadData();
    initializeSettings();
    updateVolumes();
    console.log('Game initialization complete');
  } catch (e) {
    console.error('Initialization failed:', e.message);
    alert('Failed to initialize game. Check console for errors.');
  }
});

async function loadData() {
  console.log('Loading data...');
  try {
    const langRes = await fetch('../data/lang.json');
    if (!langRes.ok) throw new Error(`Failed to load lang.json (status: ${langRes.status})`);
    langData = await langRes.json();
    console.log('Language data loaded:', langData);
  } catch (e) {
    console.error('Lang JSON load failed:', e.message);
    langData = fallbackLangData;
    console.log('Using fallback language data');
  }

  try {
    const vegRes = await fetch('../data/vegetables.json');
    if (!vegRes.ok) throw new Error(`Failed to load vegetables.json (status: ${vegRes.status})`);
    const vegData = await vegRes.json();
    vegetables = vegData.vegetables;
    console.log('Vegetables data loaded:', vegetables);
  } catch (e) {
    console.error('Vegetables JSON load failed:', e.message);
    vegetables = fallbackVegetables;
    console.log('Using fallback vegetables data');
  }

  try {
    const invRes = await fetch('../data/inventory.json');
    if (!invRes.ok) throw new Error(`Failed to load inventory.json (status: ${invRes.status})`);
    inventory = await invRes.json();
    console.log('Inventory data loaded:', inventory);
  } catch (e) {
    console.error('Inventory JSON load failed:', e.message);
    inventory = [];
    console.log('Using empty inventory');
  }

  initializeGame();
}

function initializeGame() {
  console.log('Initializing game...');
  try {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      currentLang = savedLang;
      const langToggle = document.getElementById('lang-toggle');
      if (langToggle) {
        langToggle.textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
        console.log('Language set to:', currentLang);
      }
    }
    loadPlayerData();
    updateUIText();
    initializePlots();
    updateWallet();
    updateLevelBar();
    renderBag();
    renderAchievements();
    checkDailyReward();
    console.log('Game initialized successfully');
  } catch (e) {
    console.error('Initialize game failed:', e.message);
    alert('Failed to initialize game. Check console for details.');
  }
}

function startGame() {
  console.log('Starting game...');
  try {
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');
    if (!startScreen || !gameContainer) throw new Error('Start screen or game container not found');

    startScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    console.log('Switched from start screen to game container');

    switchTab('farm');
    console.log('Switched to Farm tab');

    const bgMusic = document.getElementById('bg-music');
    const bgVoice = document.getElementById('bg-voice');
    if (bgMusic) {
      bgMusic.volume = musicVolume / 100;
      bgMusic.play().catch(e => console.warn('Background music failed to play:', e.message));
    } else {
      console.warn('Background music element not found');
    }
    if (bgVoice) {
      bgVoice.volume = voiceVolume / 100;
      bgVoice.play().catch(e => console.warn('Background voice failed to play:', e.message));
    } else {
      console.warn('Background voice element not found');
    }
    playMenuSound();
    console.log('Game started successfully');
  } catch (e) {
    console.error('Start game failed:', e.message);
    alert('Failed to start game. Check console for errors.');
  }
}

function toggleLanguage() {
  console.log('Toggling language...');
  try {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('lang', currentLang);
    console.log('Language switched to:', currentLang);

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
      console.log('Language toggle button updated');
    } else {
      console.error('Language toggle button not found');
    }

    updateUIText();
    playMenuSound();
    console.log('Language toggled successfully');
  } catch (e) {
    console.error('Toggle language failed:', e.message);
    alert('Failed to toggle language. Check console for errors.');
  }
}

function updateUIText() {
  console.log('Updating UI text...');
  try {
    const elements = {
      title: document.getElementById('title'),
      startText: document.getElementById('start-text'),
      gameTitle: document.getElementById('game-title'),
      shopTitle: document.getElementById('shop-title'),
      upgradesTitle: document.getElementById('upgrades-title'),
      inventoryTitle: document.getElementById('inventory-title'),
      exchangeTitle: document.getElementById('exchange-title'),
      leaderboardTitle: document.getElementById('leaderboard-title'),
      achievementsTitle: document.getElementById('achievements-title'),
      claimRewardBtn: document.getElementById('claim-reward-btn'),
      exchangeBtn: document.getElementById('exchange-btn'),
      coinLabel: document.getElementById('coin-label')
    };

    if (elements.title) elements.title.textContent = langData[currentLang].title || 'Pi Harvest Farm';
    if (elements.startText) elements.startText.textContent = langData[currentLang].startBtn || 'Start Game';
    if (elements.gameTitle) elements.gameTitle.textContent = langData[currentLang].title || 'Pi Harvest Farm';
    if (elements.shopTitle) elements.shopTitle.textContent = langData[currentLang].shopTab || 'Shop';
    if (elements.upgradesTitle) elements.upgradesTitle.textContent = langData[currentLang].upgradesTab || 'Upgrades';
    if (elements.inventoryTitle) elements.inventoryTitle.textContent = langData[currentLang].inventoryTab || 'Inventory';
    if (elements.exchangeTitle) elements.exchangeTitle.textContent = langData[currentLang].exchangeTab || 'Exchange';
    if (elements.leaderboardTitle) elements.leaderboardTitle.textContent = langData[currentLang].leaderboardTab || 'Leaderboard';
    if (elements.achievementsTitle) elements.achievementsTitle.textContent = langData[currentLang].achievementsTab || 'Achievements';
    if (elements.claimRewardBtn) elements.claimRewardBtn.textContent = langData[currentLang].claimRewardBtn || 'Claim Daily Reward';
    if (elements.exchangeBtn) elements.exchangeBtn.textContent = langData[currentLang].exchangeBtn || 'Tukar';
    if (elements.coinLabel) elements.coinLabel.textContent = langData[currentLang].coinLabel || 'Farm Coins';

    const tabs = ['farmTab', 'shopTab', 'upgradesTab', 'inventoryTab', 'exchangeTab', 'leaderboardTab', 'achievementsTab'];
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
      btn.textContent = langData[currentLang][tabs[idx]] || tabs[idx];
      console.log(`Tab ${tabs[idx]} updated to:`, btn.textContent);
    });

    const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
    if (activeTab) switchTab(activeTab);
    console.log('UI text updated successfully');
  } catch (e) {
    console.error('Update UI text failed:', e.message);
    alert('Failed to update UI text. Check console for details.');
  }
}

function openSettings() {
  console.log('Opening settings...');
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.add('active');
    console.log('Settings modal opened');
  } else {
    console.error('Settings modal not found');
  }
}

function initializeSettings() {
  console.log('Initializing settings...');
  try {
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('close-settings');
    const musicSlider = document.getElementById('music-volume');
    const voiceSlider = document.getElementById('voice-volume');

    if (!modal || !closeBtn || !musicSlider || !voiceSlider) {
      throw new Error('Settings elements not found');
    }

    musicSlider.value = musicVolume;
    voiceSlider.value = voiceVolume;
    console.log('Settings sliders initialized');

    closeBtn.removeEventListener('click', closeSettings);
    window.removeEventListener('click', closeSettingsOnWindowClick);

    closeBtn.addEventListener('click', closeSettings);
    window.addEventListener('click', closeSettingsOnWindowClick);

    function closeSettings() {
      console.log('Closing settings modal');
      modal.classList.remove('active');
      playMenuSound();
      console.log('Settings modal closed');
    }

    function closeSettingsOnWindowClick(event) {
      if (event.target === modal) {
        console.log('Closing settings modal via window click');
        modal.classList.remove('active');
        playMenuSound();
        console.log('Settings modal closed via window click');
      }
    }

    musicSlider.addEventListener('input', () => {
      musicVolume = parseInt(musicSlider.value);
      localStorage.setItem('musicVolume', musicVolume);
      updateVolumes();
    });

    voiceSlider.addEventListener('input', () => {
      voiceVolume = parseInt(voiceSlider.value);
      localStorage.setItem('voiceVolume', voiceVolume);
      updateVolumes();
    });

    console.log('Settings initialized successfully');
  } catch (e) {
    console.error('Initialize settings failed:', e.message);
    alert('Failed to initialize settings. Check console for errors.');
  }
      }
