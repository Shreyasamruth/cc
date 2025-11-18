// Quantum Computing in the Cloud - JavaScript

// Global variables
let currentCircuit = [];
let qubitCount = 2;
let isSimulating = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupMobileMenu();
    setupQuantumSimulator();
    setupEventListeners();
    initializeCircuitDisplay();
    setupUIEnhancements();
    setupParallaxEffects();
}

// Enhanced UI interactions
function setupUIEnhancements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.interactive-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(34, 211, 238, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Add click ripple effect
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Parallax scrolling effects
function setupParallaxEffects() {
    const particles = document.querySelectorAll('.quantum-particle');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        particles.forEach((particle, index) => {
            const speed = 0.2 + (index * 0.1);
            particle.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .concept-card').forEach(el => {
        observer.observe(el);
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Quantum Simulator Class
class QuantumSimulator {
    constructor() {
        this.circuit = [];
        this.qubits = 2;
        this.state = this.initializeState();
    }
    
    initializeState() {
        // Initialize |00...0⟩ state
        const stateSize = Math.pow(2, this.qubits);
        const state = new Array(stateSize).fill(0);
        state[0] = 1; // |00...0⟩ has amplitude 1
        return state;
    }
    
    addGate(gate, qubit, controlQubit = null) {
        this.circuit.push({
            type: gate,
            target: qubit,
            control: controlQubit,
            id: Date.now() + Math.random()
        });
        this.updateCircuitDisplay();
    }
    
    clearCircuit() {
        this.circuit = [];
        this.state = this.initializeState();
        this.updateCircuitDisplay();
        this.updateResults();
    }
    
    simulate() {
        if (this.circuit.length === 0) {
            this.showMessage('Add some gates to your circuit first!', 'warning');
            return;
        }
        
        this.state = this.initializeState();
        
        // Apply each gate in sequence
        for (const gate of this.circuit) {
            this.applyGate(gate);
        }
        
        this.updateResults();
        this.showMessage('Simulation completed successfully!', 'success');
    }
    
    applyGate(gate) {
        const newState = [...this.state];
        
        switch (gate.type) {
            case 'X':
                this.applyPauliX(newState, gate.target);
                break;
            case 'Y':
                this.applyPauliY(newState, gate.target);
                break;
            case 'Z':
                this.applyPauliZ(newState, gate.target);
                break;
            case 'H':
                this.applyHadamard(newState, gate.target);
                break;
            case 'S':
                this.applySGate(newState, gate.target);
                break;
            case 'T':
                this.applyTGate(newState, gate.target);
                break;
            case 'CNOT':
                this.applyCNOT(newState, gate.control, gate.target);
                break;
            case 'CZ':
                this.applyCZ(newState, gate.control, gate.target);
                break;
        }
        
        this.state = newState;
    }
    
    applyPauliX(state, qubit) {
        const stateSize = state.length;
        const bitMask = 1 << qubit;
        
        for (let i = 0; i < stateSize; i++) {
            if (state[i] !== 0) {
                const flippedIndex = i ^ bitMask;
                if (flippedIndex !== i) {
                    const temp = state[i];
                    state[i] = state[flippedIndex];
                    state[flippedIndex] = temp;
                }
            }
        }
    }
    
    applyHadamard(state, qubit) {
        const stateSize = state.length;
        const bitMask = 1 << qubit;
        const newState = new Array(stateSize).fill(0);
        
        for (let i = 0; i < stateSize; i++) {
            if (state[i] !== 0) {
                const amplitude = state[i] / Math.sqrt(2);
                newState[i] += amplitude;
                newState[i ^ bitMask] += (i & bitMask) ? -amplitude : amplitude;
            }
        }
        
        for (let i = 0; i < stateSize; i++) {
            state[i] = newState[i];
        }
    }
    
    applyPauliY(state, qubit) {
        // Simplified Y gate implementation
        this.applyPauliX(state, qubit);
    }
    
    applyPauliZ(state, qubit) {
        const bitMask = 1 << qubit;
        for (let i = 0; i < state.length; i++) {
            if ((i & bitMask) && state[i] !== 0) {
                state[i] *= -1;
            }
        }
    }
    
    applySGate(state, qubit) {
        // S gate adds phase of i to |1⟩ component
        const bitMask = 1 << qubit;
        for (let i = 0; i < state.length; i++) {
            if ((i & bitMask) && state[i] !== 0) {
                // In this simplified version, we'll just apply a phase
                state[i] *= 0.707; // Simplified for visualization
            }
        }
    }
    
    applyTGate(state, qubit) {
        // T gate adds phase of e^(iπ/4) to |1⟩ component
        const bitMask = 1 << qubit;
        for (let i = 0; i < state.length; i++) {
            if ((i & bitMask) && state[i] !== 0) {
                state[i] *= 0.924; // Simplified for visualization
            }
        }
    }
    
    applyCNOT(state, control, target) {
        const controlMask = 1 << control;
        const targetMask = 1 << target;
        
        for (let i = 0; i < state.length; i++) {
            if ((i & controlMask) && state[i] !== 0) {
                const flippedIndex = i ^ targetMask;
                if (flippedIndex !== i) {
                    const temp = state[i];
                    state[i] = state[flippedIndex];
                    state[flippedIndex] = temp;
                }
            }
        }
    }
    
    applyCZ(state, control, target) {
        const controlMask = 1 << control;
        const targetMask = 1 << target;
        
        for (let i = 0; i < state.length; i++) {
            if ((i & controlMask) && (i & targetMask) && state[i] !== 0) {
                state[i] *= -1;
            }
        }
    }
    
    updateCircuitDisplay() {
        const display = document.getElementById('circuit-display');
        if (!display) return;
        
        if (this.circuit.length === 0) {
            display.innerHTML = `
                <div class="text-center text-gray-400 py-20">
                    <i class="fas fa-plus-circle text-4xl mb-4"></i>
                    <p>Click on gates to add them to your circuit</p>
                    <p class="text-sm mt-2">Drag gates to reorder or remove them</p>
                </div>
            `;
            return;
        }
        
        let circuitHTML = '<div class="circuit-visualization">';
        
        // Create qubit lines
        for (let q = 0; q < this.qubits; q++) {
            circuitHTML += `<div class="qubit-line" data-qubit="${q}">`;
            circuitHTML += `<span class="qubit-label">q${q}:</span>`;
            circuitHTML += '<div class="gate-container">';
            
            // Add gates for this qubit
            this.circuit.forEach((gate, index) => {
                if (gate.target === q || gate.control === q) {
                    circuitHTML += this.renderGate(gate, q, index);
                } else {
                    circuitHTML += '<div class="gate-spacer">─</div>';
                }
            });
            
            circuitHTML += '</div></div>';
        }
        
        circuitHTML += '</div>';
        display.innerHTML = circuitHTML;
        
        // Update circuit stats
        this.updateCircuitStats();
    }
    
    renderGate(gate, qubit, index) {
        let gateHTML = '';
        
        if (gate.type === 'CNOT') {
            if (qubit === gate.control) {
                gateHTML = `<div class="gate control-gate" data-index="${index}">●</div>`;
            } else if (qubit === gate.target) {
                gateHTML = `<div class="gate target-gate" data-index="${index}">⊕</div>`;
            }
        } else if (gate.type === 'CZ') {
            if (qubit === gate.control || qubit === gate.target) {
                gateHTML = `<div class="gate cz-gate" data-index="${index}">●</div>`;
            }
        } else if (gate.target === qubit) {
            gateHTML = `<div class="gate single-gate" data-index="${index}">${gate.type}</div>`;
        } else {
            gateHTML = '<div class="gate-spacer">─</div>';
        }
        
        return gateHTML;
    }
    
    updateCircuitStats() {
        const gateCountEl = document.getElementById('gate-count');
        const depthEl = document.getElementById('circuit-depth');
        
        if (gateCountEl) gateCountEl.textContent = this.circuit.length;
        if (depthEl) depthEl.textContent = this.circuit.length; // Simplified depth calculation
    }
    
    updateResults() {
        this.updateQuantumState();
        this.updateMeasurementResults();
        this.updateProbabilityChart();
    }
    
    updateQuantumState() {
        const stateEl = document.getElementById('quantum-state');
        if (!stateEl) return;
        
        let stateHTML = '';
        const threshold = 0.001; // Only show amplitudes above this threshold
        
        for (let i = 0; i < this.state.length; i++) {
            const amplitude = this.state[i];
            if (Math.abs(amplitude) > threshold) {
                const binaryState = i.toString(2).padStart(this.qubits, '0');
                const probability = Math.abs(amplitude) * Math.abs(amplitude);
                stateHTML += `<div class="state-component">|${binaryState}⟩: ${amplitude.toFixed(4)} (${(probability * 100).toFixed(1)}%)</div>`;
            }
        }
        
        if (stateHTML === '') {
            stateHTML = '<div class="text-gray-400">|00⟩: 1.0000 (100.0%)</div>';
        }
        
        stateEl.innerHTML = stateHTML;
    }
    
    updateMeasurementResults() {
        const resultsEl = document.getElementById('measurement-results');
        if (!resultsEl) return;
        
        const shots = parseInt(document.getElementById('shots-input')?.value || 1024);
        const measurements = this.simulateMeasurements(shots);
        
        let resultsHTML = '';
        for (const [state, count] of Object.entries(measurements)) {
            const percentage = ((count / shots) * 100).toFixed(1);
            resultsHTML += `<div class="measurement-result">|${state}⟩: ${count} (${percentage}%)</div>`;
        }
        
        resultsEl.innerHTML = resultsHTML;
    }
    
    simulateMeasurements(shots) {
        const measurements = {};
        
        for (let shot = 0; shot < shots; shot++) {
            const outcome = this.measureState();
            measurements[outcome] = (measurements[outcome] || 0) + 1;
        }
        
        return measurements;
    }
    
    measureState() {
        const random = Math.random();
        let cumulativeProbability = 0;
        
        for (let i = 0; i < this.state.length; i++) {
            const probability = Math.abs(this.state[i]) * Math.abs(this.state[i]);
            cumulativeProbability += probability;
            
            if (random <= cumulativeProbability) {
                return i.toString(2).padStart(this.qubits, '0');
            }
        }
        
        return '0'.repeat(this.qubits);
    }
    
    updateProbabilityChart() {
        const chartEl = document.getElementById('probability-chart');
        if (!chartEl) return;
        
        let chartHTML = '<div class="probability-bars">';
        
        for (let i = 0; i < this.state.length; i++) {
            const probability = Math.abs(this.state[i]) * Math.abs(this.state[i]);
            if (probability > 0.001) {
                const binaryState = i.toString(2).padStart(this.qubits, '0');
                const height = Math.max(probability * 100, 2);
                chartHTML += `
                    <div class="probability-bar">
                        <div class="bar" style="height: ${height}%; background: linear-gradient(to top, #06b6d4, #3b82f6);"></div>
                        <div class="bar-label">|${binaryState}⟩</div>
                    </div>
                `;
            }
        }
        
        chartHTML += '</div>';
        
        if (chartHTML === '<div class="probability-bars"></div>') {
            chartHTML = '<div class="text-gray-400 text-sm text-center pt-10">No data to display</div>';
        }
        
        chartEl.innerHTML = chartHTML;
    }
    
    showMessage(message, type = 'info') {
        const statusEl = document.getElementById('simulation-status');
        if (!statusEl) return;
        
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            warning: 'bg-yellow-600',
            info: 'bg-blue-600'
        };
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        statusEl.innerHTML = `
            <div class="flex items-center">
                <div class="w-3 h-3 ${colors[type]} rounded-full mr-2"></div>
                <span class="text-white"><i class="fas ${icons[type]} mr-1"></i>${message}</span>
            </div>
        `;
    }
}

// Setup quantum simulator
function setupQuantumSimulator() {
    if (typeof window !== 'undefined') {
        window.quantumSim = new QuantumSimulator();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Gate buttons
    document.querySelectorAll('.gate-button').forEach(button => {
        button.addEventListener('click', function() {
            const gate = this.dataset.gate;
            handleGateClick(gate);
        });
    });
    
    // Circuit controls
    const clearBtn = document.getElementById('clear-circuit');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (window.quantumSim) {
                window.quantumSim.clearCircuit();
            }
        });
    }
    
    const runBtn = document.getElementById('run-simulation');
    if (runBtn) {
        runBtn.addEventListener('click', function() {
            if (window.quantumSim) {
                runSimulation();
            }
        });
    }
    
    // Qubit count selector
    const qubitSelect = document.getElementById('qubit-count');
    if (qubitSelect) {
        qubitSelect.addEventListener('change', function() {
            qubitCount = parseInt(this.value);
            if (window.quantumSim) {
                window.quantumSim.qubits = qubitCount;
                window.quantumSim.clearCircuit();
            }
        });
    }
    
    // Example circuits
    document.querySelectorAll('.example-button').forEach(button => {
        button.addEventListener('click', function() {
            const example = this.dataset.example;
            loadExampleCircuit(example);
        });
    });
}

function handleGateClick(gate) {
    if (!window.quantumSim) return;
    
    if (['CNOT', 'CZ'].includes(gate)) {
        // For two-qubit gates, use qubits 0 and 1 by default
        if (qubitCount >= 2) {
            window.quantumSim.addGate(gate, 1, 0); // target=1, control=0
        } else {
            window.quantumSim.showMessage('Two-qubit gates require at least 2 qubits!', 'warning');
        }
    } else {
        // For single-qubit gates, add to qubit 0 by default
        window.quantumSim.addGate(gate, 0);
    }
}

function runSimulation() {
    if (!window.quantumSim) return;
    
    // Show loading modal
    const loadingModal = document.getElementById('loading-modal');
    if (loadingModal) {
        loadingModal.classList.remove('hidden');
        loadingModal.classList.add('flex');
    }
    
    // Simulate delay for realistic feel
    setTimeout(() => {
        window.quantumSim.simulate();
        
        // Hide loading modal
        if (loadingModal) {
            loadingModal.classList.add('hidden');
            loadingModal.classList.remove('flex');
        }
    }, 1500);
}

function loadExampleCircuit(example) {
    if (!window.quantumSim) return;
    
    window.quantumSim.clearCircuit();
    
    switch (example) {
        case 'bell':
            window.quantumSim.addGate('H', 0);
            window.quantumSim.addGate('CNOT', 1, 0);
            break;
        case 'superposition':
            window.quantumSim.addGate('H', 0);
            break;
        case 'teleportation':
            // Simplified teleportation circuit
            window.quantumSim.qubits = 3;
            document.getElementById('qubit-count').value = '3';
            window.quantumSim.addGate('H', 1);
            window.quantumSim.addGate('CNOT', 2, 1);
            window.quantumSim.addGate('CNOT', 1, 0);
            window.quantumSim.addGate('H', 0);
            break;
    }
    
    window.quantumSim.showMessage(`Loaded ${example} circuit!`, 'success');
}

function initializeCircuitDisplay() {
    // Add CSS for circuit visualization
    const style = document.createElement('style');
    style.textContent = `
        .circuit-visualization {
            font-family: 'Courier New', monospace;
            padding: 20px;
        }
        
        .qubit-line {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            min-height: 40px;
        }
        
        .qubit-label {
            width: 40px;
            color: #9ca3af;
            font-weight: bold;
        }
        
        .gate-container {
            display: flex;
            align-items: center;
            flex: 1;
            border-top: 2px solid #4b5563;
            position: relative;
        }
        
        .gate {
            background: #374151;
            border: 2px solid #6b7280;
            border-radius: 6px;
            width: 40px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 10px;
            font-weight: bold;
            color: white;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .gate:hover {
            background: #4b5563;
            transform: scale(1.1);
        }
        
        .single-gate {
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
        }
        
        .control-gate {
            background: #7c3aed;
            border-radius: 50%;
            width: 20px;
            height: 20px;
        }
        
        .target-gate {
            background: #7c3aed;
        }
        
        .cz-gate {
            background: #059669;
            border-radius: 50%;
            width: 20px;
            height: 20px;
        }
        
        .gate-spacer {
            width: 60px;
            text-align: center;
            color: #6b7280;
        }
        
        .state-component, .measurement-result {
            font-family: 'Courier New', monospace;
            padding: 2px 0;
            color: #e5e7eb;
        }
        
        .probability-bars {
            display: flex;
            align-items: end;
            height: 100px;
            gap: 5px;
            padding: 10px;
        }
        
        .probability-bar {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
        }
        
        .bar {
            width: 100%;
            min-height: 2px;
            border-radius: 2px 2px 0 0;
        }
        
        .bar-label {
            font-size: 10px;
            color: #9ca3af;
            margin-top: 5px;
            font-family: 'Courier New', monospace;
        }
    `;
    document.head.appendChild(style);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for global access
if (typeof window !== 'undefined') {
    window.QuantumSimulator = QuantumSimulator;
}
