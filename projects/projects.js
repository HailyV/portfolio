import { fetchJSON, renderProjects } from '../global.js';

// Function to fetch and render projects
async function loadProjects() {
    try {
        console.log("Fetching projects from JSON...");

        // Fetch all projects from JSON
        const projects = await fetchJSON('../lib/projects.json'); // Ensure correct path
        console.log("Fetched projects:", projects);

        // Validate the fetched data
        if (!projects || !Array.isArray(projects)) {
            throw new Error("Invalid projects data: Expected a non-empty array.");
        }

        // Select the container for projects and the title element
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        if (!projectsContainer) {
            throw new Error("Error: '.projects' container not found in the DOM.");
        }

        // ✅ Update the project count in the title
        if (projectsTitle) {
            projectsTitle.textContent = `Projects (${projects.length})`;
        }

        // ✅ Clear the container before rendering projects
        projectsContainer.innerHTML = '';

        // ✅ Render each project
        projects.forEach(project => {
            renderProjects(project, projectsContainer, 'h2');
        });

        console.log("Projects loaded successfully.");
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

// ✅ Ensure script runs only after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Now loading projects...");
    loadProjects();
});
