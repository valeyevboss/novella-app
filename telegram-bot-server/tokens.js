document.addEventListener('DOMContentLoaded', () => {
    const telegramId = getTelegramId();
    if (telegramId) {
        fetchTokens(telegramId);
    } else {
        console.error('Telegram ID не найден');
    }
});

async function fetchTokens(telegramId) {
    try {
        const response = await fetch(`/api/tokens/${telegramId}`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('token-balance').innerText = data.tokens;
        } else {
            console.error('Ошибка получения токенов:', await response.json());
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
    }
}

async function updateTokens(telegramId, newTokenCount) {
    try {
        const response = await fetch(`/api/tokens/${telegramId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tokens: newTokenCount })
        });
        if (!response.ok) {
            console.error('Ошибка обновления токенов:', await response.json());
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
    }
}
