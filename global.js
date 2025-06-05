Promise.all([
  d3.csv('cases.txt'),
  d3.csv('clean_lab.csv')
])
.then(function([data1, data2]) {
  cleaned = data1.filter(d => +d.aneend >= +d.anestart).map(d => ({
    ...d,
    age: +d.age,
    height: +d.height,
    weight: +d.weight,
    preop_hb: +d.preop_hb,
    preop_plt: +d.preop_plt,
    preop_ph: +d.preop_ph,
    preop_gluc: +d.preop_gluc,
    preop_na: +d.preop_na,
    preop_k: +d.preop_k,
    preop_htn: +d.preop_htn,
    preop_dm: +d.preop_dm,
    opstart: +d.opstart,
    opend: +d.opend,
  }));

  labs = data2.map(d => ({
    ...d,
    caseid: +d.caseid,
    dt: +d.dt,
    result: +d.result,
    hour: +d.hour,
    pct_change: +d.pct_change
  }))

  let age = -1;
  let height = -1;
  let weight = -1;

  let intraop_surgery = 'Colorectal';
  let intraop_type = 'Cell Count'

  let ageRange = d3.extent(cleaned, d => d.age);
  let heightRange = d3.extent(cleaned, d => d.height);
  let weightRange = d3.extent(cleaned, d => d.weight);

  let filteredData = cleaned;

  d3.select("#age")
  .attr("min", ageRange[0])
  .attr("max", ageRange[1])

  d3.select("#height")
  .attr("min", heightRange[0])
  .attr("max", heightRange[1])

  d3.select("#weight")
  .attr("min", weightRange[0])
  .attr("max", weightRange[1])

    // D3 visualization code goes here
    /*
  showCount(cleaned);
  renderOperationDuration(cleaned);
  renderAnesthesiaDuration(cleaned);
  renderPredisposeInfo(cleaned);
  renderPreopInfo(cleaned);
  renderIntraop(cleaned, intraop_surgery, intraop_type);
  renderICUScatter(cleaned);
  renderICUBoxplot(cleaned);
  */
  createPreOpViz();

  d3.select("#toggle-male").on("change", function () {
    if (this.checked) {
      d3.select("#toggle-female").property("checked", false);
    }
    updateFilter();
  });

  d3.select("#toggle-female").on("change", function () {
    if (this.checked) {
      d3.select("#toggle-male").property("checked", false);
    }
    updateFilter();
  });

  d3.select("#age").on("input", function () {
    age = d3.select(this).property("valueAsNumber");
    const value = d3.select(this).property("valueAsNumber");
    d3.select("#age-value").text(value + ' years'); 
    age = value;
    updateFilter();
  });

  d3.select("#height").on("input", function () {
    height = d3.select(this).property("valueAsNumber");
    const value = d3.select(this).property("valueAsNumber");
    d3.select("#height-value").text(value + ' cm');  
    height = value;
    updateFilter();
  });

  d3.select("#weight").on("input", function () {
    weight = d3.select(this).property("valueAsNumber");
    const value = d3.select(this).property("valueAsNumber");
    d3.select("#weight-value").text(value + ' kgs');  
    weight = value;
    updateFilter();
  });

  d3.select("#surgery-drop").on("input", function () {
    intraop_surgery = d3.select(this).property('value');
    renderIntraop(filteredData, intraop_surgery, intraop_type);
    
  });

  d3.select("#intraop-type").on("input", function () {
    intraop_type = d3.select(this).property('value');
    renderIntraop(filteredData, intraop_surgery, intraop_type);
  });

  function updateFilter(){
    console.log("filter updated");

    d3.select("#opduration_vis").selectAll("*").remove();
    d3.select("#predispose").selectAll("*").remove();
    d3.select("#preop").selectAll("*").remove();
    d3.select("#aneduration_vis").selectAll("*").remove();
    d3.select("#intraop").selectAll("*").remove();
    
    filteredData = cleaned;

    const checkMale = d3.select("#toggle-male").property("checked");
    const checkFemale = d3.select("#toggle-female").property("checked");
    
    if (checkMale) {
      filteredData = filteredData.filter(d => d.sex === 'M');
    }
    else if (checkFemale) {
      filteredData = filteredData.filter(d => d.sex === 'F');
    }
    
    if (!isNaN(age) && age > -1) {
      filteredData = filteredData.filter(d =>
        +d.age >= age - 0.05 * (ageRange[1] - ageRange[0]) &&
        +d.age <= age + 0.05 * (ageRange[1] - ageRange[0])
      );
    }
  
    if (!isNaN(height) && height > -1) {
      filteredData = filteredData.filter(d =>
        +d.height >= height - 0.05 * (heightRange[1] - heightRange[0]) &&
        +d.height <= height + 0.05 * (heightRange[1] - heightRange[0])
      );
    }
  
    if (!isNaN(weight) && weight > -1) {
      filteredData = filteredData.filter(d =>
        +d.weight >= weight - 0.05 * (weightRange[1] - weightRange[0]) &&
        +d.weight <= weight + 0.05 * (weightRange[1] - weightRange[0])
      );
    }
  
    console.log("Filtered data length:", filteredData.length);

    showCount(filteredData);
    renderOperationDuration(filteredData);
    renderAnesthesiaDuration(filteredData)
    renderPredisposeInfo(filteredData);
    renderPreopInfo(filteredData);
    renderIntraop(filteredData, intraop_surgery, intraop_type);
    renderOutcome(cleaned);
  }

  function renderOperationDuration(data) {
    data.forEach(d => {
      d.op_duration = (d.opend - d.opstart)/3600
    })

    avgByOpType = d3.rollups (
        data,
        v => d3.mean(v, (v) => v.op_duration),
        d => d.optype
    );

    const width = 800;
    const height = 250; 

    const surgeryDescriptions = {
      'Colorectal': "Focuses on treatment of the colon, rectum, and anus. Procedures range from polyp removal to cancer and inflammatory bowel disease treatment.",
      'Stomach': "Involves surgical intervention on the stomach, often for ulcers, tumors, or weight-loss procedures such as gastrectomy or gastric bypass.",
      'Biliary/Pancreas': "Covers operations on the bile ducts, gallbladder, and pancreas, typically for gallstones, pancreatitis, or tumors in the hepatobiliary system.",
      'Vascular': "Treats disorders of the blood vessels, including procedures to repair aneurysms, clear blockages, or create access for dialysis.",
      'Major resection': "Involves removal of large or complex tissue sections, in cases of advanced tumors or extensive disease in organs like the liver or intestines.",
      'Breast': "Surgical treatment of breast conditions, including lumpectomy, mastectomy, or reconstruction, often related to cancer or benign tumors.",
      'Minor resection': "Refers to smaller-scale removals of tissue, such as partial organ or lesion removal.",
      'Transplantation': "Involves replacing a diseased organ with a healthy one from a donor, such as liver, kidney, or heart transplants.",
      'Hepatic': "Targets diseases of the liver, such as resections for tumors, treatment for cirrhosis, or preparation for transplantation.",
      'Thyroid': "Involves surgery on the thyroid gland, typically for nodules, cancer, or hyperthyroidism, ranging from lobectomy to full thyroidectomy.",
      'Others': "Includes various procedures that do not fall into standard categories, often unique or highly specialized surgical cases."
    };

    const svg = d3
      .select('#opduration_vis')
      .append('svg')
      .attr("width", width + 100)
      .attr("height", height + 100);

  // scales for axis
    const xScale = d3
      .scaleBand()
      .domain(avgByOpType.map((d) => d[0]))
      .range([0, width]); 

    maxDuration = d3.max(avgByOpType, d => d[1]);
    const yScale = d3.scaleLinear().domain([0, maxDuration]).range([height, 0]);

    // chart area
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left + 20,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };

    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    svg.append("g")
      .attr("fill", '#D8BFD8')
      .selectAll()
      .data(avgByOpType)
      .join("rect")
      .attr("class", "rect-duration")
      .attr("x", d => xScale(d[0]))
      .attr("y", height - margin.bottom)
      .attr("height", 0)
      .attr("width", xScale.bandwidth())
      .style("opacity", 0) // set bars invisible for animation
      .on('mousemove', (event, d) => {
        renderTooltipInfo(d, surgeryDescriptions);
        updateTooltipPosition(event);
      })
      .on('mouseleave', () => {
        updateTooltipVisibility(false);
      })
      .transition() // animate new bars
      .duration(500) // animation duration
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(0) - yScale(d[1]))
      .style("opacity", 1);

      // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

      // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Surgery Type");

      // Add Y axis
      svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)") 
        .attr("x", -usableArea.height / 2)
        .attr("y", -usableArea.left + 10)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Avg Operation Duration (Hours)"); 
    }

  function renderTooltipInfo(data, details) {
  const tooltip = document.getElementById('opduration-tooltip');
  tooltip.style.display = 'block';  // show
  tooltip.innerHTML = `
    <strong>${data[0]}</strong>
    <p>${details[data[0]]}</p>
  `;
}

  function renderAnesthesiaDuration(data) {
    data.forEach(d => {
      d.ane_duration = (d.aneend - d.anestart)/3600
    })

    avgByOpType = d3.rollups (
        data,
        v => d3.mean(v, (v) => v.ane_duration),
        d => d.ane_type
    );

    const width = 800;
    const height = 250; 

    const aneDescriptions = {
      'General': 'Leaves patient unconscious and blocks pain throughout the body. Administered through inhalation or IV, typically requiring breathing support. Used for major surgeries',
      'Spinal': 'Leaves patient awake, but blocks sensation below injection point (typically the lower back). Administered through injection into spinal fluid. Used for c-sections and lower body surgeries',
      'Sedationalgesia': 'Leaves patient awake but in a relaxed state, with reduced pain sensation. Administered through IV. Used in minor surgery, like dental work or endoscopy'
    }

    const svg = d3
      .select('#aneduration_vis')
      .append('svg')
      .attr("width", width + 100)
      .attr("height", height + 100);

  // scales for axis
    const xScale = d3
      .scaleBand()
      .domain(avgByOpType.map((d) => d[0]))
      .range([0, width]); 

    maxDuration = d3.max(avgByOpType, d => d[1]);
    const yScale = d3.scaleLinear().domain([0, maxDuration]).range([height, 0]);

    // chart area
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left + 20,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };

    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    svg.append("g")
      .attr("fill", '#D8BFD8')
      .selectAll()
      .data(avgByOpType)
      .join("rect")
      .attr("class", "rect-duration")
      .attr("x", d => xScale(d[0]))
      .attr("y", height - margin.bottom)
      .attr("height", 0)
      .attr("width", xScale.bandwidth())
      .style("opacity", 0) // set bars invisible for animation
      .on('mousemove', (event, d) => {
        renderTooltipInfo(d, aneDescriptions);
        updateTooltipPosition(event);
      })
      .on('mouseleave', () => {
        updateTooltipVisibility(false);
      })
      .transition() // animate new bars
      .duration(500) // animation duration
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(0) - yScale(d[1]))
      .style("opacity", 1);

      // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

      // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Anesthesia Type");

      // Add Y axis
      svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)") 
        .attr("x", -usableArea.height / 2)
        .attr("y", -usableArea.left + 10)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Avg Anesthesia Duration (Hours)"); 
  }

  function renderPredisposeInfo(data) {

    const dl = d3.select('#predispose').append('dl').attr('class', 'predispose');

    dl.append('dt').html('Hypertension');
    dl.append('dd').text(safeToFixed(d3.mean(data, d => d.preop_htn) * 100)  + ' %');
    
    dl.append('dt').html('Diabetes');
    dl.append('dd').text(safeToFixed(d3.mean(data, d => d.preop_dm) * 100)  + ' %');
  }

  function safeToFixed(value, digits = 2) {
    if (value === undefined || value === null || isNaN(value)) {
      return "N/A";
    }
    return value.toFixed(digits);
  }

  function renderPreopInfo(data) {

    const dl = d3.select('#preop').append('dl').attr('class', 'preop');

    dl.append('dt').html('Hemoglobin');
    dl.append('dt').html('Platelets');
    dl.append('dt').html('pH');

    dl.append('dd').text(safeToFixed(d3.mean(data, d=> d.preop_hb))  + ' g/dl');
    dl.append('dd').text(safeToFixed(d3.mean(data, d => d.preop_plt))  + ' x1000/mcL');
    dl.append('dd').text(safeToFixed(d3.mean(data, d => d.preop_ph)));

    dl.append('dt').html('Glucose');
    dl.append('dt').html('Sodium');
    dl.append('dt').html('Potassium');

    dl.append('dd').text(safeToFixed(d3.mean(data, d => d.preop_gluc))  + ' mg/dl');
    dl.append('dd').text(safeToFixed(d3.mean(data, d => d.preop_na))  + ' mmol/L');
    dl.append('dd').text(safeToFixed(d3.mean(data, d => d.preop_k)) + ' mmol/L');
  }

  
