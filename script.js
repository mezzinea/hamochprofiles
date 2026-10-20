(function() {
    'use strict';

    const LANGS = ['fr', 'ar'];
    const DEFAULT_LANG = 'fr';
    const STORAGE_KEY = 'hamoch_lang';
    const WHATSAPP_NUMBER = '212660021006';

    let currentLang = DEFAULT_LANG;
    const t = key => I18N[currentLang][key];
    const waUrl = text => 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);

    // ============================================================
    // LANGUAGE
    // ============================================================
    const langButtons = document.querySelectorAll('#lang button');

    function readSavedLang() {
        const fromUrl = new URLSearchParams(window.location.search).get('lang');
        if (LANGS.includes(fromUrl)) return fromUrl;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (LANGS.includes(saved)) return saved;
        } catch (e) { /* storage unavailable */ }
        return DEFAULT_LANG;
    }

    function setLanguage(lang) {
        currentLang = LANGS.includes(lang) ? lang : DEFAULT_LANG;
        try { localStorage.setItem(STORAGE_KEY, currentLang); } catch (e) { /* storage unavailable */ }

        document.documentElement.lang = currentLang;
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        document.title = t('metaTitle');
        document.querySelector('meta[name="description"]').setAttribute('content', t('metaDesc'));
        document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
        langButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === currentLang));

        // WhatsApp links with a pre-filled message
        document.querySelectorAll('[data-wa]').forEach(a => { a.href = waUrl(t(a.dataset.wa)); });
        document.querySelectorAll('[data-wa-product]').forEach(a => {
            a.href = waUrl(t('waProduct').replace('{product}', t(a.dataset.waProduct)));
        });
        closeMenu();
    }

    langButtons.forEach(b => b.addEventListener('click', () => setLanguage(b.dataset.lang)));

    // ============================================================
    // HEADER & MOBILE MENU
    // ============================================================
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');

    function onScroll() {
        header.classList.toggle('solid', window.scrollY > 40 || nav.classList.contains('open'));
    }

    function closeMenu() {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        onScroll();
    }

    burger.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        burger.setAttribute('aria-expanded', open);
        onScroll();
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('scroll', onScroll, { passive: true });

    // ============================================================
    // REVEAL ON SCROLL
    // ============================================================
    const items = document.querySelectorAll('.section-head, .product, .for-card, .features, .idea, .showroom-media, .showroom-text');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        items.forEach(el => el.classList.add('reveal'));
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        items.forEach(el => observer.observe(el));
    }

    document.getElementById('year').textContent = new Date().getFullYear();
    setLanguage(readSavedLang());
    onScroll();
})();
