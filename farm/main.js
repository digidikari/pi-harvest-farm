// [Sama seperti main.js sebelumnya, cuma ganti function switchTab]

// Switch tabs
function switchTab(tab) {
  console.log(`Switching to ${tab} tab...`);
  try {
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const tabContent = document.getElementById(tab);
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (!tabContent || !tabBtn) {
      throw new Error(`Tab content or button for ${tab} not found`);
    }

    tabContent.classList.add('active');
    tabBtn.classList.add('active');
    console.log(`Switched to ${tab} tab successfully`);

    if (tab === 'shop') {
      renderShop();
      renderSellSection();
    } else if (tab === 'inventory') {
      renderInventory();
    } else if (tab === 'achievements') {
      renderAchievements();
    } else if (tab === 'exchange') {
      updateExchangeResult();
    }

    playMenuSound();
  } catch (e) {
    console.error('Switch tab failed:', e.message);
    showNotification(langData[currentLang].error || 'Failed to switch tab!');
  }
}
