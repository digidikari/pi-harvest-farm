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
    "exchangeBtn": "Tukar"
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

    function openSettings() {
      console.log('Settings button clicked');
      try {
        const modal = document.getElementById('settings-modal');
        if (modal) {
          modal.style.display = 'block';
          console.log('Settings modal opened');
          playMenuSound();
        } else {
          throw new Error('Settings modal not found');
        }
      } catch (e) {
        console.error('Open settings failed:', e.message);
        alert('Failed to open settings. Check console for details.');
      }
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      btn.removeEventListener('click', () => switchTab(tab));
      btn.addEventListener('click', () => switchTab(tab));
    });

    console.log('Event listeners attached successfully');

    // Initialize Firebase with error handling
    try {
      initializeFirebaseAuth();
      console.log('Firebase initialized successfully');
    } catch (e) {
      console.error('Firebase initialization failed:', e.message);
      alert('Firebase initialization failed. Game may not work properly. Check console.');
    }

    loadData();
    initializeSettings();
    updateVolumes();
  } catch (e) {
    console.error('Initialization failed:', e.message);
    alert('Failed to initialize game. Please check the console for errors.');
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
      bgMusic.play().catch(e => {
        console.error('Background music failed to play:', e.message);
        alert('Background music failed to play. Check console.');
      });
    } else {
      console.warn('Background music element not found');
    }
    if (bgVoice) {
      bgVoice.play().catch(e => {
        console.error('Background voice failed to play:', e.message);
        alert('Background voice failed to play. Check console.');
      });
    } else {
      console.warn('Background voice element not found');
    }
    playMenuSound();
    console.log('Game started successfully');
  } catch (e) {
    console.error('Start game failed:', e.message);
    alert('Failed to start game. Please check the console for errors.');
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

    const startText = document.getElementById('start-text');
    if (startText) {
      startText.textContent = langData[currentLang].startBtn;
      console.log('Start text updated to:', langData[currentLang].startBtn);
    } else {
      console.error('Start text element not found');
    }

    switchTab(document.querySelector('.tab-btn.active')?.getAttribute('data-tab') || 'farm');
    playMenuSound();
    console.log('Language toggled successfully');
  } catch (e) {
    console.error('Toggle language failed:', e.message);
    alert('Failed to toggle language. Please check the console for errors.');
  }
}

function updateUIText() {
  console.log('Updating UI text...');
  try {
    const title = document.getElementById('title');
    const startText = document.getElementById('start-text');
    const gameTitle = document.getElementById('game-title');
    const shopTitle = document.getElementById('shop-title');
    const upgradesTitle = document.getElementById('upgrades-title');
    const inventoryTitle = document.getElementById('inventory-title');
    const exchangeTitle = document.getElementById('exchange-title');
    const leaderboardTitle = document.getElementById('leaderboard-title');
    const achievementsTitle = document.getElementById('achievements-title');
    const claimRewardBtn = document.getElementById('claim-reward-btn');
    const exchangeBtn = document.querySelector('#exchange-conversion button');

    if (title) {
      title.textContent = langData[currentLang].title;
      console.log('Title updated');
    }
    if (startText) {
      startText.textContent = langData[currentLang].startBtn;
      console.log('Start text updated');
    }
    if (gameTitle) {
      gameTitle.textContent = langData[currentLang].title;
      console.log('Game title updated');
    }
    if (shopTitle) {
      shopTitle.textContent = langData[currentLang].shopTab;
      console.log('Shop title updated');
    }
    if (upgradesTitle) {
      upgradesTitle.textContent = langData[currentLang].upgradesTab;
      console.log('Upgrades title updated');
    }
    if (inventoryTitle) {
      inventoryTitle.textContent = langData[currentLang].inventoryTab;
      console.log('Inventory title updated');
    }
    if (exchangeTitle) {
      exchangeTitle.textContent = langData[currentLang].exchangeTab;
      console.log('Exchange title updated');
    }
    if (leaderboardTitle) {
      leaderboardTitle.textContent = langData[currentLang].leaderboardTab;
      console.log('Leaderboard title updated');
    }
    if (achievementsTitle) {
      achievementsTitle.textContent = langData[currentLang].achievementsTab;
      console.log('Achievements title updated');
    }
    if (claimRewardBtn) {
      claimRewardBtn.textContent = langData[currentLang].claimRewardBtn;
      console.log('Claim reward button updated');
    }
    if (exchangeBtn) {
      exchangeBtn.textContent = langData[currentLang].exchangeBtn;
      console.log('Exchange button updated');
    }

    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
      const tabs = ['farmTab', 'shopTab', 'upgradesTab', 'inventoryTab', 'exchangeTab', 'leaderboardTab', 'achievementsTab'];
      btn.textContent = langData[currentLang][tabs[idx]];
    });

    const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
    if (activeTab === 'shop') renderShop();
    if (activeTab === 'inventory') renderInventory();
    if (activeTab === 'exchange') renderExchange();
    if (activeTab === 'leaderboard') renderLeaderboard();
    if (activeTab === 'achievements') renderAchievements();
    console.log('UI text updated successfully');
  } catch (e) {
    console.error('Update UI text failed:', e.message);
    alert('Failed to update UI text. Check console for details.');
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
      console.error('Settings elements not found');
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
      try {
        modal.style.display = 'none';
        playMenuSound();
        console.log('Settings modal closed');
      } catch (e) {
        console.error('Close settings failed:', e.message);
        alert('Failed to close settings. Check console for details.');
      }
    }

    function closeSettingsOnWindowClick(event) {
      if (event.target === modal) {
        console.log('Closing settings modal via window click');
        try {
          modal.style.display = 'none';
          playMenuSound();
          console.log('Settings modal closed via window click');
        } catch (e) {
          console.error('Close settings via window failed:', e.message);
          alert('Failed to close settings via window click. Check console for details.');
        }
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
    alert('Failed to initialize settings. Please check the console for errors.');
  }
}

