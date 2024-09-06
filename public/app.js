import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

document.addEventListener('DOMContentLoaded', () => {
    // Функция для отображения экрана ошибки
    const showErrorScreen = () => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('error-screen').style.display = 'block';
    };

    // Функция для отображения основного интерфейса
    const showMainInterface = () => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-interface').style.display = 'block';
        initApp();
    };

    // Проверка бонуса и отображение приветственного экрана
    const checkBonus = () => {
        const hasReceivedBonus = localStorage.getItem('receivedBonus');

        if (hasReceivedBonus) {
            window.location.href = '/main';  // Если бонус уже был получен, переходим сразу на главную
        } else {
            document.getElementById('welcome-container').style.display = 'block'; // Показываем экран с бонусом
        }
    };

    document.getElementById('ok-btn').addEventListener('click', () => {
        localStorage.setItem('receivedBonus', true);  // Отмечаем, что бонус был получен
        document.getElementById('welcome-container').style.display = 'none'; // Скрываем приветственный экран
        showMainInterface();
    });

    // Имитация проверки состояния и загрузки данных
    setTimeout(() => {
        const isUserLoggedIn = true; // Здесь будет логика проверки
        if (isUserLoggedIn) {
            checkBonus();
        } else {
            showErrorScreen();
        }
    }, 2000);

    // Логика для подключения кошелька через WalletConnect
    const connectWallet = async () => {
        const connector = new WalletConnect({
            bridge: "https://bridge.walletconnect.org",
            qrcodeModal: QRCodeModal,
        });

        if (!connector.connected) {
            await connector.createSession();
        }

        // Подписка на события
        connector.on("connect", (error, payload) => {
            if (error) throw error;
            const { accounts } = payload.params[0];
            displayConnectedWallets(accounts);
        });

        connector.on("session_update", (error, payload) => {
            if (error) throw error;
            const { accounts } = payload.params[0];
            displayConnectedWallets(accounts);
        });

        connector.on("disconnect", (error) => {
            if (error) throw error;
            displayConnectedWallets([]);
        });
    };

    // Открытие модального окна для подключения кошелька
    const openWalletConnectModal = () => {
        const modalHtml = `
            <div id="wallet-connect-modal" class="modal">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h2>Connect Your Wallet</h2>
                    <button id="connect-wallet">Connect with WalletConnect</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.querySelector('.close-button').addEventListener('click', () => {
            document.getElementById('wallet-connect-modal').remove();
        });

        document.getElementById('connect-wallet').addEventListener('click', () => {
            connectWallet();
        });
    };

    // Открытие модального окна при загрузке страницы
    openWalletConnectModal();

    // Функция для отображения подключенных кошельков
    const displayConnectedWallets = (accounts) => {
        const connectedWalletsContainer = document.getElementById('connected-wallets');
        connectedWalletsContainer.innerHTML = '';
        accounts.forEach(account => {
            const walletItem = document.createElement('div');
            walletItem.className = 'wallet-item';
            walletItem.innerHTML = `<span>${account}</span>`;
            connectedWalletsContainer.appendChild(walletItem);
        });
    };

    // Дополнительные функции и обработчики

    // Логика для кнопки задачи
    document.getElementById('task-join-community-button').addEventListener('click', function() {
        const taskButton = this;
        const taskStatus = taskButton.getAttribute('data-task-status');

        if (taskStatus === 'start') {
            window.open('https://t.me/novellatoken_community', '_blank');
            taskButton.setAttribute('data-task-status', 'check');
            taskButton.textContent = 'Check';
        } else if (taskStatus === 'check') {
            const taskCompleted = true; // Для примера задача всегда выполнена

            if (taskCompleted) {
                taskButton.setAttribute('data-task-status', 'claim');
                taskButton.textContent = 'Claim';
            } else {
                alert('Task not completed yet!');
            }
        } else if (taskStatus === 'claim') {
            alert('You claimed 500 NC!');
            taskButton.disabled = true;
            taskButton.textContent = 'Claimed';
        }
    });

    // Расчёт и отображение возраста аккаунта
    const calculateAccountAge = (months) => {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return { years, remainingMonths };
    };

    const accountAgeInMonths = 15;
    const { years, remainingMonths } = calculateAccountAge(accountAgeInMonths);
    document.getElementById('account-years').textContent = years;
    document.getElementById('account-months').textContent = remainingMonths;
});