export function renderHeatmapFromStaticCounts() {
    const img = document.getElementById("body-img");
    const canvas = document.getElementById("overlay");
    const ctx = canvas.getContext("2d");
    const tooltip = document.getElementById("heatmap-tooltip");
    const modal = document.getElementById("surgery-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const closeButton = document.querySelector(".close-button");
  
    const surgeryDescriptions = {
      "Thyroid": "Thyroid surgery involves removing part or all of the thyroid gland, typically to treat thyroid nodules, cancer, or hyperthyroidism. The procedure is performed through an incision in the neck.",
      "Breast": "Breast surgery encompasses various procedures including mastectomy (removal of breast tissue), lumpectomy (removal of tumors), and reconstructive procedures.",
      "Stomach": "Gastric surgery can include partial or total gastrectomy, often performed to treat stomach cancer, severe ulcers, or for weight loss (bariatric surgery).",
      "Biliary/Pancreas": "These surgeries involve the gallbladder, bile ducts, or pancreas. Common procedures include cholecystectomy (gallbladder removal) and various pancreatic surgeries for cancer or pancreatitis.",
      "Hepatic": "Liver surgery includes procedures like partial hepatectomy (removal of liver segments) to treat liver cancer, metastases, or other liver conditions.",
      "Major resection": "Major resection refers to the removal of significant portions of organs, typically involving complex procedures with longer recovery times.",
      "Minor resection": "Minor resection involves removing smaller portions of tissue or organs, usually with shorter recovery times and less invasive techniques.",
      "Transplantation": "Organ transplantation surgery involves replacing damaged organs with healthy donor organs. This includes liver, kidney, and other organ transplants.",
      "Vascular": "Vascular surgery treats diseases of the arteries and veins through procedures like bypass surgery, aneurysm repair, and blood vessel reconstruction.",
      "Colorectal": "Colorectal surgery involves procedures on the colon, rectum, and anus, treating conditions like cancer, inflammatory bowel disease, or diverticulitis.",
      "Others": "This category includes various other surgical procedures not covered by the main categories."
    };

    const data = {
      "Biliary/Pancreas": 812,
      "Breast": 434,
      "Colorectal": 1350,
      "Hepatic": 258,
      "Major resection": 584,
      "Minor resection": 553,
      "Others": 799,
      "Stomach": 676,
      "Thyroid": 257,
      "Transplantation": 403,
      "Vascular": 262
    };
  
    const coordMap = {
      "Thyroid": { x: 300, y: 140 },
      "Breast": { x: 300, y: 180 },
      "Stomach": { x: 300, y: 250 },
      "Biliary/Pancreas": { x: 300, y: 270 },
      "Hepatic": { x: 350, y: 270 },
      "Major resection": { x: 300, y: 300 },
      "Minor resection": { x: 300, y: 330 },
      "Transplantation": { x: 250, y: 270 },
      "Vascular": { x: 300, y: 370 },
      "Colorectal": { x: 300, y: 400 },
      "Others": { x: 100, y: 100 },
    };
  
    let circles = [];
    let hoveredCircle = null;
    let isAnimating = false;
    let currentScales = {};
    let lastTime = 0;
    let lastHoverTime = 0;
    const totalCases = Object.values(data).reduce((a, b) => a + b, 0);
    const HOVER_SCALE = 1.3;
    const TRANSITION_DURATION = 300;
    const HOVER_THRESHOLD = 1; // ms between hover changes

    // Initialize scales for all circles
    Object.keys(data).forEach(label => {
      currentScales[label] = {
        current: 1,
        target: 1,
        progress: 1
      };
    });

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  
    function updateScales(timestamp) {
      const deltaTime = lastTime ? (timestamp - lastTime) : 16.67;
      lastTime = timestamp;
      
      let needsUpdate = false;
      const step = deltaTime / TRANSITION_DURATION;

      Object.keys(data).forEach(label => {
        const scale = currentScales[label];
        const targetScale = (hoveredCircle && hoveredCircle.label === label) ? HOVER_SCALE : 1;
        
        if (scale.target !== targetScale) {
          scale.target = targetScale;
          if (targetScale > scale.current) {
            scale.progress = 0;
          } else {
            scale.progress = 1;
          }
        }

        if (scale.current !== scale.target) {
          if (scale.target > scale.current) {
            scale.progress = Math.min(1, scale.progress + step);
          } else {
            scale.progress = Math.max(0, scale.progress - step);
          }
          
          scale.current = 1 + (HOVER_SCALE - 1) * easeInOutCubic(scale.progress);
          needsUpdate = true;
        }
      });

      return needsUpdate;
    }
  
    function drawHeatmap(timestamp) {
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      const max = Math.max(...Object.values(data));
      circles = [];

      // Update selection indicator
      const indicator = document.getElementById('selection-indicator');
      if (window.selectedSurgeryTypes && window.selectedSurgeryTypes.size > 0) {
        const surgeryList = Array.from(window.selectedSurgeryTypes).join(', ');
        indicator.textContent = `Selected: ${surgeryList}`;
        indicator.classList.add('active');
      } else {
        indicator.textContent = 'Click on regions to select surgery types';
        indicator.classList.remove('active');
      }
  
      // Create circles array
      Object.entries(data).forEach(([label, count]) => {
        const coord = coordMap[label];
        if (!coord) return;
  
        const baseRadius = (count / max) * 30 + 5;
        const scale = currentScales[label].current;
        
        circles.push({
          x: coord.x,
          y: coord.y,
          r: baseRadius,
          actualRadius: baseRadius * scale,
          label: label,
          count: count,
          percentage: ((count / totalCases) * 100).toFixed(1),
          scale: scale
        });
      });

      // Sort circles by size (largest first)
      circles.sort((a, b) => b.r - a.r);

      // Draw circles
      circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.actualRadius, 0, 2 * Math.PI);
        
        const isSelected = window.selectedSurgeryTypes && window.selectedSurgeryTypes.has(circle.label);
        const isDimmed = window.selectedSurgeryTypes && window.selectedSurgeryTypes.size > 0 && !isSelected;
        
        if (circle.label === "Others") {
          ctx.fillStyle = isDimmed ? 
            "rgba(0, 128, 255, 0.1)" : 
            "rgba(0, 128, 255, 0.4)";
          ctx.strokeStyle = isDimmed ? 
            "rgba(0, 100, 200, 0.2)" : 
            "rgba(0, 100, 200, 0.7)";
        } else {
          ctx.fillStyle = isDimmed ? 
            "rgba(255, 0, 0, 0.1)" : 
            "rgba(255, 0, 0, 0.4)";
          ctx.strokeStyle = isDimmed ? 
            "rgba(200, 0, 0, 0.2)" : 
            "rgba(200, 0, 0, 0.7)";
        }
        
        if (isSelected) {
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
        } else if (isDimmed) {
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
        } else {
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
        }
        
        ctx.fill();
        ctx.stroke();
      });

      if (updateScales(timestamp)) {
        isAnimating = true;
        requestAnimationFrame(drawHeatmap);
      } else {
        isAnimating = false;
      }
    }
  
    function findHoveredCircle(mx, my) {
      // First, find all circles that contain the point
      const containingCircles = circles.filter(circle => {
        const dx = mx - circle.x;
        const dy = my - circle.y;
        return Math.sqrt(dx * dx + dy * dy) <= circle.r;
      });

      if (containingCircles.length === 0) return null;

      // If the currently hovered circle is still in the containing circles, keep it
      if (hoveredCircle && containingCircles.find(c => c.label === hoveredCircle.label)) {
        return hoveredCircle;
      }

      // Otherwise, return the smallest circle that contains the point
      return containingCircles[containingCircles.length - 1];
    }
  
    function onHover(event) {
      const now = Date.now();
      if (now - lastHoverTime < HOVER_THRESHOLD) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
  
      const mx = (event.clientX - rect.left) * scaleX;
      const my = (event.clientY - rect.top) * scaleY;
  
      const found = findHoveredCircle(mx, my);
  
      if (found?.label !== hoveredCircle?.label) {
        lastHoverTime = now;
        hoveredCircle = found;
        
        if (found) {
          const containerRect = document.getElementById('body-container').getBoundingClientRect();
          const tooltipX = event.clientX - containerRect.left + 20;
          const tooltipY = event.clientY - containerRect.top;

          tooltip.classList.add('visible');
          tooltip.style.left = `${tooltipX}px`;
          tooltip.style.top = `${tooltipY}px`;
          tooltip.innerHTML = `
            <strong>${found.label}</strong><br>
            Cases: ${found.count.toLocaleString()}<br>
            Percentage: ${found.percentage}%
          `;
        } else {
          tooltip.classList.remove('visible');
        }
        
        if (!isAnimating) {
          requestAnimationFrame(drawHeatmap);
        }
      }
    }
  
    function onClick(event) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
  
      const mx = (event.clientX - rect.left) * scaleX;
      const my = (event.clientY - rect.top) * scaleY;
  
      const clicked = findHoveredCircle(mx, my);
      
      if (clicked) {
        window.handleSurgerySelection(clicked.label);
        
        // Visual feedback for selection
        Object.keys(currentScales).forEach(label => {
          if (!window.selectedSurgeryTypes || window.selectedSurgeryTypes.size === 0) {
            currentScales[label].target = 1;
          } else {
            currentScales[label].target = window.selectedSurgeryTypes.has(label) ? HOVER_SCALE : 0.6;
          }
        });

        if (!isAnimating) {
          requestAnimationFrame(drawHeatmap);
        }
      }
    }

    // Close modal when clicking outside or on close button
    function closeModal() {
      modal.classList.remove('show');
    }

    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    canvas.addEventListener("mousemove", onHover);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mouseleave", () => {
      hoveredCircle = null;
      tooltip.classList.remove('visible');
      if (!isAnimating) {
        requestAnimationFrame(drawHeatmap);
      }
    });
  
    if (img.complete) {
      drawHeatmap();
    } else {
      img.onload = drawHeatmap;
    }
  }
  