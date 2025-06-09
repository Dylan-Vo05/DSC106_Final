Promise.all([
  d3.csv('cases.txt'),
  d3.csv('clean_lab.csv'),
  d3.csv('trks.txt')
])
.then(function([data1, data2, data3]) {
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

  tracks = data3.map(d => ({
    ...d,
    caseid: +d.caseid,
    tname: d.tname,
    tid: +d.tid
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

  /*
  d3.select("#age")
  .attr("min", ageRange[0])
  .attr("max", ageRange[1])

  d3.select("#height")
  .attr("min", heightRange[0])
  .attr("max", heightRange[1])

  d3.select("#weight")
  .attr("min", weightRange[0])
  .attr("max", weightRange[1])
  */

  // D3 visualization code goes here
  showCount(cleaned);
 // renderOperationDuration(cleaned);
  // renderAnesthesiaDuration(cleaned);
  renderPredisposeInfo(cleaned);
  renderPreopInfo(cleaned);
  // renderIntraop(cleaned, intraop_surgery, intraop_type);
  //renderICUScatter(cleaned);
  renderICUBoxplot(cleaned);

  /*
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
  */
/*
  d3.select("#surgery-drop").on("input", function () {
    intraop_surgery = d3.select(this).property('value');
    renderIntraop(filteredData, intraop_surgery, intraop_type);
  });

  d3.select("#intraop-type").on("input", function () {
    intraop_type = d3.select(this).property('value');
    renderIntraop(filteredData, intraop_surgery, intraop_type);
  });*/

  /*
  function updateFilter(){
    console.log("filter updated");
    
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

    // Update the case count display
    showCount(filteredData);

    // Update visualizations based on current step
    switch(currentStep) {
      case 1:
        renderPredisposeInfo(filteredData);
        renderPreopInfo(filteredData);
        break;
      case 2:
        renderIntraop(filteredData, intraop_surgery, intraop_type);
        break;
      case 3:
        renderICUScatter(filteredData);
        renderICUBoxplot(filteredData);
        break;
    }
  }
  */

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
    const tooltip = document.getElementById('duration-tooltip');
    tooltip.style.display = 'block';
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
    const dl = d3.select('#predispose')
      .html("") // Clear existing content
      .append('dl')
      .attr('class', 'stats-list');

    dl.append('dt').html('Hypertension');
    dl.append('dd').text(safeToFixed(d3.mean(data, d => d.preop_htn) * 100)  + '%');
    
    dl.append('dt').html('Diabetes');
    dl.append('dd').text(safeToFixed(d3.mean(data, d => d.preop_dm) * 100)  + '%');
  }

  function safeToFixed(value, digits = 2) {
    if (value === undefined || value === null || isNaN(value)) {
      return "N/A";
    }
    return value.toFixed(digits);
  }

  function renderPreopInfo(data) {
    const dl = d3.select('#preop')
      .html("") // Clear existing content
      .append('dl')
      .attr('class', 'stats-list');

    const labValues = [
      { label: 'Hemoglobin', value: d => d.preop_hb, unit: 'g/dl' },
      { label: 'Platelets', value: d => d.preop_plt, unit: 'x1000/mcL' },
      { label: 'pH', value: d => d.preop_ph, unit: '' },
      { label: 'Glucose', value: d => d.preop_gluc, unit: 'mg/dl' },
      { label: 'Sodium', value: d => d.preop_na, unit: 'mmol/L' },
      { label: 'Potassium', value: d => d.preop_k, unit: 'mmol/L' }
    ];

    labValues.forEach(item => {
      dl.append('dt').html(item.label);
      dl.append('dd').text(safeToFixed(d3.mean(data, item.value)) + (item.unit ? ' ' + item.unit : ''));
    });
  }

  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('duration-tooltip');
    if (tooltip) {
        tooltip.style.display = isVisible ? 'block' : 'none';
    }
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

function machineCount(tracks, data) {
  // Map caseid → optype from case metadata
  const caseMap = new Map(data.map(d => [+d.caseid, d.optype]));

  // Filter and clean track data to only those with a known optype
  const filteredTracks = tracks.filter(d => caseMap.has(+d.caseid));

  // Group tracks by caseid to count unique machines per case
  const caseMachineCounts = d3.rollups(
    filteredTracks,
    v => {
      const uniqueMachines = new Set(
        v.map(d => {
          const prefix = d.tname?.split("/")?.[0] || "";
          return prefix.trim();
        }).filter(Boolean)
      );
      return uniqueMachines.size;
    },
    d => +d.caseid
  );

  // Create array of { optype, machineCount } with trimmed optype
  const countsByOp = caseMachineCounts.map(([caseid, count]) => {
    let optype = caseMap.get(caseid) || "Unknown";
    optype = optype.trim(); // trim whitespace
    return { optype, count };
  });

  // Group by optype and compute average count
  let avgByOpType = d3.rollups(
    countsByOp,
    v => d3.mean(v, d => d.count),
    d => d.optype
  ).map(([optype, avg]) => ({ optype, avg }));

  // FILTER by selected surgery types if set
  if (window.selectedSurgeryTypes && window.selectedSurgeryTypes.size > 0) {
    avgByOpType = avgByOpType.filter(d => window.selectedSurgeryTypes.has(d.optype));
  }

  const optypes = [
    'Colorectal',
    'Stomach',
    'Biliary/Pancreas',
    'Vascular',
    'Major resection',
    'Breast',
    'Minor resection',
    'Transplantation',
    'Hepatic',
    'Thyroid',
    'Others'
  ];
  const colorScale = d3.scaleOrdinal()
    .domain(optypes)
    .range(d3.schemeTableau10);

  // Debug logs
  console.log("Unique optypes:", [...new Set(avgByOpType.map(d => d.optype))]);
  avgByOpType.forEach(d => {
    console.log(`optype: "${d.optype}", color: ${colorScale(d.optype)}`);
  });

  // Dimensions & margins
  const width = 800;
  const height = 300;
  const margin = { top: 40, right: 20, bottom: 80, left: 60 };

  

  const container = d3.select("#machines");
  container.selectAll("*").remove(); // Clear container
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(avgByOpType.map(d => d.optype))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(avgByOpType, d => d.avg) || 1])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Axis Labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Average Number of Machines Used per Operation Type");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Operation Type");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Avg Unique Machines");

  // Bars, colored by colorScale with fallback gray color
  svg.selectAll(".bar")
    .data(avgByOpType)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.optype))
    .attr("y", d => y(d.avg))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.avg))
    .attr("fill", d => colorScale(d.optype) || "#999999");  // fallback color

  // Tooltip
  const tooltip = d3.select("#machines")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "6px")
    .style("font-size", "12px")
    .style("border-radius", "4px");

  svg.selectAll(".bar")
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(`Op Type: ${d.optype}<br>Avg Machines: ${d.avg.toFixed(2)}`);
    })
    .on("mousemove", event => {
      tooltip.style("top", (event.pageY - 30) + "px")
             .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));
}



  
function renderICUScatter(data) {
  // Clear previous visualization
  d3.select("#postop-vis").selectAll("*").remove();

  data.forEach(d => {
    d.icu_days = +d.icu_days;         
    d.op_duration = (d.opend - d.opstart)/3600
  });

  // Filter out any invalid data points
  data = data.filter(d => !isNaN(d.icu_days) && !isNaN(d.op_duration));

  // set the dimensions and margins of the graph
  const margin = {top: 10, right: 30, bottom: 40, left: 60},
      width = 460,
      height = 400;

  // append the svg object to the body of the page
  const svg = d3.select("#postop-vis")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
   
  // Add X axis
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.op_duration)])
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
    .domain([0, d3.max(data, d => d.icu_days)])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)") 
      .attr("x", -height/2)
      .attr("y", -50)
      .attr("font-size", 12)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Days Spent in ICU");

  const tooltip = d3.select("#icu-tooltip");
  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => x(d.op_duration))
      .attr("cy", d => y(d.icu_days))
      .attr("r", 5)
      .style("fill", d => window.icuColorScale(d.optype))
      .style("opacity", d => {
        if (!window.selectedSurgeryTypes || window.selectedSurgeryTypes.size === 0) return 0.7;
        return window.selectedSurgeryTypes.has(d.optype) ? 0.7 : 0;
      })
      .style("display", d => {
        if (!window.selectedSurgeryTypes || window.selectedSurgeryTypes.size === 0) return "block";
        return window.selectedSurgeryTypes.has(d.optype) ? "block" : "none";
      })
      .style("stroke", d => d3.color(window.icuColorScale(d.optype)).darker(0.5))
      .style("stroke-width", 1)
      .on('mouseenter', (event, d) => {
        console.log("Hovered:", d);
        d3.select(event.target)
          .transition()
          .duration(150)
          .attr("r", 7)
          .style("opacity", 1);
        
        tooltip
          .style("display", "block")
          .style('position', 'absolute')
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .html(`
            <strong>${d.optype}</strong><br>
            Operation Duration: ${d.op_duration.toFixed(1)} hours<br>
            ICU Stay: ${d.icu_days.toFixed(1)} days
          `);
      })
      .on('mouseleave', (event) => {
        d3.select(event.target)
          .transition()
          .duration(150)
          .attr("r", 5)
          .style("opacity", d => {
            if (!window.selectedSurgeryTypes || window.selectedSurgeryTypes.size === 0) return 0.7;
            return window.selectedSurgeryTypes.has(d.optype) ? 0.7 : 0;
          });
        
        tooltip.style("display", "none");
      });
}

