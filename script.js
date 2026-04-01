document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const pageCache = {}; // Кэш для загруженных страниц

    // Инициализация логики, которая должна работать на каждой странице
    function initPageLogic() {
        // Логика кнопок "Подробнее"
        const expandButtons = document.querySelectorAll('.expand-btn');
        expandButtons.forEach(btn => {
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

        // ================= ПОДСВЕТКА НИЖНЕГО МЕНЮ =================
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
            item.classList.add('text-slate-600', 'font-medium'); // Сбрасываем стили на обычные
            item.classList.remove('font-semibold', 'text-slate-700');

            // Если ссылка ведет на текущую страницу - выделяем ее
            if (item.getAttribute('href') === currentPage) {
                item.classList.add('active', 'font-semibold', 'text-slate-700');
                item.classList.remove('text-slate-600', 'font-medium');
            }
        });
        // ==========================================================

        // ПАСХАЛКА 2 (Кухня на life.html)
        const kitchenEmoji = document.getElementById('easter-egg-kitchen');
        if (kitchenEmoji) {
            const newKitchenEmoji = kitchenEmoji.cloneNode(true);
            kitchenEmoji.parentNode.replaceChild(newKitchenEmoji, kitchenEmoji);

            let kitchenClicks = 0;

            newKitchenEmoji.addEventListener('click', () => {
                kitchenClicks++;
                if (kitchenClicks === 4) {
                    window.open('https://radika1.link/2026/03/31/DANYd3c11b485608dc77.jpg', '_blank');
                    kitchenClicks = 0;
                }
            });
        }
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

        mainContent.classList.remove('page-loaded');

        if (!pageCache[url]) await prefetchPage(url);

        const html = pageCache[url];
        if (!html) {
            window.location.href = url;
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.getElementById('main-content');

        setTimeout(() => {
            document.title = doc.title;
            mainContent.innerHTML = newMain.innerHTML;
            mainContent.className = newMain.className;

            if (pushHistory) {
                window.history.pushState({ url }, '', url);
            }

            initPageLogic();

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
        if (targetUrl.startsWith('#') || targetUrl.startsWith('http') || targetUrl.startsWith('tel') || link.hasAttribute('target')) return;

        e.preventDefault();

        const currentUrl = window.location.pathname.split('/').pop() || 'index.html';
        if (targetUrl === currentUrl) return;

        navigateTo(targetUrl);
    });

    // Предзагрузка при наведении
    document.body.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a.nav-link, a.nav-card');
        if (link) {
            const targetUrl = link.getAttribute('href');
            if (!targetUrl.startsWith('#') && !targetUrl.startsWith('http') && !targetUrl.startsWith('tel')) {
                prefetchPage(targetUrl);
            }
        }
    });

    window.addEventListener('popstate', (e) => {
        const url = e.state?.url || window.location.pathname.split('/').pop() || 'index.html';
        navigateTo(url, false);
    });

    // Логика Тумблера Тёмной темы
    const themeCheckbox = document.getElementById('theme-checkbox');
    let themeSwitchCount = 0;

    if (document.documentElement.classList.contains('dark') && themeCheckbox) {
        themeCheckbox.checked = true;
    }

    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function() {
            const isDark = this.checked;

            const toggleTheme = () => {
                if (isDark) {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                }
            };

            if (document.startViewTransition) {
                document.documentElement.classList.add('view-transition-active');
                const transition = document.startViewTransition(toggleTheme);
                transition.finished.finally(() => {
                    document.documentElement.classList.remove('view-transition-active');
                });
            } else {
                document.documentElement.classList.add('theme-transitioning');
                toggleTheme();
                setTimeout(() => {
                    document.documentElement.classList.remove('theme-transitioning');
                }, 250);
            }

            // ПАСХАЛКА 1 (Контакты)
            const currentUrl = window.location.pathname.split('/').pop() || 'index.html';
            if (currentUrl === 'contacts.html') {
                themeSwitchCount++;
                if (themeSwitchCount === 10) {
                    window.open('https://radika1.link/2026/03/31/7FC36A8A-F32F-459D-9613-5AD6EDA9BA92_1_105_c294db6f3a700fbe4.jpeg', '_blank');
                    themeSwitchCount = 0;
                }
            } else {
                themeSwitchCount = 0;
            }
        });
    }

    initPageLogic();
    setTimeout(() => mainContent.classList.add('page-loaded'), 50);
});