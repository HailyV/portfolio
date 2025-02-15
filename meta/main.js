let data = [];
let commits = [];
const width = 1000;  // Back to original width
const height = 600;  // Back to original height
let xScale, yScale; // Declare globally to be used in brushing
let brushSelection = null; // Stores the selected area




async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // Convert line numbers to numbers
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone), // Convert to Date object
    datetime: new Date(row.datetime),
  }));

  console.log("Loaded Data:", data); // Check structure
  processCommits(); // Process commits only after data is loaded
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
  
        let ret = {
          id: commit,
          url: `https://github.com/vis-society/lab-7/commit/${commit}`,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60, // Convert time to decimal
          totalLines: lines.length, // Count modified lines
        };
  
        // Define 'lines' as a non-enumerable, non-writable, non-configurable property
        Object.defineProperty(ret, 'lines', {
          value: lines,
          writable: false, // Prevent modifications to the array
          enumerable: false, // Exclude from iteration (e.g., `Object.keys`)
          configurable: false, // Prevent deletion or redefinition
        });
  
        return ret;
      });
  
    console.log("Processed Commits:", commits); // Debugging output
  }
  
  function displayStats() {
    processCommits(); // Ensure commits are processed first
  
    // Clear previous stats before adding new ones
    d3.select("#stats").html("");
  
    // Select the stats <dl> element inside #profile-stats
    const statsContainer = d3.select("#stats");
  
    function addStat(title, value, subValue = null) {
      const statItem = statsContainer.append("div").attr("class", "stat-item");
      statItem.append("dd")
        .html(subValue ? `<strong>${value}</strong><br><span class="sub-value">${subValue}</span>` : `<strong>${value}</strong>`);
      statItem.append("dt").text(title);
    }
  
    // **1️⃣ Total number of files in the codebase**
    const uniqueFiles = [...new Set(data.map(d => d.file))];
    addStat("Total Files", uniqueFiles.length);
  
    // **2️⃣ Longest file (by number of lines)**
    const fileLineCounts = d3.rollup(data, v => v.length, d => d.file);
    const longestFile = [...fileLineCounts.entries()].reduce((a, b) => (b[1] > a[1] ? b : a));
    addStat("Longest File", longestFile[0], `(${longestFile[1]} lines)`);
  
    // **3️⃣ Average file length (in lines)**
    const avgFileLength = d3.mean([...fileLineCounts.values()]);
    addStat("Average File Length", Math.round(avgFileLength));
  
    // **4️⃣ Time of day when most work is done**
    function getTimeOfDay(hour) {
      if (hour >= 5 && hour < 12) return "Morning";
      if (hour >= 12 && hour < 17) return "Afternoon";
      if (hour >= 17 && hour < 21) return "Evening";
      return "Night";
    }
  
    const timeBuckets = d3.rollup(data, v => v.length, d => getTimeOfDay(new Date(d.datetime).getHours()));
    const peakTime = [...timeBuckets.entries()].reduce((a, b) => (b[1] > a[1] ? b : a));
    addStat("Most Active Time", peakTime[0], `(${peakTime[1]} commits)`);
  
    console.log("Displaying Stats:", { 
      totalFiles: uniqueFiles.length, 
      longestFile, 
      avgFileLength, 
      peakTime 
    });
  }
  function createScatterplot() {
    console.log("Creating Scatterplot...");
  
    // Clear any existing chart before creating a new one
    d3.select("#chart").html("");
  
    if (!commits.length) {
      console.error("No commit data available!");
      return;
    }
  
    // **Set Dimensions**
    const width = 1000, height = 600;
    const margin = { top: 50, right: 60, bottom: 60, left: 80 };
  
    const usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };
  
    // **Create SVG**
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("display", "block")
      .style("margin", "auto");
  
    // **Define Scales Globally**
    xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([usableArea.left, usableArea.right])
      .nice();
  
    yScale = d3
      .scaleLinear()
      .domain([0, 24])
      .range([usableArea.bottom, usableArea.top]);
  
    // **Create Brush**
    const brush = d3
      .brush()
      .extent([
        [usableArea.left, usableArea.top],
        [usableArea.right, usableArea.bottom],
      ])
      .on("start brush end", brushed);
  
    // **Append Brush**
    svg.append("g").attr("class", "brush").call(brush);
  
    // **Reorder Elements to Fix Tooltip Overlap**
    svg.selectAll(".dots, .overlay ~ *").raise();
  
    // **Step 2.3: Add Grid Lines**
    svg.append("g")
      .attr("class", "gridlines")
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));
  
    // **Step 2.2: Add X and Y Axes**
    svg.append("g")
      .attr("transform", `translate(0, ${usableArea.bottom})`)
      .call(d3.axisBottom(xScale))
      .style("font-size", "14px");
  
    svg.append("g")
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat((d) => `${String(d).padStart(2, "0")}:00`))
      .style("font-size", "14px");
  
    // **Scale Dot Size Based on Lines Edited**
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([3, 25]);
  
    // **Sort Commits (Larger Dots First)**
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  
    // **Draw Circles**
    const dots = svg.append("g").attr("class", "dots");
  
    dots
      .selectAll("circle")
      .data(sortedCommits)
      .join("circle")
      .attr("cx", (d) => xScale(d.datetime))
      .attr("cy", (d) => yScale(d.hourFrac))
      .attr("r", (d) => rScale(d.totalLines))
      .attr("fill", "steelblue")
      .style("fill-opacity", 0.7)
      .on("mouseenter", function (event, d) {
        d3.select(event.currentTarget).style("fill-opacity", 1);
        updateTooltipContent(d);
        updateTooltipPosition(event);
      })
      .on("mousemove", (event) => updateTooltipPosition(event))
      .on("mouseleave", function () {
        d3.select(event.currentTarget).style("fill-opacity", 0.7);
        updateTooltipContent({});
      });
  
    console.log("Scatterplot created successfully!");
  }
  function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
  }
  function isCommitSelected(commit) {
    if (!brushSelection) return false;
  
    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
  
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
  
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
  }
  function updateSelection() {
    d3.selectAll("circle").classed("selected", (d) => isCommitSelected(d));
    updateSelectionCount();
    updateLanguageBreakdown();
  }
  function updateSelectionCount() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    document.getElementById("selection-count").textContent = `${selectedCommits.length || "No"} commits selected`;
  }
  function updateLanguageBreakdown() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    const container = document.getElementById("language-breakdown");
  
    if (selectedCommits.length === 0) {
      container.innerHTML = "";
      return;
    }
  
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // **Count lines per language**
    const breakdown = d3.rollup(lines, (v) => v.length, (d) => d.type);
  
    // **Update DOM**
    container.innerHTML = "";
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format(".1~%")(proportion);
  
      container.innerHTML += `
          <dt>${language}</dt>
          <dd>${count} lines (${formatted})</dd>
      `;
    }
  }
  
  
  
  async function loadData() {
    data = await d3.csv("loc.csv", (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone), // Convert date
      datetime: new Date(row.datetime), // Convert full datetime
    }));
  
    console.log("Raw Data Loaded:", data);
  
    // Process commits before visualizing
    displayStats();
    createScatterplot(); // Generate scatterplot
  }
  
  document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
  });
  
  function updateTooltipContent(commit) {
    const tooltip = document.getElementById("commit-tooltip");
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");
    const time = document.getElementById("commit-time");
    const author = document.getElementById("commit-author");
    const lines = document.getElementById("commit-lines");
  
    if (Object.keys(commit).length === 0) {
      updateTooltipVisibility(false);
      return;
    }
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString("en", { dateStyle: "full" });
    time.textContent = commit.datetime?.toLocaleTimeString("en", { timeStyle: "short" });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
  
    updateTooltipVisibility(true);
  }
  
  
  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.hidden = !isVisible;
  }
  function updateTooltipPosition(event) {
    const tooltip = document.getElementById("commit-tooltip");
  
    // Offset tooltip slightly to prevent it from covering the cursor
    const offsetX = 15;
    const offsetY = 15;
  
    tooltip.style.left = `${event.clientX + offsetX}px`;
    tooltip.style.top = `${event.clientY + offsetY}px`;
  }

  