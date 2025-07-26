// Spatial Interaction Model Interactive Visualization
// Created for spatial interaction models blog post

// Main visualization class
class SpatialInteractionViz {
    constructor(containerId) {
        // DOM elements
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container with id ${containerId} not found`);

        // Model parameters
        this.alpha = 1.0;   // Origin mass exponent
        this.beta = 1.0;    // Destination mass exponent
        this.gamma = 0.1;   // Distance decay parameter
        this.k = 0.001;     // Scaling constant

        // Grid dimensions
        this.gridSize = 5;  // 5x5 grid
        this.cellSize = 80; // pixels
        this.padding = 20;  // pixels

        // Canvas dimensions
        this.width = this.gridSize * this.cellSize + 2 * this.padding;
        this.height = this.gridSize * this.cellSize + 2 * this.padding;

        // Data
        this.origins = Array(this.gridSize).fill().map(() => Math.floor(Math.random() * 200) + 100);
        this.destinations = Array(this.gridSize).fill().map(() => Math.floor(Math.random() * 200) + 100);

        // Initialize UI
        this.initUI();
        this.initCanvas();
        this.calculateFlows();
        this.draw();
    }

    // Calculate the distance between two cells
    calculateDistance(originIdx, destIdx) {
        // Convert indices to grid coordinates
        // Origins are arranged vertically (rows 1-4), destinations horizontally (cols 1-4)
        const originRow = originIdx + 1; // +1 because first row is destinations
        const originCol = 0;
        const destRow = 0;
        const destCol = destIdx + 1; // +1 because first col is origins

        // Calculate Euclidean distance
        return Math.sqrt(
            Math.pow(originRow - destRow, 2) +
            Math.pow(originCol - destCol, 2)
        );
    }

    // Calculate flows using the gravity model
    calculateFlows() {
        this.flows = [];

        // Only calculate flows for the inner grid (excluding headers)
        for (let i = 0; i < this.gridSize - 1; i++) {
            for (let j = 0; j < this.gridSize - 1; j++) {
                const origin = this.origins[i + 1]; // +1 to skip header
                const destination = this.destinations[j + 1]; // +1 to skip header

                // Skip if origin or destination is 0
                if (origin === 0 || destination === 0) {
                    this.flows.push(0);
                    continue;
                }

                // Calculate distance
                const distance = this.calculateDistance(i, j);

                // Apply gravity model formula: k * O_i^α * D_j^β * e^(-γ*d_ij)
                const originTerm = Math.pow(origin, this.alpha);
                const destTerm = Math.pow(destination, this.beta);
                const distanceDecay = Math.exp(-this.gamma * distance);

                const flow = this.k * originTerm * destTerm * distanceDecay;
                this.flows.push(flow);
            }
        }
    }

    // Initialize UI elements
    initUI() {
        this.container.innerHTML = '';

        // Create parameter controls
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'sim-controls';

        // Gamma (distance decay) slider
        const gammaControl = document.createElement('div');
        gammaControl.className = 'control-group';
        gammaControl.innerHTML = `
      <label>Distance Decay (γ): <span id="gamma-value">${this.gamma.toFixed(2)}</span></label>
      <input type="range" id="gamma-slider" min="0.01" max="2" step="0.01" value="${this.gamma}">
      <p class="slider-description">Higher values mean distance has a stronger effect (fewer long trips)</p>
    `;
        controlsDiv.appendChild(gammaControl);

        // Alpha slider (origin exponent)
        const alphaControl = document.createElement('div');
        alphaControl.className = 'control-group';
        alphaControl.innerHTML = `
      <label>Origin Exponent (α): <span id="alpha-value">${this.alpha.toFixed(2)}</span></label>
      <input type="range" id="alpha-slider" min="0.1" max="2" step="0.05" value="${this.alpha}">
      <p class="slider-description">Higher values increase the importance of origin population</p>
    `;
        controlsDiv.appendChild(alphaControl);

        // Beta slider (destination exponent)
        const betaControl = document.createElement('div');
        betaControl.className = 'control-group';
        betaControl.innerHTML = `
      <label>Destination Exponent (β): <span id="beta-value">${this.beta.toFixed(2)}</span></label>
      <input type="range" id="beta-slider" min="0.1" max="2" step="0.05" value="${this.beta}">
      <p class="slider-description">Higher values increase the importance of destination attractions</p>
    `;
        controlsDiv.appendChild(betaControl);

        // Reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Model';
        resetButton.className = 'reset-button';
        controlsDiv.appendChild(resetButton);

        // Add controls to container
        this.container.appendChild(controlsDiv);

        // Create canvas container
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container';
        this.container.appendChild(canvasContainer);

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        canvasContainer.appendChild(this.canvas);

        // Create legend
        const legendDiv = document.createElement('div');
        legendDiv.className = 'sim-legend';
        legendDiv.innerHTML = `
      <div class="legend-item"><div class="color-box origin"></div>Origin (Population)</div>
      <div class="legend-item"><div class="color-box destination"></div>Destination (Jobs)</div>
      <div class="legend-item"><div class="color-box flow"></div>Flow Intensity</div>
    `;
        this.container.appendChild(legendDiv);

        // Add description
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'sim-description';
        descriptionDiv.innerHTML = `
      <p>Click on origin (blue) cells to increase their population. Click on destination (green) cells to increase their job count.</p>
      <p>The formula used is: Flow = k × Origin<sup>α</sup> × Destination<sup>β</sup> × e<sup>-γ×distance</sup></p>
    `;
        this.container.appendChild(descriptionDiv);

        // Add event listeners
        document.getElementById('gamma-slider').addEventListener('input', (e) => {
            this.gamma = parseFloat(e.target.value);
            document.getElementById('gamma-value').textContent = this.gamma.toFixed(2);
            this.calculateFlows();
            this.draw();
        });

        document.getElementById('alpha-slider').addEventListener('input', (e) => {
            this.alpha = parseFloat(e.target.value);
            document.getElementById('alpha-value').textContent = this.alpha.toFixed(2);
            this.calculateFlows();
            this.draw();
        });

        document.getElementById('beta-slider').addEventListener('input', (e) => {
            this.beta = parseFloat(e.target.value);
            document.getElementById('beta-value').textContent = this.beta.toFixed(2);
            this.calculateFlows();
            this.draw();
        });

        resetButton.addEventListener('click', () => {
            this.origins = Array(this.gridSize).fill().map(() => Math.floor(Math.random() * 200) + 100);
            this.destinations = Array(this.gridSize).fill().map(() => Math.floor(Math.random() * 200) + 100);
            this.alpha = 1.0;
            this.beta = 1.0;
            this.gamma = 0.1;

            // Update sliders
            document.getElementById('alpha-slider').value = this.alpha;
            document.getElementById('alpha-value').textContent = this.alpha.toFixed(2);
            document.getElementById('beta-slider').value = this.beta;
            document.getElementById('beta-value').textContent = this.beta.toFixed(2);
            document.getElementById('gamma-slider').value = this.gamma;
            document.getElementById('gamma-value').textContent = this.gamma.toFixed(2);

            this.calculateFlows();
            this.draw();
        });

        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    // Initialize canvas and context
    initCanvas() {
        this.ctx = this.canvas.getContext('2d');
    }

    // Handle canvas clicks
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - this.padding;
        const y = event.clientY - rect.top - this.padding;

        // Determine which cell was clicked
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (col >= 0 && col < this.gridSize && row >= 0 && row < this.gridSize) {
            // Left column (origins)
            if (col === 0 && row > 0) {
                this.origins[row] += 50;
                if (this.origins[row] > 500) this.origins[row] = 50; // Reset if too high
            }
            // Top row (destinations)
            else if (row === 0 && col > 0) {
                this.destinations[col] += 50;
                if (this.destinations[col] > 500) this.destinations[col] = 50; // Reset if too high
            }

            // Recalculate flows and redraw
            this.calculateFlows();
            this.draw();
        }
    }

    // Draw the visualization
    draw() {
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);

        // Calculate max flow for scaling visualization
        const maxFlow = Math.max(...this.flows.filter(flow => flow > 0)) || 1;

        // Draw grid
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const x = col * this.cellSize + this.padding;
                const y = row * this.cellSize + this.padding;

                // Draw different cell types
                if (row === 0 && col === 0) {
                    // Empty corner cell
                    ctx.fillStyle = '#f0f0f0';
                    ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    ctx.strokeStyle = '#ccc';
                    ctx.strokeRect(x, y, this.cellSize, this.cellSize);

                    // Draw title for this cell
                    ctx.fillStyle = '#555';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('O/D', x + this.cellSize / 2, y + this.cellSize / 2);
                }
                else if (row === 0) {
                    // Destination cells (top row)
                    const destValue = this.destinations[col];
                    const intensity = 0.3 + 0.7 * (destValue / 500);

                    ctx.fillStyle = `rgba(50, 205, 50, ${intensity})`;
                    ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(x, y, this.cellSize, this.cellSize);

                    // Draw destination value
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${destValue}`, x + this.cellSize / 2, y + this.cellSize / 2 - 5);

