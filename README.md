<div align="center">
  <img src="smart_factory_cover.png" alt="SmartFactory Digital Twin & Edge AI Dashboard" width="100%">
  
  <h1>🏭 Industrial IoT Smart Sorting System: Edge AI & Digital Twin</h1>
  <p><strong>IT/OT Integration: Real-time Computer Vision, Predictive Maintenance & Cloud Telemetry</strong></p>

  <a href="#-la-solución">Arquitectura</a> •
  <a href="#-digital-twin--edge-ai-upgrades">Nuevos Features (Upgrades)</a> •
  <a href="#-tecnologías">Tecnologías</a>
</div>

---

En la manufactura moderna, la latencia entre la detección de un defecto y la actuación mecánica es crítica. Los sistemas tradicionales de visión suelen ser costosos y rígidos. Este proyecto demuestra una arquitectura flexible y de bajo costo capaz de clasificación a alta velocidad e integración con ERPs y ecosistemas Cloud.

## 💡 La Solución Base
Un prototipo de **Smart Factory** que implementa una arquitectura Híbrida Edge-Cloud. El sistema físico clasifica productos en tiempo real usando visión artificial (Raspberry Pi/OpenCV) y control electromecánico (Arduino).

## 🚀 Digital Twin & Edge AI Upgrades
El ecosistema ha sido expandido para incluir software de grado industrial, actuando como un simulador y panel de control (HMI) avanzado:

### 1. 🌐 Web 3D / 2D Digital Twin
- **Simulación en Tiempo Real:** Dashboard web reactivo conectado por **WebSockets** al "Edge Node" (Python Backend).
- **Animación Sincronizada:** Representación visual de la cinta transportadora y el brazo robótico clasificando las cajas instantáneamente según la telemetría enviada por los sensores simulados.

### 2. 🧠 Edge AI: Predictive Maintenance
- **Machine Learning Local:** El backend Python ejecuta algoritmos de *Motor Current Signature Analysis (MCSA)*.
- **Osciloscopio IoT:** La interfaz grafica muestra en vivo los picos de corriente del motor del transportador. 
- **Detección de Anomalías:** Si se inyecta fricción deliberada en el motor, la IA detecta la anomalía en el patrón de amperaje y detiene la banda o emite una alerta temprana (Warning) *antes* de la falla catastrófica del rodamiento.

### 3. ☁️ Cloud Telemetry Mock
- **Sincronización ERP:** Los contadores de productividad (cajas rojas, verdes, azules) se agregan y se simula su envío a la nube (AWS IoT Core / Firebase) cada N ciclos para no saturar el ancho de banda.

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnologías |
|-----------|-------------|
| **Backend Simulator (Edge)** | Python 3, `websockets`, `asyncio` |
| **Digital Twin (Frontend)** | HTML5, CSS3, Vanilla JS, **Chart.js**, WebSockets |
| **Physical Prototyping** | Raspberry Pi, Arduino / C++, Motores DC/Step |
| **Protocolos** | MQTT, WebSockets, Serial, REST |

## ⚙️ Cómo ejecutar el Simulador (Digital Twin)

1. Abrir una terminal en esta carpeta.
2. Instalar dependencias: `pip install websockets`
3. Ejecutar el Nodo Edge: `python src/factory_edge.py`
4. Abrir `public/index.html` en tu navegador web.

---
> Proyecto de Investigación y Desarrollo (R&D). Elaborado por **Gustavo Matheus** - Ingeniero de Proyecto.
