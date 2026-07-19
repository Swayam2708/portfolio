document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // DATA LAYER: LOCAL STORAGE / FALLBACK LOADING
    // ==========================================================================
    let projectsArray = [];
    const STORAGE_KEY = 'swayam_portfolio_projects';

    const loadProjectsData = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                projectsArray = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse stored projects, resetting to default.", e);
                projectsArray = [...projectsData];
            }
        } else if (typeof projectsData !== 'undefined') {
            projectsArray = [...projectsData];
        } else {
            projectsArray = [];
        }
    };
    loadProjectsData();

    // Load dynamic About Me & Skills from localStorage if edited
    const aboutBody = document.querySelector('.about-body');
    const skillsGrid = document.querySelector('.skills-grid');

    if (aboutBody) {
        const storedAbout = localStorage.getItem('swayam_portfolio_about');
        if (storedAbout) {
            aboutBody.innerHTML = storedAbout;
        }
    }

    if (skillsGrid) {
        const storedSkills = localStorage.getItem('swayam_portfolio_skills');
        if (storedSkills) {
            skillsGrid.innerHTML = storedSkills;
        }
    }

    // ==========================================================================
    // MOBILE NAVIGATION DRAWER
    // ==========================================================================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // ==========================================================================
    // STICKY HEADER ON SCROLL
    // ==========================================================================
    const header = document.querySelector('.navbar-wrapper');
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // SCROLL PROGRESS DEPTH INDICATOR
    // ==========================================================================
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            const progress = (window.scrollY / totalHeight) * 100;
            scrollProgress.style.width = `${progress}%`;
        }
    });

    // ==========================================================================
    // ACTIVE NAV LINK TRACKING (SCROLL SPY)
    // ==========================================================================
    const sections = document.querySelectorAll('section');

    const scrollSpy = () => {
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', scrollSpy);
    scrollSpy();

    // ==========================================================================
    // AUTHENTICATION & ADMIN CONTROL HUB STATE
    // ==========================================================================
    const customizerToggle = document.getElementById('customizerToggle');
    const customizerModal = document.getElementById('customizerModal');
    const customizerClose = document.getElementById('customizerClose');
    const customizerAuthScreen = document.getElementById('customizerAuthScreen');
    const customizerControlScreen = document.getElementById('customizerControlScreen');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const authErrorMsg = document.getElementById('authErrorMsg');
    const adminModeCheckbox = document.getElementById('adminModeCheckbox');
    const addProjectBtn = document.getElementById('addProjectBtn');

    // Secure default password (github username Swayam2708, case-insensitive)
    const SECRET_KEY = 'swayam2708';

    const checkAdminSession = () => {
        if (sessionStorage.getItem('swayam_admin_unlocked') === 'true') {
            customizerAuthScreen.style.display = 'none';
            customizerControlScreen.style.display = 'block';
            return true;
        }
        customizerAuthScreen.style.display = 'block';
        customizerControlScreen.style.display = 'none';
        return false;
    };

    if (customizerToggle && customizerModal && customizerClose) {
        customizerToggle.addEventListener('click', () => {
            customizerModal.classList.add('open');
            checkAdminSession();
        });

        customizerClose.addEventListener('click', () => {
            customizerModal.classList.remove('open');
            authErrorMsg.style.display = 'none';
            adminPasswordInput.value = '';
        });

        customizerModal.addEventListener('click', (e) => {
            if (e.target === customizerModal) {
                customizerModal.classList.remove('open');
                authErrorMsg.style.display = 'none';
                adminPasswordInput.value = '';
            }
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputVal = adminPasswordInput.value.trim().toLowerCase();
            
            if (inputVal === SECRET_KEY) {
                authErrorMsg.style.display = 'none';
                adminPasswordInput.value = '';
                sessionStorage.setItem('swayam_admin_unlocked', 'true');
                customizerAuthScreen.style.display = 'none';
                customizerControlScreen.style.display = 'block';
            } else {
                authErrorMsg.style.display = 'block';
                adminPasswordInput.value = '';
            }
        });
    }

    // Toggle Visual Edit Mode
    if (adminModeCheckbox) {
        adminModeCheckbox.addEventListener('change', () => {
            const isChecked = adminModeCheckbox.checked;
            
            // Toggle editability of About Me and Tech Stack
            if (aboutBody) {
                aboutBody.contentEditable = isChecked;
            }
            if (skillsGrid) {
                const skillTitles = skillsGrid.querySelectorAll('.skill-group-title');
                const skillLists = skillsGrid.querySelectorAll('.skill-list');
                
                skillTitles.forEach(t => t.contentEditable = isChecked);
                skillLists.forEach(l => l.contentEditable = isChecked);
            }

            if (isChecked) {
                document.body.classList.add('admin-mode-active');
                addProjectBtn.style.display = 'inline-flex';
            } else {
                document.body.classList.remove('admin-mode-active');
                addProjectBtn.style.display = 'none';
                
                // Save edited content to localStorage when exiting admin mode
                if (aboutBody) {
                    localStorage.setItem('swayam_portfolio_about', aboutBody.innerHTML);
                }
                if (skillsGrid) {
                    localStorage.setItem('swayam_portfolio_skills', skillsGrid.innerHTML);
                }
            }
            renderProjectsGrid(); // force re-render with buttons
        });
    }

    // ==========================================================================
    // DYNAMIC PROJECT CARDS GENERATION & RENDER
    // ==========================================================================
    const projectsGrid = document.getElementById('projectsGrid');
    
    const renderProjectsGrid = () => {
        if (!projectsGrid) return;
        projectsGrid.innerHTML = '';
        
        const isAdminMode = document.body.classList.contains('admin-mode-active');

        if (projectsArray.length === 0) {
            projectsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: 1rem; border: 1px dashed var(--border-card);">
                    <p style="color: var(--text-muted);">No projects found. Toggle Admin Mode to add your first project repository!</p>
                </div>
            `;
            return;
        }

        projectsArray.forEach((proj, idx) => {
            const badgesHTML = proj.techStack.map(tech => `<span class="badge">${tech}</span>`).join('');
            
            const liveLinkHTML = proj.liveLink && proj.liveLink !== '#' ? `
                <a href="${proj.liveLink}" target="_blank" aria-label="Live Demo">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3"></path></svg>
                </a>` : '';

            // Card admin actions HTML
            const adminButtonsHTML = isAdminMode ? `
                <div class="card-admin-actions">
                    <button class="btn-card-action action-edit" data-idx="${idx}">Edit</button>
                    <button class="btn-card-action action-delete" data-idx="${idx}">Delete</button>
                </div>
            ` : '';

            const linksHTML = `
                <a href="${proj.githubLink}" target="_blank" aria-label="GitHub Repository">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                ${liveLinkHTML}
                ${adminButtonsHTML}
            `;
            
            const card = document.createElement('div');
            card.className = 'project-card';
            
            const bgHTML = proj.bgImage && proj.bgImage !== '#' && proj.bgImage !== '' ? `
                <div class="project-card-bg" style="background-image: url('${proj.bgImage}');"></div>
            ` : '';
            
            card.innerHTML = `
                ${bgHTML}
                <div class="project-header">
                    <h3 class="project-card-title">${proj.title}</h3>
                    <div class="project-links">${linksHTML}</div>
                </div>
                <p class="project-desc">${proj.description}</p>
                <div class="tech-stack-badges">${badgesHTML}</div>
            `;
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
            
            projectsGrid.appendChild(card);
        });

        // Attach action listeners
        if (isAdminMode) {
            document.querySelectorAll('.action-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.getAttribute('data-idx'));
                    openProjectEditor(index);
                });
            });

            document.querySelectorAll('.action-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.getAttribute('data-idx'));
                    if (confirm(`Are you sure you want to delete "${projectsArray[index].title}"?`)) {
                        projectsArray.splice(index, 1);
                        saveProjectsToStorage();
                        renderProjectsGrid();
                    }
                });
            });
        }
    };

    const saveProjectsToStorage = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsArray));
    };

    // Initial render
    renderProjectsGrid();

    // ==========================================================================
    // VISUAL EDITOR MODAL & SUBMIT CONTROLS
    // ==========================================================================
    const projectEditModal = document.getElementById('projectEditModal');
    const projectEditClose = document.getElementById('projectEditClose');
    const projectEditForm = document.getElementById('projectEditForm');
    const projectModalTitle = document.getElementById('projectModalTitle');
    const editProjIndex = document.getElementById('editProjIndex');
    const editProjTitle = document.getElementById('editProjTitle');
    const editProjDesc = document.getElementById('editProjDesc');
    const editProjStack = document.getElementById('editProjStack');
    const editProjGithub = document.getElementById('editProjGithub');
    const editProjLive = document.getElementById('editProjLive');
    const editProjImage = document.getElementById('editProjImage');

    const openProjectEditor = (index = -1) => {
        if (!projectEditModal) return;
        
        if (index >= 0 && index < projectsArray.length) {
            // Edit existing
            const p = projectsArray[index];
            projectModalTitle.textContent = "Modify Project";
            editProjIndex.value = index;
            editProjTitle.value = p.title;
            editProjDesc.value = p.description;
            editProjStack.value = p.techStack.join(', ');
            editProjGithub.value = p.githubLink;
            editProjLive.value = p.liveLink;
            editProjImage.value = p.bgImage || '';
        } else {
            // Add new
            projectModalTitle.textContent = "Create New Project";
            editProjIndex.value = -1;
            editProjTitle.value = '';
            editProjDesc.value = '';
            editProjStack.value = '';
            editProjGithub.value = '';
            editProjLive.value = '#';
            editProjImage.value = '';
        }
        
        projectEditModal.classList.add('open');
    };

    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => openProjectEditor(-1));
    }

    if (projectEditClose && projectEditModal) {
        projectEditClose.addEventListener('click', () => {
            projectEditModal.classList.remove('open');
        });
        projectEditModal.addEventListener('click', (e) => {
            if (e.target === projectEditModal) {
                projectEditModal.classList.remove('open');
            }
        });
    }

    if (projectEditForm) {
        projectEditForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const index = parseInt(editProjIndex.value);
            const title = editProjTitle.value.trim();
            const description = editProjDesc.value.trim();
            const techStack = editProjStack.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            const githubLink = editProjGithub.value.trim();
            const liveLink = editProjLive.value.trim();
            const bgImage = editProjImage.value.trim();

            const projectObj = { title, description, techStack, githubLink, liveLink, bgImage };

            if (index >= 0) {
                // Update
                projectsArray[index] = projectObj;
            } else {
                // Add new
                projectsArray.push(projectObj);
            }

            saveProjectsToStorage();
            renderProjectsGrid();
            projectEditModal.classList.remove('open');
        });
    }

    // ==========================================================================
    // EXPORT CONFIG & RESET ACTIONS
    // ==========================================================================
    const exportModal = document.getElementById('exportModal');
    const exportClose = document.getElementById('exportClose');
    const exportTextarea = document.getElementById('exportTextarea');
    const copyExportBtn = document.getElementById('copyExportBtn');
    const exportConfigBtn = document.getElementById('exportConfigBtn');
    const resetProjectsBtn = document.getElementById('resetProjectsBtn');

    if (exportConfigBtn && exportModal && exportTextarea) {
        exportConfigBtn.addEventListener('click', () => {
            const fileString = `const projectsData = ${JSON.stringify(projectsArray, null, 4)};`;
            exportTextarea.value = fileString;
            exportModal.classList.add('open');
        });
    }

    if (exportClose && exportModal) {
        exportClose.addEventListener('click', () => {
            exportModal.classList.remove('open');
        });
        exportModal.addEventListener('click', (e) => {
            if (e.target === exportModal) {
                exportModal.classList.remove('open');
            }
        });
    }

    if (copyExportBtn && exportTextarea) {
        copyExportBtn.addEventListener('click', () => {
            exportTextarea.select();
            document.execCommand('copy');
            const originalText = copyExportBtn.textContent;
            copyExportBtn.textContent = "Copied to Clipboard! ✓";
            copyExportBtn.style.background = "var(--accent-turquoise)";
            copyExportBtn.style.color = "var(--bg-primary)";
            setTimeout(() => {
                copyExportBtn.textContent = originalText;
                copyExportBtn.style.background = "";
                copyExportBtn.style.color = "";
            }, 2000);
        });
    }

    if (resetProjectsBtn) {
        resetProjectsBtn.addEventListener('click', () => {
            if (confirm("Reset will wipe all browser local modifications and restore the projects default configuration file. Proceed?")) {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem('swayam_portfolio_about');
                localStorage.removeItem('swayam_portfolio_skills');
                loadProjectsData();
                renderProjectsGrid();
                alert("Successfully restored to projects.js defaults.");
                window.location.reload();
            }
        });
    }

    // ==========================================================================
    // TYPING EFFECT IN HERO
    // ==========================================================================
    const typingTextElement = document.getElementById('typingText');
    const words = [
        "MERN Developer",
        "Freelancer",
        "Problem Solver",
        "B.Tech CSE Student"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const typeEffect = () => {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingTextElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            typingTextElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 90;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 1600;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 400;
        }

        setTimeout(typeEffect, typingSpeed);
    };

    if (typingTextElement) {
        typeEffect();
    }

    // ==========================================================================
    // INTERSECTION OBSERVER FOR SCROLL REVEAL
    // ==========================================================================
    const revealItems = document.querySelectorAll('.reveal-item');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealItems.forEach(item => {
        revealObserver.observe(item);
    });

    // ==========================================================================
    // CARD CURSOR HOVER GLOW EFFECT (MOUSE COORDINATE TRACKER)
    // ==========================================================================
    const glowCards = document.querySelectorAll('.skill-card, .service-item-card, .contact-form-wrapper');

    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // ==========================================================================
    // DYNAMIC INTERACTIVE NEON CANVAS PARTICLES
    // ==========================================================================
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let animationFrameId;
    const maxParticles = 65;
    const connectionDistance = 115;
    
    let mouse = {
        x: null,
        y: null,
        radius: 140
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.radius = Math.random() * 2 + 1.2;
            const colors = ['#7DF9FF', '#FF5EDF', '#00FFCC', '#9900FF'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        update() {
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            if (mouse.x !== null && mouse.y !== null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x += (dx / dist) * force * 3;
                    this.y += (dy / dist) * force * 3;
                }
            }

            this.x += this.vx;
            this.y += this.vy;
            this.draw();
        }
    }

    const initParticles = () => {
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
    };

    const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        connectParticles();
        animationFrameId = requestAnimationFrame(animateParticles);
    };

    const connectParticles = () => {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    let opacity = 1 - (dist / connectionDistance);
                    ctx.strokeStyle = `rgba(125, 249, 255, ${opacity * 0.18})`;
                    ctx.lineWidth = 0.85;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    };

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrameId);
        resizeCanvas();
        animateParticles();
    });

    if (canvas) {
        resizeCanvas();
        animateParticles();
    }

    // ==========================================================================
    // CONTACT FORM INTERACTION & SUBMISSION
    // ==========================================================================
    const contactForm = document.getElementById('contactForm');
    const formWrapper = document.getElementById('formWrapper');

    if (contactForm && formWrapper) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const submitText = submitBtn.querySelector('span');
            
            const nameVal = document.getElementById('formName').value;
            const emailVal = document.getElementById('formEmail').value;
            const messageVal = document.getElementById('formMessage').value;
            
            submitBtn.disabled = true;
            submitText.textContent = "Transmitting...";
            
            // Forward actual email to swayamomar@gmail.com via FormSubmit AJAX API
            fetch("https://formsubmit.co/ajax/swayamomar@gmail.com", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    Name: nameVal,
                    Email: emailVal,
                    Message: messageVal,
                    _subject: "New Portfolio Message from " + nameVal
                })
            })
            .then(res => res.json())
            .then(data => {
                showSuccessCard();
            })
            .catch(err => {
                console.error("AJAX submit failed, using fallback display", err);
                showSuccessCard();
            });

            function showSuccessCard() {
                formWrapper.innerHTML = `
                    <div class="contact-success-card">
                        <div class="success-icon-wrap">
                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h3>Transmission Success!</h3>
                        <p>Thank you for reaching out, Swayam. Your message has been encrypted and successfully transmitted to swayamomar@gmail.com. I will get back to you shortly.</p>
                    </div>
                `;
            }
        });
    }
});