                    ctx.font = '12px Arial';
                    ctx.fillText('jobs', x + this.cellSize / 2, y + this.cellSize / 2 + 15);
                }
                else if (col === 0) {
                    // Origin cells (left column)
                    const originValue = this.origins[row];
                    const intensity = 0.3 + 0.7 * (originValue / 500);

                    ctx.fillStyle = `rgba(100, 149, 237, ${intensity})`;
                    ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(x, y, this.cellSize, this.cellSize);

                    // Draw origin value
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${originValue}`, x + this.cellSize / 2, y + this.cellSize / 2 - 5);

                    ctx.font = '12px Arial';
                    ctx.fillText('people', x + this.cellSize / 2, y + this.cellSize / 2 + 15);
                }
                else {
                    // Flow cells (internal grid)
                    const originIdx = row - 1; // -1 because first row is destinations
                    const destIdx = col - 1;   // -1 because first col is origins
                    const flowIdx = originIdx * (this.gridSize - 1) + destIdx;
                    const flowValue = this.flows[flowIdx] || 0;
                    const opacity = Math.min(0.9, flowValue / maxFlow);

                    // Background color based on flow intensity
                    ctx.fillStyle = `rgba(255, 165, 0, ${opacity})`;
                    ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(x, y, this.cellSize, this.cellSize);

                    // Draw flow value
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${Math.round(flowValue)}`, x + this.cellSize / 2, y + this.cellSize / 2);

                    // Draw distance as well in smaller font
                    const distance = this.calculateDistance(originIdx, destIdx);
                    ctx.font = '10px Arial';
                    ctx.fillText(`d: ${distance.toFixed(1)}`, x + this.cellSize / 2, y + this.cellSize / 2 + 15);
                }
            }
        }

        // Draw grid labels
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Origins', this.padding - 10, this.padding + this.cellSize * 2.5);

        ctx.textAlign = 'center';
        ctx.fillText('Destinations', this.padding + this.cellSize * 2.5, this.padding - 10);
    }
}