function renderICUBoxplot(data) {
  // Clear previous visualization
  d3.select("#visualization").selectAll("*").remove();

  // Filter out invalid ICU length of stay data
  data = data.filter(d => !isNaN(d.icu_days));

  // Group data by surgery type
  const groupedData = d3.group(data, d => d.optype);

  // Compute boxplot stats for each surgery type
  const stats = Array.from(groupedData, ([surgeryType, values]) => {
    const icuLOSValues = values.map(d => +d.icu_days).sort(d3.ascending);
    const q1 = d3.quantile(icuLOSValues, 0.25);
    const median = d3.quantile(icuLOSValues, 0.5);
    const q3 = d3.quantile(icuLOSValues, 0.75);
    const min = icuLOSValues[0];
    const max = icuLOSValues[icuLOSValues.length - 1];
    return { surgeryType, min, q1, median, q3, max };
  }).filter(stat => {
    if (!window.selectedSurgeryTypes || window.selectedSurgeryTypes.size === 0) return true;
    return window.selectedSurgeryTypes.has(stat.surgeryType);
  });

  // Dimensions & margins
  const width = 800;
  const height = 400;
  const margin = { top: 30, right: 30, bottom: 70, left: 60 };

  // Create svg
  const svg = d3.select("#visualization")
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
    .domain([0, d3.max(stats, d => d.max)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Use the same color scale as ICU scatter plot
  const surgeryTypes = [
    'Colorectal',
    'Stomach',
    'Biliary/Pancreas',
    'Vascular',
    'Major resection',
    'Breast',
    'Minor resection',
    'Transplantation',
    'Hepatic',
    'Thyroid',
    'Others'
  ];
  const colorScale = d3.scaleOrdinal()
    .domain(surgeryTypes)
    .range(d3.schemeTableau10);

  // Draw boxes
  svg.selectAll("rect.box")
    .data(stats)
    .join("rect")
    .attr("class", "box")
    .attr("x", d => x(d.surgeryType))
    .attr("y", d => y(d.q3))
    .attr("width", x.bandwidth())
    .attr("height", d => y(d.q1) - y(d.q3))
    .attr("fill", d => colorScale(d.surgeryType))
    .attr("opacity", 0.7)
    .attr("stroke", d => d3.color(colorScale(d.surgeryType)).darker(0.5))
    .attr("stroke-width", 1);

  // Draw median lines
  svg.selectAll("line.median")
    .data(stats)
    .join("line")
    .attr("class", "median")
    .attr("x1", d => x(d.surgeryType))
    .attr("x2", d => x(d.surgeryType) + x.bandwidth())
    .attr("y1", d => y(d.median))
    .attr("y2", d => y(d.median))
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  // Draw whiskers
  svg.selectAll("line.whisker")
    .data(stats.flatMap(d => [
      { type: "min", surgeryType: d.surgeryType, value: d.min, q: d.q1 },
      { type: "max", surgeryType: d.surgeryType, value: d.max, q: d.q3 }
    ]))
    .join("line")
    .attr("class", "whisker")
    .attr("x1", d => x(d.surgeryType) + x.bandwidth() / 2)
    .attr("x2", d => x(d.surgeryType) + x.bandwidth() / 2)
    .attr("y1", d => y(d.value))
    .attr("y2", d => y(d.q))
    .attr("stroke", d => d3.color(colorScale(d.surgeryType)).darker(0.5))
    .attr("stroke-width", 1);

  // Add axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
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

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("ICU Stay Duration by Surgery Type");
}

/*
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
  }*/


  // Visualization state and data
  let currentStep = 1;
  const visualizations = {
    1: createPreOpViz,
    2: createSurgeryViz,
    3: createICUViz,
    //4: createOutcomesViz
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
      .style('text-align', 'center')
      .style('margin-bottom', '30px');
    
    // Create a container for the two sections
    const container = viz.append('div')
      .style('display', 'flex')
      .style('justify-content', 'space-around')
      .style('align-items', 'flex-start')
      .style('margin', '20px 0')
      .style('gap', '40px')
      .style('padding', '20px');

    // Left section - Predispositions
    const leftSection = container.append('div')
      .attr('class', 'assessment-section')
      .style('flex', '1')
      .style('max-width', '400px')
      .style('padding', '30px')
      .style('background', 'linear-gradient(to bottom, #ffffff, #f8f9fa)')
      .style('border-radius', '12px')
      .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)');

    leftSection.append('h3')
      .text('Pre-existing Conditions')
      .style('color', '#2c3e50')
      .style('margin-bottom', '20px')
      .style('text-align', 'center')
      .style('font-size', '1.5em');

    leftSection.append('div')
      .attr('id', 'predispose');

    // Right section - Lab Values
    const rightSection = container.append('div')
      .attr('class', 'assessment-section')
      .style('flex', '1')
      .style('max-width', '400px')
      .style('padding', '30px')
      .style('background', 'linear-gradient(to bottom, #ffffff, #f8f9fa)')
      .style('border-radius', '12px')
      .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)');

    rightSection.append('h3')
      .text('Lab Values')
      .style('color', '#2c3e50')
      .style('margin-bottom', '20px')
      .style('text-align', 'center')
      .style('font-size', '1.5em');

    rightSection.append('div')
      .attr('id', 'preop');

    // Add descriptions
    const descriptions = {
      'Hypertension': 'High blood pressure that can increase surgery risks',
      'Diabetes': 'Blood sugar condition requiring careful monitoring',
      'Hemoglobin': 'Oxygen-carrying protein in blood',
      'Platelets': 'Blood cells important for clotting',
      'pH': 'Blood acidity level',
      'Glucose': 'Blood sugar level',
      'Sodium': 'Important electrolyte for nerve function',
      'Potassium': 'Essential for heart rhythm'
    };

    // Style the stats lists
    viz.selectAll('.stats-list')
      .style('display', 'grid')
      .style('grid-template-columns', 'auto auto')
      .style('gap', '16px')
      .style('margin', '0')
      .style('padding', '0')
      .style('list-style', 'none');

    viz.selectAll('.stats-list dt')
      .style('font-weight', '600')
      .style('color', '#34495e')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('gap', '8px')
      .style('font-size', '1.1em')
      .each(function() {
        const term = d3.select(this).text();
        if (descriptions[term]) {
          d3.select(this)
            .html(`${term} <span class="info-icon" style="cursor: pointer; color: #95a5a6; font-size: 14px;">ⓘ</span>`)
            .select('.info-icon')
            .attr('title', descriptions[term]);
        }
      });

    viz.selectAll('.stats-list dd')
      .style('text-align', 'right')
      .style('color', '#2980b9')
      .style('font-weight', '500')
      .style('margin', '0')
      .style('font-size', '1.1em');

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
      .text('Distribution of Surgery Durations')
      .style('text-align', 'center')
      .style('color', '#555')
      .style('font-weight', '400')
      .style('margin-bottom', '30px');

    viz.append('div')
      .attr('id','opduration_vis');

    // Calculate operation duration and create box plot
    const data = filteredData.map(d => ({
      ...d,
      op_duration: (d.opend - d.opstart)/3600
    }));

    // Filter data based on selected surgery types
    const filteredBySelection = data.filter(d => {
      if (!window.selectedSurgeryTypes || window.selectedSurgeryTypes.size === 0) return true;
      return window.selectedSurgeryTypes.has(d.optype);
    });

    // Group data by surgery type
    const groupedData = d3.group(filteredBySelection, d => d.optype);

    // Compute boxplot stats for each surgery type
    const stats = Array.from(groupedData, ([surgeryType, values]) => {
      const durationValues = values.map(d => d.op_duration).sort(d3.ascending);
      const q1 = d3.quantile(durationValues, 0.25);
      const median = d3.quantile(durationValues, 0.5);
      const q3 = d3.quantile(durationValues, 0.75);
      const iqr = q3 - q1;
      const min = Math.max(q1 - 1.5 * iqr, durationValues[0]);
      const max = Math.min(q3 + 1.5 * iqr, durationValues[durationValues.length - 1]);
      // Calculate outliers
      const outliers = durationValues.filter(d => d < min || d > max);
      return { surgeryType, min, q1, median, q3, max, outliers, count: values.length };
    });

    // Dimensions & margins
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 80, left: 70 };

    // Create svg with gradient background
    const svg = d3.select("#opduration_vis")
      .append('svg')
      .attr("width", width)
      .attr("height", height)
      .style("background", "linear-gradient(to bottom, #ffffff, #f8f9fa)");

    // Add a subtle grid
    const chartArea = svg.append('g')
      .attr('class', 'chart-area');

    // X scale - categorical surgery types
    const x = d3.scaleBand()
      .domain(stats.map(d => d.surgeryType))
      .range([margin.left, width - margin.right])
      .paddingInner(0.5)
      .paddingOuter(0.3);

    // Y scale - operation duration
    const y = d3.scaleLinear()
      .domain([0, d3.max(stats, d => d.max)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add grid lines
    const yGrid = d3.axisLeft(y)
      .tickSize(-width + margin.left + margin.right)
      .tickFormat('')
      .ticks(8);

    chartArea.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yGrid)
      .style('stroke-opacity', 0.1);

    // Create tooltip div if it doesn't exist
    let tooltip = d3.select("#duration-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body")
        .append("div")
        .attr("id", "duration-tooltip")
        .attr("class", "tooltip")
        .style("display", "block")
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.95)")
        .style("padding", "10px")
        .style("border-radius", "4px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
        .style("font-size", "12px")
        .style("line-height", "1.4");
    }

    // Use the same color scale as ICU visualization
    const surgeryTypes = [
      'Colorectal',
      'Stomach',
      'Biliary/Pancreas',
      'Vascular',
      'Major resection',
      'Breast',
      'Minor resection',
      'Transplantation',
      'Hepatic',
      'Thyroid',
      'Others'
    ];
    const colorScale = d3.scaleOrdinal()
      .domain(surgeryTypes)
      .range(d3.schemeTableau10);

    // Draw boxes with tooltip interaction and transition
    const boxes = chartArea.selectAll("rect.box")
      .data(stats)
      .join("rect")
      .attr("class", "box")
      .attr("x", d => x(d.surgeryType))
      .attr("width", x.bandwidth())
      .attr("fill", d => colorScale(d.surgeryType))
      .attr("opacity", 0.8)
      .attr("stroke", d => d3.color(colorScale(d.surgeryType)).darker(0.5))
      .attr("stroke-width", 1)
      .attr("rx", 2) // Rounded corners
      .on("mouseover", function(event, d) {
  
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("stroke-width", 2);
          
        
        // Position tooltip near the box (fixed, not following mouse)
  let boxX = x(d.surgeryType) + x.bandwidth() / 2 + margin.left;
  const boxY = y(d.q3) + margin.top - 10; // a little above the box top
        
  if (boxX > width - margin.right) {
          boxX = boxX - 200;
        }

        tooltip
          .style("display", "block")
          .style("left", (boxX - 50) + "px")
          .style("top", (boxY - 28) + "px")
          .html(`
            <div style="font-weight: bold; margin-bottom: 5px; color: ${colorScale(d.surgeryType)}">${d.surgeryType}</div>
            <div style="color: #666;">
              <div>Maximum: ${d.max.toFixed(1)} hours</div>
              <div>75th percentile: ${d.q3.toFixed(1)} hours</div>
              <div>Median: ${d.median.toFixed(1)} hours</div>
              <div>25th percentile: ${d.q1.toFixed(1)} hours</div>
              <div>Minimum: ${d.min.toFixed(1)} hours</div>
              <div style="margin-top: 5px">Number of cases: ${d.count}</div>
              ${d.outliers.length > 0 ? `<div>Outliers: ${d.outliers.length}</div>` : ''}
            </div>
          `);
          
      })
      .on("mouseleave", function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.8)
          .attr("stroke-width", 1);
        tooltip.style("display", "none");
      });

    // Add transitions for box heights
    boxes
      .attr("y", height - margin.bottom) // Start at the bottom
      .attr("height", 0)
      .transition()
      .duration(800)
      .attr("y", d => y(d.q3))
      .attr("height", d => y(d.q1) - y(d.q3));

    // Draw median lines with transition
    const medianLines = chartArea.selectAll("line.median")
      .data(stats)
      .join("line")
      .attr("class", "median")
      .attr("x1", d => x(d.surgeryType))
      .attr("x2", d => x(d.surgeryType) + x.bandwidth())
      .attr("y1", height - margin.bottom)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    medianLines
      .transition()
      .duration(800)
      .attr("y1", d => y(d.median))
      .attr("y2", d => y(d.median));

    // Draw whiskers with transition
    const whiskers = chartArea.selectAll("line.whisker")
      .data(stats.flatMap(d => [
        { type: "min", surgeryType: d.surgeryType, value: d.min, q: d.q1 },
        { type: "max", surgeryType: d.surgeryType, value: d.max, q: d.q3 }
      ]))
      .join("line")
      .attr("class", "whisker")
      .attr("x1", d => x(d.surgeryType) + x.bandwidth() / 2)
      .attr("x2", d => x(d.surgeryType) + x.bandwidth() / 2)
      .attr("y1", height - margin.bottom)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#666")
      .attr("stroke-width", 1);

    whiskers
      .transition()
      .duration(800)
      .attr("y1", d => y(d.value))
      .attr("y2", d => y(d.q));

    // Draw outlier points with transition
    stats.forEach(d => {
      chartArea.selectAll(null)
        .data(d.outliers)
        .join("circle")
        .attr("cx", x(d.surgeryType) + x.bandwidth() / 2)
        .attr("cy", height - margin.bottom)
        .attr("r", 3)
        .attr("fill", colorScale(d.surgeryType))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay((_, i) => i * 20 + 800)
        .attr("cy", v => y(v))
        .attr("opacity", 0.7);
    });

    // Add axes
    const xAxis = chartArea.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .style("font-size", "11px");

    xAxis.selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end")
      .style("fill", "#666");

    xAxis.append("text")
      .attr("x", width / 2)
      .attr("y", 60)
      .attr("fill", "#666")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Surgery Type");

    const yAxis = chartArea.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .style("font-size", "11px");

    yAxis.selectAll("text")
      .style("fill", "#666");

    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("fill", "#666")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Operation Duration (hours)");

    viz.append('div')
      .attr('id', 'machines');
    window.icuColorScale = colorScale;

    machineCount(tracks, filteredData);

  }

  function createICUViz() {
    //console.log('icu viz');
    const viz = d3.select('#visualization');
    viz.html('');
    viz.append('h2')
      .text('ICU Recovery Stats')
      .style('text-align', 'center');
    
    viz.append('h3')
      .text('Duration of Operation vs Days in ICU')
      .style('text-align', 'center')
      .style('color', '#555')
      .style('margin-bottom', '30px');

    // Create a container for the visualization and legend
    const container = viz.append('div')
      .style('display', 'flex')
      .style('gap', '20px')
      .style('margin', '20px 0');

    // Main visualization area
    const mainViz = container.append('div')
      .style('flex', '3')
      .attr('id', 'postop-vis');

    // Legend area
    const legendContainer = container.append('div')
      .style('flex', '1')
      .style('padding', '20px')
      .style('background', 'linear-gradient(to bottom, #ffffff, #f8f9fa)')
      .style('border-radius', '8px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('max-width', '250px')
      .style('align-self', 'flex-start');

    legendContainer.append('h4')
      .text('Surgery Types')
      .style('margin-top', '0')
      .style('margin-bottom', '15px')
      .style('color', '#2c3e50')
      .style('font-size', '1.1em');

    const surgeryTypes = [
      'Colorectal',
      'Stomach',
      'Biliary/Pancreas',
      'Vascular',
      'Major resection',
      'Breast',
      'Minor resection',
      'Transplantation',
      'Hepatic',
      'Thyroid',
      'Others'
    ];

    const colorScale = d3.scaleOrdinal()
      .domain(surgeryTypes)
      .range(d3.schemeTableau10);

    const legend = legendContainer.append('div')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('gap', '8px');

    surgeryTypes.forEach(type => {
      const legendItem = legend.append('div')
        .attr('class', 'legend-item')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('gap', '8px')
        .style('padding', '4px')
        .style('opacity', () => {
          if (!window.selectedSurgeryTypes || window.selectedSurgeryTypes.size === 0) return 1;
          return window.selectedSurgeryTypes.has(type) ? 1 : 0.3;
        });

      legendItem.append('div')
        .style('width', '12px')
        .style('height', '12px')
        .style('background-color', colorScale(type))
        .style('border-radius', '2px');

      legendItem.append('span')
        .text(type)
        .style('font-size', '0.9em')
        .style('color', '#34495e');
    });

    /*viz.append('dl')
      .attr('id','icu-tooltip')
      .attr('class', 'info tooltip')
      .attr('hidden', true);

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
      .attr('id', 'icu');*/
    
      // Create tooltip div if it doesn't exist
    let tooltip = d3.select("#icu-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body")
        .append("div")
        .attr("id", "icu-tooltip")
        .attr("class", "tooltip")
        .style("display", "none")
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.95)")
        .style("padding", "10px")
        .style("border-radius", "4px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
        .style("font-size", "12px")
        .style("line-height", "1.4");
    }

    // Store the color scale in a global variable so it can be used by renderICUScatter
    
    
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
  createPreOpViz();

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

  // Global state
  window.selectedSurgeryTypes = new Set();

  // Function to handle surgery type selection
  window.handleSurgerySelection = function(surgeryType) {
    // Toggle the surgery type in the set
    if (window.selectedSurgeryTypes.has(surgeryType)) {
        window.selectedSurgeryTypes.delete(surgeryType);
    } else {
        window.selectedSurgeryTypes.add(surgeryType);
    }
    
    // Update the selection indicator
    const indicator = document.getElementById('selection-indicator');
    if (window.selectedSurgeryTypes.size > 0) {
        const surgeryList = Array.from(window.selectedSurgeryTypes).join(', ');
        indicator.textContent = `Selected: ${surgeryList}`;
        indicator.classList.add('active');
    } else {
        indicator.textContent = 'Click on regions to select surgery types';
        indicator.classList.remove('active');
    }

    // Update legend items opacity
    d3.selectAll('.legend-item')
      .style('opacity', function() {
        const type = d3.select(this).select('span').text();
        if (!window.selectedSurgeryTypes || window.selectedSurgeryTypes.size === 0) return 1;
        return window.selectedSurgeryTypes.has(type) ? 1 : 0.3;
      });

    // Filter the data
    filteredData = cleaned;
    
    /*const checkMale = d3.select("#toggle-male").property("checked");
    const checkFemale = d3.select("#toggle-female").property("checked");
    
    if (checkMale) {
        filteredData = filteredData.filter(d => d.sex === 'M');
    }
    else if (checkFemale) {
        filteredData = filteredData.filter(d => d.sex === 'F');
    }
    
    if (window.selectedSurgeryTypes.size > 0) {
        filteredData = filteredData.filter(d => window.selectedSurgeryTypes.has(d.optype));
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
    */

    // Update only the necessary visualizations
    showCount(filteredData);
    renderPredisposeInfo(filteredData);
    renderPreopInfo(filteredData);

    // Trigger custom event for any other components that need to update
    const event = new CustomEvent('surgeryTypesChanged', { 
        detail: Array.from(window.selectedSurgeryTypes) 
    });
    window.dispatchEvent(event);
  };

});