function updateVolumes() {
  console.log('Updating volumes...');
  try {
    const bgMusic = document.getElementById('bg-music');
    const bgVoice = document.getElementById('bg-voice');
    const harvestSound = document.getElementById('harvest-sound');
    const wateringSound = document.getElementById('watering-sound');
    const menuSound = document.getElementById('menu-sound');
    const buyingSound = document.getElementById('buying-sound');
    const coinSound = document.getElementById('coin-sound');

    if (bgMusic) bgMusic.volume = musicVolume / 100;
    if (bgVoice) bgVoice.volume = voiceVolume / 100;
    if (harvestSound) harvestSound.volume = voiceVolume / 100;
    if (wateringSound) wateringSound.volume = voiceVolume / 100;
    if (menuSound) menuSound.volume = voiceVolume / 100;
    if (buyingSound) buyingSound.volume = voiceVolume / 100;
    if (coinSound) coinSound.volume = voiceVolume / 100;
    console.log('Volumes updated successfully');
  } catch (e) {
    console.error('Update volumes failed:', e.message);
  }
}

function playMenuSound() {
  console.log('Playing menu sound...');
  try {
    const menuSound = document.getElementById('menu-sound');
    if (menuSound) {
      menuSound.play().catch(e => {
        console.error('Menu sound failed:', e.message);
      });
    } else {
      console.warn('Menu sound element not found');
    }
  } catch (e) {
    console.error('Play menu sound failed:', e.message);
  }
}

function playBuyingSound() {
  console.log('Playing buying sound...');
  try {
    const buyingSound = document.getElementById('buying-sound');
    if (buyingSound) {
      buyingSound.play().catch(e => console.error('Buying sound failed:', e.message));
    }
  } catch (e) {
    console.error('Play buying sound failed:', e.message);
  }
}

function playCoinSound() {
  console.log('Playing coin sound...');
  try {
    const coinSound = document.getElementById('coin-sound');
    if (coinSound) {
      coinSound.play().catch(e => console.error('Coin sound failed:', e.message));
    }
  } catch (e) {
    console.error('Play coin sound failed:', e.message);
  }
}

function switchTab(tab) {
  console.log('Switching to tab:', tab);
  try {
    const tabElement = document.getElementById(tab);
    if (!tabElement) {
      console.error(`Tab element ${tab} not found!`);
      throw new Error(`Tab element ${tab} not found`);
    }
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    tabElement.style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    if (tab === 'farm') renderFarm();
    if (tab === 'shop') renderShop();
    if (tab === 'inventory') renderInventory();
    if (tab === 'exchange') renderExchange();
    if (tab === 'leaderboard') renderLeaderboard();
    if (tab === 'achievements') renderAchievements();
    playMenuSound();
    console.log('Tab switched successfully');
  } catch (e) {
    console.error('Switch tab failed:', e.message);
    alert('Failed to switch tab. Check console for details.');
  }
}