function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('opduration-tooltip');
  tooltip.style.display = isVisible ? 'block' : 'none';
}

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('duration-tooltip');
    if (tooltip) {
        tooltip.style.left = `${event.pageX + 15}px`;
        tooltip.style.top = `${event.pageY + 15}px`;
    }
  }

  function showCount(data) {
    const dl = d3.select('#case_count').text(data.length)
  }

  function renderIntraop(data, intraop_surgery, intraop_type) {
    const validCases = data.filter(d => d.optype === intraop_surgery);
    const validCaseIDs = new Set(validCases.map(d => +d.caseid));
    let yval = d => +d.pct_change;
    let cols = [];
    let ylabel = 'Percentage Change (%)';

    const legendNames = {
      wbc: ["White Blood Cells", "Immune cells that help fight infections. High levels may indicate infection, inflammation, or stress, while low levels can indicate bone marrow issues or immunodeficiency"],
      plt: ["Platelets", "Cell fragments involved in clotting. Low counts increase bleeding risk and high levels may increase stroke risk or suggest inflammation"],
      na: ["Sodium", "Regulates fluid balance and nerve communication. Abnormal levels can cause neurological symptoms and are due to improper hydration"],
      k: ["Potassium", "Critical for heart rhythm, nerve signals, and muscle function. Extremes can lead to dangerous cardiac arrhythmias"],
      ica: ["Ionized Calcium", "Biologically active form of calcium, important for muscle contractions, blood clotting, and nerve function. More important than total calcium in critical care environments"],
      cl: ["Chloride", "Helps maintain fluid balance, pH, and is often interpreted alongside sodium and bicarbonate in metabolic assessments"],
      hb: ["Hemoglobin", "Protein in red blood cells that carries oxygen. Low levels (anemia) reduce oxygen delivery; high levels may suggest chronic hypoxia or polycythemia"],
      gluc: ["Glucose", "Blood sugar level. High levels can indicate diabetes or stress, with low levels (hypoglycemia) causing confusion, seizures, or coma"],
      tprot: ["Total Protein", "Sum of albumin and globulins in the blood. Reflects nutritional status, liver function, and immune activity"],
      ammo: ["Ammonia", "Waste product processed by the liver. High levels may indicate liver dysfunction or inborn metabolic disorders and can lead to encephalopathy"]
    };

    if (intraop_type === 'Cell Count') {
      cols = ['wbc', 'plt'];
      ylabel = 'Count (x1000/mcL)';
      yval = d => +d.result;
    } else if (intraop_type === 'Electrolyte Levels') {
      cols = ['na', 'k', 'ica', 'cl'];
    } else if (intraop_type === 'Metabolite Levels') {
      cols = ['hb', 'gluc', 'tprot', 'ammo'];
    }

    const filtered = labs
      .filter(d =>
        validCaseIDs.has(d.caseid) &&
        cols.includes(d.name) &&
        d.pct_change !== "" &&
        !isNaN(+d.pct_change)
      )
      .map(d => ({
        caseid: d.caseid,
        name: d.name,
        hour: +d.hour,
        pct_change: +d.pct_change,
        result: +d.result
      }));

    const groupedByNameAndHour = d3.group(filtered, d => d.name, d => d.hour);

    const medianData = new Map();

    for (const [name, hoursMap] of groupedByNameAndHour.entries()) {
      const medianPoints = [];
      for (const [hour, records] of hoursMap.entries()) {
        const values = records.map(yval).sort(d3.ascending);
        const medianVal = d3.median(values);
        medianPoints.push({ hour, medianVal });
      }
      medianPoints.sort((a, b) => a.hour - b.hour);
      medianData.set(name, medianPoints);
    }

    const width = 800, height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    d3.select("#intraop_vis").selectAll("*").remove();
    const svg = d3.select("#intraop_vis")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scaleLinear()
      .domain(d3.extent(filtered, d => d.hour))
      .range([margin.left, width - margin.right]);

    const values = filtered.map(yval).sort(d3.ascending);
    const lower = 0;
    const upper = d3.quantile(values, 0.99);

    const y = d3.scaleLinear()
      .domain([lower, upper])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain(cols)
      .range(d3.schemeTableau10);

    const tooltip = d3.select("#surgery-tooltip")
        .style("position", "fixed")
        .style("z-index", "1000");

    // Dedicated group for lines
    const lineLayer = svg.append("g").attr("id", "lines");

    lineLayer.selectAll(".line")
      .data(Array.from(medianData.entries()))
      .join("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", ([name]) => color(name))
      .attr("stroke-width", 1.8)
      .attr("opacity", 1)
      .attr("d", ([, points]) =>
        d3.line()
          .x(d => x(d.hour))
          .y(d => y(d.medianVal))(points)
      )
      .on("mousemove", function(event, [name]) {
        // Dim all lines except the hovered one
        lineLayer.selectAll(".line")
          .classed("dimmed", true)
          .classed("highlighted", false);

        d3.select(this)
          .classed("dimmed", false)
          .classed("highlighted", true)
          .raise();

        // Show and position tooltip
        tooltip
          .style("display", "block")
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY + 15) + "px")
          .html(`<strong>${legendNames[name][0]}</strong><br>${legendNames[name][1]}`);
      })
      .on("mouseleave", function() {
        // Reset line styles
        lineLayer.selectAll(".line")
          .classed("dimmed", false)
          .classed("highlighted", false);

        // Hide tooltip
        tooltip.style("display", "none");
      });
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Hours");

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -35)
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(ylabel);

    const legendItemHeight = 20;
    const legendBoxPadding = 10;

    const legendLayer = svg.append("g")
      .attr("id", "legend-layer")
      .attr("transform", `translate(${width - margin.right - 150}, ${margin.top})`)
      .style("pointer-events", "none"); // Avoid blocking line interaction

    // Legend background
    legendLayer.append("rect")
      .attr("x", -legendBoxPadding)
      .attr("y", -legendBoxPadding)
      .attr("width", 140)
      .attr("height", cols.length * legendItemHeight + legendBoxPadding * 2)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#ccc")
      .attr("rx", 6);

    // Legend color squares
    legendLayer.selectAll("legend-color")
      .data(cols)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * legendItemHeight)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => color(d));

     legendLayer.selectAll("legend-text")
      .data(cols)
      .join("text")
      .attr("x", 24)
      .attr("y", (d, i) => i * legendItemHeight + 14)
      .text(d => legendNames[d][0])
      .attr("font-size", 12)
      .attr("fill", "black");
  }

  
