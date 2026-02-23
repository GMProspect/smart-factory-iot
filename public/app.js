document.addEventListener('DOMContentLoaded', () => {
    // --- WebSocket Setup ---
    const wsUrl = 'ws://localhost:8765';
    let ws;

    // --- DOM Elements ---
    const connectionStatus = document.getElementById('connection-status');
    const countRed = document.getElementById('count-red');
    const countGreen = document.getElementById('count-green');
    const countBlue = document.getElementById('count-blue');

    const simBox = document.getElementById('sim-box');
    const robotArm = document.querySelector('.robot-arm');

    const aiStatus = document.getElementById('ai-status');
    const currentReadout = document.getElementById('current-readout');
    const cloudLog = document.getElementById('cloud-log');

    // --- Buttons ---
    const btnReset = document.getElementById('btn-reset');
    const btnInjectFriction = document.getElementById('btn-inject-friction');
    const btnClearFriction = document.getElementById('btn-clear-friction');

    // --- Chart.js Setup ---
    const ctx = document.getElementById('motorChart').getContext('2d');
    const motorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(50).fill(''),
            datasets: [{
                label: 'Motor Current (Amps)',
                data: Array(50).fill(0),
                borderColor: '#00d2ff',
                backgroundColor: 'rgba(0, 210, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.1
            },
            {
                label: 'Failure Threshold',
                data: Array(50).fill(4.5),
                borderColor: '#ff4444',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                y: {
                    min: 0,
                    max: 8,
                    grid: { color: '#333' }
                },
                x: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { labels: { color: '#eee' } }
            }
        }
    });

    // --- Logic State ---
    let lastTotalSorted = 0;

    function connect() {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            connectionStatus.textContent = '🟢 Connected to Edge Server';
            connectionStatus.style.color = '#00ff00';
            logToCloud("Connection established with Edge Node.");
        };

        ws.onmessage = (event) => {
            const state = JSON.parse(event.data);
            updateDashboard(state);
        };

        ws.onclose = () => {
            connectionStatus.textContent = '🔴 Disconnected. Retrying...';
            connectionStatus.style.color = '#ff4444';
            setTimeout(connect, 2000);
        };
    }

    function updateDashboard(state) {
        // Update Counters
        countRed.textContent = state.boxes_sorted.red;
        countGreen.textContent = state.boxes_sorted.green;
        countBlue.textContent = state.boxes_sorted.blue;

        // Cloud Telemetry Mock Logic
        if (state.boxes_sorted.total > lastTotalSorted) {
            if (state.boxes_sorted.total % 5 === 0) { // Log every 5 boxes to not spam
                logToCloud(`[AWS IoT Core] Synced Total Sorted: ${state.boxes_sorted.total}`);
            }
            lastTotalSorted = state.boxes_sorted.total;
        }

        // Digital Twin Animation
        if (state.current_box) {
            simBox.style.display = 'block';
            simBox.style.left = `${state.current_box.position_pct}%`;
            simBox.style.backgroundColor = getBoxColor(state.current_box.color);

            // Animate robot arm sorting
            if (state.current_box.position_pct > 80) {
                robotArm.style.transform = `translateY(${getArmPosition(state.current_box.color)})`;
            } else {
                robotArm.style.transform = `translateY(0px)`;
            }
        } else {
            simBox.style.display = 'none';
            robotArm.style.transform = `translateY(0px)`;
        }

        // Update ML Chart
        const currentData = motorChart.data.datasets[0].data;
        currentData.shift();
        currentData.push(state.motor_current_amps);

        motorChart.update();

        // Update AI Insight
        currentReadout.textContent = `Inst. Current: ${state.motor_current_amps.toFixed(2)} A`;

        if (state.maintenance_warning) {
            aiStatus.textContent = 'WARNING: Friction Limit Exceeded!';
            aiStatus.className = 'badge danger';
            motorChart.data.datasets[0].borderColor = '#ffaa00';
            motorChart.data.datasets[0].backgroundColor = 'rgba(255, 170, 0, 0.2)';
            logToCloud(`[PREDICTIVE MAINT] Anomalous Friction Detected! Discarding defective bearing.`);
        } else {
            aiStatus.textContent = 'Condition: Nominal';
            aiStatus.className = 'badge ok';
            motorChart.data.datasets[0].borderColor = '#00d2ff';
            motorChart.data.datasets[0].backgroundColor = 'rgba(0, 210, 255, 0.1)';
        }
    }

    function getBoxColor(colorStr) {
        switch (colorStr) {
            case 'red': return '#ff4444';
            case 'green': return '#55ff55';
            case 'blue': return '#4444ff';
            default: return '#ccc';
        }
    }

    function getArmPosition(colorStr) {
        switch (colorStr) {
            case 'red': return '10px';
            case 'green': return '40px';
            case 'blue': return '70px';
            default: return '0px';
        }
    }

    function logToCloud(message) {
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry push';
        entry.textContent = `[${time}] ${message}`;
        cloudLog.prepend(entry);
        if (cloudLog.childElementCount > 10) {
            cloudLog.removeChild(cloudLog.lastChild);
        }
    }

    // --- Event Listeners ---
    btnReset.addEventListener('click', () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ cmd: 'reset_counters' }));
            logToCloud("[USER CMD] Resetting Counters on Edge Node.");
        }
    });

    btnInjectFriction.addEventListener('click', () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ cmd: 'inject_friction' }));
            logToCloud("[SIM CMD] Injecting Mechanical Friction.");
        }
    });

    btnClearFriction.addEventListener('click', () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ cmd: 'clear_friction' }));
            logToCloud("[SIM CMD] Mechanical Friction Cleared.");
        }
    });

    // Start
    connect();
});
