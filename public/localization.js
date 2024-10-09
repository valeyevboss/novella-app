function loadTranslations(lang) {
    fetch(`/locales/${lang}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Language not found, loading default language');
            }
            return response.json();
        })
        .then(data => {
            // Объекты на страницах
            const freedurovButton = document.getElementById('freedurov-button');
            const dailyRewardTitle = document.getElementById('daily-reward-title');
            const claimRewardButton = document.getElementById('claim-reward-button');
            const premiumRewardButton = document.getElementById('premium-reward-button');
            const menuMain = document.getElementById('menu-main');
            const menuTask = document.getElementById('menu-task');
            const menuFriends = document.getElementById('menu-friends');
            const menuAirdrop = document.getElementById('menu-airdrop');
            const menuLeaders = document.getElementById('menu-leaders');
            const taskSubtitle = document.getElementById('task-subtitle');
            const sectionTitleIngame = document.getElementById('section-title-ingame');
            const sectionTitlePartners = document.getElementById('section-title-partners');
            const friendsSubtitle = document.getElementById('friends-subtitle');
            const friendsCount = document.getElementById('friends-count');
            const inviteButton = document.getElementById('invite-button');
            const airdropSubtitle = document.getElementById('airdrop-subtitle');
            const connectwalletButton = document.getElementById("ton-connect-button");
            const warningText = document.getElementById('warning-text');
            const leaderSubtitle = document.getElementById('leader-subtitle');

            // Применение переводов
            if (freedurovButton) freedurovButton.textContent = data.freedurov_button;
            if (dailyRewardTitle) dailyRewardTitle.textContent = data.daily_rewards;
            if (claimRewardButton) claimRewardButton.textContent = data.daily_checkin;
            if (premiumRewardButton) premiumRewardButton.textContent = data.premium_checkin;
            if (menuMain) menuMain.textContent = data.main;
            if (menuTask) menuTask.textContent = data.task;
            if (menuFriends) menuFriends.textContent = data.friends;
            if (menuAirdrop) menuAirdrop.textContent = data.airdrop;
            if (menuLeaders) menuLeaders.textContent = data.leaders;
            if (taskSubtitle) taskSubtitle.textContent = data['task-subtitle'];
            if (sectionTitleIngame) sectionTitleIngame.textContent = data['section-title-ingame'];
            if (sectionTitlePartners) sectionTitlePartners.textContent = data['section-title-partners'];
            if (friendsSubtitle) friendsSubtitle.textContent = data['friends-subtitle'];
            if (friendsCount) friendsCount.textContent = data['friends-count'];
            if (inviteButton) inviteButton.textContent = data['invite-button'];
            if (airdropSubtitle) airdropSubtitle.textContent = data['airdrop-subtitle'];
            if (connectwalletButton) connectwalletButton.textContent = data["ton-connect-button"];
            if (warningText) warningText.textContent = data['warning-text'];
            if (leaderSubtitle) leaderSubtitle.textContent = data['leader-subtitle'];
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
