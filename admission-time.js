// Create the circular heatmap for admission times
function createAdmissionTimeViz() {
    // Calculate responsive dimensions
    const container = document.querySelector("#admission-time .viz-container");
    const containerRect = container.getBoundingClientRect();
    const width = Math.min(containerRect.width * 0.9, containerRect.height * 0.9);
    const height = width;
    const margin = width * 0.15;
    const innerRadius = width * 0.25;
    const outerRadius = (width / 2) - margin;

    // Sample data structure (we'll replace this with real data)
    const hours = Array.from({length: 24}, (_, i) => i);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Sample data (replace with real data)
    const data = [];
    days.forEach((day, dayIndex) => {
        hours.forEach(hour => {
            const value = Math.random() * 20;
            data.push({
                day: day,
                hour: hour,
                value: value,
                dayIndex: dayIndex
            });
        });
    });

    // Clear any existing SVG
    d3.select("#admission-time .viz-container svg").remove();

    // Create SVG with viewBox for responsiveness
    const svg = d3.select("#admission-time .viz-container")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    // Color scale
    const color = d3.scaleSequential()
        .domain([0, d3.max(data, d => d.value)])
        .interpolator(d3.interpolateReds);

    // Create scales
    const angleScale = d3.scaleLinear()
        .domain([0, 24])
        .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleBand()
        .domain(days)
        .range([innerRadius, outerRadius])
        .padding(0.15);

    // Create arc generator
    const arc = d3.arc()
        .innerRadius(d => radiusScale(d.day))
        .outerRadius(d => radiusScale(d.day) + radiusScale.bandwidth())
        .startAngle(d => angleScale(d.hour))
        .endAngle(d => angleScale(d.hour + 1))
        .padAngle(0.02)
        .padRadius(innerRadius);

    // Add the heatmap cells
    svg.selectAll("path")
        .data(data)
        .join("path")
        .attr("d", arc)
        .attr("fill", d => color(d.value))
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .on("mousemove", function(event, d) {
            // Highlight the cell
            d3.select(this)
                .attr("stroke-width", 1.5)
                .attr("stroke", "#2c3e50");
            
            // Get container position for relative positioning
            const containerRect = document.querySelector("#admission-time").getBoundingClientRect();
            
            // Calculate position relative to container
            const xPos = event.clientX - containerRect.left + 20;
            const yPos = event.clientY - containerRect.top;
            
            // Format hour with leading zero
            const hourFormatted = d.hour.toString().padStart(2, '0');
            
            // Update and show tooltip
            const tooltip = d3.select("#admission-tooltip");
            tooltip
                .html(`
                    <strong>${hourFormatted}:00</strong>
                    <div class="tooltip-value">${Math.round(d.value)}</div>
                    <div class="tooltip-day">${d.day}</div>
                `)
                .style("left", `${xPos}px`)
                .style("top", `${yPos}px`)
                .classed('visible', true);

            // Ensure tooltip stays within container bounds
            const tooltipElement = tooltip.node();
            const tooltipRect = tooltipElement.getBoundingClientRect();
            
            if (tooltipRect.right > containerRect.right) {
                tooltip.style("left", `${xPos - tooltipRect.width - 40}px`);
            }
            if (tooltipRect.bottom > containerRect.bottom) {
                tooltip.style("top", `${yPos - tooltipRect.height}px`);
            }
        })
        .on("mouseout", function() {
            // Remove highlight
            d3.select(this)
                .attr("stroke-width", 0.5)
                .attr("stroke", "white");
            
            // Hide tooltip
            d3.select("#admission-tooltip")
                .classed('visible', false);
        });

    // Add hour labels at key points
    const hourLabels = [0, 6, 12, 18];
    const hourLabelRadius = outerRadius + margin * 0.5;
    
    svg.selectAll(".hour-label")
        .data(hourLabels)
        .join("text")
        .attr("class", "hour-label")
        .attr("x", d => hourLabelRadius * Math.sin(angleScale(d)))
        .attr("y", d => -hourLabelRadius * Math.cos(angleScale(d)))
        .attr("text-anchor", d => {
            if (d === 0) return "middle";
            if (d === 6) return "start";
            if (d === 12) return "middle";
            return "end";
        })
        .attr("dominant-baseline", d => {
            if (d === 0) return "baseline";
            if (d === 12) return "hanging";
            return "middle";
        })
        .text(d => d + ":00")
        .style("font-size", `${width * 0.028}px`)
        .style("fill", "#2c3e50")
        .style("font-weight", "500");

    // Add legend below the visualization
    const legendWidth = width * 0.4;
    const legendHeight = margin * 0.2;
    
    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickSize(legendHeight * 0.3);

    const legend = svg.append("g")
        .attr("transform", `translate(${-legendWidth/2},${outerRadius + margin * 1.2})`);  // Moved legend further down

    const legendGradient = legend.append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    const stops = color.domain();
    legendGradient.selectAll("stop")
        .data(stops)
        .join("stop")
        .attr("offset", (d, i) => i / (stops.length - 1))
        .attr("stop-color", color);

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    legend.append("g")
        .attr("transform", `translate(0,${legendHeight})`)
        .call(legendAxis)
        .style("font-size", `${width * 0.022}px`);

    legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -margin * 0.15)
        .attr("text-anchor", "middle")
        .style("font-size", `${width * 0.028}px`)
        .style("fill", "#2c3e50")
        .text("Number of Admissions");
}

// Call the function when the document is ready
document.addEventListener('DOMContentLoaded', createAdmissionTimeViz); 