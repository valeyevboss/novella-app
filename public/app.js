document.addEventListener('DOMContentLoaded', () => {
    // Имитируем задержку загрузки
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }, 3000); // Замените 3000 на время анимации в миллисекундах
});

// Модальное окно с поздравлением пользователя
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const userName = 'JohnDoe'; // Замените на имя пользователя
        const accountAge = 15; // В месяцах
        const tokens = calculateTokens(accountAge);

        document.getElementById('user-message').textContent = `Username: ${userName}, congratulations!`;
        document.getElementById('account-info').textContent = `Account age: ${accountAge} months\nTokens awarded: ${tokens}`;
        document.getElementById('notification').style.display = 'flex';
    }, 3000); // Время задержки для имитации загрузки
});

// Обработка кнопок меню и динамическая загрузка контента
document.addEventListener('DOMContentLoaded', () => {
    const updateActiveMenu = (activePage) => {
        const buttons = document.querySelectorAll('.menu-button');
        buttons.forEach(button => {
            if (button.getAttribute('data-page') === activePage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    };

    const currentPage = window.location.hash.substring(1) || 'main';
    updateActiveMenu(currentPage);

    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const page = event.currentTarget.getAttribute('data-page');
            window.location.hash = page;
            updateActiveMenu(page);
            loadPageContent(page);
        });
    });

    const loadPageContent = (page) => {
        const pageContent = document.getElementById('page-content');
        switch (page) {
            case 'main':
                pageContent.innerHTML = `
                    <div id="main-page">
                        <img src="/images/NovellaCoin.png" alt="NovellaCoin" id="token-icon">
                        <p id="token-amount">1000 Tokens</p>
                        <button id="boost-button">Boost</button>
                    </div>`;
                break;
            case 'boost':
                pageContent.innerHTML = `
                    <div id="boost-page">
                        <img src="/images/NovellaCoin.png" alt="NovellaCoin" id="token-icon">
                        <p>Get buy more Novella tokens</p>
                        <div class="purchase-options">
                            <button class="purchase-button">
                                <span>20,000 NC</span>
                                <span>For 500 Telegram Stars</span>
                                <img src="/images/Starstelegram.png" alt="Telegram Stars">
                            </button>
                        </div>
                    </div>`;
                break;
            case 'task':
                pageContent.innerHTML = '<h2>Task Page</h2><p>Here are your tasks.</p>';
                break;
            case 'wallet':
                pageContent.innerHTML = '<h2>Wallet Page</h2><p>Manage your wallet here.</p>';
                break;
            case 'airdrop':
                pageContent.innerHTML = '<h2>Airdrop Page</h2><p>Check out airdrops here.</p>';
                break;
            default:
                pageContent.innerHTML = '<h2>404</h2><p>Page not found.</p>';
                break;
        }
    };

    loadPageContent(currentPage);

    document.getElementById('boost-button')?.addEventListener('click', () => {
        window.location.hash = 'boost';
        updateActiveMenu('boost');
    });
});

// Страница Wallet с возможностью привязки и отвязки кошельков
document.addEventListener('DOMContentLoaded', () => {
    const connectedWalletsContainer = document.getElementById('connected-wallets');

    const displayConnectedWallets = () => {
        const wallets = [
            { id: 1, address: '0x1234567890abcdef', app: 'Telegram' },
            { id: 2, address: '0xabcdef1234567890', app: 'Another App' }
        ];

        connectedWalletsContainer.innerHTML = '';
        wallets.forEach(wallet => {
            const walletItem = document.createElement('div');
            walletItem.className = 'wallet-item';
            walletItem.innerHTML = `
                <span>${wallet.address}</span>
                <button data-id="${wallet.id}" class="disconnect-button">Disconnect</button>
            `;
            connectedWalletsContainer.appendChild(walletItem);
        });

        document.querySelectorAll('.disconnect-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const walletId = event.currentTarget.getAttribute('data-id');
                disconnectWallet(walletId);
            });
        });
    };

    const disconnectWallet = (walletId) => {
        console.log(`Disconnect wallet with ID: ${walletId}`);
        displayConnectedWallets();
    };

    displayConnectedWallets();

    document.getElementById('connect-wallet-button').addEventListener('click', () => {
        console.log('Connect Wallet button clicked');
    });
});

// Привязка кошелька через внешнее окно или модальное окно
document.addEventListener('DOMContentLoaded', () => {
    const connectWalletButton = document.getElementById('connect-wallet-button');

    connectWalletButton.addEventListener('click', () => {
        const externalWalletConnectUrl = 'https://example.com/connect-wallet';
        window.open(externalWalletConnectUrl, '_blank');
    });

    const openWalletConnectModal = () => {
        const modalHtml = `
            <div id="wallet-connect-modal" class="modal">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h2>Connect Your Wallet</h2>
                    <p>Choose the wallet application you want to connect with:</p>
                    <button id="connect-telegram-wallet">Connect with Telegram</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.querySelector('.close-button').addEventListener('click', () => {
            document.getElementById('wallet-connect-modal').remove();
        });

        document.getElementById('connect-telegram-wallet').addEventListener('click', () => {
            window.open('https://example.com/connect-telegram', '_blank');
        });
    };
});

// Инициализация приложения и обработка ошибок
document.addEventListener('DOMContentLoaded', () => {
    const getUserInfo = () => {
        return {
            username: '', // Оставляем пустым, если username не установлен
            accountAge: 365, // Пример: возраст аккаунта в днях
            tokens: 1000 // Пример: количество токенов
        };
    };

    const initApp = () => {
        const userInfo = getUserInfo();

        if (!userInfo.username) {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('error-screen').style.display = 'block';
        } else {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('main-interface').style.display = 'block';
        }
    };

    setTimeout(initApp, 3000);
});