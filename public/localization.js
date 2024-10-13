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
            const personalAchievementsTitle = document.getElementById("personal-achievements-title");
            const achievementTextDays = document.getElementById("achievement-text-days");
            const personalSettingsTitle = document.getElementById('personal-settings-title');
            const selectLanguageText = document.getElementById('select-language-text');
            const saveLanguageBtn = document.getElementById('save-language-btn');
            const closeLanguageBtn = document.getElementById('close-language-btn');
            const menuMain = document.getElementById('menu-main');
            const menuTask = document.getElementById('menu-task');
            const menuFriends = document.getElementById('menu-friends');
            const menuAirdrop = document.getElementById('menu-airdrop');
            const menuLeaders = document.getElementById('menu-leaders');
            const taskSubtitle = document.getElementById('task-subtitle');
            const sectionTitleIngame = document.getElementById('section-title-ingame');
            const sectionTitlePartners = document.getElementById('section-title-partners');
            const friendsSubtitle = document.getElementById('friends-subtitle');
            const refCodeTitle = document.getElementById("ref-сode-title");
            const refYouCodeText = document.getElementById("ref-youсode-text");
            const refActivateTitle = document.getElementById("ref-activate-title");
            const claimButton = document.getElementById("claim-button");
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
            const boostScoreButton = document.getElementById("boost-score-button");
            const titletop100 = document.getElementById("title-top100");
            
            // Применение переводов
            if (freedurovButton) freedurovButton.textContent = data.freedurov_button;
            if (dailyRewardTitle) dailyRewardTitle.textContent = data.daily_rewards;
            if (personalAchievementsTitle) personalAchievementsTitle.textContent = data['personal-achievements-title'];
            if (achievementTextDays) achievementTextDays.textContent = data['achievement-text-days'];
            if (personalSettingsTitle) personalSettingsTitle.textContent = data['personal-settings-title'];
            if (selectLanguageText) selectLanguageText.textContent = data['select-language-text'];
            if (saveLanguageBtn) saveLanguageBtn.textContent = data['save-language-btn'];
            if (closeLanguageBtn) closeLanguageBtn.textContent = data['close-language-btn'];
            if (menuMain) menuMain.textContent = data.main;
            if (menuTask) menuTask.textContent = data.task;
            if (menuFriends) menuFriends.textContent = data.friends;
            if (menuAirdrop) menuAirdrop.textContent = data.airdrop;
            if (menuLeaders) menuLeaders.textContent = data.leaders;
            if (taskSubtitle) taskSubtitle.textContent = data['task-subtitle'];
            if (sectionTitleIngame) sectionTitleIngame.textContent = data['section-title-ingame'];
            if (sectionTitlePartners) sectionTitlePartners.textContent = data['section-title-partners'];
            if (friendsSubtitle) friendsSubtitle.textContent = data['friends-subtitle'];
            if (refCodeTitle) refCodeTitle.textContent = data["ref-code-title"];
            if (refYouCodeText) refYouCodeText.textContent = data["ref-code-text-days"];
            if (refActivateTitle) refActivateTitle.textContent = data["ref-youсode-text"];
            if (claimButton) claimButton.textContent = data["claim-button"];
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
            if (boostScoreButton) boostScoreButton.textContent = data['boost-score-button'];
        })
        .catch(error => {
            console.error(error);
            if (lang !== 'en-US') {
                loadTranslations('en-US');
            }
        });
}

// Функция для инициализации локализации
function initLocalization() {
    const savedLang = localStorage.getItem('selectedLanguage'); // Проверяем сохранённый язык
    const userLang = savedLang || (navigator.language || 'en-US'); // Если нет сохранённого, используем язык браузера
    const supportedLangs = ['en-US', 'ru-RU', 'uk-UA'];
    const lang = supportedLangs.includes(userLang) ? userLang : 'en-US';

    loadTranslations(lang);
}

// Обработчик для сохранения выбранного языка
document.getElementById('save-language-btn')?.addEventListener('click', () => {
    const selectedLang = document.getElementById('country-select').value;
    localStorage.setItem('selectedLanguage', selectedLang); // Сохраняем язык в localStorage
    loadTranslations(selectedLang); // Загружаем переводы для выбранного языка
});

// Запускаем локализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена, начинаем локализацию');
    initLocalization();
});