/* ===================================
   CIC信用情報開示 完全ガイド
   JavaScript - Mobile First
   =================================== */

// State
let currentSection = 0;
const totalSections = 11;

// DOM Elements
const sections = document.querySelectorAll('.section');
const stepDots = document.querySelectorAll('.step-dot');
const progressFill = document.getElementById('progressFill');
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');
const overlay = document.getElementById('overlay');
const sideMenuLinks = document.querySelectorAll('.side-menu-nav a');

// ===================================
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    // Load saved progress
    const savedSection = localStorage.getItem('cicGuideSection');
    if (savedSection !== null) {
        const saved = parseInt(savedSection);
        if (saved > 0 && saved < totalSections) {
            // Ask user if they want to continue
            if (confirm('前回の続きから再開しますか？')) {
                goToSection(saved);
            }
        }
    }

    updateProgress();
    initializeEventListeners();
    initMemoInput();
});

// ===================================
// Navigation Functions
// ===================================
function nextSection() {
    if (currentSection < totalSections - 1) {
        goToSection(currentSection + 1);
    }
}

function prevSection() {
    if (currentSection > 0) {
        goToSection(currentSection - 1);
    }
}

function goToSection(index) {
    // Hide current section
    sections[currentSection].classList.remove('active');
    stepDots[currentSection].classList.remove('active');

    // Mark previous sections as completed
    for (let i = 0; i < index; i++) {
        stepDots[i].classList.add('completed');
    }

    // Show new section
    currentSection = index;
    sections[currentSection].classList.add('active');
    stepDots[currentSection].classList.add('active');
    stepDots[currentSection].classList.remove('completed');

    // Clear completed for future sections
    for (let i = currentSection + 1; i < totalSections; i++) {
        stepDots[i].classList.remove('completed');
    }

    // Update progress bar
    updateProgress();

    // Save progress
    localStorage.setItem('cicGuideSection', currentSection);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close menu if open
    closeSideMenu();

    // STEP4 (index 5) - Show saved receipt number
    if (index === 5) {
        updateStep4Display();
    }

    // Haptic feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

function updateProgress() {
    const progress = (currentSection / (totalSections - 1)) * 100;
    progressFill.style.width = `${progress}%`;
}

// ===================================
// Side Menu
// ===================================
function openSideMenu() {
    sideMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSideMenu() {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ===================================
// Collapsible
// ===================================
function toggleCollapsible(header) {
    const collapsible = header.closest('.collapsible');
    collapsible.classList.toggle('active');
}

// ===================================
// Event Listeners
// ===================================
function initializeEventListeners() {
    // Menu buttons
    if (menuBtn) {
        menuBtn.addEventListener('click', openSideMenu);
    }

    if (closeMenu) {
        closeMenu.addEventListener('click', closeSideMenu);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSideMenu);
    }

    // Side menu links
    sideMenuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionIndex = parseInt(this.getAttribute('data-section'));
            goToSection(sectionIndex);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            nextSection();
        } else if (e.key === 'ArrowLeft') {
            prevSection();
        } else if (e.key === 'Escape') {
            closeSideMenu();
        }
    });

    // Swipe navigation
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 80;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                nextSection();
            } else {
                // Swipe right - previous
                prevSection();
            }
        }
    }

    // Step dot clicks
    stepDots.forEach((dot, index) => {
        dot.addEventListener('click', function () {
            // Only allow going to completed sections or the next one
            if (index <= currentSection + 1) {
                goToSection(index);
            }
        });
        dot.style.cursor = 'pointer';
        dot.style.pointerEvents = 'auto';
    });

    // Make step indicator clickable
    const stepIndicator = document.getElementById('stepIndicator');
    if (stepIndicator) {
        stepIndicator.style.pointerEvents = 'auto';
    }

    // Checkbox items - add satisfying feedback
    const checkItems = document.querySelectorAll('.check-item');
    checkItems.forEach(item => {
        item.addEventListener('click', function () {
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(5);
            }
        });
    });

    // Phone button - store number for later
    const phoneButton = document.querySelector('.phone-button');
    if (phoneButton) {
        phoneButton.addEventListener('click', function () {
            // Track that user clicked the phone button
            localStorage.setItem('cicGuidePhoneCalled', 'true');
        });
    }

    // Memo input handling is now done by initMemoInput()

    // External links - add small delay for better UX
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Add visual feedback
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 300);
        });
    });
}

// ===================================
// Utility Functions
// ===================================

// Check if all required items are checked
function checkAllRequired() {
    const requiredItems = document.querySelectorAll('.check-item.required .check-input');
    let allChecked = true;

    requiredItems.forEach(item => {
        if (!item.checked) {
            allChecked = false;
        }
    });

    return allChecked;
}

// Clear all saved data
function clearProgress() {
    localStorage.removeItem('cicGuideSection');
    localStorage.removeItem('cicGuidePhoneCalled');
    localStorage.removeItem('cicGuideReceiptNumber');
    goToSection(0);
}

// ===================================
// Service Worker for PWA (optional)
// ===================================
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
*/