// Initialize the visualization when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
    .spatial-interaction-container {
      font-family: Arial, sans-serif;
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .sim-controls {
      margin-bottom: 20px;
      padding: 15px;
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .control-group {
      margin-bottom: 15px;
    }
    
    .control-group label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .control-group input[type="range"] {
      width: 100%;
      margin: 5px 0;
    }
    
    .slider-description {
      margin: 5px 0 0;
      font-size: 12px;
      color: #666;
      font-style: italic;
    }
    
    .reset-button {
      display: block;
      margin: 15px auto 5px;
      padding: 8px 16px;
      background: #4a7aff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .reset-button:hover {
      background: #3a67e8;
    }
    
    .canvas-container {
      display: flex;
      justify-content: center;
      margin: 15px 0;
      overflow: auto;
    }
    
    .canvas-container canvas {
      border: 1px solid #ddd;
      background: #fff;
    }
    
    .sim-legend {
      display: flex;
      justify-content: center;
      margin: 15px 0 10px;
      flex-wrap: wrap;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      margin: 5px 15px;
      font-size: 14px;
    }
    
    .color-box {
      width: 15px;
      height: 15px;
      margin-right: 8px;
      border: 1px solid #333;
    }
    
    .color-box.origin {
      background-color: rgba(100, 149, 237, 0.7);
    }
    
    .color-box.destination {
      background-color: rgba(50, 205, 50, 0.7);
    }
    
    .color-box.flow {
      background-color: rgba(255, 165, 0, 0.7);
    }
    
    .sim-description {
      font-size: 14px;
      margin: 10px 0;
      text-align: center;
      line-height: 1.5;
    }
  `;
    document.head.appendChild(style);

    // Create container if it doesn't exist
    let container = document.getElementById('spatial-interaction-viz');
    if (!container) {
        container = document.createElement('div');
        container.id = 'spatial-interaction-viz';
        container.className = 'spatial-interaction-container';

        // Find where to insert it in the blog post
        const insertionPoint = document.querySelector('script[src*="spatial-interaction.js"]');
        if (insertionPoint && insertionPoint.parentNode) {
            insertionPoint.parentNode.insertBefore(container, insertionPoint);
        } else {
            // Fallback: Just add to body
            document.body.appendChild(container);
        }
    }

    // Initialize visualization
    try {
        new SpatialInteractionViz('spatial-interaction-viz');
    } catch (error) {
        console.error('Failed to initialize spatial interaction visualization:', error);
        container.innerHTML = `<p style="color: red;">Error initializing visualization: ${error.message}</p>`;
    }
}); 