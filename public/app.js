// Функция для обработки нажатия на кнопку задания
async function handleTaskButtonClick(event) {
    const button = event.target;
    const taskBlock = button.closest('.task-block');
    const taskId = taskBlock.dataset.taskId;

    if (button.classList.contains('task-button')) {
        switch (button.textContent) {
            case 'Start':
                button.textContent = 'Check';
                // Логика для начала выполнения задания (если нужна)
                break;

            case 'Check':
                button.textContent = 'Claim';
                // Логика для проверки выполнения задания (если нужна)
                break;

            case 'Claim':
                button.textContent = 'Completed';
                await claimTask(taskId);
                break;

            default:
                console.error('Неизвестный статус кнопки');
                break;
        }
    }
}

// Функция для начисления токенов
async function claimTask(taskId) {
    try {
        const telegramId = getTelegramId(); // Функция для получения telegramId пользователя
        const response = await fetch(`/tasks/claim/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ telegramId })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Вам зачислено ${data.tokens} токенов!`);
            updateUserBalance(data.tokens);
        } else {
            console.error('Ошибка при зачислении токенов:', data.error);
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
}

// Функция для обновления баланса пользователя
function updateUserBalance(tokens) {
    const balanceElement = document.getElementById('token-balance');
    if (balanceElement) {
        let currentBalance = parseInt(balanceElement.textContent, 10);
        balanceElement.textContent = currentBalance + tokens;
    }
}

// Функция для получения telegramId (реализуйте по своему усмотрению)
function getTelegramId() {
    // Например, можно получить из URL параметров
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('telegramId');
}

// Добавляем обработчик события для кнопок
document.addEventListener('click', handleTaskButtonClick);