function initializePlots() {
  console.log('Initializing farm plots...');
  try {
    const farmArea = document.getElementById('farm-area');
    farmArea.innerHTML = '';
    const totalPlots = plotCount + upgrades.extraPlot;
    for (let i = 0; i < totalPlots; i++) {
      const plot = document.createElement('div');
      plot.className = 'plot';
      plot.dataset.index = i;
      plot.onclick = () => plantSeed(i);
      farmArea.appendChild(plot);
      farmPlots[i] = { vegetable: null, growth: 0, watered: false };
    }
    console.log('Farm plots initialized');
  } catch (e) {
    console.error('Initialize plots failed:', e.message);
  }
}

function renderFarm() {
  console.log('Rendering farm...');
  try {
    farmPlots.forEach((plot, index) => {
      const plotElement = document.querySelector(`.plot[data-index="${index}"]`);
      plotElement.innerHTML = '';
      if (plot.vegetable) {
        const veg = vegetables.find(v => v.id === plot.vegetable);
        const frame = Math.min(Math.floor((plot.growth / veg.growthTime) * veg.frames), veg.frames - 1);
        const img = document.createElement('img');
        img.src = `../assets/img/plant/${veg.id}/${veg.id}_${frame + 1}.png`;
        img.alt = veg.name[currentLang];
        img.className = 'plant-img';
        if (plot.growth >= veg.growthTime) {
          plotElement.classList.add('ready');
          plotElement.onclick = () => harvest(index);
        } else {
          plotElement.classList.remove('ready');
          plotElement.onclick = () => water(index);
        }
        if (!plot.watered) {
          plotElement.classList.add('dry');
          plotElement.onclick = () => water(index);
        } else {
          plotElement.classList.remove('dry');
        }
        plotElement.appendChild(img);
      } else {
        plotElement.classList.remove('ready', 'dry');
        plotElement.onclick = () => plantSeed(index);
      }
    });
    console.log('Farm rendered');
  } catch (e) {
    console.error('Render farm failed:', e.message);
  }
}

function plantSeed(index) {
  console.log('Planting seed at index:', index);
  try {
    if (bag.length === 0) {
      showNotification(langData[currentLang].emptyBag);
      return;
    }
    const seedObj = bag.shift();
    farmPlots[index].vegetable = seedObj.id;
    farmPlots[index].growth = 0;
    farmPlots[index].watered = false;
    renderFarm();
    renderBag();
  } catch (e) {
    console.error('Plant seed failed:', e.message);
  }
}

function water(index) {
  console.log('Watering plot at index:', index);
  try {
    if (!farmPlots[index].vegetable) return;
    if (water <= 0) {
      showNotification(langData[currentLang].notEnoughWater);
      return;
    }
    water--;
    if (upgrades.wateringCan) {
      farmPlots[index].watered = true;
      farmPlots[index].growth += 2;
    } else {
      farmPlots[index].watered = true;
      farmPlots[index].growth += 1;
    }
    const veg = vegetables.find(v => v.id === farmPlots[index].vegetable);
    if (farmPlots[index].growth >= veg.growthTime) {
      farmPlots[index].growth = veg.growthTime;
    }
    updateWallet();
    renderFarm();
    const wateringSound = document.getElementById('watering-sound');
    if (wateringSound) wateringSound.play().catch(e => console.error('Watering sound failed:', e.message));
  } catch (e) {
    console.error('Water plot failed:', e.message);
  }
}

function harvest(index) {
  console.log('Harvesting plot at index:', index);
  try {
    const veg = vegetables.find(v => v.id === farmPlots[index].vegetable);
    let yieldAmount = veg.yield;
    if (upgrades.yieldBoost) {
      yieldAmount = Math.round(yieldAmount * 1.5);
    }
    inventory.push({ id: veg.id, amount: yieldAmount });
    farmPlots[index] = { vegetable: null, growth: 0, watered: false };
    farmCoins += yieldAmount;
    xp += 10;
    harvestCount++;
    checkAchievements();
    checkLevelUp();
    updateWallet();
    updateLeaderboard();
    updateLevelBar();
    renderFarm();
    const harvestSound = document.getElementById('harvest-sound');
    if (harvestSound) harvestSound.play().catch(e => console.error('Harvest sound failed:', e.message));
    showNotification(`${langData[currentLang].harvested} ${veg.name[currentLang]}! +${yieldAmount} ${langData[currentLang].coinLabel}, +10 XP`);
  } catch (e) {
    console.error('Harvest failed:', e.message);
  }
}

