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

  let interop_surgery = 'Colorectal';
  let interop_type = 'Cell Count'

    // D3 visualization code goes here
  showCount(cleaned);
  renderOperationDuration(cleaned);
  renderAnesthesiaDuration(cleaned);
  renderPrediposeInfo(cleaned);
  renderPreopInfo(cleaned);
  renderInterop(cleaned, interop_surgery, interop_type);

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
    updateFilter();
  });

  d3.select("#height").on("input", function () {
    height = d3.select(this).property("valueAsNumber");
    updateFilter();
  });

  d3.select("#weight").on("input", function () {
    weight = d3.select(this).property("valueAsNumber");
    updateFilter();
  });

  d3.select("#surgery-drop").on("input", function () {
    interop_surgery = d3.select(this).property('value');
    renderInterop(cleaned, interop_surgery, interop_type);
  });

  d3.select("#interop-type").on("input", function () {
    interop_type = d3.select(this).property('value');
    renderInterop(cleaned, interop_surgery, interop_type);
  });

  function updateFilter(){
    console.log("filter updated");

    d3.select("#opduration_vis").selectAll("*").remove();
    d3.select("#predispose").selectAll("*").remove();
    d3.select("#preop").selectAll("*").remove();
    d3.select("#aneduration_vis").selectAll("*").remove();
    d3.select("#interop").selectAll("*").remove();
    
    let filteredData = cleaned;

    const checkMale = d3.select("#toggle-male").property("checked");
    const checkFemale = d3.select("#toggle-female").property("checked");
    const ageRange = d3.extent(cleaned, d => d.age);
    const heightRange = d3.extent(cleaned, d => d.height);
    const weightRange = d3.extent(cleaned, d => d.weight);
    
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
    renderPrediposeInfo(filteredData);
    renderPreopInfo(filteredData);
    renderInterop(filteredData, interop_surgery, interop_type);
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

    const width = 1000;
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
      .on('mouseenter', (event, d) => {
        renderTooltipInfo(d, surgeryDescriptions);
        updateTooltipVisibility(true);
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
    const info = document.getElementById('info');
    info.innerHTML = `${safeToFixed(data[1])} <br>
      ${details[data[0]]}
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

    const width = 1000;
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
      .on('mouseenter', (event, d) => {
        renderTooltipInfo(d, aneDescriptions);
        updateTooltipVisibility(true);
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
  
  function renderPrediposeInfo(data) {

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
  const tooltip = document.getElementById('duration-tooltip');
  tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('duration-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

  function showCount(data) {
    const dl = d3.select('#case_count').text(data.length)
  }

  function renderInterop(data, interop_surgery, interop_type) {
    // 1. Filter relevant case IDs
    const validCases = data.filter(d => d.optype === interop_surgery);
    const validCaseIDs = new Set(validCases.map(d => +d.caseid));
    let yval = d => +d.pct_change;  // default
    let cols = [];
    let ylabel = 'Percentage Change (%)';

    if (interop_type === 'Cell Count') {
      cols = ['wbc', 'plt'];
      ylabel = 'Count (x1000/mcL)';
      yval = d => +d.result;
    } else if (interop_type === 'Electrolyte Levels') {
      cols = ['na', 'k', 'ica', 'cl'];
    } else if (interop_type === 'Metabolite Levels') {
      cols = ['hb', 'gluc', 'tprot', 'ammo'];
    }

    // 2. Filter lab data by matching caseids and test names
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

    // 3b. Group by test name and hour
    const groupedByNameAndHour = d3.group(filtered, d => d.name, d => d.hour);

    // 3c. Compute median per test per hour
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

    // 4. SVG setup
    const width = 800, height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    d3.select("#interop_vis").selectAll("*").remove();
    const svg = d3.select("#interop_vis")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scaleLinear()
      .domain(d3.extent(filtered, d => d.hour))
      .range([margin.left, width - margin.right]);

    const values = filtered.map(yval).sort(d3.ascending);
    const lower = 0
    const upper = d3.quantile(values, 0.99);

    const y = d3.scaleLinear()
      .domain([lower, upper])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain(cols)
      .range(d3.schemeTableau10);

    const line = d3.line()
      .x(d => x(d.hour))
      .y(d => y(yval(d)));

    // 5. Plot lines for each lab test
    svg.selectAll(".line")
      .data(Array.from(medianData.entries()))
      .join("path")
      .attr("fill", "none")
      .attr("stroke", ([name]) => color(name))
      .attr("stroke-width", 1.8)
      .attr("d", ([, points]) =>
        d3.line()
          .x(d => x(d.hour))
          .y(d => y(d.medianVal))
          (points)
      );

    // 6. Axes
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

    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right - 120}, ${margin.top})`);

    const legendItemHeight = 20;

    legend.selectAll("rect")
      .data(cols)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * legendItemHeight)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => color(d));

    legend.selectAll("text")
      .data(cols)
      .join("text")
      .attr("x", 24)
      .attr("y", (d, i) => i * legendItemHeight + 14)
      .text(d => d)
      .attr("font-size", 12)
      .attr("fill", "black");
  }


});