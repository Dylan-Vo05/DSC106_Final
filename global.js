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
  showCount(cleaned);
  renderOperationDuration(cleaned);
  renderAnesthesiaDuration(cleaned);
  renderPrediposeInfo(cleaned);
  renderPreopInfo(cleaned);
  renderIntraop(cleaned, intraop_surgery, intraop_type);

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
    renderintraop(cleaned, intraop_surgery, intraop_type);
  });

  d3.select("#intraop-type").on("input", function () {
    intraop_type = d3.select(this).property('value');
    renderintraop(cleaned, intraop_surgery, intraop_type);
  });

  function updateFilter(){
    console.log("filter updated");

    d3.select("#opduration_vis").selectAll("*").remove();
    d3.select("#predispose").selectAll("*").remove();
    d3.select("#preop").selectAll("*").remove();
    d3.select("#aneduration_vis").selectAll("*").remove();
    d3.select("#intraop").selectAll("*").remove();
    
    let filteredData = cleaned;

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
    renderPrediposeInfo(filteredData);
    renderPreopInfo(filteredData);
    renderIntraop(filteredData, intraop_surgery, intraop_type);
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
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(0) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .on('mouseenter', (event, d) => {
        renderTooltipContent(d);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', () => {
        updateTooltipVisibility(false);
      });

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
        .text("Operation Duration (Hours)"); 
    }

    function renderTooltipContent(data) {
    const hours = document.getElementById('hours');
    hours.textContent = safeToFixed(data[1]);
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
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(0) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .on('mouseenter', (event, d) => {
        renderTooltipContent(d);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', () => {
        updateTooltipVisibility(false);
      });

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
        .text("Anesthesia Duration (Hours)"); 
    }

    function renderTooltipContent(data) {
    const hours = document.getElementById('hours');
    hours.textContent = safeToFixed(data[1]);
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

    const width = 1075, height = 400;
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

    const tooltip = d3.select("#intraop-tooltip");

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
      .on("mouseenter", function (event, [name]) {
        lineLayer.selectAll(".line")
          .classed("dimmed", true)
          .classed("highlighted", false);

        d3.select(this)
          .classed("dimmed", false)
          .classed("highlighted", true)
          .raise();

        tooltip
          .html(`<strong>${legendNames[name][0]}</strong><br>${legendNames[name][1]}`)
          .style("visibility", "visible");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", (event.pageY + 15) + "px")
          .style("left", (event.pageX + 15) + "px");
      })
      .on("mouseleave", function () {
        lineLayer.selectAll(".line")
          .classed("dimmed", false)
          .classed("highlighted", false);

        tooltip.style("visibility", "hidden");
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

});