function renderShop() {
  console.log('Rendering shop');
  try {
    const seedList = document.getElementById('seed-list');
    seedList.innerHTML = '';
    let farmCoinPurchases = bag.filter(seed => seed.boughtWith === 'farm').length;
    vegetables.forEach(veg => {
      const div = document.createElement('div');
      div.className = 'seed-item';
      const img = document.createElement('img');
      img.src = veg.image || `../assets/img/plant/${veg.id}/${veg.id}_${veg.frames}.png`;
      img.alt = veg.name[currentLang];
      img.onerror = () => console.error(`Failed to load image: ${img.src}`);
      const span = document.createElement('span');
      span.textContent = `${veg.name[currentLang]} - ${veg.farmPrice} ${langData[currentLang].coinLabel} / ${veg.piPrice || 0} Pi${veg.amount ? ` (${veg.amount} Water)` : ''}`;
      const farmBuyBtn = document.createElement('button');
      farmBuyBtn.textContent = `${langData[currentLang].buyLabel} (Farm)`;
      farmBuyBtn.disabled = veg.id !== 'water' && farmCoinPurchases >= 2;
      farmBuyBtn.onclick = () => buySeed(veg.id, 'farm');
      const piBuyBtn = document.createElement('button');
      piBuyBtn.textContent = `${langData[currentLang].buyLabel} (Pi)`;
      piBuyBtn.onclick = () => buySeed(veg.id, 'pi');
      div.append(img, span, farmBuyBtn, veg.id === 'water' ? null : piBuyBtn);
      seedList.appendChild(div);
    });
    console.log('Shop rendered');
  } catch (e) {
    console.error('Render shop failed:', e.message);
  }
}

function buySeed(id, currency) {
  console.log('Buying seed:', id, 'with', currency);
  try {
    const veg = vegetables.find(v => v.id === id);
    let canBuy = false;
    let farmCoinPurchases = bag.filter(seed => seed.boughtWith === 'farm').length;

    if (currency === 'farm' && (veg.id === 'water' || farmCoinPurchases < 2) && farmCoins >= veg.farmPrice) {
      farmCoins -= veg.farmPrice;
      canBuy = true;
    } else if (currency === 'pi' && veg.piPrice && pi >= veg.piPrice) {
      pi -= veg.piPrice;
      canBuy = true;
    }

    if (canBuy) {
      if (veg.id === 'water') {
        water += veg.amount;
      } else {
        bag.push({ id: id, boughtWith: currency });
      }
      updateWallet();
      renderBag();
      renderShop();
      showNotification(`${langData[currentLang].bought} ${veg.name[currentLang]}!`);
      playBuyingSound();
    } else {
      showNotification(langData[currentLang].notEnoughMoney);
    }
  } catch (e) {
    console.error('Buy seed failed:', e.message);
  }
}

function renderBag() {
  console.log('Rendering bag...');
  try {
    const bagList = document.getElementById('bag-list');
    const bagIcon = document.getElementById('bag').querySelector('img');
    bagList.innerHTML = bag.length === 0 ? langData[currentLang].emptyBag : '';
    bag.forEach((seedObj, idx) => {
      const veg = vegetables.find(v => v.id === seedObj.id);
      const div = document.createElement('div');
      div.className = 'bag-item';
      const img = document.createElement('img');
      img.src = `../assets/img/plant/${veg.id}/${veg.id}_1.png`;
      img.alt = veg.name[currentLang];
      const span = document.createElement('span');
      span.textContent = veg.name[currentLang];
      div.append(img, span);
      bagList.appendChild(div);
    });
    bagIcon.removeEventListener('click', toggleBag);
    bagIcon.addEventListener('click', toggleBag);
    console.log('Bag rendered');
  } catch (e) {
    console.error('Render bag failed:', e.message);
  }
}

function toggleBag() {
  console.log('Toggling bag list');
  try {
    const bagList = document.getElementById('bag-list');
    bagList.classList.toggle('show');
    playMenuSound();
  } catch (e) {
    console.error('Toggle bag failed:', e.message);
  }
}

