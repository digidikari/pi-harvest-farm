let vegetables = [];
let langData = {};
let currentLang = 'en';
let coins = 100;
let pi = 0;
let farmPlots = [];
let inventory = [];
let bag = [];
let upgrades = {
  wateringCan: false,
  extraPlotCoins: 0,
  extraPlotPi: 0,
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

const plotCount = 8;
const xpPerLevel = 100;
const dailyRewardCooldown = 24 * 60 * 60 * 1000;

const fallbackLangData = {
  "en": {
    "title": "Pi Harvest Farm",
    "startBtn": "Start Game",
    "farmTab": "Farm",
    "shopTab": "Shop",
    "upgradesTab": "Upgrades",
    "inventoryTab": "Inventory",
    "leaderboardTab": "Leaderboard",
    "achievementsTab": "Achievements",
    "coinLabel": "Coins",
    "buyLabel": "Buy",
    "emptyBag": "Bag is empty!",
    "emptyInventory": "Inventory is empty!",
    "notEnoughMoney": "Not enough money!",
    "bought": "Bought",
    "harvested": "Harvested",
    "upgradeBought": "Upgrade bought",
    "levelUp": "Level up to",
    "claimPiBtn": "Claim Pi",
    "claimedPi": "Claimed",
    "claimRewardBtn": "Claim Daily Reward",
    "rewardClaimed": "Daily Reward Claimed!",
    "rewardCooldown": "Reward Available Tomorrow!",
    "achievementHarvest10": "Harvest 10 Plants",
    "achievementPi10": "Collect 10 Pi",
    "achievementUnlocked": "Achievement Unlocked!"
  },
  "id": {
    "title": "Pi Harvest Farm",
    "startBtn": "Mulai Permainan",
    "farmTab": "Ladang",
    "shopTab": "Toko",
    "upgradesTab": "Peningkatan",
    "inventoryTab": "Inventaris",
    "leaderboardTab": "Papan Peringkat",
    "achievementsTab": "Pencapaian",
    "coinLabel": "Koin",
    "buyLabel": "Beli",
    "emptyBag": "Tas kosong!",
    "emptyInventory": "Inventaris kosong!",
    "notEnoughMoney": "Uang tidak cukup!",
    "bought": "Dibeli",
    "harvested": "Dipanen",
    "upgradeBought": "Peningkatan dibeli",
    "levelUp": "Naik level ke",
    "claimPiBtn": "Klaim Pi",
    "claimedPi": "Diklaim",
    "claimRewardBtn": "Klaim Hadiah Harian",
    "rewardClaimed": "Hadiah Harian Diklaim!",
    "rewardCooldown": "Hadiah Tersedia Besok!",
    "achievementHarvest10": "Panen 10 Tanaman",
    "achievementPi10": "Kumpulkan 10 Pi",
    "achievementUnlocked": "Pencapaian Dibuka!"
  }
};

// Tambah fallback data buat vegetables
const fallbackVegetables = [
  { id: "beet", name: { en: "Beet", id: "Bit" }, price: 10, piPrice: 0.1, growthTime: 10, frames: 12, yield: 15 },
  { id: "cabbage", name: { en: "Cabbage", id: "Kol" }, price: 20, piPrice: 0.2, growthTime: 12, frames: 10, yield: 25 },
  { id: "carrot", name: { en: "Carrot", id: "Wortel" }, price: 15, piPrice: 0.15, growthTime: 8, frames: 8, yield: 20 },
  { id: "corn", name: { en: "Corn", id: "Jagung" }, price: 25, piPrice: 0.25, growthTime: 15, frames: 14, yield: 30 },
  { id: "cucumber", name: { en: "Cucumber", id: "Timun" }, price: 18, piPrice: 0.18, growthTime: 10, frames: 9, yield: 22 },
  { id: "eggplant", name: { en: "Eggplant", id: "Terong" }, price: 22, piPrice: 0.22, growthTime: 12, frames: 11, yield: 28 },
  { id: "onion", name: { en: "Onion", id: "Bawang" }, price: 12, piPrice: 0.12, growthTime: 7, frames: 7, yield: 18 },
  { id: "peas", name: { en: "Peas", id: "Kacang Polong" }, price: 16, piPrice: 0.16, growthTime: 9, frames: 8, yield: 20 },
  { id: "pepper", name: { en: "Pepper", id: "Paprika" }, price: 20, piPrice: 0.2, growthTime: 11, frames: 10, yield: 25 },
  { id: "potato", name: { en: "Potato", id: "Kentang" }, price: 18, piPrice: 0.18, growthTime: 10, frames: 9, yield: 22 },
  { id: "pumpkin", name: { en: "Pumpkin", id: "Labu" }, price: 30, piPrice: 0.3, growthTime: 15, frames: 20, yield: 35 },
  { id: "radish", name: { en: "Radish", id: "Lobak" }, price: 12, piPrice: 0.12, growthTime: 7, frames: 7, yield: 18 },
  { id: "lettuce", name: { en: "Lettuce", id: "Selada" }, price: 15, piPrice: 0.15, growthTime: 8, frames: 8, yield: 20 },
  { id: "spinach", name: { en: "Spinach", id: "Bayam" }, price: 10, piPrice: 0.1, growthTime: 6, frames: 6, yield: 15 },
  { id: "tomato", name: { en: "Tomato", id: "Tomat" }, price: 18, piPrice: 0.18, growthTime: 10, frames: 9, yield: 22 },
  { id: "watermelon", name: { en: "Watermelon", id: "Semangka" }, price: 35, piPrice: 0.35, growthTime: 18, frames: 15, yield: 40 },
  { id: "wheat", name: { en: "Wheat", id: "Gandum" }, price: 22, piPrice: 0.22, growthTime: 12, frames: 10, yield: 28 }
];

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  initializeFirebaseAuth();
  loadData();
  document.getElementById('start-text').onclick = startGame;
  document.getElementById('lang-toggle').onclick = toggleLanguage;
  initializeSettings();
  updateVolumes();
  document.getElementById('bg-music').play().catch(e => console.warn('Background music failed to play:', e));
});

