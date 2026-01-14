/**
 * ═══════════════════════════════════════════════════════════════════════
 * APP.JS - Controlador Principal
 * Maneja la interacción del usuario y coordina los módulos
 * ═══════════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
    const App = {
        // Elementos del DOM
        elements: {
            form: document.getElementById('birth-form'),
            submitBtn: null,
            chartSection: document.getElementById('chart-result'),
            chartWheel: document.getElementById('chart-wheel'),
            chartName: document.getElementById('chart-name'),
            chartInfo: document.getElementById('chart-info'),
            sunSign: document.getElementById('sun-sign'),
            moonSign: document.getElementById('moon-sign'),
            risingSign: document.getElementById('rising-sign'),
            planetsContainer: document.getElementById('planets-container'),
            interpretation: document.getElementById('interpretation')
        },

        // Estado de la aplicación
        state: {
            isLoading: false
        },

        /**
         * Inicializa la aplicación
         */
        init() {
            this.elements.submitBtn = this.elements.form.querySelector('.submit-btn');
            this.bindEvents();
            this.setMaxDate();
            this.createLoadingOverlay();
            console.log('✦ Astral Chart initialized ✦');
        },

        /**
         * Vincula los eventos
         */
        bindEvents() {
            this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
        },

        /**
         * Establece la fecha máxima como hoy
         */
        setMaxDate() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('birth-date').setAttribute('max', today);
        },

        /**
         * Crea el overlay de carga
         */
        createLoadingOverlay() {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay hidden';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="283" stroke-dashoffset="75">
                                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5">
                                <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="2s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="50" cy="50" r="8" fill="currentColor">
                                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                    </div>
                    <div class="loading-text">
                        <p class="loading-title">Consultando las estrellas...</p>
                        <p class="loading-subtitle" id="loading-status">Obteniendo coordenadas geográficas</p>
                    </div>
                    <div class="loading-symbols">
                        <span>☉</span><span>☽</span><span>☿</span><span>♀</span><span>♂</span>
                        <span>♃</span><span>♄</span><span>♅</span><span>♆</span><span>♇</span>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        },

        /**
         * Muestra el overlay de carga
         */
        showLoading(message = 'Consultando las estrellas...') {
            this.state.isLoading = true;
            const overlay = document.getElementById('loading-overlay');
            const status = document.getElementById('loading-status');
            if (overlay) {
                overlay.classList.remove('hidden');
                if (status) status.textContent = message;
            }
            if (this.elements.submitBtn) {
                this.elements.submitBtn.disabled = true;
                this.elements.submitBtn.classList.add('loading');
            }
        },

        /**
         * Oculta el overlay de carga
         */
        hideLoading() {
            this.state.isLoading = false;
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }
            if (this.elements.submitBtn) {
                this.elements.submitBtn.disabled = false;
                this.elements.submitBtn.classList.remove('loading');
            }
        },

        /**
         * Actualiza el mensaje de carga
         */
        updateLoadingStatus(message) {
            const status = document.getElementById('loading-status');
            if (status) status.textContent = message;
        },

        /**
         * Maneja el envío del formulario (ASYNC)
         */
        async handleSubmit(e) {
            e.preventDefault();
            
            if (this.state.isLoading) return;
            
            // Obtener datos del formulario
            const formData = new FormData(this.elements.form);
            const name = formData.get('name');
            const birthDate = formData.get('birth-date');
            const birthTime = formData.get('birth-time');
            const birthPlace = formData.get('birth-place');

            // Validar datos
            if (!this.validateForm(name, birthDate, birthTime, birthPlace)) {
                return;
            }

            // Mostrar estado de carga
            this.showLoading('Obteniendo coordenadas geográficas...');

            try {
                // Pequeña pausa para mostrar la animación
                await this.delay(500);
                this.updateLoadingStatus('Consultando la API de geocodificación...');
                
                await this.delay(300);
                this.updateLoadingStatus('Calculando posiciones planetarias...');
                
                // Generar la carta astral ONLINE (async)
                const chartData = await Astrology.generateChartOnline(name, birthDate, birthTime, birthPlace);
                
                this.updateLoadingStatus('Preparando tu carta astral...');
                await this.delay(500);
                
                // Ocultar carga y mostrar resultados
                this.hideLoading();
                this.displayChart(chartData);
                
            } catch (error) {
                console.error('Error al generar la carta:', error);
                this.hideLoading();
                this.showError('Hubo un error al generar tu carta astral. Por favor, intenta de nuevo.');
            }
        },

        /**
         * Utilidad para crear delays
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /**
         * Valida los datos del formulario
         */
        validateForm(name, birthDate, birthTime, birthPlace) {
            if (!name || name.trim().length < 2) {
                this.showError('Por favor, ingresa un nombre válido');
                return false;
            }

            if (!birthDate) {
                this.showError('Por favor, selecciona tu fecha de nacimiento');
                return false;
            }

            if (!birthTime) {
                this.showError('Por favor, ingresa tu hora de nacimiento');
                return false;
            }

            if (!birthPlace || birthPlace.trim().length < 2) {
                this.showError('Por favor, ingresa tu lugar de nacimiento');
                return false;
            }

            return true;
        },

        /**
         * Muestra un mensaje de error
         */
        showError(message) {
            // Crear notificación de error elegante
            const notification = document.createElement('div');
            notification.className = 'error-notification';
            notification.innerHTML = `
                <span class="error-icon">⚠</span>
                <span class="error-message">${message}</span>
            `;
            document.body.appendChild(notification);
            
            // Animar entrada
            setTimeout(() => notification.classList.add('show'), 10);
            
            // Remover después de 4 segundos
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        },

        /**
         * Muestra la carta astral generada
         */
        displayChart(chartData) {
            // Mostrar la sección de resultados
            this.elements.chartSection.classList.remove('hidden');
            
            // Scroll suave hacia los resultados
            setTimeout(() => {
                this.elements.chartSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);

            // Actualizar información del encabezado
            this.elements.chartName.textContent = chartData.name;
            this.elements.chartInfo.innerHTML = this.formatChartInfo(chartData);

            // Renderizar la rueda zodiacal
            ChartRenderer.render(chartData, this.elements.chartWheel);

            // Actualizar los Tres Grandes
            this.updateBigThree(chartData);

            // Actualizar lista de planetas
            this.updatePlanetsList(chartData.planets);

            // Actualizar interpretación
            this.updateInterpretation(chartData.interpretation);
        },

        /**
         * Formatea la información de la carta
         */
        formatChartInfo(chartData) {
            const date = new Date(chartData.birthDate);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = date.toLocaleDateString('es-ES', options);
            
            let coordsInfo = '';
            if (chartData.coordinates) {
                const lat = chartData.coordinates.latitude.toFixed(4);
                const lon = chartData.coordinates.longitude.toFixed(4);
                coordsInfo = `<br><span class="coords-info">📍 Coordenadas: ${lat}°, ${lon}°</span>`;
            }
            
            return `${formattedDate} a las ${chartData.birthTime}<br>📍 ${chartData.location}${coordsInfo}`;
        },

        /**
         * Actualiza los Tres Grandes (Sol, Luna, Ascendente)
         */
        updateBigThree(chartData) {
            // Sol
            this.elements.sunSign.innerHTML = `
                <span class="sign-symbol">${chartData.sunSign.symbol}</span>
                ${chartData.sunSign.name}
            `;
            this.elements.sunSign.className = `sign-name sign-${chartData.sunSign.name.toLowerCase()}`;

            // Luna
            this.elements.moonSign.innerHTML = `
                <span class="sign-symbol">${chartData.moonSign.symbol}</span>
                ${chartData.moonSign.name}
            `;
            this.elements.moonSign.className = `sign-name sign-${chartData.moonSign.name.toLowerCase()}`;

            // Ascendente
            this.elements.risingSign.innerHTML = `
                <span class="sign-symbol">${chartData.risingSign.symbol}</span>
                ${chartData.risingSign.name}
            `;
            this.elements.risingSign.className = `sign-name sign-${chartData.risingSign.name.toLowerCase()}`;
        },

        /**
         * Actualiza la lista de planetas
         */
        updatePlanetsList(planets) {
            const container = this.elements.planetsContainer;
            container.innerHTML = '';

            planets.forEach((planetData, index) => {
                const item = document.createElement('div');
                item.className = 'planet-item';
                item.style.animationDelay = `${index * 0.1}s`;
                item.innerHTML = `
                    <span class="symbol">${planetData.planet.symbol}</span>
                    <div class="info">
                        <span class="name">${planetData.planet.name}</span>
                        <span class="position">${planetData.sign.symbol} ${planetData.sign.name} ${planetData.formattedDegree}</span>
                    </div>
                `;
                container.appendChild(item);
            });
        },

        /**
         * Actualiza la sección de interpretación
         */
        updateInterpretation(interpretation) {
            const container = this.elements.interpretation;
            container.innerHTML = '';

            // Sol
            const sunCard = this.createInterpretationCard(
                interpretation.sun.title,
                interpretation.sun.symbol,
                interpretation.sun.text,
                'sun'
            );
            container.appendChild(sunCard);

            // Luna
            const moonCard = this.createInterpretationCard(
                interpretation.moon.title,
                interpretation.moon.symbol,
                interpretation.moon.text,
                'moon'
            );
            container.appendChild(moonCard);

            // Ascendente
            const risingCard = this.createInterpretationCard(
                interpretation.rising.title,
                interpretation.rising.symbol,
                interpretation.rising.text,
                'rising'
            );
            container.appendChild(risingCard);
        },

        /**
         * Crea una tarjeta de interpretación
         */
        createInterpretationCard(title, symbol, text, type) {
            const card = document.createElement('div');
            card.className = `interpretation-card interpretation-${type}`;
            card.innerHTML = `
                <h4>
                    <span class="card-symbol">${symbol}</span>
                    ${title}
                </h4>
                <p>${text}</p>
            `;
            return card;
        }
    };

    // Iniciar la aplicación
    App.init();
});

// ═══════════════════════════════════════════════════════════════════════
// ANIMACIONES ADICIONALES
// ═══════════════════════════════════════════════════════════════════════

// Efecto parallax sutil en el hero
document.addEventListener('mousemove', (e) => {
    const symbols = document.querySelectorAll('.floating-symbols .symbol');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    symbols.forEach((symbol, index) => {
        const speed = (index + 1) * 0.5;
        const offsetX = (x - 0.5) * speed * 30;
        const offsetY = (y - 0.5) * speed * 30;
        symbol.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
});

// Añadir efecto de aparición a las tarjetas cuando entran en viewport
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar tarjetas de about
document.querySelectorAll('.about-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});