function buyUpgrade(type, currency) {
  console.log('Buying upgrade:', type, 'with', currency);
  try {
    const costs = {
      wateringCan: { farmCoins: 100, pi: 0.12 },
      extraPlot: { farmCoins: 400, pi: 0.48 },
      yieldBoost: { farmCoins: 200, pi: 0.3 }
    };
    const cost = costs[type];
    if (currency === 'farm' && farmCoins >= cost.farmCoins) {
      farmCoins -= cost.farmCoins;
      applyUpgrade(type);
    } else if (currency === 'pi' && pi >= cost.pi) {
      pi -= cost.pi;
      applyUpgrade(type);
    } else {
      showNotification(langData[currentLang].notEnoughMoney);
      return;
    }
    updateWallet();
    updateLeaderboard();
    showNotification(`${langData[currentLang].upgradeBought} ${type}!`);
    playBuyingSound();
  } catch (e) {
    console.error('Buy upgrade failed:', e.message);
  }
}

function applyUpgrade(type) {
  try {
    if (type === 'wateringCan' || type === 'yieldBoost') {
      upgrades[type] = true;
    } else if (type === 'extraPlot') {
      upgrades.extraPlot += 1;
      initializePlots();
    }
  } catch (e) {
    console.error('Apply upgrade failed:', e.message);
  }
}

function renderInventory() {
  console.log('Rendering inventory...');
  try {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = inventory.length === 0 ? langData[currentLang].emptyInventory : '';
    inventory.forEach(item => {
      const veg = vegetables.find(v => v.id === item.id);
      const div = document.createElement('div');
      div.className = 'inventory-item';
      const img = document.createElement('img');
      img.src = `../assets/img/plant/${veg.id}/${veg.id}_1.png`;
      img.alt = veg.name[currentLang];
      const span = document.createElement('span');
      span.textContent = `${veg.name[currentLang]}: ${item.amount}`;
      div.append(img, span);
      inventoryList.appendChild(div);
    });
  } catch (e) {
    console.error('Render inventory failed:', e.message);
  }
}

function renderExchange() {
  console.log('Rendering exchange...');
  try {
    updateWallet();
  } catch (e) {
    console.error('Render exchange failed:', e.message);
  }
}

function convertCurrency() {
  try {
    const farmInput = document.getElementById('farm-to-pi');
    const piInput = document.getElementById('pi-to-farm');
    const farmAmount = parseInt(farmInput.value);
    const piAmount = parseFloat(piInput.value);

    if (farmAmount > 0 && piAmount > 0) {
      showNotification('Please enter only one value to convert.');
      return;
    }

    if (farmAmount > 0) {
      if (farmCoins < farmAmount) {
        showNotification(langData[currentLang].notEnoughMoney);
        return;
      }
      const piConverted = farmAmount / piToFarmRate;
      farmCoins -= farmAmount;
      pi += piConverted;
      showNotification(`${langData[currentLang].convertSuccess} +${piConverted.toFixed(2)} Pi`);
    } else if (piAmount > 0) {
      if (pi < piAmount) {
        showNotification(langData[currentLang].notEnoughMoney);
        return;
      }
      const farmConverted = piAmount * piToFarmRate;
      pi -= piAmount;
      farmCoins += farmConverted;
      showNotification(`${langData[currentLang].convertSuccess} +${farmConverted} ${langData[currentLang].coinLabel}`);
    } else {
      showNotification('Please enter a valid amount.');
      return;
    }

    updateWallet();
    updateLeaderboard();
    farmInput.value = '';
    piInput.value = '';
    playBuyingSound();
  } catch (e) {
    console.error('Convert currency failed:', e.message);
  }
}

function renderLeaderboard() {
  console.log('Rendering leaderboard...');
  try {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = 'Loading...';
    db.collection('leaderboard')
      .orderBy('pi', 'desc')
      .limit(5)
      .get()
      .then(snapshot => {
        leaderboardList.innerHTML = '';
        snapshot.forEach((doc, idx) => {
          const data = doc.data();
          const div = document.createElement('div');
          div.className = 'leaderboard-item';
          div.textContent = `#${idx + 1}: ${data.name} - ${data.pi.toFixed(2)} Pi`;
          leaderboardList.appendChild(div);
        });
      })
      .catch(e => {
        console.error('Leaderboard fetch failed:', e);
        leaderboardList.innerHTML = 'Failed to load leaderboard.';
      });
  } catch (e) {
    console.error('Render leaderboard failed:', e.message);
  }
}

function updateLeaderboard() {
  console.log('Updating leaderboard...');
  try {
    if (!auth.currentUser) return;
    db.collection('leaderboard').doc(auth.currentUser.uid).set({
      name: playerName,
      pi: pi
    }).catch(e => console.error('Leaderboard update failed:', e));
  } catch (e) {
    console.error('Update leaderboard failed:', e.message);
  }
}

