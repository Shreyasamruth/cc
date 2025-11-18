"""
Quantum Circuit Simulation Module
Provides quantum circuit simulation capabilities using numpy for state vector simulation.
"""

import numpy as np
import json
from typing import List, Dict, Tuple, Optional, Union
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuantumGate:
    """Represents a quantum gate with its matrix representation."""
    
    # Single-qubit gates
    I = np.array([[1, 0], [0, 1]], dtype=complex)  # Identity
    X = np.array([[0, 1], [1, 0]], dtype=complex)  # Pauli-X (NOT)
    Y = np.array([[0, -1j], [1j, 0]], dtype=complex)  # Pauli-Y
    Z = np.array([[1, 0], [0, -1]], dtype=complex)  # Pauli-Z
    H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)  # Hadamard
    S = np.array([[1, 0], [0, 1j]], dtype=complex)  # S gate (Phase)
    T = np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]], dtype=complex)  # T gate
    
    # Rotation gates
    @staticmethod
    def RX(theta: float) -> np.ndarray:
        """Rotation around X-axis."""
        return np.array([
            [np.cos(theta/2), -1j * np.sin(theta/2)],
            [-1j * np.sin(theta/2), np.cos(theta/2)]
        ], dtype=complex)
    
    @staticmethod
    def RY(theta: float) -> np.ndarray:
        """Rotation around Y-axis."""
        return np.array([
            [np.cos(theta/2), -np.sin(theta/2)],
            [np.sin(theta/2), np.cos(theta/2)]
        ], dtype=complex)
    
    @staticmethod
    def RZ(theta: float) -> np.ndarray:
        """Rotation around Z-axis."""
        return np.array([
            [np.exp(-1j * theta/2), 0],
            [0, np.exp(1j * theta/2)]
        ], dtype=complex)

class QuantumCircuit:
    """Represents a quantum circuit with qubits and gates."""
    
    def __init__(self, num_qubits: int):
        """
        Initialize quantum circuit.
        
        Args:
            num_qubits: Number of qubits in the circuit
        """
        self.num_qubits = num_qubits
        self.gates = []
        self.measurements = []
        self.state_vector = self._initialize_state()
    
    def _initialize_state(self) -> np.ndarray:
        """Initialize the quantum state to |00...0⟩."""
        state_size = 2 ** self.num_qubits
        state = np.zeros(state_size, dtype=complex)
        state[0] = 1.0  # |00...0⟩ state
        return state
    
    def add_gate(self, gate_name: str, target_qubit: int, 
                 control_qubit: Optional[int] = None, 
                 parameter: Optional[float] = None) -> None:
        """
        Add a gate to the circuit.
        
        Args:
            gate_name: Name of the gate ('X', 'Y', 'Z', 'H', 'S', 'T', 'CNOT', 'CZ', etc.)
            target_qubit: Target qubit index
            control_qubit: Control qubit index (for controlled gates)
            parameter: Parameter for parameterized gates
        """
        gate_info = {
            'name': gate_name,
            'target': target_qubit,
            'control': control_qubit,
            'parameter': parameter
        }
        self.gates.append(gate_info)
        logger.info(f"Added {gate_name} gate to qubit {target_qubit}")
    
    def add_measurement(self, qubit: int) -> None:
        """Add a measurement to a specific qubit."""
        self.measurements.append(qubit)
    
    def reset(self) -> None:
        """Reset the circuit to initial state."""
        self.gates.clear()
        self.measurements.clear()
        self.state_vector = self._initialize_state()
    
    def get_gate_matrix(self, gate_name: str, parameter: Optional[float] = None) -> np.ndarray:
        """Get the matrix representation of a gate."""
        gate_matrices = {
            'I': QuantumGate.I,
            'X': QuantumGate.X,
            'Y': QuantumGate.Y,
            'Z': QuantumGate.Z,
            'H': QuantumGate.H,
            'S': QuantumGate.S,
            'T': QuantumGate.T,
        }
        
        if gate_name in gate_matrices:
            return gate_matrices[gate_name]
        elif gate_name == 'RX' and parameter is not None:
            return QuantumGate.RX(parameter)
        elif gate_name == 'RY' and parameter is not None:
            return QuantumGate.RY(parameter)
        elif gate_name == 'RZ' and parameter is not None:
            return QuantumGate.RZ(parameter)
        else:
            raise ValueError(f"Unknown gate: {gate_name}")

