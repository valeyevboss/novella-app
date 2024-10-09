function loadTranslations(lang) {
    fetch(`/locales/${lang}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Language not found, loading default language');
            }
            return response.json();
        })
        .then(data => {
            // Кнопки и заголовки
            const freedurovButton = document.getElementById('freedurov-button');
            const dailyRewardTitle = document.getElementById('daily-reward-title');
            const claimRewardButton = document.getElementById('claim-reward-button');
            const premiumRewardButton = document.getElementById('premium-reward-button');
            const menuMain = document.getElementById('menu-main');
            const menuTask = document.getElementById('menu-task');
            const menuFriends = document.getElementById('menu-friends');
            const menuAirdrop = document.getElementById('menu-airdrop');
            const menuLeaders = document.getElementById('menu-leaders');
            
            // Новые элементы интерфейса
            const taskSubtitle = document.getElementById('task-subtitle');
            const sectionTitleIngame = document.getElementById('section-title-ingame');
            const sectionTitlePartners = document.getElementById('section-title-partners');
            const taskJoinCommunity = document.getElementById('task-join-community');
            const taskReward = document.getElementById('task-reward');
            const friendsSubtitle = document.getElementById('friends-subtitle');
            const friendsCount = document.getElementById('friends-count');
            const inviteButton = document.getElementById('invite-button');
            const copyButton = document.getElementById('copy-button');

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

            // Применение переводов для новых элементов
            if (taskSubtitle) taskSubtitle.textContent = data['task-subtitle'];
            if (sectionTitleIngame) sectionTitleIngame.textContent = data['section-title-ingame'];
            if (sectionTitlePartners) sectionTitlePartners.textContent = data['section-title-partners'];
            if (taskJoinCommunity) taskJoinCommunity.textContent = data['task-join-community'];
            if (taskReward) taskReward.textContent = data['task-reward'];
            if (friendsSubtitle) friendsSubtitle.textContent = data['friends-subtitle'];
            if (friendsCount) friendsCount.textContent = data['friends-count'];
            if (inviteButton) inviteButton.textContent = data['invite-button'];
            if (copyButton) copyButton.textContent = data['copy-button'];
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