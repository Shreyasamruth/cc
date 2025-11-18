from flask import Flask, render_template, request, jsonify
import json
import os
from models.quantum_simulation import QuantumSimulator
from utils.cloud_connector import CloudConnector

app = Flask(__name__)

# Initialize quantum simulator and cloud connector
quantum_sim = QuantumSimulator()
cloud_conn = CloudConnector()

@app.route('/')
def index():
    """Home page route"""
    return render_template('index.html')

@app.route('/about')
def about():
    """About page route"""
    return render_template('about.html')

@app.route('/concepts')
def concepts():
    """Quantum concepts explanation page"""
    return render_template('concepts.html')

@app.route('/simulation')
def simulation():
    """Quantum circuit simulator page"""
    return render_template('simulation.html')

@app.route('/contact')
def contact():
    """Contact information page"""
    return render_template('contact.html')

@app.route('/api/simulate', methods=['POST'])
def simulate_circuit():
    """API endpoint to simulate quantum circuits"""
    try:
        circuit_data = request.get_json()
        
        # Validate input
        if not circuit_data or 'gates' not in circuit_data:
            return jsonify({'error': 'Invalid circuit data'}), 400
        
        # Run simulation
        result = quantum_sim.simulate_circuit(
            gates=circuit_data['gates'],
            qubits=circuit_data.get('qubits', 2),
            shots=circuit_data.get('shots', 1024)
        )
        
        return jsonify({
            'success': True,
            'result': result,
            'message': 'Simulation completed successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/cloud-status')
def cloud_status():
    """Get cloud quantum computing status"""
    try:
        status = cloud_conn.get_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({
            'error': 'Failed to get cloud status',
            'details': str(e)
        }), 500

@app.route('/api/quantum-concepts')
def get_quantum_concepts():
    """Get quantum computing concepts data"""
    concepts = {
        'superposition': {
            'title': 'Superposition',
            'description': 'A quantum state where a qubit exists in multiple states simultaneously',
            'example': 'A qubit can be both 0 and 1 at the same time'
        },
        'entanglement': {
            'title': 'Entanglement',
            'description': 'A quantum phenomenon where qubits become correlated',
            'example': 'Measuring one entangled qubit instantly affects its partner'
        },
        'interference': {
            'title': 'Interference',
            'description': 'Quantum states can interfere constructively or destructively',
            'example': 'Used in quantum algorithms to amplify correct answers'
        }
    }
    return jsonify(concepts)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
