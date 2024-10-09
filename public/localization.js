function loadTranslations(lang) {
    fetch(`/locales/${lang}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Language not found, loading default language');
            }
            return response.json();
        })
        .then(data => {
            const freedurovButton = document.getElementById('freedurov-button');
            const dailyRewardTitle = document.getElementById('daily-reward-title');
            const claimRewardButton = document.getElementById('claim-reward-button');
            const premiumRewardButton = document.getElementById('premium-reward-button');
            const menuMain = document.getElementById('menu-main');
            const menuTask = document.getElementById('menu-task');
            const menuFriends = document.getElementById('menu-friends');
            const menuAirdrop = document.getElementById('menu-airdrop');
            const menuLeaders = document.getElementById('menu-leaders');

            if (freedurovButton) freedurovButton.textContent = data.freedurov_button;
            if (dailyRewardTitle) dailyRewardTitle.textContent = data.daily_rewards;
            if (claimRewardButton) claimRewardButton.textContent = data.daily_checkin;
            if (premiumRewardButton) premiumRewardButton.textContent = data.premium_checkin;
            if (menuMain) menuMain.textContent = data.main;
            if (menuTask) menuTask.textContent = data.task;
            if (menuFriends) menuFriends.textContent = data.friends;
            if (menuAirdrop) menuAirdrop.textContent = data.airdrop;
            if (menuLeaders) menuLeaders.textContent = data.leaders;
        })
        .catch(error => {
            console.error(error);
            if (lang !== 'en-US') {
                loadTranslations('en-US');
            }
        });
}

// Определение языка пользователя с fallback на en-US
const userLang = navigator.language || 'en-US';
const supportedLangs = ['en-US', 'ru-RU', 'uk-UA'];
const lang = supportedLangs.includes(userLang) ? userLang : 'en-US';

// Загрузка переводов
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations(lang);
});