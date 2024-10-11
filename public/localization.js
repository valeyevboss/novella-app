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
            const personalSettingsTitle = document.getElementById('personal-settings-title');
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
            const connectwalletButton = document.getElementById("connectButton");
            const warningText = document.getElementById('warning-text');
            const airdropDescriptTitle = document.getElementById('airdrop-descript-title');
            const airdropDescription1 = document.getElementById('airdrop-description-1');
            const airdropDescription2 = document.getElementById('airdrop-description-2');
            const airdropDescription3 = document.getElementById('airdrop-description-3');
            const listingDescriptTitle = document.getElementById('listing-descript-title');
            const listingDescription1 = document.getElementById('listing-description-1');
            const listingDescription2 = document.getElementById('listing-description-2');
            const leaderSubtitle = document.getElementById('leader-subtitle');
            const titletop100 = document.getElementById("title-top100");

            // Применение переводов
            if (freedurovButton) freedurovButton.textContent = data.freedurov_button;
            if (dailyRewardTitle) dailyRewardTitle.textContent = data.daily_rewards;
            if (claimRewardButton) claimRewardButton.textContent = data.daily_checkin;
            if (premiumRewardButton) premiumRewardButton.textContent = data.premium_checkin;
            if (personalSettingsTitle) personalSettingsTitle.textContent = data['personal-settings-title'];
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
            if (connectwalletButton) connectwalletButton.textContent = data["connectButton"];
            if (warningText) warningText.textContent = data['warning-text'];
            if (airdropDescriptTitle) airdropDescriptTitle.textContent = data['airdrop-descript-title'];
            if (airdropDescription1) airdropDescription1.textContent = data['airdrop-description-1'];
            if (airdropDescription2) airdropDescription2.textContent = data['airdrop-description-2'];
            if (airdropDescription3) airdropDescription3.textContent = data['airdrop-description-3'];
            if (listingDescriptTitle) listingDescriptTitle.textContent = data['listing-descript-title'];
            if (listingDescription1) listingDescription1.textContent = data['listing-description-1'];
            if (listingDescription2) listingDescription2.textContent = data['listing-description-2'];
            if (leaderSubtitle) leaderSubtitle.textContent = data['leader-subtitle'];
            if (titletop100) titletop100.textContent = data['title-top100'];
        })
        .catch(error => {
            console.error(error);
            if (lang !== 'en-US') {
                loadTranslations('en-US');
            }
        });
}

// Функция для получения языка из контекста Telegram
function getUserLanguageFromTelegram() {
    const tg = window.Telegram.WebApp;
    return tg.initDataUnsafe.user.language_code || 'en-US'; // Используем 'en-US' по умолчанию
}

// Обработчик для сохранения выбранного языка
document.getElementById('save-language-btn').addEventListener('click', () => {
    const selectedLang = document.getElementById('country-select').value;
    localStorage.setItem('selectedLanguage', selectedLang); // Сохраняем язык в localStorage
    loadTranslations(selectedLang); // Загружаем переводы для выбранного языка
});

// Проверка сохранённого языка в localStorage или использование языка Telegram
const savedLang = localStorage.getItem('selectedLanguage'); // Проверяем, есть ли сохранённый язык
const userLang = savedLang || getUserLanguageFromTelegram(); // Если нет сохранённого, используем язык Telegram
const supportedLangs = ['en-US', 'ru-RU', 'uk-UA'];
const lang = supportedLangs.includes(userLang) ? userLang : 'en-US';

// Загрузка переводов при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена, начинаем локализацию');
    loadTranslations(lang);

    // Дополнительная проверка для отображения переведенных элементов
    if (!freedurovButton && !menuMain && !claimRewardButton) {
        console.warn('Некоторые элементы не найдены на этой странице');
    }
});