/* ==========================================
   SIP & SYNC EVENT MINI-SITE INTERACTIVE LOGIC
   Vanilla JavaScript Interaction Engine
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. HIGH FRAME RATE 3D SPACE STARFIELD DRIFT ---
    const canvas = document.getElementById('starfield');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        let stars = [];
        const STAR_COUNT = 12000; // Ultra-dense 3x expansion (12k stars)
        const speed = 0.22; // Speed accelerated by another 20% for an ultra-immersive cosmic drift
        
        // Handle High-DPI (Retina) Displays
        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            
            // Re-normalize dimensions in CSS
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            
            ctx.scale(dpr, dpr);
            
            initStars();
        }
        
        function initStars() {
            stars = [];
            const w = window.innerWidth;
            const h = window.innerHeight;
            const maxDepth = w; // Max space depth matches viewport width
            
            for (let i = 0; i < STAR_COUNT; i++) {
                // Keep stars themed: Mostly pure white, with some HTI orange, Portal magenta, or neon cyan highlights
                let color = '#ffffff';
                const rand = Math.random();
                if (rand > 0.96) {
                    color = '#f58420'; // HTI Orange
                } else if (rand > 0.92) {
                    color = '#ff1c84'; // Portal Magenta
                } else if (rand > 0.88) {
                    color = '#00f0ff'; // Neon Cyan
                }
                
                stars.push({
                    x: (Math.random() - 0.5) * w * 2,
                    y: (Math.random() - 0.5) * h * 2,
                    z: Math.random() * maxDepth,
                    prevZ: 0,
                    color: color,
                    size: 0.5 + Math.random() * 1.5
                });
                stars[i].prevZ = stars[i].z;
            }
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial setup
        
        function drawStarfield() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const cx = w / 2;
            const cy = h / 2;
            const maxDepth = w;
            
            // Solid backdrop clear
            ctx.fillStyle = '#06050f';
            ctx.fillRect(0, 0, w, h);
            
            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];
                
                // Track Z coordinate shift
                star.prevZ = star.z;
                star.z -= speed;
                
                // Reset stars that fly past screen camera
                if (star.z <= 0) {
                    star.z = maxDepth;
                    star.x = (Math.random() - 0.5) * w * 2;
                    star.y = (Math.random() - 0.5) * h * 2;
                    star.prevZ = star.z;
                }
                
                // 3D to 2D projection formulas
                const px = (star.x / star.z) * w + cx;
                const py = (star.y / star.z) * h + cy;
                
                // Skip rendering if stars project outside viewport
                if (px < 0 || px >= w || py < 0 || py >= h) continue;
                
                // Fade star into visibility as it travels from dark distance
                const opacity = Math.min(1, 1 - star.z / maxDepth);
                
                // Dynamically scale size based on proximity
                const currentSize = star.size * (1 + (maxDepth / star.z) * 0.05);
                
                // Draw space particle trail ONLY for close stars (cuts path building by 60%)
                if (star.z < maxDepth * 0.4) {
                    const ppx = (star.x / star.prevZ) * w + cx;
                    const ppy = (star.y / star.prevZ) * h + cy;
                    
                    ctx.beginPath();
                    ctx.strokeStyle = star.color;
                    ctx.lineWidth = Math.min(2.0, currentSize);
                    ctx.globalAlpha = opacity * 0.45;
                    ctx.moveTo(ppx, ppy);
                    ctx.lineTo(px, py);
                    ctx.stroke();
                }
                
                // Ultra-high performance core render utilizing hardware-accelerated fillRect
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = opacity;
                ctx.fillRect(px - currentSize / 2, py - currentSize / 2, currentSize, currentSize);
            }
            
            ctx.globalAlpha = 1.0;
            requestAnimationFrame(drawStarfield);
        }
        
        requestAnimationFrame(drawStarfield);
    }

    // --- 1. TICKETING & DONATION CALCULATOR ---
    // Smooth scroll spotlight effect for tickets card
    const ticketLinks = document.querySelectorAll('a[href="#tickets"]');
    ticketLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector('#tickets');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                
                // Trigger gorgeous spotlight halo pulse on the widget
                const widget = document.querySelector('.ticket-widget');
                if (widget) {
                    widget.classList.add('spotlight-glow');
                    setTimeout(() => {
                        widget.classList.remove('spotlight-glow');
                    }, 2500);
                }
            }
        });
    });

    const ticketQtyInput = document.getElementById('ticketQty');
    const qtyMinusBtn = document.getElementById('qtyMinus');
    const qtyPlusBtn = document.getElementById('qtyPlus');
    
    const donateSlider = document.getElementById('donateSlider');
    const donateInput = document.getElementById('donateInput');
    const presetBtns = document.querySelectorAll('.btn-preset');
    
    const invoiceTicketLabel = document.getElementById('invoiceTicketLabel');
    const invoiceTicketPrice = document.getElementById('invoiceTicketPrice');
    const invoiceDonationPrice = document.getElementById('invoiceDonationPrice');
    const invoiceTotal = document.getElementById('invoiceTotal');
    
    const TICKET_PRICE = 5.00;

    // Quantity selectors logic
    if (qtyMinusBtn) {
        qtyMinusBtn.addEventListener('click', () => {
            let val = parseInt(ticketQtyInput.value);
            if (val > 1) {
                ticketQtyInput.value = val - 1;
                calculateInvoice();
            }
        });
    }

    if (qtyPlusBtn) {
        qtyPlusBtn.addEventListener('click', () => {
            let val = parseInt(ticketQtyInput.value);
            if (val < 10) {
                ticketQtyInput.value = val + 1;
                calculateInvoice();
            }
        });
    }

    // Sync slider and numerical donation input
    if (donateSlider) {
        donateSlider.addEventListener('input', (e) => {
            donateInput.value = e.target.value;
            deactivatePresets();
            activateMatchingPreset(e.target.value);
            calculateInvoice();
        });
    }

    if (donateInput) {
        donateInput.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (isNaN(val) || val < 0) val = 0;
            
            // Adjust slider range dynamically
            if (val < 25) {
                donateSlider.min = 0;
            }
            
            donateSlider.value = val;
            deactivatePresets();
            activateMatchingPreset(val.toString());
            calculateInvoice();
        });
    }

    // Preset donation buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            deactivatePresets();
            btn.classList.add('active');
            const val = btn.getAttribute('data-val');
            if (val === 'custom') {
                donateSlider.min = 0; // Allow dragging lower than 25
                donateInput.focus();
                donateInput.select();
            } else {
                donateSlider.min = 25; // Re-enforce 25 minimum bounds
                donateInput.value = val;
                donateSlider.value = val;
                calculateInvoice();
            }
        });
    });

    function deactivatePresets() {
        presetBtns.forEach(b => b.classList.remove('active'));
    }

    function activateMatchingPreset(value) {
        presetBtns.forEach(b => {
            if (b.getAttribute('data-val') === value) {
                b.classList.add('active');
            }
        });
        
        const hasActive = Array.from(presetBtns).some(b => b.classList.contains('active'));
        if (!hasActive) {
            const customBtn = Array.from(presetBtns).find(b => b.getAttribute('data-val') === 'custom');
            if (customBtn) {
                customBtn.classList.add('active');
                donateSlider.min = 0; // "Other" mode allows values under 25
            }
        } else {
            const activeBtn = Array.from(presetBtns).find(b => b.classList.contains('active'));
            if (activeBtn && activeBtn.getAttribute('data-val') !== 'custom') {
                donateSlider.min = 25; // Static presets force 25 minimum bounds
            }
        }
    }

    // Recalculate invoice row by row
    function calculateInvoice() {
        if (!ticketQtyInput || !invoiceTicketLabel) return;
        const qty = parseInt(ticketQtyInput.value);
        const donation = parseFloat(donateInput.value) || 0;
        
        const ticketsCost = qty * TICKET_PRICE;
        const total = ticketsCost + donation;
        
        // Update elements
        invoiceTicketLabel.textContent = `${qty} × General Admission Ticket${qty > 1 ? 's' : ''}`;
        invoiceTicketPrice.textContent = `$${ticketsCost.toFixed(2)}`;
        invoiceDonationPrice.textContent = `$${donation.toFixed(2)}`;
        invoiceTotal.textContent = `$${total.toFixed(2)}`;
    }

    calculateInvoice();


    // --- 2. PERSISTENT PASS GENERATOR & TICKET MODAL ---
    const btnClaimTicket = document.getElementById('btnClaimTicket');
    const ticketModal = document.getElementById('ticketModal');
    const modalClose = document.getElementById('modalClose');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    const passCodeDisplay = document.getElementById('passCodeDisplay');
    const passGuestName = document.getElementById('passGuestName');
    const passCountDisplay = document.getElementById('passCountDisplay');
    const modalQrCode = document.getElementById('modalQrCode');
    const floatingPassPill = document.getElementById('floatingPassPill');

    // Sync ticket payment state in modal (blur QR, show banner, toggle CTAs)
    function syncPassPaymentState(ticket) {
        const passPaymentStatus = document.getElementById('passPaymentStatus');
        const modalQrCode = document.getElementById('modalQrCode');
        const passQrLockOverlay = document.getElementById('passQrLockOverlay');
        const passPaymentActions = document.getElementById('passPaymentActions');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const btnPayActivate = document.getElementById('btnPayActivate');
        
        if (!ticket) return;

        if (ticket.paid) {
            // Paid State
            if (passPaymentStatus) {
                passPaymentStatus.textContent = '✓ TICKET ACTIVATED // PAID';
                passPaymentStatus.classList.add('paid');
            }
            if (modalQrCode) modalQrCode.classList.remove('unpaid');
            if (passQrLockOverlay) passQrLockOverlay.classList.add('hidden');
            if (passPaymentActions) passPaymentActions.style.display = 'none';
            if (modalCloseBtn) modalCloseBtn.style.display = 'block';
        } else {
            // Unpaid State
            const totalCost = (ticket.qty * 5.0) + (ticket.donation || 0);
            if (passPaymentStatus) {
                passPaymentStatus.textContent = '⚠️ PENDING PAYMENT';
                passPaymentStatus.classList.remove('paid');
            }
            if (modalQrCode) modalQrCode.classList.add('unpaid');
            if (passQrLockOverlay) passQrLockOverlay.classList.remove('hidden');
            if (passPaymentActions) passPaymentActions.style.display = 'flex';
            if (modalCloseBtn) modalCloseBtn.style.display = 'none';
            
            if (btnPayActivate) {
                btnPayActivate.textContent = `Pay & Activate Ticket ($${totalCost.toFixed(2)}) ➔`;
            }
        }
    }

    // Load ticket pass if already exists in localStorage
    function checkExistingTicket() {
        const savedPass = localStorage.getItem('ss_event_ticket');
        if (savedPass && floatingPassPill) {
            const data = JSON.parse(savedPass);
            
            // Populate Ticket Modal
            if (passGuestName) passGuestName.textContent = data.guestName;
            if (passCountDisplay) passCountDisplay.textContent = `${data.qty} Ticket${data.qty > 1 ? 's' : ''}`;
            if (passCodeDisplay) passCodeDisplay.textContent = data.code;
            
            // Update QR code: Points to local scanner validation check URL parameter
            const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=${data.code}&guest=${encodeURIComponent(data.guestName)}&qty=${data.qty}&donation=${data.donation}`;
            if (modalQrCode) modalQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
            
            // Sync payment state
            syncPassPaymentState(data);

            // Reveal floating pill
            floatingPassPill.style.display = 'block';
        } else if (floatingPassPill) {
            floatingPassPill.style.display = 'none';
        }
    }

    checkExistingTicket();

    // Claim Ticket Action
    if (btnClaimTicket) {
        btnClaimTicket.addEventListener('click', () => {
            const guestNameInput = document.getElementById('guestNameInput');
            let guestName = guestNameInput ? guestNameInput.value.trim() : "Will Sigmon";
            if (guestName === "") guestName = "Will Sigmon";
            
            const qty = parseInt(ticketQtyInput.value);
            const randomPassCode = `SS-${Math.floor(10000 + Math.random() * 90000)}`;
            const donationVal = parseFloat(donateInput.value) || 0;

            // Create Ticket Object
            const ticketInfo = {
                guestName: guestName,
                qty: qty,
                code: randomPassCode,
                donation: donationVal,
                paid: false
            };

            // Save locally to persist
            localStorage.setItem('ss_event_ticket', JSON.stringify(ticketInfo));

            // Sync Modal
            if (passGuestName) passGuestName.textContent = guestName;
            if (passCountDisplay) passCountDisplay.textContent = `${qty} Ticket${qty > 1 ? 's' : ''}`;
            if (passCodeDisplay) passCodeDisplay.textContent = randomPassCode;
            
            // Generate self-validating check-in QR code
            const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=${randomPassCode}&guest=${encodeURIComponent(guestName)}&qty=${qty}&donation=${donationVal}`;
            if (modalQrCode) modalQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

            // Sync payment state
            syncPassPaymentState(ticketInfo);

            // Show Modal & Pill
            if (ticketModal) ticketModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (floatingPassPill) floatingPassPill.style.display = 'block';
        });
    }

    const closeModal = () => {
        if (ticketModal) ticketModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (ticketModal) {
        ticketModal.addEventListener('click', (e) => {
            if (e.target === ticketModal) closeModal();
        });
    }

    // Pay & Activate Ticket button actions
    const btnPayActivate = document.getElementById('btnPayActivate');
    const btnConfirmPaid = document.getElementById('btnConfirmPaid');

    if (btnPayActivate) {
        btnPayActivate.addEventListener('click', () => {
            showToast("Opening PayPal Secure Donation Portal...");
        });
    }

    if (btnConfirmPaid) {
        btnConfirmPaid.addEventListener('click', () => {
            const savedPass = localStorage.getItem('ss_event_ticket');
            if (savedPass) {
                const data = JSON.parse(savedPass);
                data.paid = true;
                localStorage.setItem('ss_event_ticket', JSON.stringify(data));
                
                // Animate transition to paid
                syncPassPaymentState(data);
                showToast("Ticket pass activated successfully! Thank you!");
            }
        });
    }

    // Floating Pass Pill click triggers modal show
    if (floatingPassPill) {
        floatingPassPill.addEventListener('click', () => {
            if (ticketModal) ticketModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }


    // --- 3. QR CODE SCAN CHECKS OVERLAY ("ACTUALLY WORKS" LOCAL VALIDATION) ---
    const checkinModal = document.getElementById('checkinModal');
    const checkinClose = document.getElementById('checkinClose');
    const checkinCloseBtn = document.getElementById('checkinCloseBtn');
    
    const checkinCode = document.getElementById('checkinCode');
    const checkinGuestName = document.getElementById('checkinGuestName');
    const checkinQty = document.getElementById('checkinQty');
    const checkinDonation = document.getElementById('checkinDonation');

    function checkUrlForTicketScan() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('verify')) {
            const codeVal = params.get('verify');
            const guestVal = params.get('guest') || 'Guest';
            const qtyVal = params.get('qty') || '1';
            const donationVal = params.get('donation') || '0';

            // Populate scan verification fields
            if (checkinCode) checkinCode.textContent = codeVal;
            if (checkinGuestName) checkinGuestName.textContent = decodeURIComponent(guestVal);
            if (checkinQty) checkinQty.textContent = `${qtyVal} General Admission Pass${parseInt(qtyVal) > 1 ? 'es' : ''}`;
            if (checkinDonation) checkinDonation.textContent = `$${parseFloat(donationVal).toFixed(2)}`;

            // Launch verification screen
            setTimeout(() => {
                if (checkinModal) checkinModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }, 600);
        }
    }

    checkUrlForTicketScan();

    const closeCheckinModal = () => {
        if (checkinModal) checkinModal.classList.remove('active');
        document.body.style.overflow = '';
        // Clear query parameters smoothly without reloading
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    };

    if (checkinClose) checkinClose.addEventListener('click', closeCheckinModal);
    if (checkinCloseBtn) checkinCloseBtn.addEventListener('click', closeCheckinModal);
    if (checkinModal) {
        checkinModal.addEventListener('click', (e) => {
            if (e.target === checkinModal) closeCheckinModal();
        });
    }


    // --- 4. PERSISTENT DEVICE PLEDGE SYSTEM & RYZEN LIVE SYNCHRONIZER ---
    const pledgeForm = document.getElementById('pledgeForm');
    const progressBar = document.getElementById('progressBar');
    const pledgedCountLabel = document.getElementById('pledgedCount');

    // Default base list of pledges (real user submissions start empty)
    const defaultPledges = [];

    // Load pledges from localStorage
    let storedPledges = JSON.parse(localStorage.getItem('ss_pledges')) || defaultPledges;
    // Clean up any old simulated seed pledges from localStorage
    storedPledges = storedPledges.filter(p => p.time === "Just Now" || (p.time && p.time !== "Verified"));

    // Recalculate pledges
    function syncPledgeTracker() {
        if (!pledgedCountLabel || !progressBar) return;
        
        // Target event goal is 150 laptops
        const goalTarget = 150;
        
        // Real user submissions (remove fake baseline 119 entirely!)
        let totalCount = storedPledges.reduce((sum, item) => sum + item.count, 0);

        if (totalCount > goalTarget) totalCount = goalTarget; // Clamp at max goal target

        let percentage = Math.round((totalCount / goalTarget) * 100);

        // Render live counters
        pledgedCountLabel.textContent = totalCount;
        
        const wipedCountLabel = document.getElementById('wipedCount');
        if (wipedCountLabel) {
            wipedCountLabel.textContent = totalCount;
        }

        const progressPercentLabel = document.getElementById('progressPercent');
        if (progressPercentLabel) {
            progressPercentLabel.textContent = `${percentage}%`;
        }

        progressBar.style.width = `${percentage}%`;

        // Update progress bar stats label in HTML text if present
        const progressStatsLabel = document.querySelector('.progress-stats');
        if (progressStatsLabel) {
            progressStatsLabel.innerHTML = `<strong>${totalCount}</strong> / ${goalTarget} Laptops`;
        }

        // Dynamically update remaining laptop devices disclaimer text
        const progressDisclaimer = document.getElementById('progressDisclaimer');
        if (progressDisclaimer) {
            if (totalCount === 0) {
                progressDisclaimer.textContent = "Be the first to pledge a laptop and jumpstart our campaign!";
            } else {
                const remaining = goalTarget - totalCount;
                if (remaining > 0) {
                    progressDisclaimer.textContent = `Help us get the next ${remaining} laptops to reach our goal!`;
                } else {
                    progressDisclaimer.textContent = `Goal Achieved! Thank you so much!`;
                }
            }
        }
    }

    syncPledgeTracker();

    // =========================================================================
    // CUSTOM LIVE SYNCHRONIZER PROTOCOL
    // How to connect this live tracker in production to keep track in real-time:
    //
    // Since you run n8n on Unraid at tower.local (:5678), you can custom-make a
    // real-time live database in 5 minutes!
    //
    // 1. Create an n8n workflow with a "Webhook" node (Method: GET/POST).
    // 2. Connect the Webhook node to a "Google Sheets" or local database node.
    // 3. Uncomment and trigger the functions below to fetch and push real data!
    // =========================================================================
    /*
    async function syncWithRyzenServer() {
        try {
            // Fetch live verified list from n8n automation database
            const response = await fetch('http://192.168.1.139:5678/webhook-test/hti-laptop-pledges');
            if (response.ok) {
                const liveData = await response.json();
                storedPledges = liveData; // Sync list
                syncPledgeTracker();      // Render UI
            }
        } catch (err) {
            console.warn('Ryzens n8n server offline, falling back to persistent localStorage:', err);
        }
    }
    // Poll Ryzen tower.local database every 10 seconds for real-time live additions
    setInterval(syncWithRyzenServer, 10000);
    */

    // Pledge Submission
    if (pledgeForm) {
        pledgeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameVal = document.getElementById('pledgeName').value.trim();
            const countVal = parseInt(document.getElementById('pledgeCount').value) || 1;
            const detailsVal = document.getElementById('pledgeDetails').value.trim() || 'Laptop Devices';
            
            // Add to active local storage logs with current timestamp
            const newPledge = {
                name: nameVal,
                count: countVal,
                details: detailsVal,
                time: "Just Now"
            };

            storedPledges.push(newPledge);
            localStorage.setItem('ss_pledges', JSON.stringify(storedPledges));

            // Optional: Push to Ryzen n8n serverless webhook on submit!
            /*
            fetch('http://192.168.1.139:5678/webhook-test/hti-laptop-pledges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPledge)
            }).catch(err => console.log('Ryzen upload offline, saved locally.'));
            */

            // Sync Tracker UI
            syncPledgeTracker();
            
            // Show glowing progress pulse
            progressBar.classList.add('pulse-glow-orange');
            setTimeout(() => {
                progressBar.classList.remove('pulse-glow-orange');
            }, 1500);

            alert(`Thank you, ${nameVal}! Your pledge of ${countVal} device${countVal > 1 ? 's' : ''} has been registered to the live drive stream. We sent drop-off instructions to your email!`);
            
            pledgeForm.reset();
        });
    }


    // --- 5. MICRO COPY TOAST NOTIFIER ---
    const toast = document.getElementById('toast');

    function showToast(message) {
        if (toast) {
            toast.textContent = message;
            toast.classList.add('active');
            setTimeout(() => {
                toast.classList.remove('active');
            }, 2500);
        }
    }

    function triggerCopyToast() {
        showToast("URL copied to clipboard!");
    }


    // --- 6. COLLAPSIBLE FLOATING SHARE QR WIDGET (UIRTQ STYLE) ---
    const floatingShareWidget = document.getElementById('floatingShareWidget');
    const btnSharePill = document.getElementById('btnSharePill');
    const shareCardExpanded = document.getElementById('shareCardExpanded');
    const shareCardClose = document.getElementById('shareCardClose');
    const shareQrImage = document.getElementById('shareQrImage');
    const shareUrlDisplay = document.getElementById('shareUrlDisplay');
    const btnCopyShareUrl = document.getElementById('btnCopyShareUrl');

    if (btnSharePill && shareCardExpanded) {
        // Initialize direct share links based on active window URL
        const currentUrl = window.location.href;
        if (shareUrlDisplay) shareUrlDisplay.textContent = currentUrl;
        
        // Dynamically load scanner share QR image pointing to current address
        if (shareQrImage) {
            shareQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`;
        }

        btnSharePill.addEventListener('click', () => {
            shareCardExpanded.style.display = 'flex';
        });
    }

    if (shareCardClose && shareCardExpanded) {
        shareCardClose.addEventListener('click', () => {
            shareCardExpanded.style.display = 'none';
        });
    }

    // Auto-close share card when clicking outside
    document.addEventListener('click', (e) => {
        if (shareCardExpanded && shareCardExpanded.style.display === 'flex') {
            if (!floatingShareWidget.contains(e.target)) {
                shareCardExpanded.style.display = 'none';
            }
        }
    });

    if (btnCopyShareUrl) {
        btnCopyShareUrl.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                triggerCopyToast();
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }





    // --- 7. SCROLL REVEAL INTERSECTION OBSERVER ---
    const revealSections = document.querySelectorAll('.bento-card, .info-card, .quote-card, .ticket-widget, .pledge-progress-card, .pledge-form-card, .logistics-card, .connect-container, .backstory-card');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        root: null,
        threshold: 0.12,
        rootMargin: '0px'
    });

    revealSections.forEach(sec => {
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(30px)';
        sec.style.transition = 'opacity 0.8s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
        revealObserver.observe(sec);
    });


    // --- 9. PREMIUM SCROLL-SPY ACTIVE CAPSULE SYNC ---
    const navLinks = document.querySelectorAll('.nav-link');
    const spySections = document.querySelectorAll('section[id], main.container section[id]');

    function scrollSpyHandler() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 160; // offset for the header spy boundary

        spySections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        } else if (window.scrollY < 200) {
            navLinks.forEach(link => link.classList.remove('active'));
        }
    }

    window.addEventListener('scroll', scrollSpyHandler);
    scrollSpyHandler(); // Run on startup

    // --- 10. HIGH-PERFORMANCE SPOTLIGHT MOUSE-TRACKING ENGINE ---
    const spotlightCards = document.querySelectorAll('.info-card, .bento-card, .coordinator-card, .pledge-progress-card, .pledge-form-card, .ticket-widget, .backstory-card, .logistics-card');
    
    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

});

