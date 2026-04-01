document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const pageCache = {};

    // --- ЛОГИКА МУЛЬТИЯЗЫЧНОСТИ ---
    let currentLang = localStorage.getItem('lang') || 'ru';
    if (currentLang === 'en') document.body.classList.add('lang-en');

    // Словари заголовков вкладок
    const pageTitles = {
        'index.html': { ru: 'Главная | Общежитие ЯРГУ', en: 'Home | YarSU Dormitory' },
        'rules.html': { ru: 'Правила | Общежитие ЯРГУ', en: 'Rules | YarSU Dormitory' },
        'life.html': { ru: 'Быт | Общежитие ЯРГУ', en: 'Life | YarSU Dormitory' },
        'schedule.html': { ru: 'Доступ | Общежитие ЯРГУ', en: 'Access | YarSU Dormitory' },
        'contacts.html': { ru: 'Контакты | Общежитие ЯРГУ', en: 'Contacts | YarSU Dormitory' },
        '': { ru: 'Главная | Общежитие ЯРГУ', en: 'Home | YarSU Dormitory' } // для корня сайта
    };

    function updatePageTitle(url) {
        const page = url || window.location.pathname.split('/').pop() || 'index.html';
        const isEn = document.body.classList.contains('lang-en');
        if (pageTitles[page]) document.title = isEn ? pageTitles[page].en : pageTitles[page].ru;
    }
    updatePageTitle(); 

    // Перехват клика по кнопке языка
    document.body.addEventListener('click', (e) => {
        const langBtn = e.target.closest('#lang-toggle');
        if (langBtn) {
            currentLang = currentLang === 'en' ? 'ru' : 'en';
            localStorage.setItem('lang', currentLang);
            
            if (currentLang === 'en') document.body.classList.add('lang-en');
            else document.body.classList.remove('lang-en');
            
            langBtn.innerText = currentLang === 'en' ? 'RU' : 'EN';
            updatePageTitle(window.location.pathname.split('/').pop());
        }
    });

    // Установка текста кнопки при загрузке
    const initialLangBtn = document.getElementById('lang-toggle');
    if (initialLangBtn) initialLangBtn.innerText = currentLang === 'en' ? 'RU' : 'EN';

    function initPageLogic() {
        // Логика кнопок "Подробнее" (теперь двуязычная)
        const expandButtons = document.querySelectorAll('.expand-btn');
        expandButtons.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const targetWrapper = document.getElementById(targetId);
                const isExpanded = targetWrapper.classList.contains('expanded');

                if (!this.hasAttribute('data-original-html')) {
                    this.setAttribute('data-original-html', this.innerHTML);
                }

                if (isExpanded) {
                    targetWrapper.classList.remove('expanded');
                    this.innerHTML = this.getAttribute('data-original-html');
                } else {
                    targetWrapper.classList.add('expanded');
                    this.innerHTML = '<span data-lang="ru">Скрыть &uarr;</span><span data-lang="en">Hide &uarr;</span>';
                }
            });
        });

        // Подсветка меню
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active', 'font-semibold', 'text-slate-700');
            item.classList.add('text-slate-600', 'font-medium');
            if (item.getAttribute('href') === currentPage) {
                item.classList.add('active', 'font-semibold', 'text-slate-700');
                item.classList.remove('text-slate-600', 'font-medium');
            }
        });

        // Пасхалка 2
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

    // Навигация
    async function prefetchPage(url) {
        if (!pageCache[url]) {
            try {
                const response = await fetch(url);
                pageCache[url] = await response.text();
            } catch (e) { console.error('Error prefetching:', e); }
        }
    }

    async function navigateTo(url, pushHistory = true) {
        if (!mainContent) return;
        mainContent.classList.remove('page-loaded');
        if (!pageCache[url]) await prefetchPage(url);
        
        const html = pageCache[url];
        if (!html) { window.location.href = url; return; }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.getElementById('main-content');

        setTimeout(() => {
            updatePageTitle(url);
            mainContent.innerHTML = newMain.innerHTML;
            mainContent.className = newMain.className;
            if (pushHistory) window.history.pushState({ url }, '', url);
            initPageLogic();
            requestAnimationFrame(() => setTimeout(() => mainContent.classList.add('page-loaded'), 20));
        }, 200);
    }

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

    document.body.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a.nav-link, a.nav-card');
        if (link) {
            const targetUrl = link.getAttribute('href');
            if (!targetUrl.startsWith('#') && !targetUrl.startsWith('http') && !targetUrl.startsWith('tel')) prefetchPage(targetUrl);
        }
    });

    window.addEventListener('popstate', (e) => {
        const url = e.state?.url || window.location.pathname.split('/').pop() || 'index.html';
        navigateTo(url, false);
    });

    // Тумблер темы
    const themeCheckbox = document.getElementById('theme-checkbox');
    let themeSwitchCount = 0;
    if (document.documentElement.classList.contains('dark') && themeCheckbox) themeCheckbox.checked = true;

    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function() {
            const isDark = this.checked;
            const toggleTheme = () => {
                if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
                else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
            };

            if (document.startViewTransition) {
                document.documentElement.classList.add('view-transition-active');
                const transition = document.startViewTransition(toggleTheme);
                transition.finished.finally(() => document.documentElement.classList.remove('view-transition-active'));
            } else {
                document.documentElement.classList.add('theme-transitioning');
                toggleTheme();
                setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 250);
            }

            const currentUrl = window.location.pathname.split('/').pop() || 'index.html';
            if (currentUrl === 'contacts.html') {
                themeSwitchCount++;
                if (themeSwitchCount === 10) {
                    window.open('https://radika1.link/2026/03/31/7FC36A8A-F32F-459D-9613-5AD6EDA9BA92_1_105_c294db6f3a700fbe4.jpeg', '_blank');
                    themeSwitchCount = 0;
                }
            } else { themeSwitchCount = 0; }
        });
    }

    initPageLogic();
    setTimeout(() => mainContent.classList.add('page-loaded'), 50);
});
