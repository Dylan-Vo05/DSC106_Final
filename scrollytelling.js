// Visualization state and data
let currentStep = 1;
let currentData = null;
const visualizations = {
  1: createPreOpViz,
  2: createSurgeryViz,
  3: createICUViz,
  4: createOutcomesViz
};

function createPreOpViz() {
  const viz = d3.select('#visualization');
  viz.html('');
  viz.append('h2')
     .text('Pre-Op Assessment')
     .style('text-align', 'center');
  
  viz.append('h4')
    .text('Based on your selection, how likely are you to have...?');
  viz.append('div')
    .attr('id','predispose');
}

function createSurgeryViz() {
  const viz = d3.select('#visualization');
  viz.html('');
  viz.append('h2')
     .text('Surgery Details')
     .style('text-align', 'center');
  
  viz.append('div')
     .style('width', '80%')
     .style('height', '60%')
     .style('margin', '0 auto')
     .style('background', '#ddd')
     .style('display', 'flex')
     .style('align-items', 'center')
     .style('justify-content', 'center')
     .html('Surgery Visualization<br>(Placeholder)');
}

function createICUViz() {
  const viz = d3.select('#visualization');
  viz.html('');
  viz.append('h2')
     .text('ICU Recovery Stats')
     .style('text-align', 'center');
  
  viz.append('div')
     .style('width', '80%')
     .style('height', '60%')
     .style('margin', '0 auto')
     .style('background', '#ddd')
     .style('display', 'flex')
     .style('align-items', 'center')
     .style('justify-content', 'center')
     .html('ICU Visualization<br>(Placeholder)');
}

function createOutcomesViz() {
  const viz = d3.select('#visualization');
  viz.html('');
  viz.append('h2')
     .text('Patient Outcomes')
     .style('text-align', 'center');
  
  viz.append('div')
     .style('width', '80%')
     .style('height', '60%')
     .style('margin', '0 auto')
     .style('background', '#ddd')
     .style('display', 'flex')
     .style('align-items', 'center')
     .style('justify-content', 'center')
     .html('Outcomes Visualization<br>(Placeholder)');
}

// Set up intersection observer
const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5
};

// Create observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const step = parseInt(entry.target.dataset.step);
            if (step !== currentStep) {
                currentStep = step;
                updateVisualization(step);
            }
        }
    });
}, observerOptions);

// Function to handle tooltip updates
function updateTooltip(event, data, tooltipId = "#visualization-tooltip") {
    const tooltip = d3.select(tooltipId);
    const bounds = event.target.getBoundingClientRect();
    
    tooltip
        .style("left", `${event.clientX + 10}px`)
        .style("top", `${event.clientY + 10}px`)
        .style("display", "block");

    // Update tooltip content based on data
    if (data) {
        let content = "";
        if (data.optype) {
            content = `<strong>${data.optype}</strong><br>
                      Average Duration: ${(data.duration || 0).toFixed(2)} hours`;
        } else if (data.name) {
            content = `<strong>${data.name}</strong><br>
                      Value: ${(data.value || 0).toFixed(2)}`;
        }
        tooltip.html(content);
    }
}

function hideTooltip(tooltipId = "#visualization-tooltip") {
    d3.select(tooltipId).style("display", "none");
}

// Function to handle visualization changes
function updateVisualization(step) {
    const container = d3.select("#visualization");
    container.selectAll("*").remove(); // Clear previous visualization
    
    switch(step) {
        case 1:
            renderPreOpViz();
            break;
        case 2:
            renderSurgeryViz();
            break;
        case 3:
            renderICUViz();
            break;
        case 4:
            renderOutcomesViz();
            break;
    }
}

// Observe all scroll sections
document.addEventListener('DOMContentLoaded', () => {
    // Add tooltip container if it doesn't exist
    if (!document.querySelector("#visualization-tooltip")) {
        const tooltipDiv = document.createElement("div");
        tooltipDiv.id = "visualization-tooltip";
        tooltipDiv.className = "tooltip";
        document.body.appendChild(tooltipDiv);
    }

    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach(section => observer.observe(section));
    
    // Initialize first visualization
    updateVisualization(1);
}); 