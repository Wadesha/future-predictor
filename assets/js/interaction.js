/**
 * Interaction - UI interaction helpers
 */
const Interaction = {
  showToast(message, duration = 2500) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },

  showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
    window.scrollTo(0, 0);
  },

  initNav() {
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page) {
          document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
          link.classList.add('active');
          if (page === 'home') App.renderHome();
          else if (page === 'scenarios') App.renderScenarios();
          else if (page === 'profile') App.renderProfile();
          this.showPage(page);
        }
      });
    });
  }
};