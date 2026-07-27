// Initialization
(() => {

  // 3D Interactive Feature Cards
  const cards = document.querySelectorAll('[class~="3d-card"]');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      // Max rotation 8deg
      const rotateX = deltaY * -8;
      const rotateY = deltaX * 8;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `rotateX(0) rotateY(0)`;
      // Add transition for smooth return
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none'; // remove transition for smooth follow
    });
  });

  // Smooth Scrolling for Nav Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Sticky Navbar background change on scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(245, 244, 240, 0.85)';
      navbar.style.backdropFilter = 'blur(10px)';
      navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
    } else {
      navbar.style.background = 'var(--bg-dark)';
      navbar.style.backdropFilter = 'none';
      navbar.style.boxShadow = 'none';
    }
  });

  // Active Package selection
  const packages = document.querySelectorAll('.package-card');
  packages.forEach(pkg => {
    pkg.addEventListener('mouseenter', () => {
      packages.forEach(p => p.classList.remove('active'));
      pkg.classList.add('active');
    });
  });
  // Modal Logic
  const modal = document.getElementById('formModal');
  const closeBtn = document.querySelector('.modal-close');
  const modalTitle = document.getElementById('modalTitle');
  const formTypeInput = document.getElementById('formType');
  const packageNameInput = document.getElementById('packageName');
  const emailGroup = document.getElementById('emailGroup');
  const messageGroup = document.getElementById('messageGroup');
  const formStatus = document.getElementById('formStatus');
  const leadForm = document.getElementById('leadForm');

  function openModal(type, pkg = '') {
    formStatus.textContent = '';
    formStatus.className = 'form-status';
    leadForm.reset();
    formTypeInput.value = type;

    if (type === 'quote') {
      modalTitle.textContent = `Get Quote: ${pkg}`;
      packageNameInput.value = pkg;
      emailGroup.style.display = 'none';
      messageGroup.style.display = 'block';
      document.getElementById('email').required = false;
      
      const msgLabel = document.getElementById('messageLabel');
      if (msgLabel) msgLabel.textContent = 'Requirement Details';
      document.getElementById('message').placeholder = 'Please explain your requirement in detail...';
    } else {
      modalTitle.textContent = 'Start Your Project';
      packageNameInput.value = '';
      emailGroup.style.display = 'block';
      messageGroup.style.display = 'block';
      document.getElementById('email').required = true;
      
      const msgLabel = document.getElementById('messageLabel');
      if (msgLabel) msgLabel.textContent = 'Message';
      document.getElementById('message').placeholder = 'Tell us about your project requirements...';
    }

    modal.classList.add('active');
  }

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.querySelectorAll('.btn-primary').forEach(btn => {
    if (!btn.id && !btn.closest('form')) {
      btn.addEventListener('click', () => {
        if (btn.textContent.includes('Quot')) {
          const pkgName = btn.closest('.package-card')?.querySelector('.pkg-name')?.textContent || 'Standard';
          openModal('quote', pkgName);
        } else {
          openModal('contact');
        }
      });
    }
  });

  document.querySelectorAll('.cta-nav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('contact');
    });
  });

  document.querySelectorAll('.btn-outline').forEach(btn => {
    btn.addEventListener('click', () => {
      const pkgName = btn.closest('.package-card')?.querySelector('.pkg-name')?.textContent || 'Package';
      openModal('quote', pkgName);
    });
  });

  // Video Modal Logic
  const videoModal = document.getElementById('videoModal');
  const videoCloseBtn = document.getElementById('videoCloseBtn');
  const tourVideo = document.getElementById('tourVideo');
  const videoSrc = "https://www.youtube-nocookie.com/embed/l6EzZafb1Pk?autoplay=1";

  document.querySelectorAll('.btn-play').forEach(btn => {
    btn.addEventListener('click', () => {
      if (tourVideo) tourVideo.src = videoSrc;
      if (videoModal) videoModal.classList.add('active');
    });
  });

  const closeVideoModal = () => {
    if (videoModal) videoModal.classList.remove('active');
    setTimeout(() => { if (tourVideo) tourVideo.src = ""; }, 300);
  };

  if (videoCloseBtn) videoCloseBtn.addEventListener('click', closeVideoModal);
  if (videoModal) videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeVideoModal();
  });

  // WhatsApp Modal Logic
  const waModal = document.getElementById('waModal');
  const waCloseBtn = document.getElementById('waCloseBtn');

  document.querySelectorAll('.wa-open-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (waModal) waModal.classList.add('active');
    });
  });

  const closeWaModal = () => {
    if (waModal) waModal.classList.remove('active');
  };

  if (waCloseBtn) waCloseBtn.addEventListener('click', closeWaModal);
  if (waModal) waModal.addEventListener('click', (e) => {
    if (e.target === waModal) closeWaModal();
  });

  // Form Submission
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const formData = new FormData(leadForm);
    const data = Object.fromEntries(formData.entries());
    const isQuote = data.formType === 'quote';
    const endpoint = isQuote ? '/api/quote' : '/api/contact';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok) {
        formStatus.textContent = result.message || 'Success!';
        formStatus.className = 'form-status success';
        leadForm.reset();
        setTimeout(() => modal.classList.remove('active'), 2000);
      } else {
        formStatus.textContent = result.error || 'Something went wrong.';
        formStatus.className = 'form-status error';
      }
    } catch (error) {
      formStatus.textContent = 'Network error. Please try again later.';
      formStatus.className = 'form-status error';
    } finally {
      submitBtn.textContent = 'Submit Request';
      submitBtn.disabled = false;
    }
  });

  // Call Form Submission
  const callForm = document.getElementById('callForm');
  if (callForm) {
    callForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('callSubmitBtn');
      const callFormStatus = document.getElementById('callFormStatus');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(callForm);
      const data = Object.fromEntries(formData.entries());

      if (data.projectType === 'Others') {
        data.message = `Interested in: Others. Details: ${data.otherDetails}`;
      } else {
        data.message = `Interested in: ${data.projectType}`;
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
          window.location.href = 'success.html';
        } else {
          callFormStatus.textContent = result.error || 'Something went wrong.';
          callFormStatus.className = 'form-status error';
        }
      } catch (error) {
        callFormStatus.textContent = 'Network error. Please try again later.';
        callFormStatus.className = 'form-status error';
      } finally {
        submitBtn.textContent = 'Send a Request';
        submitBtn.disabled = false;
      }
    });
  }

  // Viewport Scroll Reveal Observer
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });

  // Add Video Modal Logic
  const addVideoModal = document.getElementById('addVideoModal');
  const addVideoCloseBtn = document.getElementById('addVideoCloseBtn');
  const addVideoBtn = document.getElementById('addVideoBtn');
  const addVideoForm = document.getElementById('addVideoForm');

  if (addVideoBtn && addVideoModal) {
    addVideoBtn.addEventListener('click', () => {
      addVideoModal.classList.add('active');
    });
  }

  const closeAddVideoModal = () => {
    if (addVideoModal) addVideoModal.classList.remove('active');
  };

  if (addVideoCloseBtn) addVideoCloseBtn.addEventListener('click', closeAddVideoModal);
  if (addVideoModal) addVideoModal.addEventListener('click', (e) => {
    if (e.target === addVideoModal) closeAddVideoModal();
  });

  if (addVideoForm) {
    addVideoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('videoSubmitBtn');
      const videoFormStatus = document.getElementById('videoFormStatus');
      submitBtn.textContent = 'Uploading...';
      submitBtn.disabled = true;
      videoFormStatus.textContent = '';
      videoFormStatus.className = 'form-status';

      const formData = new FormData(addVideoForm);

      try {
        const response = await fetch('/api/video', {
          method: 'POST',
          body: formData // multer handles multipart/form-data, do not set Content-Type header manually
        });

        const result = await response.json();
        if (response.ok) {
          videoFormStatus.textContent = result.message || 'Video uploaded successfully!';
          videoFormStatus.className = 'form-status success';
          addVideoForm.reset();
          setTimeout(() => closeAddVideoModal(), 2000);
        } else {
          videoFormStatus.textContent = result.error || 'Upload failed.';
          videoFormStatus.className = 'form-status error';
        }
      } catch (error) {
        videoFormStatus.textContent = 'Network error. Please try again later.';
        videoFormStatus.className = 'form-status error';
      } finally {
        submitBtn.textContent = 'Upload Video';
        submitBtn.disabled = false;
      }
    });
  }

})();