function renderICUScatter(data) {
  console.log('icu viz')
  data.forEach(d => {
      d.icu_days = +d.icu_days;         
      d.op_duration = (d.opend - d.opstart)/3600
    });

  // set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 40, left: 60},
    //width = 460 - margin.left - margin.right,
    //height = 400 - margin.top - margin.bottom;
    width = 460,
    height = 400;

// append the svg object to the body of the page
const svg = d3.select("#postop-vis")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
   
  // Add X axis
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.op_duration)])
    .nice()
    .range([0, width]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .append("text")
        .attr("x", width/2)
        .attr("y", 35)
        .attr("font-size", 12)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Duration of Operation (Hours)");


  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.icu_days)])
    .range([height, 0]);

  svg.append("g").call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)") 
        .attr("x", -height/2)
        .attr("y", -50)
        .attr("font-size", 12)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Days Spent in ICU");
    
   const surgeryDescriptions = {
      'Colorectal': "Focuses on treatment of the colon, rectum, and anus. Procedures range from polyp removal to cancer and inflammatory bowel disease treatment.",
      'Stomach': "Involves surgical intervention on the stomach, often for ulcers, tumors, or weight-loss procedures such as gastrectomy or gastric bypass.",
      'Biliary/Pancreas': "Covers operations on the bile ducts, gallbladder, and pancreas, typically for gallstones, pancreatitis, or tumors in the hepatobiliary system.",
      'Vascular': "Treats disorders of the blood vessels, including procedures to repair aneurysms, clear blockages, or create access for dialysis.",
      'Major resection': "Involves removal of large or complex tissue sections, in cases of advanced tumors or extensive disease in organs like the liver or intestines.",
      'Breast': "Surgical treatment of breast conditions, including lumpectomy, mastectomy, or reconstruction, often related to cancer or benign tumors.",
      'Minor resection': "Refers to smaller-scale removals of tissue, such as partial organ or lesion removal.",
      'Transplantation': "Involves replacing a diseased organ with a healthy one from a donor, such as liver, kidney, or heart transplants.",
      'Hepatic': "Targets diseases of the liver, such as resections for tumors, treatment for cirrhosis, or preparation for transplantation.",
      'Thyroid': "Involves surgery on the thyroid gland, typically for nodules, cancer, or hyperthyroidism, ranging from lobectomy to full thyroidectomy.",
      'Others': "Includes various procedures that do not fall into standard categories, often unique or highly specialized surgical cases."
    };

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.op_duration))
    .attr("cy", (d) => y(d.icu_days))
    .attr("r", 5)
    .style("fill", "#69b3a2")
    .on('mouseenter', (event, d) => {
        renderTooltipContent(d);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', () => {
        updateTooltipVisibility(false);
      });
}

