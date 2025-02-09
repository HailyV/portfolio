import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let query = ''; // Search query
let selectedIndex = -1; // No wedge selected by default
let projectsContainer, projectsTitle, searchInput;

// ✅ Fetch & Render Projects
async function loadProjects() {
    try {
        console.log("Fetching projects...");
        const projects = await fetchJSON('../lib/projects.json');
        if (!projects || !Array.isArray(projects)) throw new Error("Invalid project data.");

        window.allProjects = projects;
        updateProjectList();
    } catch (error) {
        console.error("Error loading projects:", error);
    }
}

function updateProjectList() {
    projectsContainer = document.querySelector('.projects');
    projectsTitle = document.querySelector('.projects-title');

    let filteredProjects = window.allProjects.filter(project => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    console.log("🔍 Initial Filtered Projects:", filteredProjects.length);
    console.log("📌 selectedIndex:", selectedIndex);
    console.log("🗂 window.chartData:", window.chartData);

    // ✅ If a wedge is selected, filter projects by the selected year
    if (selectedIndex !== -1 && window.chartData[selectedIndex]) {
        let selectedYear = window.chartData[selectedIndex].label;
        console.log("🟢 Selected Year from chartData:", selectedYear);
        console.log("📊 All Available Years in Projects:", window.allProjects.map(p => p.year));

        filteredProjects = filteredProjects.filter(p => {
            console.log("🛠 Checking project year:", p.year, "==", selectedYear);
            return p.year.toString() === selectedYear.toString();
        });

        console.log("🔴 Filtered Projects After Year Check:", filteredProjects.length);
    } else {
        console.warn("⚠️ selectedIndex out of range or chartData not ready!");
    }

    projectsTitle.textContent = `Projects (${filteredProjects.length})`;
    projectsContainer.innerHTML = '';

    // ✅ Render the filtered projects
    filteredProjects.forEach(project => renderProjects(project, projectsContainer, 'h2'));

    renderPieChart(filteredProjects);
}

function renderPieChart(projectsGiven) {
    let svg = d3.select("svg");
    svg.selectAll("*").remove(); // ✅ Clear previous chart

    let colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    let rolledData = d3.rollups(projectsGiven, v => v.length, d => d.year);
    let data = rolledData.map(([year, count]) => ({ value: count, label: year }));

    console.log("✅ Assigning chartData:", data); // Debugging chart data
    window.chartData = data;

    let sliceGenerator = d3.pie().value(d => d.value);
    let arcData = sliceGenerator(data);

    // ✅ Create Pie Chart Wedges
    let paths = svg.selectAll("path")
        .data(arcData)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (_, i) => colorScale(i))
        .attr("data-index", (_, i) => i) // Store index for lookup
        .on("click", function (_, i) {
            console.log("📌 Wedge Clicked! Index:", i, "Previous:", selectedIndex);
            selectedIndex = selectedIndex === i ? -1 : i; // ✅ Toggle selection
            console.log("✅ New selectedIndex:", selectedIndex);
            
            updateSelection(); // ✅ Update Pie Chart & Legend Styling
            updateProjectList(); // ✅ Ensure project list updates on wedge click
        });

    // ✅ Create Legend
    let legend = d3.select('.legend');
    legend.html('');

    data.forEach((d, idx) => {
        legend.append('li')
            .attr("data-index", idx)
            .attr('style', `--color:${colorScale(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .on("click", function () {
                console.log("📌 Legend Clicked! Index:", idx, "Previous:", selectedIndex);
                selectedIndex = selectedIndex === idx ? -1 : idx; // ✅ Toggle selection
                console.log("✅ New selectedIndex:", selectedIndex);
                
                updateSelection(); // ✅ Update Pie Chart & Legend Styling
                updateProjectList(); // ✅ Ensure project list updates on legend click
            });
    });

    updateSelection(); // ✅ Apply initial selection state
}

// ✅ Function to Apply Selection Immediately
function updateSelection() {
    d3.selectAll("path")
        .classed("selected", (_, idx) => idx === selectedIndex)
        .attr("fill", (_, idx) => (idx === selectedIndex ? "var(--color-accent)" : d3.schemeTableau10[idx])); // ✅ Change color immediately

    d3.selectAll("li[data-index]")
        .classed("selected", (_, idx) => idx === selectedIndex)
        .select(".swatch")
        .style("background-color", (_, idx) => (idx === selectedIndex ? "var(--color-accent)" : "")); // ✅ Change legend color
}

// ✅ Handle Search Input
document.addEventListener("DOMContentLoaded", () => {
    searchInput = document.querySelector('.searchBar');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            query = event.target.value;
            updateProjectList();
        });
    }
    loadProjects();
});