function renderAchievements() {
  console.log('Rendering achievements...');
  try {
    const achievementList = document.getElementById('achievement-list');
    achievementList.innerHTML = '';
    const achievementsData = [
      { id: 'harvest10', name: langData[currentLang].achievementHarvest10, completed: achievements.harvest10 },
      { id: 'pi10', name: langData[currentLang].achievementPi10, completed: achievements.pi10 }
    ];
    achievementsData.forEach(ach => {
      const div = document.createElement('div');
      div.className = 'achievement-item';
      div.textContent = `${ach.name}: ${ach.completed ? 'Completed' : 'In Progress'}`;
      achievementList.appendChild(div);
    });
  } catch (e) {
    console.error('Render achievements failed:', e.message);
  }
}

function checkAchievements() {
  console.log('Checking achievements...');
  try {
    if (harvestCount >= 10 && !achievements.harvest10) {
      achievements.harvest10 = true;
      showNotification(langData[currentLang].achievementUnlocked + ' ' + langData[currentLang].achievementHarvest10);
    }
    if (pi >= 10 && !achievements.pi10) {
      achievements.pi10 = true;
      showNotification(langData[currentLang].achievementUnlocked + ' ' + langData[currentLang].achievementPi10);
    }
    localStorage.setItem('achievements', JSON.stringify(achievements));
    localStorage.setItem('harvestCount', JSON.stringify(harvestCount));
    if (document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'achievements') {
      renderAchievements();
    }
  } catch (e) {
    console.error('Check achievements failed:', e.message);
  }
}

function checkDailyReward() {
  console.log('Checking daily reward...');
  try {
    const now = Date.now();
    const claimRewardBtn = document.getElementById('claim-reward-btn');
    if (now - lastRewardClaim >= dailyRewardCooldown) {
      claimRewardBtn.disabled = false;
    } else {
      claimRewardBtn.disabled = true;
      claimRewardBtn.textContent = langData[currentLang].rewardCooldown;
    }
  } catch (e) {
    console.error('Check daily reward failed:', e.message);
  }
}

function claimDailyReward() {
  console.log('Claiming daily reward...');
  try {
    const now = Date.now();
    if (now - lastRewardClaim < dailyRewardCooldown) {
      showNotification(langData[currentLang].rewardCooldown);
      return;
    }
    farmCoins += 50;
    lastRewardClaim = now;
    localStorage.setItem('lastRewardClaim', JSON.stringify(lastRewardClaim));
    updateWallet();
    updateLeaderboard();
    checkDailyReward();
    showNotification(`${langData[currentLang].rewardClaimed} +50 ${langData[currentLang].coinLabel}!`);
    playCoinSound();
  } catch (e) {
    console.error('Claim daily reward failed:', e.message);
  }
}

function updateWallet() {
  console.log('Updating wallet...');
  try {
    document.getElementById('coin-balance').textContent = farmCoins;
    document.getElementById('pi-balance').textContent = pi.toFixed(2);
    document.getElementById('water-balance').textContent = water;
    savePlayerData();
  } catch (e) {
    console.error('Update wallet failed:', e.message);
  }
}

function updateLevelBar() {
  console.log('Updating level bar...');
  try {
    document.getElementById('level-display').textContent = level;
    document.getElementById('xp-display').textContent = xp;
    const progress = (xp / (xpPerLevel * level)) * 100;
    document.getElementById('xp-progress').style.width = `${progress}%`;
  } catch (e) {
    console.error('Update level bar failed:', e.message);
  }
}

function showNotification(message) {
  console.log('Showing notification:', message);
  try {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  } catch (e) {
    console.error('Show notification failed:', e.message);
  }
}

function checkLevelUp() {
  console.log('Checking level up...');
  try {
    if (xp >= xpPerLevel * level) {
      level++;
      xp = 0;
      showNotification(`${langData[currentLang].levelUp} ${level}!`);
      updateLevelBar();
    }
  } catch (e) {
    console.error('Check level up failed:', e.message);
  }
}

setInterval(() => {
  try {
    farmPlots.forEach((plot, index) => {
      if (plot.vegetable && plot.watered) {
        plot.growth += 1;
        const veg = vegetables.find(v => v.id === plot.vegetable);
        if (plot.growth >= veg.growthTime) {
          plot.growth = veg.growthTime;
        }
        plot.watered = false;
        renderFarm();
      }
    });
  } catch (e) {
    console.error('Farm plot update interval failed:', e.message);
  }
}, 5000);

loadData();
