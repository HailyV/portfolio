console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

// currentLink.classList.add('current');
// currentLink?.classList.add('current');

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-switcher">
      <option value="auto" selected>Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
`
);

// Function to initialize the theme on page load
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'auto';
  setTheme(savedTheme);
  document.getElementById('theme-switcher').value = savedTheme;
}

// Function to apply the selected theme
function setTheme(theme) {
  if (theme === 'auto') {
    document.documentElement.style.removeProperty('color-scheme'); // Default to system preference
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.style.setProperty('color-scheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
  localStorage.setItem('theme', theme);
}

// Add event listener to the dropdown
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();

  const select = document.querySelector('#theme-switcher');
  select.addEventListener('input', function (event) {
    console.log('Color scheme changed to', event.target.value);
    setTheme(event.target.value); // Apply the selected theme
  });

  // Apply styling to the theme switcher
  const switcher = document.querySelector('.color-scheme');
  switcher.style.position = 'absolute';
  switcher.style.top = '1rem';
  switcher.style.right = '1rem';
  switcher.style.fontSize = '80%';
  switcher.style.fontFamily = 'inherit';

  // Navigation setup
  const ARE_WE_HOME = document.documentElement.classList.contains('home');
  // change for live server
  let pages = [
    { url: '/portfolio/', title: 'Home' },
    { url: '/portfolio/projects/index.html', title: 'Projects' },
    { url: '/portfolio/cv/index.html', title: 'Resume' },
    { url: '/portfolio/contact/index.html', title: 'Contact' },
    { url: 'https://github.com/HailyV', title: 'Profile' },
  ];

  let nav = document.createElement('nav');
  document.body.prepend(nav);

  for (let p of pages) {
    let url = p.url;
    let title = p.title;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // Mark the current page
    if (a.host === location.host && a.pathname === location.pathname) {
      a.classList.add('current');
    }

    // Open external links in a new tab
    if (a.host !== location.host) {
      a.target = '_blank';
    }

    nav.append(a);
  }
  document.head.append(style);
});


document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);

    let url = form.action + '?';

    for (let [name, value] of data) {
      url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
    }

    url = url.slice(0, -1);

    console.log('Redirecting to:', url);

    location.href = url;
  });
});