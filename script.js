(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = document.getElementById('nav');
    const toggle = nav.querySelector('.nav__toggle');
    const hero = document.querySelector('[data-hero]');
    const statement = document.querySelector('.statement');
    const statementText = document.querySelector('[data-words]');

    /* ---------- Mobile menu ---------- */
    const setMenu = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    /* ---------- Split statement into words ---------- */
    const words = [];
    if (statementText) {
        const raw = statementText.textContent.trim().split(/\s+/);
        statementText.textContent = '';
        raw.forEach(w => {
            const span = document.createElement('span');
            span.className = 'w';
            span.textContent = w;
            statementText.append(span, ' ');
            words.push(span);
        });
    }

    /* ---------- Scroll-linked effects (one rAF loop) ---------- */
    let ticking = false;
    const update = () => {
        const y = window.scrollY;
        const vh = window.innerHeight;

        nav.classList.toggle('is-scrolled', y > 10);

        if (!reduceMotion && hero) {
            const p = Math.min(y / vh, 1);
            hero.style.transform = `translateY(${p * 90}px) scale(${1 - p * 0.08})`;
            hero.style.opacity = String(Math.max(1 - p * 1.3, 0));
        }

        if (statement && words.length) {
            if (reduceMotion) {
                words.forEach(w => w.classList.add('on'));
            } else {
                const r = statement.getBoundingClientRect();
                const progress = Math.min(Math.max((vh * 0.35 - r.top) / (r.height - vh * 0.65), 0), 1);
                const lit = Math.round(progress * words.length);
                words.forEach((w, i) => w.classList.toggle('on', i < lit));
            }
        }
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();

    /* ---------- Reveal on scroll ---------- */
    document.querySelectorAll('[data-stagger]').forEach(group => {
        [...group.children].forEach((child, i) => child.style.setProperty('--delay', `${i * 90}ms`));
    });

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ---------- Active nav link ---------- */
    const links = [...nav.querySelectorAll('.nav__links a')];
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
            }
        });
    }, { rootMargin: '-50% 0px -50% 0px' });
    links.forEach(l => {
        const target = document.querySelector(l.getAttribute('href'));
        if (target) sectionObserver.observe(target);
    });

    /* ---------- Footer year ---------- */
    const year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
})();
