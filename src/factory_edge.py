import asyncio
import websockets
import json
import random
import time
import math

# Factory State
state = {
    "system_status": "RUNNING",
    "motor_current_amps": 2.5,  # Baseline current
    "friction_anomaly": False,
    "maintenance_warning": False,
    "boxes_sorted": {
        "red": 0,
        "green": 0,
        "blue": 0,
        "total": 0
    },
    "current_box": None,  # Current box on the conveyor
    "conveyor_speed_m_s": 1.2
}

# Predictive Maintenance Parameters
current_history = []
HISTORY_SIZE = 50
NOMINAL_CURRENT = 2.5
CURRENT_NOISE = 0.2
ANOMALY_THRESHOLD = 4.5  # Amps - if current exceeds this, flag warning

async def edge_compute_loop():
    """Simulates the Edge Device (Raspberry Pi/Arduino) logic."""
    global state, current_history
    
    colors = ['red', 'green', 'blue']
    box_timer = 0
    
    while True:
        # Simulate Motor Physics (Adding noise and vibration)
        # Baseline + Noise
        raw_current = NOMINAL_CURRENT + random.uniform(-CURRENT_NOISE, CURRENT_NOISE)
        
        # Add a low-frequency oscillation to simulate motor rotation
        raw_current += math.sin(time.time() * 2) * 0.1
        
        # Inject friction anomaly if active
        if state["friction_anomaly"]:
            raw_current += random.uniform(2.0, 3.5) # Huge spikes
            
        state["motor_current_amps"] = round(raw_current, 2)
        
        # Predictive Maintenance AI Logic (Simple Z-Score / Thresholding)
        current_history.append(state["motor_current_amps"])
        if len(current_history) > HISTORY_SIZE:
            current_history.pop(0)
            
        # Analyze last X samples
        avg_current = sum(current_history) / len(current_history)
        if avg_current > ANOMALY_THRESHOLD or state["motor_current_amps"] > (ANOMALY_THRESHOLD + 1):
            state["maintenance_warning"] = True
        else:
            state["maintenance_warning"] = False

        # Simulate Box Detection & Sorting (Computer Vision Mock)
        box_timer -= 0.1
        if box_timer <= 0:
            if state["current_box"] is None:
                # New box arrives
                state["current_box"] = {
                    "color": random.choice(colors),
                    "position_pct": 0  # 0 to 100% position on conveyor
                }
            else:
                # Box moves
                state["current_box"]["position_pct"] += 5
                
                # Box reaches end, get sorted
                if state["current_box"]["position_pct"] >= 100:
                    sorted_color = state["current_box"]["color"]
                    state["boxes_sorted"][sorted_color] += 1
                    state["boxes_sorted"]["total"] += 1
                    state["current_box"] = None
                    box_timer = random.uniform(1.0, 3.0) # Wait before next box

        await asyncio.sleep(0.1)  # 10 Hz simulation loop

clients = set()

async def ws_handler(websocket, path):
    """Handles WebSocket connections from the Digital Twin."""
    clients.add(websocket)
    print(f"Client connected. Active clients: {len(clients)}")
    try:
        async for message in websocket:
            data = json.loads(message)
            cmd = data.get("cmd")
            
            if cmd == "inject_friction":
                state["friction_anomaly"] = True
                print("Anomaly Injected: Mechanical Friction")
            elif cmd == "clear_friction":
                state["friction_anomaly"] = False
                state["maintenance_warning"] = False
                print("Anomaly Cleared: Maintenance performed")
            elif cmd == "reset_counters":
                state["boxes_sorted"] = {"red": 0, "green": 0, "blue": 0, "total": 0}
                
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        clients.remove(websocket)
        print(f"Client disconnected. Active clients: {len(clients)}")

async def broadcast_state():
    """Broadcasts the edge device state to all connected Digital Twins."""
    while True:
        if clients:
            message = json.dumps(state)
            # Use asyncio.gather to send to all clients concurrently
            await asyncio.gather(*[client.send(message) for client in clients], return_exceptions=True)
        await asyncio.sleep(0.1) # 10 Hz broadcast

async def cloud_telemetry_loop():
    """Mocks sending data to AWS/Firebase every 5 seconds."""
    while True:
        await asyncio.sleep(5)
        # Here we would normally use firebase-admin or boto3
        # For the portfolio demo without setting up a real cloud account, we mock the log:
        print(f"[CLOUD TELEMETRY PUSH] -> Total Sorted: {state['boxes_sorted']['total']} | Avg Current: {sum(current_history)/len(current_history) if current_history else 0:.2f}A | Status: {'WARNING' if state['maintenance_warning'] else 'OK'}")

async def main():
    print("Starting SmartFactory Edge Node...")
    print("Starting Simulation Engine (10Hz)...")
    print("Starting Machine Learning Anomaly Detection...")
    print("Connecting to Mock Cloud Telemetry...")
    
    server = await websockets.serve(ws_handler, "localhost", 8765)
    print("WebSocket Digital Twin Server running on ws://localhost:8765")
    
    await asyncio.gather(
        edge_compute_loop(),
        broadcast_state(),
        cloud_telemetry_loop()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Shutting down Edge Node.")
