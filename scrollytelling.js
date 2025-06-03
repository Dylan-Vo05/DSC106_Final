// Visualization state and data
let currentStep = 1;
const visualizations = {
  1: createAdmissionViz,
  2: createPreOpViz,
  3: createSurgeryViz,
  4: createICUViz,
  5: createOutcomesViz
};

// Placeholder visualization functions
function createAdmissionViz() {
  const viz = d3.select('#visualization');
  viz.html(''); // Clear previous visualization
  viz.append('h2')
     .text('Admission Demographics')
     .style('text-align', 'center');
  
  // Placeholder rectangle
  viz.append('div')
     .style('width', '80%')
     .style('height', '60%')
     .style('margin', '0 auto')
     .style('background', '#ddd')
     .style('display', 'flex')
     .style('align-items', 'center')
     .style('justify-content', 'center')
     .html('Admission Visualization<br>(Placeholder)');
}

function createPreOpViz() {
  const viz = d3.select('#visualization');
  viz.html('');
  viz.append('h2')
     .text('Pre-Op Assessment')
     .style('text-align', 'center');
  
  viz.append('div')
     .style('width', '80%')
     .style('height', '60%')
     .style('margin', '0 auto')
     .style('background', '#ddd')
     .style('display', 'flex')
     .style('align-items', 'center')
     .style('justify-content', 'center')
     .html('Pre-Op Visualization<br>(Placeholder)');
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

// Initialize first visualization
createAdmissionViz();

// Intersection Observer setup
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const step = parseInt(entry.target.dataset.step);
      if (step !== currentStep) {
        // Remove active class from all sections
        document.querySelectorAll('.scroll-section').forEach(section => {
          section.classList.remove('active');
        });
        
        // Add active class to current section
        entry.target.classList.add('active');
        
        // Update visualization
        currentStep = step;
        visualizations[step]();
      }
    }
  });
}, observerOptions);

// Observe all scroll sections
document.querySelectorAll('.scroll-section').forEach(section => {
  observer.observe(section);
}); 