async function loadData() {
  console.log('Loading data...');
  try {
    const langRes = await fetch('../data/lang.json');
    if (!langRes.ok) {
      console.error(`Failed to load lang.json, status: ${langRes.status}, statusText: ${langRes.statusText}`);
      throw new Error('Failed to load lang.json');
    }
    langData = await langRes.json();
    console.log('Loaded lang.json:', langData);
  } catch (e) {
    console.error('Lang JSON load failed:', e.message);
    console.warn('Using fallback lang data...');
    langData = fallbackLangData;
  }

  try {
    const vegRes = await fetch('../data/vegetables.json');
    if (!vegRes.ok) {
      console.error(`Failed to load vegetables.json, status: ${vegRes.status}, statusText: ${vegRes.statusText}`);
      throw new Error('Failed to load vegetables.json');
    }
    const vegData = await vegRes.json();
    vegetables = vegData.vegetables;
    console.log('Loaded vegetables.json:', vegetables);
  } catch (e) {
    console.error('Vegetables JSON load failed:', e.message);
    console.warn('Using fallback vegetables data...');
    vegetables = fallbackVegetables;
  }

  try {
    const invRes = await fetch('../data/inventory.json');
    if (!invRes.ok) {
      console.error(`Failed to load inventory.json, status: ${invRes.status}, statusText: ${invRes.statusText}`);
      throw new Error('Failed to load inventory.json');
    }
    inventory = await invRes.json();
    console.log('Loaded inventory.json:', inventory);
  } catch (e) {
    console.error('Inventory JSON load failed:', e.message);
    inventory = [];
  }

  initializeGame();
}

function initializeGame() {
  console.log('Initializing game...');
  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
    currentLang = savedLang;
    document.getElementById('lang-toggle').textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
  }
  loadPlayerData();
  updateUIText();
  initializePlots();
  updateWallet();
  updateLevelBar();
  renderBag();
  renderAchievements();
  checkDailyReward();
}

function startGame() {
  console.log('Starting game...');
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  switchTab('farm');
}

function toggleLanguage() {
  console.log('Toggling language...');
  currentLang = currentLang === 'en' ? 'id' : 'en';
  localStorage.setItem('lang', currentLang);
  document.getElementById('lang-toggle').textContent = `Switch Language (${currentLang === 'en' ? 'ID' : 'EN'})`;
  updateUIText();
  document.getElementById('start-text').textContent = langData[currentLang].startBtn;
  switchTab(document.querySelector('.tab-btn.active')?.getAttribute('data-tab') || 'farm');
}

