d3.csv("cases.txt").then(function(data) {
    console.log(data);

    // D3 visualization code goes here
    renderOperationDuration(data);

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