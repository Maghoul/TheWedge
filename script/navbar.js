document.addEventListener('DOMContentLoaded', () => {
  // Fetch and inject the navbar
  fetch('../html/navbar.html')
    .then(response => response.text())
    .then(data => {
      // document.getElementById('navbar-placeholder').innerHTML = data;
      document.body.insertAdjacentHTML('afterbegin', data);

      // Set page-specific icon and title
      const pageIcon = document.getElementById('page-icon');
      const pageTitle = document.getElementById('page-title');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const pagePath = window.location.pathname; // Get full path
const normalizedPage = pagePath.includes('/html/') ? pagePath.split('/html/').pop() : currentPage;

switch (normalizedPage) {
  case 'index.html':
    pageIcon.src = '../images/home-icon.png';
    pageTitle.textContent = 'The Wedge';
    break;
  case 'wx.html':
    pageIcon.src = '../images/weather-icon.png';
    pageTitle.textContent = 'Weather';
    break;
  case 'bpb.html': // Updated from preflight-checklist.html
    pageIcon.src = '../images/checklist-icon.png';
    pageTitle.textContent = 'Before Pushback';
    break;
  case 'frm.html':
    pageIcon.src = '../images/rest-icon.png';
    pageTitle.textContent = 'Flight Rest Management';
    break;
  case 'fraam.html':
    pageIcon.src = '../images/risk-icon.png';
    pageTitle.textContent = 'Fatigue Risk Assessment';
    break;
  case 'contact.html':
    pageIcon.src = '../images/contact-icon.png';
    pageTitle.textContent = 'Contact';
    break;
  default:
    pageIcon.src = '../images/home-icon.png';
    pageTitle.textContent = 'The Wedge';
}

      // Add hamburger menu toggle
      const hamburger = document.querySelector('.hamburger');
      const navMenu = document.querySelector('.nav-menu');

      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      // Close menu when a link is clicked
      document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });

      // Close navbar when clicking outside
      document.addEventListener('click', (event) => {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);

        if (!isClickInsideMenu && !isClickOnHamburger && navMenu.classList.contains('active')) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        }
      });
    })
    .catch(error => console.error('Error loading navbar:', error));
});