function renderICUBoxplot(data, containerId = "#visualization") {

  // Filter out invalid ICU length of stay data
  const filteredData = data;

  // Group data by surgery type
  const groupedData = d3.group(filteredData, d => d.optype);

  console.log("filteredData length:", filteredData.length);
  console.log(filteredData.slice(0, 5));


  // Compute boxplot stats for each surgery type
  const stats = Array.from(groupedData, ([surgeryType, values]) => {
    const icuLOSValues = values.map(d => +d.icu_days).sort(d3.ascending);
    const q1 = d3.quantile(icuLOSValues, 0.25);
    const median = d3.quantile(icuLOSValues, 0.5);
    const q3 = d3.quantile(icuLOSValues, 0.75);
    const min = icuLOSValues[0];
    const max = icuLOSValues[icuLOSValues.length - 1];
    console.log(surgeryType, icuLOSValues, { q1, median, q3, min, max });
    return { surgeryType, min, q1, median, q3, max };
  });

  // Dimensions & margins (consistent naming)
  const width = 800;
  const height = 400;
  const margin = { top: 30, right: 30, bottom: 70, left: 60 };

  // Clear previous svg content
  //d3.select(containerId).selectAll("*").remove();

  // Create svg
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // X scale - categorical surgery types
  const x = d3.scaleBand()
    .domain(stats.map(d => d.surgeryType))
    .range([margin.left, width - margin.right])
    .paddingInner(0.3)
    .paddingOuter(0.2);

  // Y scale - ICU length of stay
  const y = d3.scaleLinear()
    .domain([
      0,
      5
    ])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Color scale (consistent with your other plots)
  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(stats.map(d => d.surgeryType));

  // Create tooltip div if it doesn't exist
  let tooltip = d3.select("#boxplot-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("id", "boxplot-tooltip")
      .attr("class", "tooltip")
      .style("display", "none");
  }

  // Draw boxes with tooltip interaction
  svg.selectAll("rect.box")
    .data(stats)
    .join("rect")
    .attr("class", "box")
    .attr("x", d => x(d.surgeryType))
    .attr("y", d => Math.min(y(d.q1), y(d.q3)))
    .attr("width", x.bandwidth())
    .attr("height", d => Math.abs(y(d.q1) - y(d.q3)))
    .attr("fill", "steelblue")
    .attr("opacity", 0.7)
    .on("mousemove", function(event, d) {
      tooltip
        .style("display", "block")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px")
        .html(`
          <strong>${d.surgeryType}</strong><br/>
          Maximum: ${d.max.toFixed(1)} days<br/>
          75th percentile: ${d.q3.toFixed(1)} days<br/>
          Median: ${d.median.toFixed(1)} days<br/>
          25th percentile: ${d.q1.toFixed(1)} days<br/>
          Minimum: ${d.min.toFixed(1)} days
        `);
    })
    .on("mouseleave", function() {
      tooltip.style("display", "none");
    });

  // Draw median lines
  svg.selectAll("line.median")
    .data(stats)
    .join("line")
    .attr("class", "median")
    .attr("x1", d => x(d.surgeryType))
    .attr("x2", d => x(d.surgeryType) + x.bandwidth())
    .attr("y1", d => y(d.median))
    .attr("y2", d => y(d.median))
    .attr("stroke", "black")
    .attr("stroke-width", 2);

  // Draw whiskers (min to q1 and q3 to max)
  // Whisker lines (vertical)
  svg.selectAll("line.whisker-min")
    .data(stats)
    .join("line")
    .attr("class", "whisker-min")
    .attr("x1", d => x(d.surgeryType) + x.bandwidth() / 2)
    .attr("x2", d => x(d.surgeryType) + x.bandwidth() / 2)
    .attr("y1", d => y(d.min))
    .attr("y2", d => y(d.q1))
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  svg.selectAll("line.whisker-max")
    .data(stats)
    .join("line")
    .attr("class", "whisker-max")
    .attr("x1", d => x(d.surgeryType) + x.bandwidth() / 2)
    .attr("x2", d => x(d.surgeryType) + x.bandwidth() / 2)
    .attr("y1", d => y(d.q3))
    .attr("y2", d => y(d.max))
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  // Whisker caps (horizontal)
  const capWidth = x.bandwidth() * 0.4;
  svg.selectAll("line.whisker-min-cap")
    .data(stats)
    .join("line")
    .attr("class", "whisker-min-cap")
    .attr("x1", d => x(d.surgeryType) + x.bandwidth() / 2 - capWidth / 2)
    .attr("x2", d => x(d.surgeryType) + x.bandwidth() / 2 + capWidth / 2)
    .attr("y1", d => y(d.min))
    .attr("y2", d => y(d.min))
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  svg.selectAll("line.whisker-max-cap")
    .data(stats)
    .join("line")
    .attr("class", "whisker-max-cap")
    .attr("x1", d => x(d.surgeryType) + x.bandwidth() / 2 - capWidth / 2)
    .attr("x2", d => x(d.surgeryType) + x.bandwidth() / 2 + capWidth / 2)
    .attr("y1", d => y(d.max))
    .attr("y2", d => y(d.max))
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "black")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("ICU Length of Stay (days)");

  console.log(stats);
  svg.selectAll("rect.box")
  .data(stats)
  .join("rect")
  .attr("class", "box")
  .attr("x", d => x(d.surgeryType))
  .attr("y", d => Math.min(y(d.q1), y(d.q3)))
  .attr("width", x.bandwidth())
  .attr("height", d => Math.abs(y(d.q1) - y(d.q3)))
  .attr("fill", "steelblue")
  .attr("opacity", 0.7);
}


  function renderTooltipContent(data) {
    const hours = document.getElementById('hours');
    hours.textContent = data.op_duration
    //const icu = document.getElementById('icu');
    //icu.textContent = data.icu_days
  }

 function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('icu-tooltip');
  tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('icu-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }


  // Visualization state and data
  let currentStep = 1;
  const visualizations = {
    1: createPreOpViz,
    2: createSurgeryViz,
    3: createICUViz,
    4: createOutcomesViz
  };
  /*
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
      */

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
    viz.append('h4')
      .text('What are typical preoperative levels of...?');
    viz.append('div')
      .attr('id', 'preop');
    renderPredisposeInfo(filteredData);
    renderPreopInfo(filteredData);
  }

  function createSurgeryViz() {
    const viz = d3.select('#visualization');
    viz.html('');
    viz.append('h2')
      .text('Surgery Details')
      .style('text-align', 'center');
    
    viz.append('h3')
      .text('How Long Does Your Surgery Take?');
    viz.append('div')
      .attr('id','opduration_vis');
    viz.append('dl')
      .attr('id','opduration-tooltip')
      .attr('class', 'info tooltip')
      .attr('hidden', true);

    const dl1 = d3.select('#duration-tooltip');
    dl1.append('dt')
      .attr('id', 'hours-label')
      .text('Hours');
    dl1.append('dd')
      .attr('id', 'hours');
    /*
    viz.append('h3')
      .text('How Long Are You Under Anesthesia?');
    viz.append('div')
      .attr('id','aneduration_vis');
    viz.append('dl')
      .attr('id','aneduration-tooltip')
      .attr('class', 'info tooltip')
      .attr('hidden', true);

    const dl2 = d3.select('#aneduration-tooltip');
    dl2.append('dt')
      .attr('id', 'hours-label')
      .text('Hours');
    dl2.append('dd')
      .attr('id', 'hours');
      */

    viz.append('div')
      .attr('id', 'intraop_vis');
    viz.append('div')
      .attr('id', 'intraop-tooltip');
    renderOperationDuration(filteredData);
    //renderAnesthesiaDuration(filteredData);
    renderIntraop(filteredData, intraop_surgery, intraop_type);
  }

  function createICUViz() {
    console.log('icu viz');
  const viz = d3.select('#visualization');
    viz.html('');
    viz.append('h2')
      .text('ICU Recovery Stats')
      .style('text-align', 'center');
    
    viz.append('h3')
      .text('Duration of Operation vs Days in ICU');

    viz.append('div')
      .attr('id','postop-vis');

    viz.append('dl')
      .attr('id','icu-tooltip')
      .attr('class', 'info tooltip')
      .style('display', 'none');

    const dl3 = d3.select('#icu-tooltip');
  dl3.append('dt')
      .attr('id', 'hours2-label')
      .text('Hours');
    dl3.append('dd')
      .attr('id', 'hours2');

      dl3.append('dt')
      .attr('id', 'icu-label')
      .text('Days in ICU');
    dl3.append('dd')
      .attr('id', 'icu');
    renderICUScatter(filteredData);
  }

  function createOutcomesViz() {
    const viz = d3.select('#visualization');
    viz.html('');
    viz.append('h2')
      .text('Patient Outcomes')
      .style('text-align', 'center');
    
    viz.append('div')
      .attr('id','postop-vis');

    renderICUBoxplot(filteredData);


  }
  // Initialize first visualization

  // Intersection Observer setup
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.6
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

});

