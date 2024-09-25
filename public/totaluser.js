async function fetchTotalUsers() {
    try {
        const response = await fetch('/api/total-users'); // URL, который вы будете использовать для получения общего числа пользователей
        const data = await response.json();
        
        if (response.ok) {
            document.querySelector('.total-users').textContent = `${data.totalUsers} users`; // Обновляем текст на странице
        } else {
            console.error('Error fetching total users:', data.error);
        }
    } catch (error) {
        console.error('Error fetching total users:', error);
    }
}

// Вызываем функцию при загрузке страницы
window.onload = fetchTotalUsers;
