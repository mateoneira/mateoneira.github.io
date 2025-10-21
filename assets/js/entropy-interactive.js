// Entropy Interactive Visualizations
// Three main visualizations: Statistical Mechanics, Information Theory, and Thermodynamic Entropy

class EntropyVisualizations {
    constructor() {
        this.init();
    }

    init() {
        // Initialize all three visualizations
        this.initStatisticalMechanics();
        this.initInformationTheory();
        this.initThermodynamicEntropy();
    }

    // 1. Statistical Mechanics: Particle Distribution Visualization
    initStatisticalMechanics() {
        const container = document.getElementById('statistical-entropy-viz');
        if (!container) return;

        // Create HTML structure
        container.innerHTML = `
            <div class="controls">
                <label>Temperature: <input type="range" id="temperature" min="0.1" max="5" step="0.1" value="1"></label>
                <span id="temp-value">1.0</span>
                <button id="randomize-particles">Randomize</button>
                <button id="reset-particles">Reset to Order</button>
            </div>
            <div class="grid-container">
                <canvas id="particle-canvas" width="400" height="400"></canvas>
                <div class="entropy-display">
                    <div>Microstates (Ω): <span id="microstates">1</span></div>
                    <div>Entropy (S): <span id="statistical-entropy">0.00</span></div>
                    <div>Energy Distribution:</div>
                    <canvas id="energy-dist" width="200" height="150"></canvas>
                </div>
            </div>
        `;

        // Initialize particle system
        this.particleSystem = new ParticleSystem();
        this.setupStatisticalControls();
    }