class QuantumSimulator:
    """Main quantum circuit simulator class."""
    
    def __init__(self):
        """Initialize the quantum simulator."""
        self.circuit = None
        self.results = {}
    
    def create_circuit(self, num_qubits: int) -> QuantumCircuit:
        """Create a new quantum circuit."""
        self.circuit = QuantumCircuit(num_qubits)
        return self.circuit
    
    def simulate_circuit(self, gates: List[Dict], qubits: int = 2, shots: int = 1024) -> Dict:
        """
        Simulate a quantum circuit.
        
        Args:
            gates: List of gate dictionaries
            qubits: Number of qubits
            shots: Number of measurement shots
            
        Returns:
            Dictionary containing simulation results
        """
        try:
            # Create circuit
            circuit = self.create_circuit(qubits)
            
            # Add gates to circuit
            for gate_info in gates:
                gate_name = gate_info.get('type', gate_info.get('name', ''))
                target = gate_info.get('target', 0)
                control = gate_info.get('control')
                parameter = gate_info.get('parameter')
                
                circuit.add_gate(gate_name, target, control, parameter)
            
            # Execute simulation
            final_state = self._execute_circuit(circuit)
            
            # Perform measurements
            measurement_results = self._measure_state(final_state, shots, qubits)
            
            # Calculate probabilities
            probabilities = self._calculate_probabilities(final_state)
            
            # Prepare results
            results = {
                'state_vector': self._format_state_vector(final_state),
                'probabilities': probabilities,
                'measurements': measurement_results,
                'shots': shots,
                'success': True
            }
            
            self.results = results
            return results
            
        except Exception as e:
            logger.error(f"Simulation error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'measurements': {},
                'probabilities': {}
            }
    
    def _execute_circuit(self, circuit: QuantumCircuit) -> np.ndarray:
        """Execute the quantum circuit and return final state."""
        state = circuit.state_vector.copy()
        
        for gate_info in circuit.gates:
            state = self._apply_gate(state, gate_info, circuit.num_qubits)
        
        return state
    
    def _apply_gate(self, state: np.ndarray, gate_info: Dict, num_qubits: int) -> np.ndarray:
        """Apply a quantum gate to the state vector."""
        gate_name = gate_info['name']
        target = gate_info['target']
        control = gate_info.get('control')
        parameter = gate_info.get('parameter')
        
        if control is not None:
            # Controlled gate
            return self._apply_controlled_gate(state, gate_name, control, target, num_qubits, parameter)
        else:
            # Single-qubit gate
            return self._apply_single_qubit_gate(state, gate_name, target, num_qubits, parameter)
    
    def _apply_single_qubit_gate(self, state: np.ndarray, gate_name: str, 
                                target: int, num_qubits: int, 
                                parameter: Optional[float] = None) -> np.ndarray:
        """Apply a single-qubit gate."""
        gate_matrix = self.circuit.get_gate_matrix(gate_name, parameter)
        
        # Create the full gate matrix for the entire system
        full_matrix = self._create_full_gate_matrix(gate_matrix, target, num_qubits)
        
        # Apply the gate
        return full_matrix @ state
    
    def _apply_controlled_gate(self, state: np.ndarray, gate_name: str,
                              control: int, target: int, num_qubits: int,
                              parameter: Optional[float] = None) -> np.ndarray:
        """Apply a controlled gate."""
        if gate_name == 'CNOT' or gate_name == 'X':
            return self._apply_cnot(state, control, target, num_qubits)
        elif gate_name == 'CZ' or gate_name == 'Z':
            return self._apply_cz(state, control, target, num_qubits)
        else:
            # General controlled gate
            gate_matrix = self.circuit.get_gate_matrix(gate_name, parameter)
            return self._apply_general_controlled_gate(state, gate_matrix, control, target, num_qubits)
    
    def _apply_cnot(self, state: np.ndarray, control: int, target: int, num_qubits: int) -> np.ndarray:
        """Apply CNOT gate."""
        new_state = state.copy()
        
        for i in range(len(state)):
            # Check if control qubit is |1⟩
            if (i >> control) & 1:
                # Flip target qubit
                flipped_index = i ^ (1 << target)
                new_state[flipped_index] = state[i]
                new_state[i] = 0
        
        return new_state
    
    def _apply_cz(self, state: np.ndarray, control: int, target: int, num_qubits: int) -> np.ndarray:
        """Apply CZ gate."""
        new_state = state.copy()
        
        for i in range(len(state)):
            # Check if both control and target qubits are |1⟩
            if ((i >> control) & 1) and ((i >> target) & 1):
                new_state[i] *= -1
        
        return new_state
    
    def _create_full_gate_matrix(self, gate_matrix: np.ndarray, target: int, num_qubits: int) -> np.ndarray:
        """Create full system gate matrix from single-qubit gate."""
        # This is a simplified implementation
        # For a complete implementation, use tensor products
        full_size = 2 ** num_qubits
        full_matrix = np.eye(full_size, dtype=complex)
        
        # Apply gate to target qubit (simplified)
        for i in range(full_size):
            for j in range(full_size):
                # Check if states differ only in target qubit
                if (i ^ j) == (1 << target):
                    target_bit_i = (i >> target) & 1
                    target_bit_j = (j >> target) & 1
                    full_matrix[i, j] = gate_matrix[target_bit_i, target_bit_j]
                elif i == j:
                    target_bit = (i >> target) & 1
                    full_matrix[i, i] = gate_matrix[target_bit, target_bit]
        
        return full_matrix
    
    def _apply_general_controlled_gate(self, state: np.ndarray, gate_matrix: np.ndarray,
                                     control: int, target: int, num_qubits: int) -> np.ndarray:
        """Apply a general controlled gate."""
        new_state = state.copy()
        
        for i in range(len(state)):
            if (i >> control) & 1:  # Control qubit is |1⟩
                target_bit = (i >> target) & 1
                # Apply gate matrix
                for j in range(2):
                    if gate_matrix[target_bit, j] != 0:
                        new_index = i ^ ((target_bit ^ j) << target)
                        new_state[new_index] += gate_matrix[target_bit, j] * state[i]
                new_state[i] = 0
        
        return new_state
    
    def _measure_state(self, state: np.ndarray, shots: int, num_qubits: int) -> Dict[str, int]:
        """Perform measurements on the quantum state."""
        measurements = {}
        
        # Calculate probabilities
        probabilities = np.abs(state) ** 2
        
        # Perform shots
        for _ in range(shots):
            # Sample from probability distribution
            outcome_index = np.random.choice(len(state), p=probabilities)
            
            # Convert to binary string
            binary_outcome = format(outcome_index, f'0{num_qubits}b')
            
            measurements[binary_outcome] = measurements.get(binary_outcome, 0) + 1
        
        return measurements
    
    def _calculate_probabilities(self, state: np.ndarray) -> Dict[str, float]:
        """Calculate measurement probabilities."""
        probabilities = {}
        
        for i, amplitude in enumerate(state):
            probability = abs(amplitude) ** 2
            if probability > 1e-10:  # Only include non-negligible probabilities
                binary_state = format(i, f'0{len(bin(len(state)-1))-2}b')
                probabilities[binary_state] = float(probability)
        
        return probabilities
    
    def _format_state_vector(self, state: np.ndarray) -> Dict[str, Dict[str, float]]:
        """Format state vector for JSON serialization."""
        formatted_state = {}
        
        for i, amplitude in enumerate(state):
            if abs(amplitude) > 1e-10:
                binary_state = format(i, f'0{len(bin(len(state)-1))-2}b')
                formatted_state[binary_state] = {
                    'real': float(amplitude.real),
                    'imag': float(amplitude.imag),
                    'magnitude': float(abs(amplitude)),
                    'probability': float(abs(amplitude) ** 2)
                }
        
        return formatted_state
    
    def get_circuit_info(self) -> Dict:
        """Get information about the current circuit."""
        if not self.circuit:
            return {'error': 'No circuit created'}
        
        return {
            'num_qubits': self.circuit.num_qubits,
            'num_gates': len(self.circuit.gates),
            'gates': self.circuit.gates,
            'measurements': self.circuit.measurements
        }
    
    def export_circuit(self, filename: str) -> bool:
        """Export circuit to JSON file."""
        if not self.circuit:
            return False
        
        try:
            circuit_data = {
                'num_qubits': self.circuit.num_qubits,
                'gates': self.circuit.gates,
                'measurements': self.circuit.measurements
            }
            
            with open(filename, 'w') as f:
                json.dump(circuit_data, f, indent=2)
            
            return True
        except Exception as e:
            logger.error(f"Export error: {str(e)}")
            return False
    
    def import_circuit(self, filename: str) -> bool:
        """Import circuit from JSON file."""
        try:
            with open(filename, 'r') as f:
                circuit_data = json.load(f)
            
            self.circuit = QuantumCircuit(circuit_data['num_qubits'])
            self.circuit.gates = circuit_data.get('gates', [])
            self.circuit.measurements = circuit_data.get('measurements', [])
            
            return True
        except Exception as e:
            logger.error(f"Import error: {str(e)}")
            return False

