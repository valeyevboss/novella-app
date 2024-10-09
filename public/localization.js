function loadTranslations(lang) {
    fetch(`/locales/${lang}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Language not found, loading default language');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('freedurov-button').textContent = data.freedurov_button;
            document.getElementById('daily-reward-title').textContent = data.daily_rewards;
            document.getElementById('claim-reward-button').textContent = data.daily_checkin;
            document.getElementById('premium-reward-button').textContent = data.premium_checkin;
            document.getElementById('menu-main').textContent = data.main;
            document.getElementById('menu-task').textContent = data.task;
            document.getElementById('menu-friends').textContent = data.friends;
            document.getElementById('menu-airdrop').textContent = data.airdrop;
            document.getElementById('menu-leaders').textContent = data.leaders;
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
loadTranslations(lang);
