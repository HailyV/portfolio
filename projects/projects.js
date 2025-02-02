import { fetchJSON, renderProjects } from '../global.js';

// Select the container where projects will be displayed
const projectsContainer = document.querySelector('.projects');

// Ensure the container exists
if (!projectsContainer) {
    console.error("Error: '.projects' container not found in the DOM.");
}

// Function to fetch and render projects
async function loadProjects() {
    try {
        console.log("Fetching projects from JSON...");
        const projects = await fetchJSON('../lib/projects.json'); // Adjust path if needed
        console.log("Fetched projects:", projects);

        if (!projects || !Array.isArray(projects)) {
            throw new Error("Invalid projects data: Expected an array.");
        }

        // ✅ Clear the container before rendering
        projectsContainer.innerHTML = '';

        // ✅ Render each project
        projects.forEach(project => {
            renderProjects(project, projectsContainer, 'h2');
        });

    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

// ✅ Ensure script runs only after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Now loading projects...");
    loadProjects();
});
