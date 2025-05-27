d3.csv("cases.txt").then(function(data) {
  cleaned = data.filter(d => +d.aneend >= +d.anestart)
  console.log(data);
  let age = -1;
  let height = -1;
  let weight = -1;

    // D3 visualization code goes here
  renderOperationDuration(cleaned);
  renderPrediposeInfo(cleaned);
  renderPreopInfo(cleaned);

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

  function updateFilter(){
    
    let filteredData = data;

    const checkMale = d3.select("#toggle-male").property("checked");
    const checkFemale = d3.select("#toggle-female").property("checked");
    const ageRange = d3.extent(data, d => d.age);
    const heightRange = d3.extent(data, d => d.height);
    const weightRange = d3.extent(data, d => d.weight);
    
    if (checkMale) {
      filteredData = filteredData.filter(d => d.sex === 'M');
    }
    else if (checkFemale) {
      filteredData = filteredData.filter(d => d.sex === 'F');
    }
    
    if (!isNaN(age) || age > -1){
      filteredData = filteredData.filter(d => +d.age >= (age - 0.05 * ageRange) && +d.age <= (age + 0.05 * ageRange));
    }

    if (!isNaN(height) || height > -1){
      filteredData = filteredData.filter(d => +d.height >= (height - 0.05 * heightRange) && +d.height <= (height + 0.05 * heightRange));
    }

    if (!isNaN(weight) || weight > -1){
      filteredData = filteredData.filter(d => +d.weight >= (weight - 0.05 * weightRange) && +d.weight <= (weight + 0.05 * weightRange));
    }

    renderOperationDuration(filteredData);
    renderPrediposeInfo(filteredData);
    renderPreopInfo(filteredData);
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
    hours.textContent = data[1].toFixed(2);
  }

  function renderPrediposeInfo(data) {

    const dl = d3.select('#predispose').append('dl').attr('class', 'predispose');

    dl.append('dt').html('Hypertension');
    dl.append('dd').text((d3.mean(data, d => d.preop_htn) * 100).toFixed(2)  + ' %');
    
    dl.append('dt').html('Diabetes');
    dl.append('dd').text((d3.mean(data, d => d.preop_dm) * 100).toFixed(2)  + ' %');
  }

  function renderPreopInfo(data) {

    const dl = d3.select('#preop').append('dl').attr('class', 'preop');

    dl.append('dt').html('Hemoglobin');
    dl.append('dt').html('Platelets');
    dl.append('dt').html('pH');

    dl.append('dd').text((d3.mean(data, d => d.preop_hb)).toFixed(2)  + ' g/dl');
    dl.append('dd').text((d3.mean(data, d => d.preop_plt)).toFixed(2)  + ' x1000/mcL');
    dl.append('dd').text((d3.mean(data, d => d.preop_ph)).toFixed(2));

    dl.append('dt').html('Glucose');
    dl.append('dt').html('Sodium');
    dl.append('dt').html('Potassium');

    dl.append('dd').text((d3.mean(data, d => d.preop_gluc)).toFixed(2)  + ' mg/dl');
    dl.append('dd').text((d3.mean(data, d => d.preop_na)).toFixed(2)  + ' mmol/L');
    dl.append('dd').text((d3.mean(data, d => d.preop_k)).toFixed(2) + ' mmol/L');
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

});