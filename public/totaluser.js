async function fetchTotalUsers() {
    try {
        const response = await fetch('/total-users');
        const data = await response.json();
        
        if (response.ok) {
            document.querySelector('.total-users').textContent = `Total: ${data.totalUsers} users`; // Обновляем текст на странице
        } else {
            console.error('Error fetching total users:', data.error);
        }
    } catch (error) {
        console.error('Error fetching total users:', error);
    }
}

// Вызываем функцию при загрузке страницы
window.onload = fetchTotalUsers;