    // 2. Information Theory: Message Entropy Visualization
    initInformationTheory() {
        const container = document.getElementById('information-entropy-viz');
        if (!container) return;

        container.innerHTML = `
            <div class="controls">
                <textarea id="message-input" placeholder="Type a message to analyze its entropy..." rows="3">Hello World</textarea>
                <button id="analyze-message">Analyze</button>
                <label>Symbol Set: 
                    <select id="symbol-set">
                        <option value="characters">Characters</option>
                        <option value="words">Words</option>
                        <option value="bytes">Bytes</option>
                    </select>
                </label>
            </div>
            <div class="analysis-container">
                <div class="probability-chart">
                    <h5>Symbol Probabilities</h5>
                    <canvas id="prob-chart" width="300" height="200"></canvas>
                </div>
                <div class="entropy-metrics">
                    <div>Shannon Entropy: <span id="shannon-entropy">0.00</span> bits</div>
                    <div>Max Possible Entropy: <span id="max-entropy">0.00</span> bits</div>
                    <div>Efficiency: <span id="entropy-efficiency">0%</span></div>
                    <div>Information Content: <span id="info-content">0.00</span> bits</div>
                    <div>Compression Ratio: <span id="compression-ratio">1.00</span></div>
                </div>
            </div>
            <div class="symbol-table">
                <h5>Symbol Analysis</h5>
                <table id="symbol-stats">
                    <thead>
                        <tr><th>Symbol</th><th>Count</th><th>Probability</th><th>Information</th></tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;

        this.setupInformationControls();
    }

    // 3. Thermodynamic Entropy: Heat Distribution Visualization
    initThermodynamicEntropy() {
        const container = document.getElementById('thermodynamic-entropy-viz');
        if (!container) return;

        container.innerHTML = `
            <div class="controls">
                <button id="add-heat">Add Heat Source</button>
                <button id="remove-heat">Remove Heat</button>
                <button id="run-simulation">Run/Pause</button>
                <button id="reset-heat">Reset</button>
                <label>Diffusion Rate: <input type="range" id="diffusion-rate" min="0.01" max="0.2" step="0.01" value="0.1"></label>
            </div>
            <div class="heat-container">
                <canvas id="heat-canvas" width="400" height="300"></canvas>
                <div class="thermodynamic-display">
                    <div>Total Entropy: <span id="thermo-entropy">0.00</span></div>
                    <div>Heat Sources: <span id="heat-sources">0</span></div>
                    <div>Average Temperature: <span id="avg-temp">0.0</span>°C</div>
                    <div>Temperature Gradient: <span id="temp-gradient">0.00</span></div>
                    <canvas id="temp-profile" width="200" height="150"></canvas>
                </div>
            </div>
        `;

        this.heatSystem = new HeatDiffusion();
        this.setupThermodynamicControls();
    }

    setupStatisticalControls() {
        const tempSlider = document.getElementById('temperature');
        const tempValue = document.getElementById('temp-value');
        const randomizeBtn = document.getElementById('randomize-particles');
        const resetBtn = document.getElementById('reset-particles');

        tempSlider.addEventListener('input', (e) => {
            const temp = parseFloat(e.target.value);
            tempValue.textContent = temp.toFixed(1);
            this.particleSystem.setTemperature(temp);
        });

        randomizeBtn.addEventListener('click', () => {
            this.particleSystem.randomize();
        });

        resetBtn.addEventListener('click', () => {
            this.particleSystem.reset();
        });

        // Start animation
        this.animateParticles();
    }

    setupInformationControls() {
        const input = document.getElementById('message-input');
        const analyzeBtn = document.getElementById('analyze-message');
        const symbolSet = document.getElementById('symbol-set');

        const analyze = () => {
            const message = input.value;
            const type = symbolSet.value;
            this.analyzeMessage(message, type);
        };

        analyzeBtn.addEventListener('click', analyze);
        input.addEventListener('input', analyze);
        symbolSet.addEventListener('change', analyze);

        // Initial analysis
        analyze();
    }

    setupThermodynamicControls() {
        const addHeatBtn = document.getElementById('add-heat');
        const removeHeatBtn = document.getElementById('remove-heat');
        const runBtn = document.getElementById('run-simulation');
        const resetBtn = document.getElementById('reset-heat');
        const diffusionSlider = document.getElementById('diffusion-rate');

        addHeatBtn.addEventListener('click', () => {
            this.heatSystem.addHeatSource();
        });

        removeHeatBtn.addEventListener('click', () => {
            this.heatSystem.removeHeatSource();
        });

        runBtn.addEventListener('click', () => {
            this.heatSystem.toggleSimulation();
            runBtn.textContent = this.heatSystem.running ? 'Pause' : 'Run';
        });

        resetBtn.addEventListener('click', () => {
            this.heatSystem.reset();
            runBtn.textContent = 'Run';
        });

        diffusionSlider.addEventListener('input', (e) => {
            this.heatSystem.setDiffusionRate(parseFloat(e.target.value));
        });

        // Start heat simulation
        this.animateHeat();
    }

    animateParticles() {
        this.particleSystem.update();
        this.particleSystem.draw();
        requestAnimationFrame(() => this.animateParticles());
    }

    animateHeat() {
        this.heatSystem.update();
        this.heatSystem.draw();
        requestAnimationFrame(() => this.animateHeat());
    }

    analyzeMessage(message, type) {
        const analyzer = new MessageAnalyzer(message, type);
        const results = analyzer.analyze();
        
        // Update displays
        document.getElementById('shannon-entropy').textContent = results.shannonEntropy.toFixed(3);
        document.getElementById('max-entropy').textContent = results.maxEntropy.toFixed(3);
        document.getElementById('entropy-efficiency').textContent = (results.efficiency * 100).toFixed(1);
        document.getElementById('info-content').textContent = results.totalInformation.toFixed(3);
        document.getElementById('compression-ratio').textContent = results.compressionRatio.toFixed(3);

        // Update probability chart
        this.drawProbabilityChart(results.symbolStats);
        
        // Update symbol table
        this.updateSymbolTable(results.symbolStats);
    }

    drawProbabilityChart(symbolStats) {
        const canvas = document.getElementById('prob-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const symbols = Object.keys(symbolStats).slice(0, 20); // Show top 20
        const barWidth = canvas.width / symbols.length;
        const maxProb = Math.max(...symbols.map(s => symbolStats[s].probability));
        
        symbols.forEach((symbol, i) => {
            const prob = symbolStats[symbol].probability;
            const height = (prob / maxProb) * (canvas.height - 30);
            
            // Draw bar
            ctx.fillStyle = `hsl(${i * 360 / symbols.length}, 70%, 50%)`;
            ctx.fillRect(i * barWidth, canvas.height - height - 20, barWidth - 1, height);
            
            // Draw label
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const displaySymbol = symbol === ' ' ? '␣' : symbol.substring(0, 3);
            ctx.fillText(displaySymbol, i * barWidth + barWidth/2, canvas.height - 5);
        });
    }

    updateSymbolTable(symbolStats) {
        const tbody = document.querySelector('#symbol-stats tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const sortedSymbols = Object.keys(symbolStats)
            .sort((a, b) => symbolStats[b].count - symbolStats[a].count)
            .slice(0, 10);
        
        sortedSymbols.forEach(symbol => {
            const stats = symbolStats[symbol];
            const row = tbody.insertRow();
            
            const displaySymbol = symbol === ' ' ? '(space)' : 
                                symbol === '\n' ? '(newline)' : 
                                symbol === '\t' ? '(tab)' : symbol;
            
            row.innerHTML = `
                <td>${displaySymbol}</td>
                <td>${stats.count}</td>
                <td>${stats.probability.toFixed(4)}</td>
                <td>${stats.information.toFixed(3)} bits</td>
            `;
        });
    }
}

// Particle System for Statistical Mechanics
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.energyCanvas = document.getElementById('energy-dist');
        this.energyCtx = this.energyCanvas.getContext('2d');
        
        this.gridSize = 20;
        this.cellSize = this.canvas.width / this.gridSize;
        this.temperature = 1.0;
        this.particles = [];
        
        this.initializeParticles();
    }

    initializeParticles() {
        this.particles = [];
        // Start with ordered configuration (all particles in bottom-left)
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.floor(i % 5),
                y: Math.floor(i / 5) + 15,
                energy: 0.1 + Math.random() * 0.4
            });
        }
    }

    setTemperature(temp) {
        this.temperature = temp;
    }

    randomize() {
        this.particles.forEach(particle => {
            particle.x = Math.floor(Math.random() * this.gridSize);
            particle.y = Math.floor(Math.random() * this.gridSize);
            particle.energy = Math.random() * this.temperature;
        });
    }

    reset() {
        this.initializeParticles();
    }

    update() {
        // Simulate particle movement based on temperature
        this.particles.forEach(particle => {
            if (Math.random() < 0.1 * this.temperature) {
                const dx = (Math.random() - 0.5) * 2;
                const dy = (Math.random() - 0.5) * 2;
                
                particle.x = Math.max(0, Math.min(this.gridSize - 1, 
                    Math.floor(particle.x + dx)));
                particle.y = Math.max(0, Math.min(this.gridSize - 1, 
                    Math.floor(particle.y + dy)));
                
                // Update energy based on Maxwell-Boltzmann distribution
                particle.energy = this.sampleMaxwellBoltzmann();
            }
        });
    }

    sampleMaxwellBoltzmann() {
        // Simplified Maxwell-Boltzmann sampling
        const beta = 1.0 / this.temperature;
        return -Math.log(Math.random()) / beta;
    }

    calculateEntropy() {
        // Calculate configurational entropy using spatial bins
        const bins = new Array(this.gridSize * this.gridSize).fill(0);
        
        this.particles.forEach(particle => {
            const binIndex = particle.y * this.gridSize + particle.x;
            bins[binIndex]++;
        });
        
        const total = this.particles.length;
        let entropy = 0;
        
        bins.forEach(count => {
            if (count > 0) {
                const prob = count / total;
                entropy -= prob * Math.log(prob);
            }
        });
        
        return entropy;
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#ddd';
        for (let i = 0; i <= this.gridSize; i++) {
            const pos = i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
        
        // Draw particles
        this.particles.forEach(particle => {
            const x = particle.x * this.cellSize + this.cellSize / 2;
            const y = particle.y * this.cellSize + this.cellSize / 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            
            // Color based on energy
            const intensity = Math.min(255, particle.energy * 100);
            this.ctx.fillStyle = `rgb(${intensity}, 0, ${255 - intensity})`;
            this.ctx.fill();
        });
        
        // Update entropy display
        const entropy = this.calculateEntropy();
        const microstates = Math.exp(entropy);
        
        document.getElementById('microstates').textContent = microstates.toFixed(0);
        document.getElementById('statistical-entropy').textContent = entropy.toFixed(3);
        
        // Draw energy distribution
        this.drawEnergyDistribution();
    }

    drawEnergyDistribution() {
        this.energyCtx.clearRect(0, 0, this.energyCanvas.width, this.energyCanvas.height);
        
        // Create energy histogram
        const bins = 20;
        const maxEnergy = Math.max(...this.particles.map(p => p.energy));
        const binSize = maxEnergy / bins;
        const histogram = new Array(bins).fill(0);
        
        this.particles.forEach(particle => {
            const binIndex = Math.min(bins - 1, Math.floor(particle.energy / binSize));
            histogram[binIndex]++;
        });
        
        const maxCount = Math.max(...histogram);
        const barWidth = this.energyCanvas.width / bins;
        
        // Draw histogram
        histogram.forEach((count, i) => {
            const height = (count / maxCount) * (this.energyCanvas.height - 20);
            
            this.energyCtx.fillStyle = '#4CAF50';
            this.energyCtx.fillRect(i * barWidth, this.energyCanvas.height - height, 
                                  barWidth - 1, height);
        });
        
        // Draw theoretical Maxwell-Boltzmann curve
        this.energyCtx.strokeStyle = '#F44336';
        this.energyCtx.lineWidth = 2;
        this.energyCtx.beginPath();
        
        for (let i = 0; i < bins; i++) {
            const energy = (i + 0.5) * binSize;
            const prob = Math.exp(-energy / this.temperature);
            const y = this.energyCanvas.height - (prob * this.energyCanvas.height * 0.8);
            
            if (i === 0) {
                this.energyCtx.moveTo(i * barWidth + barWidth/2, y);
            } else {
                this.energyCtx.lineTo(i * barWidth + barWidth/2, y);
            }
        }
        this.energyCtx.stroke();
    }
}

// Message Analyzer for Information Theory
class MessageAnalyzer {
    constructor(message, type) {
        this.message = message;
        this.type = type;
    }

    analyze() {
        const symbols = this.extractSymbols();
        const symbolStats = this.calculateSymbolStats(symbols);
        const shannonEntropy = this.calculateShannonEntropy(symbolStats);
        const maxEntropy = Math.log2(Object.keys(symbolStats).length);
        
        return {
            symbolStats,
            shannonEntropy,
            maxEntropy,
            efficiency: shannonEntropy / maxEntropy,
            totalInformation: this.message.length * shannonEntropy,
            compressionRatio: (this.message.length * 8) / (this.message.length * shannonEntropy)
        };
    }

    extractSymbols() {
        switch (this.type) {
            case 'characters':
                return this.message.split('');
            case 'words':
                return this.message.toLowerCase().split(/\s+/).filter(word => word.length > 0);
            case 'bytes':
                return Array.from(new TextEncoder().encode(this.message));
            default:
                return this.message.split('');
        }
    }

    calculateSymbolStats(symbols) {
        const counts = {};
        const total = symbols.length;
        
        symbols.forEach(symbol => {
            counts[symbol] = (counts[symbol] || 0) + 1;
        });
        
        const stats = {};
        Object.keys(counts).forEach(symbol => {
            const count = counts[symbol];
            const probability = count / total;
            stats[symbol] = {
                count,
                probability,
                information: -Math.log2(probability)
            };
        });
        
        return stats;
    }

    calculateShannonEntropy(symbolStats) {
        let entropy = 0;
        Object.values(symbolStats).forEach(stats => {
            entropy -= stats.probability * Math.log2(stats.probability);
        });
        return entropy;
    }
}

// Heat Diffusion for Thermodynamic Entropy
class HeatDiffusion {
    constructor() {
        this.canvas = document.getElementById('heat-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.profileCanvas = document.getElementById('temp-profile');
        this.profileCtx = this.profileCanvas.getContext('2d');
        
        this.width = 80;
        this.height = 60;
        this.cellWidth = this.canvas.width / this.width;
        this.cellHeight = this.canvas.height / this.height;
        
        this.temperature = new Array(this.width * this.height).fill(20); // Room temperature
        this.newTemperature = new Array(this.width * this.height).fill(20);
        this.heatSources = [];
        this.diffusionRate = 0.1;
        this.running = false;
        
        this.setupCanvasInteraction();
    }

    setupCanvasInteraction() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.cellWidth);
            const y = Math.floor((e.clientY - rect.top) / this.cellHeight);
            
            this.addHeatSourceAt(x, y);
        });
    }

    addHeatSource() {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);
        this.addHeatSourceAt(x, y);
    }

    addHeatSourceAt(x, y) {
        this.heatSources.push({ x, y, temperature: 100 });
        this.setTemperatureAt(x, y, 100);
        this.updateDisplay();
    }

    removeHeatSource() {
        if (this.heatSources.length > 0) {
            this.heatSources.pop();
            this.updateDisplay();
        }
    }

    toggleSimulation() {
        this.running = !this.running;
    }

    reset() {
        this.temperature.fill(20);
        this.newTemperature.fill(20);
        this.heatSources = [];
        this.running = false;
        this.updateDisplay();
    }

    setDiffusionRate(rate) {
        this.diffusionRate = rate;
    }

    setTemperatureAt(x, y, temp) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.temperature[y * this.width + x] = temp;
        }
    }

    getTemperatureAt(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.temperature[y * this.width + x];
        }
        return 20; // Boundary condition
    }

    update() {
        if (!this.running) return;
        
        // Apply heat diffusion equation: ∂T/∂t = α∇²T
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const current = this.getTemperatureAt(x, y);
                const neighbors = [
                    this.getTemperatureAt(x-1, y),
                    this.getTemperatureAt(x+1, y),
                    this.getTemperatureAt(x, y-1),
                    this.getTemperatureAt(x, y+1)
                ];
                
                const laplacian = neighbors.reduce((sum, temp) => sum + temp, 0) - 4 * current;
                this.newTemperature[y * this.width + x] = current + this.diffusionRate * laplacian;
            }
        }
        
        // Swap arrays
        [this.temperature, this.newTemperature] = [this.newTemperature, this.temperature];
        
        // Maintain heat sources
        this.heatSources.forEach(source => {
            this.setTemperatureAt(source.x, source.y, source.temperature);
        });
        
        this.updateDisplay();
    }

    calculateThermodynamicEntropy() {
        // Calculate entropy based on temperature distribution
        // S = ∫ (dQ/T) - simplified discrete version
        let entropy = 0;
        const minTemp = Math.min(...this.temperature);
        const maxTemp = Math.max(...this.temperature);
        
        if (maxTemp > minTemp) {
            this.temperature.forEach(temp => {
                if (temp > 0) {
                    entropy += Math.log(temp);
                }
            });
            entropy /= this.temperature.length;
        }
        
        return entropy;
    }

    calculateTemperatureGradient() {
        let totalGradient = 0;
        let count = 0;
        
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const current = this.getTemperatureAt(x, y);
                const dx = this.getTemperatureAt(x+1, y) - this.getTemperatureAt(x-1, y);
                const dy = this.getTemperatureAt(x, y+1) - this.getTemperatureAt(x, y-1);
                const gradient = Math.sqrt(dx*dx + dy*dy);
                totalGradient += gradient;
                count++;
            }
        }
        
        return count > 0 ? totalGradient / count : 0;
    }

    updateDisplay() {
        document.getElementById('heat-sources').textContent = this.heatSources.length;
        document.getElementById('thermo-entropy').textContent = this.calculateThermodynamicEntropy().toFixed(3);
        
        const avgTemp = this.temperature.reduce((sum, temp) => sum + temp, 0) / this.temperature.length;
        document.getElementById('avg-temp').textContent = avgTemp.toFixed(1);
        document.getElementById('temp-gradient').textContent = this.calculateTemperatureGradient().toFixed(2);
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Find temperature range for color mapping
        const minTemp = Math.min(...this.temperature);
        const maxTemp = Math.max(...this.temperature);
        const tempRange = maxTemp - minTemp || 1;
        
        // Draw temperature field
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const temp = this.getTemperatureAt(x, y);
                const normalized = (temp - minTemp) / tempRange;
                
                // Create heat map color
                const r = Math.floor(255 * normalized);
                const g = Math.floor(255 * (1 - Math.abs(normalized - 0.5) * 2));
                const b = Math.floor(255 * (1 - normalized));
                
                this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                this.ctx.fillRect(x * this.cellWidth, y * this.cellHeight, 
                                this.cellWidth, this.cellHeight);
            }
        }
        
        // Draw heat sources
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        
        this.heatSources.forEach(source => {
            const x = source.x * this.cellWidth + this.cellWidth / 2;
            const y = source.y * this.cellHeight + this.cellHeight / 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        });
        
        this.drawTemperatureProfile();
    }

    drawTemperatureProfile() {
        this.profileCtx.clearRect(0, 0, this.profileCanvas.width, this.profileCanvas.height);
        
        // Draw temperature profile across middle row
        const midRow = Math.floor(this.height / 2);
        const temps = [];
        for (let x = 0; x < this.width; x++) {
            temps.push(this.getTemperatureAt(x, midRow));
        }
        
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const tempRange = maxTemp - minTemp || 1;
        
        this.profileCtx.strokeStyle = '#2196F3';
        this.profileCtx.lineWidth = 2;
        this.profileCtx.beginPath();
        
        temps.forEach((temp, i) => {
            const x = (i / (temps.length - 1)) * this.profileCanvas.width;
            const y = this.profileCanvas.height - ((temp - minTemp) / tempRange) * this.profileCanvas.height;
            
            if (i === 0) {
                this.profileCtx.moveTo(x, y);
            } else {
                this.profileCtx.lineTo(x, y);
            }
        });
        
        this.profileCtx.stroke();
        
        // Add labels
        this.profileCtx.fillStyle = 'black';
        this.profileCtx.font = '12px Arial';
        this.profileCtx.fillText(`Min: ${minTemp.toFixed(1)}°C`, 5, this.profileCanvas.height - 5);
        this.profileCtx.fillText(`Max: ${maxTemp.toFixed(1)}°C`, 5, 15);
    }
}

// CSS styles for visualizations
const style = document.createElement('style');
style.textContent = `
    .entropy-visualization {
        margin: 20px 0;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        background: #f9f9f9;
    }
    
    .controls {
        margin-bottom: 15px;
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
    }
    
    .controls label {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .controls button {
        padding: 8px 12px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .controls button:hover {
        background: #1976D2;
    }
    
    .grid-container, .analysis-container, .heat-container {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }
    
    .entropy-display, .entropy-metrics, .thermodynamic-display {
        min-width: 200px;
    }
    
    .entropy-display div, .entropy-metrics div, .thermodynamic-display div {
        margin: 8px 0;
        font-weight: bold;
    }
    
    #message-input {
        width: 100%;
        max-width: 400px;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: monospace;
    }
    
    .probability-chart {
        flex: 1;
    }
    
    .symbol-table {
        margin-top: 15px;
    }
    
    .symbol-table table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .symbol-table th, .symbol-table td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }
    
    .symbol-table th {
        background: #f5f5f5;
        font-weight: bold;
    }
    
    canvas {
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    
    #particle-canvas, #heat-canvas {
        cursor: crosshair;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EntropyVisualizations();
});