function updateUIText() {
  console.log('Updating UI text...');
  document.getElementById('title').textContent = langData[currentLang].title;
  document.getElementById('start-text').textContent = langData[currentLang].startBtn;
  document.getElementById('game-title').textContent = langData[currentLang].title;
  document.getElementById('shop-title').textContent = langData[currentLang].shopTab;
  document.getElementById('upgrades-title').textContent = langData[currentLang].upgradesTab;
  document.getElementById('inventory-title').textContent = langData[currentLang].inventoryTab;
  document.getElementById('leaderboard-title').textContent = langData[currentLang].leaderboardTab;
  document.getElementById('achievements-title').textContent = langData[currentLang].achievementsTab;
  const claimPiBtn = document.querySelector('#claim-pi-btn');
  if (claimPiBtn) {
    claimPiBtn.textContent = langData[currentLang].claimPiBtn;
  }
  const claimRewardBtn = document.querySelector('#claim-reward-btn');
  if (claimRewardBtn) {
    claimRewardBtn.textContent = langData[currentLang].claimRewardBtn;
  }
  document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
    const tabs = ['farmTab', 'shopTab', 'upgradesTab', 'inventoryTab', 'leaderboardTab', 'achievementsTab'];
    btn.textContent = langData[currentLang][tabs[idx]];
  });
  if (document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'shop') {
    renderShop();
  }
  if (document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'inventory') {
    renderInventory();
  }
  if (document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'leaderboard') {
    renderLeaderboard();
  }
  if (document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'achievements') {
    renderAchievements();
  }
}

function initializeSettings() {
  const modal = document.getElementById('settings-modal');
  const btn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('close-settings');
  const musicSlider = document.getElementById('music-volume');
  const voiceSlider = document.getElementById('voice-volume');

  musicSlider.value = musicVolume;
  voiceSlider.value = voiceVolume;

  btn.onclick = () => {
    modal.style.display = 'block';
  };

  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  musicSlider.oninput = () => {
    musicVolume = parseInt(musicSlider.value);
    localStorage.setItem('musicVolume', musicVolume);
    updateVolumes();
  };

  voiceSlider.oninput = () => {
    voiceVolume = parseInt(voiceSlider.value);
    localStorage.setItem('voiceVolume', voiceVolume);
    updateVolumes();
  };
}

function updateVolumes() {
  const bgMusic = document.getElementById('bg-music');
  const harvestSound = document.getElementById('harvest-sound');
  bgMusic.volume = musicVolume / 100;
  harvestSound.volume = voiceVolume / 100;
}

