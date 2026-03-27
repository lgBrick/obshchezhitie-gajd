document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const pageCache = {}; // Кэш для загруженных страниц

    // Инициализация логики, которая должна работать на каждой странице
    function initPageLogic() {
        // Логика кнопок "Подробнее"
        const expandButtons = document.querySelectorAll('.expand-btn');
        expandButtons.forEach(btn => {
            // Удаляем старые слушатели, чтобы не было дублей при переходах
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const targetWrapper = document.getElementById(targetId);
                const isExpanded = targetWrapper.classList.contains('expanded');

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

        // Подсветка активной кнопки меню
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === currentPage) item.classList.add('active');
        });
    }

    // Предзагрузка страницы в фоне при наведении
    async function prefetchPage(url) {
        if (!pageCache[url]) {
            try {
                const response = await fetch(url);
                const html = await response.text();
                pageCache[url] = html;
            } catch (e) {
                console.error('Ошибка предзагрузки:', e);
            }
        }
    }

    // Функция плавной смены контента
    async function navigateTo(url, pushHistory = true) {
        if (!mainContent) return;

        // Плавный уход (чуть ускорили для динамики)
        mainContent.classList.remove('page-loaded');

        // Параллельно загружаем страницу, если ее нет в кэше
        if (!pageCache[url]) await prefetchPage(url);

        const html = pageCache[url];
        if (!html) { // Если ошибка сети - фоллбэк на обычный переход
            window.location.href = url;
            return;
        }

        // Парсим полученный HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.getElementById('main-content');

        // Ждем завершения анимации исчезновения (200ms вместо 350ms)
        setTimeout(() => {
            // Меняем тайтл и контент
            document.title = doc.title;
            mainContent.innerHTML = newMain.innerHTML;
            mainContent.className = newMain.className; // Сохраняем классы (отступы и т.д.)

            if (pushHistory) {
                window.history.pushState({ url }, '', url);
            }

            initPageLogic(); // Переподключаем скрипты для нового контента

            // Плавное появление
            requestAnimationFrame(() => {
                setTimeout(() => mainContent.classList.add('page-loaded'), 20);
            });
        }, 200);
    }

    // Перехват кликов по ссылкам
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a.nav-link, a.nav-card');
        if (!link) return;

        const targetUrl = link.getAttribute('href');
        // Игнорируем внешние ссылки, якоря и телефон
        if (targetUrl.startsWith('#') || targetUrl.startsWith('http') || targetUrl.startsWith('tel') || link.hasAttribute('target')) return;

        e.preventDefault();

        // Если клик по текущей странице - ничего не делаем
        const currentUrl = window.location.pathname.split('/').pop() || 'index.html';
        if (targetUrl === currentUrl) return;

        navigateTo(targetUrl);
    });

    // Перехват наведения для предзагрузки (магия скорости)
    document.body.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a.nav-link, a.nav-card');
        if (link) {
            const targetUrl = link.getAttribute('href');
            if (!targetUrl.startsWith('#') && !targetUrl.startsWith('http') && !targetUrl.startsWith('tel')) {
                prefetchPage(targetUrl);
            }
        }
    });

    // Обработка кнопок "Вперед/Назад" в браузере
    window.addEventListener('popstate', (e) => {
        const url = e.state?.url || window.location.pathname.split('/').pop() || 'index.html';
        navigateTo(url, false);
    });

    // Логика Тумблера Тёмной темы
    const themeCheckbox = document.getElementById('theme-checkbox');
    if (document.documentElement.classList.contains('dark') && themeCheckbox) {
        themeCheckbox.checked = true;
    }

    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function() {
            // 1. Включаем анимацию для всех элементов на странице
            document.documentElement.classList.add('theme-transitioning');

            // 2. Меняем тему
            if (this.checked) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }

            // 3. Выключаем анимацию сразу после её завершения (300мс)
            // Это освобождает процессор и убирает лаги при ховере кнопок
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 300);
        });
    }

    // Первичный запуск
    initPageLogic();
    setTimeout(() => mainContent.classList.add('page-loaded'), 50);
});