document.addEventListener('DOMContentLoaded', () => {
    // Обработка экрана загрузки
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        initApp();
    }, 3000);

    // Отображение поздравительного сообщения
    setTimeout(() => {
        const userName = 'JohnDoe';
        const accountAge = 15;
        const tokens = calculateTokens(accountAge);

        document.getElementById('user-message').textContent = `Username: ${userName}, congratulations!`;
        document.getElementById('account-info').textContent = `Account age: ${accountAge} months\nTokens awarded: ${tokens}`;
        document.getElementById('notification').style.display = 'flex';
    }, 3000);

    // Управление модальным окном при клике на иконку
    const tokenIcon = document.getElementById('token-icon');
    tokenIcon?.addEventListener('click', () => {
        const accountAgeInYears = Math.floor(15 / 12);
        document.getElementById('user-info-text').textContent = `You have been on Telegram for ${accountAgeInYears} year(s).`;
        document.getElementById('user-info-modal').style.display = 'flex';
    });

    document.querySelector('.close-button').addEventListener('click', () => {
        document.getElementById('user-info-modal').style.display = 'none';
    });

    document.getElementById('back-button').addEventListener('click', () => {
        window.location.hash = 'main';
        document.getElementById('user-info-modal').style.display = 'none';
    });

    // Управление меню и динамической подгрузкой контента
    const updateActiveMenu = (activePage) => {
        document.querySelectorAll('.menu-button').forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-page') === activePage);
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

    loadPageContent(currentPage);

    document.getElementById('boost-button')?.addEventListener('click', () => {
        window.location.hash = 'boost';
        updateActiveMenu('boost');
    });
	
	// Логика для кнопки задачи
	document.getElementById('task-join-community-button').addEventListener('click', function() {
    const taskButton = this;
    const taskStatus = taskButton.getAttribute('data-task-status');

    if (taskStatus === 'start') {
        // Открываем ссылку на сообщество
        window.open('https://community-link.com', '_blank');

        // Изменяем статус кнопки на "Check"
        taskButton.setAttribute('data-task-status', 'check');
        taskButton.textContent = 'Check';
    } else if (taskStatus === 'check') {
        // Проверяем выполнена ли задача (здесь можно добавить реальную проверку)
        const taskCompleted = true; // Для примера задача всегда выполнена

        if (taskCompleted) {
            // Изменяем статус кнопки на "Claim"
            taskButton.setAttribute('data-task-status', 'claim');
            taskButton.textContent = 'Claim';
        } else {
            alert('Task not completed yet!');
        }
    } else if (taskStatus === 'claim') {
        // Выдать награду пользователю
        alert('You claimed 500 NC!');
        
        // Блокируем задачу после получения награды
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

	// Пример: данные об аккаунте
	const accountAgeInMonths = 15; // Замените на реальные данные
	const { years, remainingMonths } = calculateAccountAge(accountAgeInMonths);

	// Отображаем возраст в модальном окне
	document.getElementById('account-years').textContent = years;
	document.getElementById('account-months').textContent = remainingMonths;

    // Привязка кошельков
    const displayConnectedWallets = () => {
        const wallets = [
            { id: 1, address: '0x1234567890abcdef', app: 'Telegram' },
            { id: 2, address: '0xabcdef1234567890', app: 'Another App' }
        ];

        const connectedWalletsContainer = document.getElementById('connected-wallets');
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

    document.getElementById('connect-wallet-button')?.addEventListener('click', () => {
        console.log('Connect Wallet button clicked');
        openWalletConnectModal();
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

		const getUserInfo = () => ({
			username: 'JohnDoe',
			accountAge: 15,
			tokens: 1000
		});

		setTimeout(initApp, 3000);
});