# Example usage and predefined circuits
class ExampleCircuits:
    """Collection of example quantum circuits."""
    
    @staticmethod
    def bell_state() -> List[Dict]:
        """Create Bell state (maximally entangled state)."""
        return [
            {'name': 'H', 'target': 0},
            {'name': 'CNOT', 'control': 0, 'target': 1}
        ]
    
    @staticmethod
    def ghz_state(num_qubits: int = 3) -> List[Dict]:
        """Create GHZ state (generalized Bell state)."""
        gates = [{'name': 'H', 'target': 0}]
        for i in range(1, num_qubits):
            gates.append({'name': 'CNOT', 'control': 0, 'target': i})
        return gates
    
    @staticmethod
    def quantum_fourier_transform(num_qubits: int = 3) -> List[Dict]:
        """Create Quantum Fourier Transform circuit."""
        gates = []
        
        for i in range(num_qubits):
            gates.append({'name': 'H', 'target': i})
            
            for j in range(i + 1, num_qubits):
                angle = np.pi / (2 ** (j - i))
                gates.append({
                    'name': 'RZ', 
                    'control': j, 
                    'target': i, 
                    'parameter': angle
                })
        
        return gates
    
    @staticmethod
    def grover_oracle(num_qubits: int = 2, marked_state: int = 3) -> List[Dict]:
        """Create Grover's algorithm oracle."""
        gates = []
        
        # Mark the target state
        for i in range(num_qubits):
            if not (marked_state & (1 << i)):
                gates.append({'name': 'X', 'target': i})
        
        # Multi-controlled Z gate (simplified)
        if num_qubits == 2:
            gates.append({'name': 'CZ', 'control': 0, 'target': 1})
        
        # Unmark
        for i in range(num_qubits):
            if not (marked_state & (1 << i)):
                gates.append({'name': 'X', 'target': i})
        
        return gates

if __name__ == "__main__":
    # Example usage
    simulator = QuantumSimulator()
    
    # Create Bell state
    bell_gates = ExampleCircuits.bell_state()
    result = simulator.simulate_circuit(bell_gates, qubits=2, shots=1000)
    
    print("Bell State Simulation Results:")
    print(f"Probabilities: {result['probabilities']}")
    print(f"Measurements: {result['measurements']}")
