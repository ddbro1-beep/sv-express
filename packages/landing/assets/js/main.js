document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // INTERNATIONALIZATION (i18n) SYSTEM
    // ==========================================

    let currentLang = localStorage.getItem('sv-express-lang') || 'ru';

    // Translation function
    function t(key) {
        if (typeof translations === 'undefined') {
            console.warn('Translations not loaded');
            return key;
        }
        const value = translations[currentLang]?.[key];
        return value !== undefined ? value : key;
    }

    // Apply translations to elements with data-i18n attribute
    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = t(key);

            // Handle different element types
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder) {
                    el.placeholder = translation;
                }
            } else if (el.tagName === 'TITLE') {
                el.textContent = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Handle placeholders specifically
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = t(key);
            if (el.placeholder !== undefined) {
                el.placeholder = translation;
            }
        });

        // Handle select option translations (country names)
        document.querySelectorAll('option[data-i18n-key]').forEach(option => {
            const key = option.getAttribute('data-i18n-key');
            const translation = t(key);
            if (translation !== key) {
                option.textContent = translation;
            }
        });

        // Update lang attribute on html element
        document.documentElement.lang = currentLang;

        // Update language switcher UI
        updateLanguageSwitcherUI();

        // Recalculate prices after language change (updates button text)
        if (typeof recalc === 'function') {
            recalc();
        }
    }

    // Update language switcher UI
    function updateLanguageSwitcherUI() {
        document.querySelectorAll('.lang-switcher').forEach(switcher => {
            const lang = switcher.getAttribute('data-lang');
            if (lang === currentLang) {
                switcher.classList.remove('text-slate-400', 'hover:text-slate-600');
                switcher.classList.add('text-blue-600');
            } else {
                switcher.classList.remove('text-blue-600');
                switcher.classList.add('text-slate-400', 'hover:text-slate-600');
            }
        });
    }

    // Switch language
    function switchLanguage(lang) {
        if (lang === currentLang) return;
        currentLang = lang;
        localStorage.setItem('sv-express-lang', lang);
        applyTranslations();
    }

    // Initialize language switchers
    document.querySelectorAll('.lang-switcher').forEach(switcher => {
        switcher.addEventListener('click', () => {
            const lang = switcher.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });

    // Apply translations on page load
    if (typeof translations !== 'undefined') {
        applyTranslations();
    }

    // ==========================================
    // MOBILE MENU
    // ==========================================

    const mobileMenu = document.getElementById('mobile-menu');
    const openBtn = document.querySelector('[data-mobile-open]');
    const closers = mobileMenu ? Array.from(mobileMenu.querySelectorAll('[data-mobile-close]')) : [];

    if (mobileMenu && openBtn) {
        const toggleMenu = (show) => {
            mobileMenu.classList.toggle('hidden', !show);
            document.body.classList.toggle('overflow-hidden', show);
        };

        openBtn.addEventListener('click', () => toggleMenu(true));
        closers.forEach((el) => el.addEventListener('click', () => toggleMenu(false)));
    }

    // Simple calculator with 3 tariffs
    const weightRange = document.getElementById('weight-range');
    const weightValue = document.getElementById('weight-value');
    const priceEl = document.getElementById('calc-price');
    const noteEl = document.getElementById('calc-note');
    const fromCountry = document.getElementById('from-country');
    const toCountry = document.getElementById('to-country');
    const trackInput = document.getElementById('track-input');
    const trackButton = document.getElementById('track-button');

    const tariffs = {
        small: 95,   // до 10 кг
        medium: 156, // до 20 кг
        large: 245   // до 30 кг
    };

    const formatPrice = (value) => `~${value}€`;

    const syncCountryOptions = () => {
        if (!fromCountry || !toCountry) return;
        // Simple guard to avoid same country both sides if desired later
        if (fromCountry.value === toCountry.value) {
            // Swap to a sensible default if duplicates picked
            const options = Array.from(toCountry.options);
            const alternate = options.find((opt) => opt.value !== fromCountry.value);
            if (alternate) {
                toCountry.value = alternate.value;
            }
        }
    };

    const recalc = () => {
        try {
            if (!weightRange || !priceEl || !noteEl) return;

            let weight = Number(weightRange.value || 0);
            let price = null;
            let noteKey = 'calc.result.note.included';
            let noteClass = 'text-[10px] text-green-600 flex items-center gap-1 mt-1';

            if (weight <= 10) {
                price = tariffs.small;
                noteKey = 'calc.result.note.small';
            } else if (weight <= 20) {
                price = tariffs.medium;
                noteKey = 'calc.result.note.medium';
            } else if (weight <= 30) {
                price = tariffs.large;
                noteKey = 'calc.result.note.large';
            } else {
                noteKey = 'calc.result.note.custom';
                noteClass = 'text-[10px] text-orange-600 flex items-center gap-1 mt-1';
            }

            if (price !== null) {
                priceEl.textContent = formatPrice(price);
            } else {
                priceEl.textContent = t('calc.result.contact');
            }
            noteEl.textContent = t(noteKey);
            noteEl.className = noteClass;

            if (weightValue) {
                weightValue.textContent = `${weight} ${t('calc.weight.kg')}`;
            }
        } catch (err) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('Calc error:', err);
            }
        }
    };

    if (weightRange) {
        weightRange.addEventListener('input', recalc);
        weightRange.addEventListener('change', recalc);
    }
    if (fromCountry) {
        fromCountry.addEventListener('change', syncCountryOptions);
    }
    if (toCountry) {
        toCountry.addEventListener('change', syncCountryOptions);
    }

    recalc();

    // Tracking redirect to track.global
    const handleTrack = () => {
        if (!trackInput) return;
        const code = (trackInput.value || '').trim();
        if (!code) {
            trackInput.focus();
            return;
        }
        const url = `https://track.global/ru?tracking=${encodeURIComponent(code)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (trackButton) {
        trackButton.addEventListener('click', handleTrack);
    }
    if (trackInput) {
        trackInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleTrack();
            }
        });
    }

    // Lead form submission
    const leadForm = document.getElementById('lead-form-submit');
    const leadSubmitBtn = document.getElementById('lead-submit-btn');

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('lead-name');
            const phoneInput = document.getElementById('lead-phone');
            const originInput = document.getElementById('lead-origin');
            const destinationInput = document.getElementById('lead-destination');

            if (!nameInput || !phoneInput || !originInput || !destinationInput) {
                console.error('Form inputs not found');
                return;
            }

            const formData = {
                name: nameInput.value.trim(),
                phone: phoneInput.value.trim(),
                originCountryId: parseInt(originInput.value),
                destinationCountryId: parseInt(destinationInput.value)
            };

            // Validate
            if (!formData.name || !formData.phone) {
                alert(t('leadform.error.empty'));
                return;
            }

            // Disable button and show loading
            const originalText = leadSubmitBtn.textContent;
            leadSubmitBtn.disabled = true;
            leadSubmitBtn.textContent = t('leadform.submitting');
            leadSubmitBtn.classList.add('opacity-70', 'cursor-not-allowed');

            try {
                const apiUrl = 'https://api-oy5fw1sm7-gregs-projects-c94a974d.vercel.app/api/leads';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Success
                    alert(t('leadform.success'));
                    leadForm.reset();
                } else {
                    // Error from API
                    throw new Error(result.error || t('leadform.error.submit'));
                }
            } catch (error) {
                console.error('Lead submission error:', error);
                alert(t('leadform.error.submit'));
            } finally {
                // Restore button
                leadSubmitBtn.disabled = false;
                leadSubmitBtn.textContent = originalText;
                leadSubmitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            }
        });
    }
});
