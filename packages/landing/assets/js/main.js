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

    // Tracking Modal Logic
    const trackingModal = document.getElementById('tracking-modal');
    const trackingLoading = document.getElementById('tracking-loading');
    const trackingContent = document.getElementById('tracking-content');
    const trackingError = document.getElementById('tracking-error');
    const trackingNumberEl = document.getElementById('tracking-number');
    const trackingStatusEl = document.getElementById('tracking-status');
    const trackingCarrierEl = document.getElementById('tracking-carrier');
    const trackingUpdateEl = document.getElementById('tracking-update');
    const trackingEventsBlock = document.getElementById('tracking-events-block');
    const trackingEventsEl = document.getElementById('tracking-events');
    const trackingFallbackLink = document.getElementById('tracking-fallback-link');
    const trackingExternalLink = document.getElementById('tracking-external-link');
    const trackingStatusIcon = document.getElementById('tracking-status-icon');
    const trackingRedirect = document.getElementById('tracking-redirect');
    const trackingRedirectLink = document.getElementById('tracking-redirect-link');
    const trackingRedirectNumber = document.getElementById('tracking-redirect-number');

    const showTrackingModal = () => {
        if (trackingModal) {
            trackingModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    };

    const hideTrackingModal = () => {
        if (trackingModal) {
            trackingModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    };

    const showTrackingLoading = () => {
        if (trackingLoading) trackingLoading.classList.remove('hidden');
        if (trackingContent) trackingContent.classList.add('hidden');
        if (trackingError) trackingError.classList.add('hidden');
        if (trackingRedirect) trackingRedirect.classList.add('hidden');
    };

    const showTrackingResult = (data) => {
        if (trackingLoading) trackingLoading.classList.add('hidden');
        if (trackingError) trackingError.classList.add('hidden');
        if (trackingRedirect) trackingRedirect.classList.add('hidden');
        if (trackingContent) trackingContent.classList.remove('hidden');

        if (trackingNumberEl) trackingNumberEl.textContent = data.trackingNumber;
        if (trackingStatusEl) trackingStatusEl.textContent = data.currentStatus || t('tracking.modal.inprogress');
        if (trackingCarrierEl) {
            trackingCarrierEl.textContent = data.carrier ? `${t('tracking.modal.carrier')}: ${data.carrier}` : '';
        }
        if (trackingUpdateEl && data.lastUpdate) {
            trackingUpdateEl.textContent = `${t('tracking.modal.updated')}: ${data.lastUpdate}`;
        }

        // Update status icon based on status
        if (trackingStatusIcon) {
            const status = (data.currentStatus || '').toLowerCase();
            if (status.includes('доставлен') || status.includes('delivered') || status.includes('вручен')) {
                trackingStatusIcon.className = 'w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0';
                trackingStatusIcon.innerHTML = '<span class="iconify" data-icon="lucide:check-circle" data-width="20"></span>';
            } else if (status.includes('в пути') || status.includes('transit') || status.includes('отправлен')) {
                trackingStatusIcon.className = 'w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0';
                trackingStatusIcon.innerHTML = '<span class="iconify" data-icon="lucide:truck" data-width="20"></span>';
            } else {
                trackingStatusIcon.className = 'w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0';
                trackingStatusIcon.innerHTML = '<span class="iconify" data-icon="lucide:package" data-width="20"></span>';
            }
        }

        // Show events if available
        if (data.events && data.events.length > 0 && trackingEventsBlock && trackingEventsEl) {
            trackingEventsBlock.classList.remove('hidden');
            trackingEventsEl.innerHTML = data.events.map(event => `
                <div class="flex gap-3 text-sm">
                    <div class="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                    <div class="flex-1">
                        <p class="text-slate-700">${event.status}</p>
                        <p class="text-xs text-slate-400">${[event.date, event.time, event.location].filter(Boolean).join(' • ')}</p>
                    </div>
                </div>
            `).join('');
        } else if (trackingEventsBlock) {
            trackingEventsBlock.classList.add('hidden');
        }

        // Update external links
        if (data.fallbackUrl) {
            if (trackingExternalLink) trackingExternalLink.href = data.fallbackUrl;
        }
    };

    const showTrackingError = (fallbackUrl) => {
        if (trackingLoading) trackingLoading.classList.add('hidden');
        if (trackingContent) trackingContent.classList.add('hidden');
        if (trackingRedirect) trackingRedirect.classList.add('hidden');
        if (trackingError) trackingError.classList.remove('hidden');

        if (trackingFallbackLink && fallbackUrl) {
            trackingFallbackLink.href = fallbackUrl;
        }
        if (trackingExternalLink && fallbackUrl) {
            trackingExternalLink.href = fallbackUrl;
        }
    };

    const showTrackingRedirect = (trackingNumber, fallbackUrl) => {
        if (trackingLoading) trackingLoading.classList.add('hidden');
        if (trackingContent) trackingContent.classList.add('hidden');
        if (trackingError) trackingError.classList.add('hidden');
        if (trackingRedirect) trackingRedirect.classList.remove('hidden');

        if (trackingRedirectNumber) {
            trackingRedirectNumber.textContent = trackingNumber;
        }
        if (trackingRedirectLink && fallbackUrl) {
            trackingRedirectLink.href = fallbackUrl;
        }
        if (trackingExternalLink && fallbackUrl) {
            trackingExternalLink.href = fallbackUrl;
        }
    };

    // Close modal handlers
    if (trackingModal) {
        trackingModal.querySelectorAll('[data-tracking-close]').forEach(el => {
            el.addEventListener('click', hideTrackingModal);
        });
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !trackingModal.classList.contains('hidden')) {
                hideTrackingModal();
            }
        });
    }

    // Tracking with API proxy
    const handleTrack = async () => {
        if (!trackInput) return;
        const code = (trackInput.value || '').trim();
        if (!code) {
            trackInput.focus();
            return;
        }

        const fallbackUrl = `https://track.global/${currentLang}?tracking=${encodeURIComponent(code)}`;

        // Show modal with loading state
        showTrackingModal();
        showTrackingLoading();

        try {
            // Try our API first - use relative URL for same-origin or configured API URL
            const apiBaseUrl = window.SV_EXPRESS_API_URL || '';
            const apiUrl = `${apiBaseUrl}/api/tracking/${encodeURIComponent(code)}?lang=${currentLang}`;
            const response = await fetch(apiUrl);
            const result = await response.json();

            if (result.success && result.data) {
                if (result.data.found) {
                    showTrackingResult(result.data);
                } else if (result.data.requiresRedirect) {
                    // Service available but needs redirect to track.global
                    showTrackingRedirect(code, result.data.fallbackUrl || fallbackUrl);
                } else {
                    // Package genuinely not found
                    showTrackingError(result.data.fallbackUrl || fallbackUrl);
                }
            } else {
                showTrackingError(fallbackUrl);
            }
        } catch (err) {
            console.warn('Tracking API error, using fallback:', err);
            // On any error, show redirect state (more positive UX)
            showTrackingRedirect(code, fallbackUrl);
        }
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
