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

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      // Check if the response was successful
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      // Parse the JSON response
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  // Ensure the container exists
  if (!containerElement) {
      console.error("Error: containerElement is not defined.");
      return;
  }

  // Clear the container to avoid duplication
  containerElement.innerHTML = '';

  // Validate heading level (must be h1-h6)
  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const headingTag = validHeadings.includes(headingLevel) ? headingLevel : 'h2';

  // Create an article for the project
  const article = document.createElement('article');

  // Create a project card container
  const projectCard = document.createElement("div");
  projectCard.classList.add("project-card");

  // Add project title dynamically based on heading level
  const title = document.createElement(headingTag);
  title.textContent = project.title || "Untitled Project";
  
  // Add project description
  const description = document.createElement("p");
  description.textContent = project.description || "No description available.";

  // Add project image (if available)
  if (project.image) {
      const img = document.createElement("img");
      img.src = project.image;
      img.alt = project.title || "Project Image";
      projectCard.appendChild(img);
  }

  // Add project link (if available)
  if (project.link) {
      const link = document.createElement("a");
      link.href = project.link;
      link.textContent = "View Project";
      link.target = "_blank";
      projectCard.appendChild(link);
  }

  // Append elements to the project card
  projectCard.appendChild(title);
  projectCard.appendChild(description);

  // Append project card to the article
  article.appendChild(projectCard);

  // Append the article to the container
  containerElement.appendChild(article);
}