// ===================================
// Accessibility
// ===================================

// Announce section changes for screen readers
function announceSection(index) {
    const section = sections[index];
    const heading = section.querySelector('h1, h2');

    if (heading) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = heading.textContent;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// ===================================
// STEP4 - Receipt Number Display
// ===================================

let expiryInterval = null;

function updateStep4Display() {
    const savedNumber = localStorage.getItem('cicGuideReceiptNumber');
    const savedTime = localStorage.getItem('cicGuideReceiptTime');

    const savedNumberCard = document.getElementById('savedNumberCard');
    const noNumberWarning = document.getElementById('noNumberWarning');
    const savedNumberDisplay = document.getElementById('savedNumberDisplay');
    const expiryTimeEl = document.getElementById('expiryTime');
    const copyCheck = document.getElementById('copyCheck');

    if (!savedNumberCard || !noNumberWarning) return;

    // Check if we have a valid 6-digit number
    if (savedNumber && savedNumber.length === 6) {
        // Show the number card
        savedNumberCard.style.display = 'block';
        noNumberWarning.style.display = 'none';

        // Display the number
        savedNumberDisplay.textContent = savedNumber;

        // Calculate remaining time (1 hour from save time)
        if (savedTime) {
            startExpiryCountdown(parseInt(savedTime));
        } else {
            expiryTimeEl.textContent = '約60分';
        }

        // Reset copy check
        if (copyCheck) {
            copyCheck.classList.remove('active');
        }
    } else {
        // Show warning
        savedNumberCard.style.display = 'none';
        noNumberWarning.style.display = 'block';
    }
}

function startExpiryCountdown(savedTime) {
    const expiryTimeEl = document.getElementById('expiryTime');
    if (!expiryTimeEl) return;

    // Clear any existing interval
    if (expiryInterval) {
        clearInterval(expiryInterval);
    }

    // 1 hour in milliseconds
    const oneHour = 60 * 60 * 1000;
    const expiryTime = savedTime + oneHour;

    function updateCountdown() {
        const now = Date.now();
        const remaining = expiryTime - now;

        if (remaining <= 0) {
            expiryTimeEl.textContent = '期限切れ';
            expiryTimeEl.style.color = 'var(--danger)';
            clearInterval(expiryInterval);
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        if (minutes > 0) {
            expiryTimeEl.textContent = `${minutes}分${seconds}秒`;
        } else {
            expiryTimeEl.textContent = `${seconds}秒`;
            expiryTimeEl.style.color = 'var(--danger)';
        }

        // Warning color when less than 10 minutes
        if (minutes < 10) {
            expiryTimeEl.style.color = 'var(--warning)';
        }
        if (minutes < 5) {
            expiryTimeEl.style.color = 'var(--danger)';
        }
    }

    updateCountdown();
    expiryInterval = setInterval(updateCountdown, 1000);
}

function copyReceiptNumber() {
    const savedNumber = localStorage.getItem('cicGuideReceiptNumber');
    const copyBtn = document.getElementById('copyNumberBtn');
    const copyCheck = document.getElementById('copyCheck');

    if (!savedNumber || savedNumber.length !== 6) {
        alert('受付番号が入力されていません');
        return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(savedNumber).then(() => {
        // Visual feedback
        if (copyBtn) {
            copyBtn.classList.add('copied');
            copyBtn.querySelector('span').textContent = 'コピー済';

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.querySelector('span').textContent = 'コピー';
            }, 2000);
        }

        // Check the action step
        if (copyCheck) {
            copyCheck.classList.add('active');
        }

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = savedNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        if (copyBtn) {
            copyBtn.classList.add('copied');
            copyBtn.querySelector('span').textContent = 'コピー済';

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.querySelector('span').textContent = 'コピー';
            }, 2000);
        }
    });
}

// Enhanced memo input handler - also save the time
function initMemoInput() {
    const memoInput = document.querySelector('.memo-input');
    if (!memoInput) return;

    const savedNumber = localStorage.getItem('cicGuideReceiptNumber');
    if (savedNumber) {
        memoInput.value = savedNumber;
    }

    memoInput.addEventListener('input', function () {
        // Only allow numbers
        this.value = this.value.replace(/[^0-9]/g, '');

        // Save value
        localStorage.setItem('cicGuideReceiptNumber', this.value);

        // Only save time when we have 6 digits (complete number)
        if (this.value.length === 6) {
            localStorage.setItem('cicGuideReceiptTime', Date.now().toString());

            // Visual feedback - success state
            this.style.borderColor = 'var(--success)';
            this.style.background = 'var(--success-light)';

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([30, 30, 30]);
            }
        } else {
            // Reset style if not complete
            this.style.borderColor = '';
            this.style.background = '';
        }
    });

    // If we already have 6 digits, show success state
    if (savedNumber && savedNumber.length === 6) {
        memoInput.style.borderColor = 'var(--success)';
        memoInput.style.background = 'var(--success-light)';
    }
}

// ===================================
// Debug (remove in production)
// ===================================
console.log('CIC開示ガイド v2.1 - 受付番号導線改善');
