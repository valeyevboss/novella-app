const translations = {
    "en-US": {
        freedurov_button: "Support FreeDUROV",
        daily_rewards: "Daily Rewards",
        daily_checkin: "Daily Check in +{amount} $Novella",
        premium_checkin: "Premium Check-in",
        "personal-achievements-title": "Personal Achievements",
        "achievement-text-days": "Achievements for {days} days",
        "personal-settings-title": "Personal Settings",
        main: "Main",
        task: "Task",
        friends: "Friends",
        airdrop: "Airdrop",
        leaders: "Leaders",
        "task-subtitle": "Your Tasks",
        "section-title-ingame": "In-Game",
        "section-title-partners": "Partners",
        "friends-subtitle": "Your Friends",
        "friends-count": "You have {count} friends",
        "invite-button": "Invite Friends",
        "airdrop-subtitle": "Airdrop Information",
        "connectButton": "Connect Wallet",
        "warning-text": "Warning: Please check your connection",
        "airdrop-descript-title": "Airdrop Description",
        "airdrop-description-1": "Description 1",
        "airdrop-description-2": "Description 2",
        "airdrop-description-3": "Description 3",
        "listing-descript-title": "Listing Description",
        "listing-description-1": "Listing Info 1",
        "listing-description-2": "Listing Info 2",
        "leader-subtitle": "Leaders",
        "title-top100": "Top 100",
        "boost-score-button": "Boost Score"
    },
    "ru-RU": {
        freedurov_button: "Поддержать FreeDUROV",
        daily_rewards: "Ежедневные Награды",
        daily_checkin: "Ежедневный +{amount} $Novella",
        premium_checkin: "Премиум Проверка",
        "personal-achievements-title": "Личные Достижения",
        "achievement-text-days": "Достижения за {days} дней",
        "personal-settings-title": "Личные Настройки",
        main: "Главная",
        task: "Задача",
        friends: "Друзья",
        airdrop: "Возврат",
        leaders: "Лидеры",
        "task-subtitle": "Ваши Задачи",
        "section-title-ingame": "В Игре",
        "section-title-partners": "Партнеры",
        "friends-subtitle": "Ваши Друзья",
        "friends-count": "У вас {count} друзей",
        "invite-button": "Пригласить Друзей",
        "airdrop-subtitle": "Информация о Возврате",
        "connectButton": "Подключить Кошелек",
        "warning-text": "Предупреждение: Проверьте ваше соединение",
        "airdrop-descript-title": "Описание Возврата",
        "airdrop-description-1": "Описание 1",
        "airdrop-description-2": "Описание 2",
        "airdrop-description-3": "Описание 3",
        "listing-descript-title": "Описание Листа",
        "listing-description-1": "Информация о Листе 1",
        "listing-description-2": "Информация о Листе 2",
        "leader-subtitle": "Лидеры",
        "title-top100": "Топ 100",
        "boost-score-button": "Увеличить Оценку"
    },
    "uk-UA": {
        freedurov_button: "Підтримати FreeDUROV",
        daily_rewards: "Щоденні Нагороди",
        daily_checkin: "Щоденний +{amount} $Novella",
        premium_checkin: "Преміум Перевірка",
        "personal-achievements-title": "Особисті Досягнення",
        "achievement-text-days": "Досягнення за {days} днів",
        "personal-settings-title": "Особисті Налаштування",
        main: "Головна",
        task: "Завдання",
        friends: "Друзі",
        airdrop: "Аирдроп",
        leaders: "Лідери",
        "task-subtitle": "Ваші Завдання",
        "section-title-ingame": "В Грі",
        "section-title-partners": "Партнери",
        "friends-subtitle": "Ваші Друзі",
        "friends-count": "У вас {count} друзів",
        "invite-button": "Запросити Друзів",
        "airdrop-subtitle": "Інформація про Аирдроп",
        "connectButton": "Підключити Гаманець",
        "warning-text": "Попередження: Перевірте з'єднання",
        "airdrop-descript-title": "Опис Аирдропу",
        "airdrop-description-1": "Опис 1",
        "airdrop-description-2": "Опис 2",
        "airdrop-description-3": "Опис 3",
        "listing-descript-title": "Опис Листа",
        "listing-description-1": "Інформація про Лист 1",
        "listing-description-2": "Інформація про Лист 2",
        "leader-subtitle": "Лідери",
        "title-top100": "Топ 100",
        "boost-score-button": "Підвищити Бал"
    }
};

// Функция загрузки переводов
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
            const personalAchievementsTitle = document.getElementById("personal-achievements-title");
            const achievementTextDays = document.getElementById("achievement-text-days");
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
            const boostScoreButton = document.getElementById("boost-score-button");
            const titletop100 = document.getElementById("title-top100");
            
            // Применение переводов
            if (freedurovButton) freedurovButton.textContent = data.freedurov_button;
            if (dailyRewardTitle) dailyRewardTitle.textContent = data.daily_rewards;
            
            // Обновление награды с подстановкой
            const rewardAmount = 100; // Замените на актуальное значение
            if (claimRewardButton) claimRewardButton.textContent = data.daily_checkin.replace("{amount}", rewardAmount);
            if (premiumRewardButton) premiumRewardButton.textContent = data.premium_checkin;
            if (personalAchievementsTitle) personalAchievementsTitle.textContent = data['personal-achievements-title'];
            if (achievementTextDays) achievementTextDays.textContent = data['achievement-text-days'];
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
            if (friendsCount) friendsCount.textContent = data['friends-count'].replace("{count}", 5); // Замените на актуальное значение
            if (inviteButton) inviteButton.textContent = data['invite-button'];
            if (airdropSubtitle) airdropSubtitle.textContent = data['airdrop-subtitle'];
            if (connectwalletButton) connectwalletButton.textContent = data['connectButton'];
            if (warningText) warningText.textContent = data['warning-text'];
            if (airdropDescriptTitle) airdropDescriptTitle.textContent = data['airdrop-descript-title'];
            if (airdropDescription1) airdropDescription1.textContent = data['airdrop-description-1'];
            if (airdropDescription2) airdropDescription2.textContent = data['airdrop-description-2'];
            if (airdropDescription3) airdropDescription3.textContent = data['airdrop-description-3'];
            if (listingDescriptTitle) listingDescriptTitle.textContent = data['listing-descript-title'];
            if (listingDescription1) listingDescription1.textContent = data['listing-description-1'];
            if (listingDescription2) listingDescription2.textContent = data['listing-description-2'];
            if (leaderSubtitle) leaderSubtitle.textContent = data['leader-subtitle'];
            if (boostScoreButton) boostScoreButton.textContent = data['boost-score-button'];
            if (titletop100) titletop100.textContent = data['title-top100'];
        })
        .catch((error) => {
            console.error('Error loading translations:', error);
            // При ошибке загрузки используем язык по умолчанию
            const defaultLang = 'en-US';
            loadTranslations(defaultLang);
        });
}

// Определяем язык, который будет использоваться
const userLang = navigator.language || navigator.userLanguage; 
const lang = userLang.startsWith('ru') ? 'ru-RU' : userLang.startsWith('uk') ? 'uk-UA' : 'en-US';

// Загружаем переводы на выбранном языке
loadTranslations(lang);