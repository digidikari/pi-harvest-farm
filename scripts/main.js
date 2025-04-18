import { login, getUserData, updateUserData, updateLeaderboard } from '../firebase/firebase-functions.js';
import vegetables from '../data/vegetables.json' assert { type: 'json' };
import en from '../lang/en.json' assert { type: 'json' };
import id from '../lang/id.json' assert { type: 'json' };

let user = null;
let userData = null;
let currentLang = 'en';
const langData = { en, id };

async function initGame() {
  user = await login();
  userData = await getUserData(user.uid);
  renderFarm();
  renderShop();
  updateWallet();
  updateLeaderboard();
  initPiSDK();
  loadLanguage();
  startBGM();
  document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
}

function startBGM() {
  const bgm = new Audio('../assets/sfx/music/bgm.mp3');
  bgm.loop = true;
  bgm.play();
}

function playSound(file) {
  new Audio(file).play();
}

function renderFarm() {
  const farmArea = document.getElementById('farm-area');
  farmArea.innerHTML = '';
  userData.plots.forEach(plot => {
    const plotDiv = document.createElement('div');
    plotDiv.className = 'plot';
    if (plot.planted) {
      plotDiv.className += ' planted';
      plotDiv.style.backgroundImage = `url(${plot.sprite}/stage${plot.stage}.png)`;
    }
    plotDiv.addEventListener('click', () => handlePlotClick(plot));
    farmArea.appendChild(plotDiv);
  });
}

function renderShop() {
  const seedList = document.getElementById('seed-list');
  seedList.innerHTML = '';
  vegetables.vegetables.forEach(veg => {
    const li = document.createElement('li');
    li.textContent = `${veg.name} - ${veg.price} Coins / ${veg.piPrice} Pi`;
    li.addEventListener('click', () => buySeed(veg));
    seedList.appendChild(li);
  });
}

function updateWallet() {
  document.getElementById('pi-balance').textContent = userData.piBalance.toFixed(2);
  document.getElementById('coin-balance').textContent = userData.coinBalance;
}

function handlePlotClick(plot) {
  if (!plot.planted) return;
  playSound('../assets/sfx/voice/water.mp3');
  if (plot.stage < 3) {
    plot.watered = true;
    plot.growthTime *= 0.9; // Percepat 10%
    renderFarm();
  } else {
    playSound('../assets/sfx/voice/harvest.mp3');
    userData.coinBalance += plot.yield * (userData.upgrades.yieldBoost || 1);
    if (Math.random() < 0.1) userData.piBalance += 0.01;
    plot.planted = false;
    checkLevelUp();
    updateUserData(user.uid, { coinBalance: userData.coinBalance, piBalance: userData.piBalance, plots: userData.plots });
    renderFarm();
    updateWallet();
    updateLeaderboard();
  }
}

function buySeed(veg) {
  if (userData.coinBalance >= veg.price || userData.piBalance >= veg.piPrice) {
    const cost = userData.coinBalance >= veg.price ? { coinBalance: userData.coinBalance - veg.price } : { piBalance: userData.piBalance - veg.piPrice };
    const plot = userData.plots.find(p => !p.planted);
    if (plot) {
      plot.planted = true;
      plot.sprite = veg.sprite;
      plot.stage = 1;
      plot.yield = veg.yield;
      plot.growthTime = veg.growthTime * (userData.upgrades.wateringCan || 1);
      startGrowth(plot);
      updateUserData(user.uid, { ...cost, plots: userData.plots });
      renderFarm();
      updateWallet();
    }
  }
}

function startGrowth(plot) {
  const interval = setInterval(() => {
    if (plot.stage < 3) {
      plot.stage++;
      renderFarm();
    } else {
      clearInterval(interval);
    }
  }, plot.growthTime * 1000 / 3);
}

function checkLevelUp() {
  userData.panenCount = (userData.panenCount || 0) + 1;
  if (userData.panenCount % 10 === 0) {
    userData.level = (userData.level || 0) + 1;
    userData.coinBalance += 50; // Bonus level up
    updateUserData(user.uid, { panenCount: userData.panenCount, level: userData.level, coinBalance: userData.coinBalance });
    updateWallet();
  }
}

const upgrades = {
  wateringCan: { cost: 50, piCost: 0.2, effect: 0.8 },
  extraPlot: { cost: 200, piCost: 1, effect: 1 },
  yieldBoost: { cost: 100, piCost: 0.5, effect: 1.5 }
};

window.buyUpgrade = function(type) {
  const upgrade = upgrades[type];
  if (userData.coinBalance >= upgrade.cost || userData.piBalance >= upgrade.piCost) {
    const cost = userData.coinBalance >= upgrade.cost ? { coinBalance: userData.coinBalance - upgrade.cost } : { piBalance: userData.piBalance - upgrade.piCost };
    userData.upgrades[type] = (userData.upgrades[type] || (type === 'extraPlot' ? 0 : 1)) * (type === 'extraPlot' ? 1 : upgrade.effect);
    if (type === 'extraPlot') {
      userData.plots.push({ id: userData.plots.length + 1, planted: false });
    }
    updateUserData(user.uid, { ...cost, upgrades: userData.upgrades, plots: userData.plots });
    renderFarm();
    updateWallet();
  }
};

function initPiSDK() {
  Pi.init({ version: '2.0', appId: 'YOUR_PI_APP_ID' });
  document.getElementById('top-up-btn').addEventListener('click', () => {
    Pi.createPayment({
      amount: 1,
      memo: 'Top-up Pi Harvest Farm',
      metadata: { userId: user.uid }
    }, {
      onReadyForServerApproval: async (paymentId) => {
        await firebase.functions().httpsCallable('verifyPayment')({ paymentId, userId: user.uid });
      },
      onReadyForServerCompletion: async () => {
        userData.piBalance += 1;
        await updateUserData(user.uid, { piBalance: userData.piBalance });
        updateWallet();
      },
      onCancel: () => console.log('Payment cancelled'),
      onError: (error) => console.error('Payment error:', error)
    });
  });

  document.getElementById('withdraw-btn').addEventListener('click', () => {
    const amount = prompt('Enter amount to withdraw (min 0.1 Pi):');
    if (amount >= 0.1 && userData.piBalance >= amount) {
      Pi.createPayment({
        amount: parseFloat(amount),
        memo: 'Withdraw from Pi Harvest Farm',
        metadata: { userId: user.uid, type: 'withdraw' }
      }, {
        onReadyForServerApproval: async (paymentId) => {
          await firebase.functions().httpsCallable('processWithdrawal')({ paymentId, userId: user.uid, amount });
        },
        onReadyForServerCompletion: async () => {
          userData.piBalance -= amount;
          await updateUserData(user.uid, { piBalance: userData.piBalance });
          updateWallet();
        }
      });
    }
  });

  document.getElementById('watch-ad-btn').addEventListener('click', () => {
    Pi.createAd({
      adUnitId: 'YOUR_AD_UNIT_ID'
    }, {
      onAdImpression: () => {
        userData.coinBalance += 50;
        updateUserData(user.uid, { coinBalance: userData.coinBalance });
        updateWallet();
      },
      onError: (error) => console.error('Ad error:', error)
    });
  });
}

function loadLanguage() {
  document.getElementById('title').textContent = langData[currentLang].title;
  document.getElementById('shop-title').textContent = langData[currentLang].shop;
  document.getElementById('top-up-btn').textContent = langData[currentLang].topUp;
  document.getElementById('watch-ad-btn').textContent = langData[currentLang].watchAd;
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'id' : 'en';
  loadLanguage();
}

initGame();
