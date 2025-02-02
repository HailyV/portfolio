import { fetchJSON, renderProjects, fetchGitHubData } from './global.js'; // Ensure the correct path

// Fetch and render projects
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and render projects
    const projectsContainer = document.querySelector('.projects');
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3); // Display the latest 3 projects
    renderProjects(latestProjects, projectsContainer, 'h2');

    // Fetch and display GitHub profile stats
    const profileStats = document.querySelector('#profile-stats');
    if (profileStats) {
        const githubData = await fetchGitHubData('HailyV'); // Fetch GitHub data for 'HailyV'

        if (githubData) {
            profileStats.innerHTML = `
                <h2>${githubData.login}'s GitHub Stats</h2>
                <dl>
                    <dt>Followers:</dt> <dd>${githubData.followers}</dd>
                    <dt>Following:</dt> <dd>${githubData.following}</dd>
                    <dt>Public Repos:</dt> <dd>${githubData.public_repos}</dd>
                    <dt>Public Gists:</dt> <dd>${githubData.public_gists || 0}</dd>
                </dl>
            `;
        } else {
            console.error("No GitHub data to display.");
        }
    } else {
        console.error("Error: #profile-stats container not found.");
    }
});


async function loadProjects() {
    try {
        console.log("Fetching projects from JSON...");

        // Fetch all projects
        const projects = await fetchJSON('../lib/projects.json'); // Adjust path if needed
        console.log("Fetched projects:", projects);

        if (!projects || !Array.isArray(projects)) {
            throw new Error("Invalid projects data: Expected an array.");
        }

        // Select the container for the latest projects
        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        if (!projectsContainer) {
            throw new Error("Error: '.projects' container not found in the DOM.");
        }

        // ✅ Render the latest 3 projects
        const latestProjects = projects.slice(0, 3); // Get the first 3 projects
        renderProjects(latestProjects, projectsContainer, 'h2');

        // ✅ Update project count in the title
        if (projectsTitle) {
            projectsTitle.textContent = `Projects (${projects.length})`;
        }

        console.log("Projects loaded and rendered successfully.");
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

// ✅ Ensure script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", loadProjects);