document.addEventListener('DOMContentLoaded', () => {
    // 1. Плавное появление страницы
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        setTimeout(() => mainContent.classList.add('page-loaded'), 50);
    }

    // 2. Плавный уход со страницы при клике на меню
    const links = document.querySelectorAll('a.nav-link, a.nav-card');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetUrl = link.getAttribute('href');
            if (targetUrl.startsWith('#') || targetUrl.startsWith('http') || targetUrl.startsWith('tel') || link.hasAttribute('target')) return;

            e.preventDefault();
            mainContent.classList.remove('page-loaded');
            setTimeout(() => window.location.href = targetUrl, 350);
        });
    });

    // 3. Подсветка активной кнопки меню
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) item.classList.add('active');
    });

    // 4. Логика кнопок "Подробнее"
    const expandButtons = document.querySelectorAll('.expand-btn');
    expandButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetWrapper = document.getElementById(targetId);
            const isExpanded = targetWrapper.classList.contains('expanded');

            // Запоминаем изначальный текст кнопки
            if (!this.hasAttribute('data-original-text')) {
                this.setAttribute('data-original-text', this.innerHTML);
            }

            if (isExpanded) {
                targetWrapper.classList.remove('expanded');
                this.innerHTML = this.getAttribute('data-original-text');
            } else {
                targetWrapper.classList.add('expanded');
                this.innerHTML = 'Скрыть &uarr;';
            }
        });
    });

    // 5. Логика Тумблера Тёмной темы
    const themeCheckbox = document.getElementById('theme-checkbox');

    // Устанавливаем положение тумблера при загрузке
    if (document.documentElement.classList.contains('dark')) {
        if(themeCheckbox) themeCheckbox.checked = true;
    }

    // Слушаем переключение тумблера
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }
});