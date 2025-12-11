document.addEventListener('DOMContentLoaded', () => {
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
    const typeInputs = Array.from(document.querySelectorAll('input[name="type"]'));
    const fromCountry = document.getElementById('from-country');
    const toCountry = document.getElementById('to-country');
    const trackInput = document.getElementById('track-input');
    const trackButton = document.getElementById('track-button');

    const tariffs = {
        docs: 30,
        small: 95, // до 10 кг
        medium: 156 // до 20 кг
    };

    const formatPrice = (value) => `~${value}€`;

    const setWeightDisabled = (disabled) => {
        if (!weightRange) return;
        weightRange.disabled = disabled;
        weightRange.classList.toggle('input-disabled', disabled);
    };

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
            const selectedType = typeInputs.find((r) => r.checked);
            const type = (selectedType && selectedType.value) ? selectedType.value : 'used';
            const isDocs = type === 'docs';

            setWeightDisabled(isDocs);

            let weight = Number(weightRange.value || 0);
            if (isDocs) {
                weight = 0.5;
            }
            let price = null;
            let note = 'Включен забор и таможня';
            let noteClass = 'text-[10px] text-green-600 flex items-center gap-1 mt-1';

            if (isDocs) {
                price = tariffs.docs;
                note = 'Тариф для документов до 0.5 кг';
            } else if (weight <= 10) {
                price = tariffs.small;
                note = 'Тариф посылка до 10 кг';
            } else if (weight <= 20) {
                price = tariffs.medium;
                note = 'Тариф посылка до 20 кг';
            } else {
                note = 'Нужен индивидуальный расчёт — свяжитесь с менеджером';
                noteClass = 'text-[10px] text-orange-600 flex items-center gap-1 mt-1';
            }

            if (price !== null) {
                priceEl.textContent = formatPrice(price);
            } else {
                priceEl.textContent = 'Свяжитесь с менеджером';
            }
            noteEl.textContent = note;
            noteEl.className = noteClass;

            if (weightValue) {
                weightValue.textContent = isDocs ? 'до 0.5 кг' : `${weight} кг`;
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
    if (typeInputs.length) {
        typeInputs.forEach((el) => {
            el.addEventListener('change', recalc);
            el.addEventListener('input', recalc);
        });
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
});