function switchTab(tab) {
  console.log('Switching to tab:', tab);
  try {
    const tabElement = document.getElementById(tab);
    if (!tabElement) {
      console.error(`Tab element ${tab} not found!`);
      alert(`Error: Tab ${tab} not found in HTML. Check index.html.`);
      return;
    }
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    tabElement.style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.onclick = () => switchTab(btn.getAttribute('data-tab'));
    });
    const activeBtn = document.querySelector(`button[onclick="switchTab('${tab}')"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('data-tab', tab);
    }
    if (tab === 'farm') renderFarm();
    if (tab === 'shop') renderShop();
    if (tab === 'inventory') renderInventory();
    if (tab === 'leaderboard') renderLeaderboard();
    if (tab === 'achievements') renderAchievements();
  } catch (e) {
    console.error('Tab switch failed:', e);
    alert('Tab error: ' + e.message);
  }
}

function initializePlots() {
  console.log('Initializing farm plots...');
  const farmArea = document.getElementById('farm-area');
  farmArea.innerHTML = '';
  const totalPlots = plotCount + upgrades.extraPlotCoins + upgrades.extraPlotPi;
  for (let i = 0; i < totalPlots; i++) {
    const plot = document.createElement('div');
    plot.className = 'plot';
    plot.dataset.index = i;
    plot.onclick = () => plantSeed(i);
    farmArea.appendChild(plot);
    farmPlots[i] = { vegetable: null, growth: 0, watered: false };
  }
  console.log('Farm plots initialized:', farmPlots);
}

function renderFarm() {
  console.log('Rendering farm...');
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
      } else {
        plotElement.classList.remove('dry');
      }
      plotElement.appendChild(img);
    } else {
      plotElement.classList.remove('ready', 'dry');
      plotElement.onclick = () => plantSeed(index);
    }
  });
}

function plantSeed(index) {
  console.log('Planting seed at index:', index);
  if (bag.length === 0) {
    showNotification(langData[currentLang].emptyBag);
    return;
  }
  const seed = bag.shift();
  farmPlots[index].vegetable = seed;
  farmPlots[index].growth = 0;
  farmPlots[index].watered = false;
  renderFarm();
  renderBag();
}

function water(index) {
  console.log('Watering plot at index:', index);
  if (!farmPlots[index].vegetable) return;
  if (upgrades.wateringCan) {
    farmPlots[index].watered = true;
    farmPlots[index].growth += 2;
  } else {
    farmPlots[index].growth += 1;
  }
  const veg = vegetables.find(v => v.id === farmPlots[index].vegetable);
  if (farmPlots[index].growth >= veg.growthTime) {
    farmPlots[index].growth = veg.growthTime;
  }
  renderFarm();
}

function harvest(index) {
  console.log('Harvesting plot at index:', index);
  const veg = vegetables.find(v => v.id === farmPlots[index].vegetable);
  let yieldAmount = veg.yield;
  if (upgrades.yieldBoost) yieldAmount = Math.floor(yieldAmount * 1.5);
  inventory.push({ id: veg.id, amount: yieldAmount });
  farmPlots[index] = { vegetable: null, growth: 0, watered: false };
  coins += veg.price;
  pi += veg.piPrice / 2;
  xp += 10;
  harvestCount++;
  checkAchievements();
  checkLevelUp();
  updateWallet();
  updateLeaderboard();
  updateLevelBar();
  renderFarm();
  try {
    document.getElementById('harvest-sound').play();
  } catch (e) {
    console.warn('Harvest sound failed:', e);
  }
  showNotification(`${langData[currentLang].harvested} ${veg.name[currentLang]}! +${veg.price} ${langData[currentLang].coinLabel}, +${(veg.piPrice / 2).toFixed(2)} Pi, +10 XP`);
}

function renderShop() {
  console.log('Rendering shop');
  const seedList = document.getElementById('seed-list');
  seedList.innerHTML = '';
  vegetables.forEach(veg => {
    const div = document.createElement('div');
    div.className = 'seed-item';
    const img = document.createElement('img');
    img.src = `../assets/img/plant/${veg.id}/${veg.id}_1.png`;
    img.alt = veg.name[currentLang];
    const span = document.createElement('span');
    span.textContent = `${veg.name[currentLang]} - ${veg.price} ${langData[currentLang].coinLabel} / ${veg.piPrice} Pi`;
    const buyBtn = document.createElement('button');
    buyBtn.textContent = langData[currentLang].buyLabel;
    buyBtn.onclick = () => buySeed(veg.id);
    div.append(img, span, buyBtn);
    seedList.appendChild(div);
  });
}

function buySeed(id) {
  console.log('Buying seed:', id);
  const veg = vegetables.find(v => v.id === id);
  if (coins >= veg.price) {
    coins -= veg.price;
    bag.push(id);
    updateWallet();
    renderBag();
    showNotification(`${langData[currentLang].bought} ${veg.name[currentLang]}!`);
  } else if (pi >= veg.piPrice) {
    pi -= veg.piPrice;
    bag.push(id);
    updateWallet();
    renderBag();
    showNotification(`${langData[currentLang].bought} ${veg.name[currentLang]}!`);
  } else {
    showNotification(langData[currentLang].notEnoughMoney);
  }
}

function renderBag() {
  console.log('Rendering bag...');
  const bagList = document.getElementById('bag-list');
  bagList.innerHTML = bag.length === 0 ? langData[currentLang].emptyBag : '';
  bag.forEach((seed, idx) => {
    const veg = vegetables.find(v => v.id === seed);
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
  document.getElementById('bag').querySelector('img').onclick = () => {
    bagList.classList.toggle('show');
  };
}

function buyUpgrade(type) {
  console.log('Buying upgrade:', type);
  const costs = {
    wateringCan: { coins: 50, pi: 0.2 },
    extraPlotCoins: { coins: 200, pi: 0 },
    extraPlotPi: { coins: 0, pi: 1 },
    yieldBoost: { coins: 100, pi: 0.5 }
  };
  const cost = costs[type];
  if (coins >= cost.coins && pi >= cost.pi) {
    coins -= cost.coins;
    pi -= cost.pi;
    if (type === 'wateringCan' || type === 'yieldBoost') {
      upgrades[type] = true;
    } else if (type === 'extraPlotCoins') {
      upgrades.extraPlotCoins += 1;
      initializePlots();
    } else if (type === 'extraPlotPi') {
      upgrades.extraPlotPi += 1;
      initializePlots();
    }
    updateWallet();
    updateLeaderboard();
    showNotification(`${langData[currentLang].upgradeBought} ${type}!`);
  } else {
    showNotification(langData[currentLang].notEnoughMoney);
  }
}

function renderInventory() {
  console.log('Rendering inventory...');
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
}

function claimPi() {
  console.log('Claiming Pi...');
  if (inventory.length === 0) {
    showNotification(langData[currentLang].emptyInventory);
    return;
  }
  const totalPi = inventory.reduce((sum, item) => {
    const veg = vegetables.find(v => v.id === item.id);
    return sum + (item.amount * (veg.piPrice / 10));
  }, 0);
  pi += totalPi;
  inventory = [];
  savePlayerData();
  updateWallet();
  updateLeaderboard();
  checkAchievements();
  renderInventory();
  showNotification(`${langData[currentLang].claimedPi} ${totalPi.toFixed(2)} Pi!`);
}

function renderLeaderboard() {
  console.log('Rendering leaderboard...');
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
}

function updateLeaderboard() {
  console.log('Updating leaderboard...');
  if (!auth.currentUser) return;
  db.collection('leaderboard').doc(auth.currentUser.uid).set({
    name: playerName,
    pi: pi
  }).catch(e => console.error('Leaderboard update failed:', e));
}

function renderAchievements() {
  console.log('Rendering achievements...');
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
}

function checkAchievements() {
  console.log('Checking achievements...');
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
}

function checkDailyReward() {
  console.log('Checking daily reward...');
  const now = Date.now();
  const claimRewardBtn = document.getElementById('claim-reward-btn');
  if (now - lastRewardClaim >= dailyRewardCooldown) {
    claimRewardBtn.disabled = false;
  } else {
    claimRewardBtn.disabled = true;
    claimRewardBtn.textContent = langData[currentLang].rewardCooldown;
  }
}

function claimDailyReward() {
  console.log('Claiming daily reward...');
  const now = Date.now();
  if (now - lastRewardClaim < dailyRewardCooldown) {
    showNotification(langData[currentLang].rewardCooldown);
    return;
  }
  coins += 50;
  pi += 0.5;
  lastRewardClaim = now;
  localStorage.setItem('lastRewardClaim', JSON.stringify(lastRewardClaim));
  updateWallet();
  updateLeaderboard();
  checkDailyReward();
  showNotification(`${langData[currentLang].rewardClaimed} +50 ${langData[currentLang].coinLabel}, +0.5 Pi!`);
}

function updateWallet() {
  console.log('Updating wallet...');
  document.getElementById('coin-balance').textContent = coins;
  document.getElementById('pi-balance').textContent = pi.toFixed(2);
  savePlayerData();
}

function updateLevelBar() {
  console.log('Updating level bar...');
  document.getElementById('level-display').textContent = level;
  document.getElementById('xp-display').textContent = xp;
  const progress = (xp / (xpPerLevel * level)) * 100;
  document.getElementById('xp-progress').style.width = `${progress}%`;
}

function showNotification(message) {
  console.log('Showing notification:', message);
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

function checkLevelUp() {
  console.log('Checking level up...');
  if (xp >= xpPerLevel * level) {
    level++;
    xp = 0;
    showNotification(`${langData[currentLang].levelUp} ${level}!`);
    updateLevelBar();
  }
}

setInterval(() => {
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
}, 5000);

loadData();
