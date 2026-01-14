/**
 * ═══════════════════════════════════════════════════════════════════════
 * CHART.JS - Visualización de la Carta Astral
 * Dibuja la rueda zodiacal y las posiciones planetarias
 * ═══════════════════════════════════════════════════════════════════════
 */

const ChartRenderer = {
    // Configuración del gráfico
    config: {
        width: 600,
        height: 600,
        centerX: 300,
        centerY: 300,
        outerRadius: 280,
        innerRadius: 200,
        planetRadius: 160,
        houseRadius: 120,
        colors: {
            background: 'transparent',
            zodiacRing: 'rgba(212, 175, 55, 0.15)',
            zodiacBorder: 'rgba(212, 175, 55, 0.4)',
            houseBorder: 'rgba(212, 175, 55, 0.2)',
            planetOrbit: 'rgba(200, 197, 217, 0.1)',
            text: '#e8e6f0',
            gold: '#d4af37',
            fire: '#ff6b35',
            earth: '#8bc34a',
            air: '#ffc107',
            water: '#00bcd4'
        }
    },

    /**
     * Renderiza la carta astral completa
     */
    render(chartData, svgElement) {
        const svg = svgElement;
        svg.innerHTML = '';
        
        // Crear definiciones (gradientes, etc.)
        this.createDefs(svg);
        
        // Dibujar capas
        this.drawBackground(svg);
        this.drawZodiacWheel(svg);
        this.drawHouses(svg, chartData);
        this.drawPlanetOrbit(svg);
        this.drawPlanets(svg, chartData.planets);
        this.drawAscendantMarker(svg, chartData.ascendantDegree);
    },

    /**
     * Crea las definiciones SVG (gradientes, filtros)
     */
    createDefs(svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Gradiente radial para el fondo
        const bgGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        bgGradient.setAttribute('id', 'bgGradient');
        bgGradient.innerHTML = `
            <stop offset="0%" stop-color="rgba(26, 26, 46, 0.3)"/>
            <stop offset="100%" stop-color="rgba(10, 10, 18, 0.8)"/>
        `;
        defs.appendChild(bgGradient);

        // Gradiente para el anillo zodiacal
        const zodiacGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        zodiacGradient.setAttribute('id', 'zodiacGradient');
        zodiacGradient.innerHTML = `
            <stop offset="0%" stop-color="rgba(212, 175, 55, 0.2)"/>
            <stop offset="50%" stop-color="rgba(212, 175, 55, 0.1)"/>
            <stop offset="100%" stop-color="rgba(212, 175, 55, 0.2)"/>
        `;
        defs.appendChild(zodiacGradient);

        // Filtro de brillo
        const glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        glowFilter.setAttribute('id', 'glow');
        glowFilter.innerHTML = `
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        `;
        defs.appendChild(glowFilter);

        svg.appendChild(defs);
    },

    /**
     * Dibuja el fondo
     */
    drawBackground(svg) {
        const { centerX, centerY, outerRadius } = this.config;
        
        // Círculo de fondo
        const bg = this.createCircle(centerX, centerY, outerRadius, 'url(#bgGradient)', 'none');
        svg.appendChild(bg);
    },

    /**
     * Dibuja la rueda zodiacal con los 12 signos
     */
    drawZodiacWheel(svg) {
        const { centerX, centerY, outerRadius, innerRadius, colors } = this.config;
        const signs = Astrology.zodiacSigns;

        // Anillo exterior
        const outerRing = this.createCircle(centerX, centerY, outerRadius, 'none', colors.zodiacBorder, 2);
        svg.appendChild(outerRing);

        // Anillo interior del zodiaco
        const innerRing = this.createCircle(centerX, centerY, innerRadius, 'none', colors.zodiacBorder, 1);
        svg.appendChild(innerRing);

        // Dibujar cada signo
        signs.forEach((sign, index) => {
            const startAngle = index * 30 - 90; // Comenzar desde arriba (Aries a las 9 en punto tradicionalmente, pero aquí empezamos arriba)
            const endAngle = startAngle + 30;
            
            // Dibujar sector
            const sector = this.createSector(
                centerX, centerY,
                innerRadius, outerRadius,
                startAngle, endAngle,
                this.getElementColor(sign.element)
            );
            svg.appendChild(sector);

            // Línea divisoria
            const lineEnd = this.polarToCartesian(centerX, centerY, outerRadius, endAngle);
            const lineStart = this.polarToCartesian(centerX, centerY, innerRadius, endAngle);
            const line = this.createLine(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y, colors.zodiacBorder, 1);
            svg.appendChild(line);

            // Símbolo del signo
            const midAngle = startAngle + 15;
            const symbolRadius = (outerRadius + innerRadius) / 2;
            const symbolPos = this.polarToCartesian(centerX, centerY, symbolRadius, midAngle);
            
            const symbolText = this.createText(
                symbolPos.x, symbolPos.y,
                sign.symbol,
                colors.gold,
                '1.2rem',
                'middle'
            );
            symbolText.setAttribute('filter', 'url(#glow)');
            svg.appendChild(symbolText);

            // Nombre del signo (más pequeño, en el borde)
            const nameRadius = outerRadius - 15;
            const namePos = this.polarToCartesian(centerX, centerY, nameRadius, midAngle);
            const nameText = this.createText(
                namePos.x, namePos.y,
                sign.name,
                colors.text,
                '0.5rem',
                'middle'
            );
            nameText.setAttribute('opacity', '0.6');
            // Rotar el texto para que siga la curva
            nameText.setAttribute('transform', `rotate(${midAngle + 90}, ${namePos.x}, ${namePos.y})`);
            svg.appendChild(nameText);
        });
    },

    /**
     * Dibuja las 12 casas
     */
    drawHouses(svg, chartData) {
        const { centerX, centerY, innerRadius, houseRadius, colors } = this.config;
        
        // Círculo de las casas
        const houseRing = this.createCircle(centerX, centerY, houseRadius, 'none', colors.houseBorder, 1);
        houseRing.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(houseRing);

        // Determinar el ángulo inicial basado en el ascendente
        const ascendantIndex = Astrology.zodiacSigns.findIndex(
            s => s.name === chartData.risingSign.name
        );
        const ascendantOffset = ascendantIndex * 30;

        // Dibujar las casas
        for (let i = 0; i < 12; i++) {
            const angle = i * 30 - 90 - ascendantOffset;
            
            // Línea de la casa
            const lineEnd = this.polarToCartesian(centerX, centerY, innerRadius - 5, angle);
            const lineStart = this.polarToCartesian(centerX, centerY, houseRadius, angle);
            const line = this.createLine(
                lineStart.x, lineStart.y,
                lineEnd.x, lineEnd.y,
                colors.houseBorder,
                i === 0 || i === 3 || i === 6 || i === 9 ? 2 : 1
            );
            if (i === 0 || i === 3 || i === 6 || i === 9) {
                line.setAttribute('stroke', colors.gold);
                line.setAttribute('opacity', '0.5');
            }
            svg.appendChild(line);

            // Número de casa
            const numAngle = angle + 15;
            const numRadius = houseRadius - 20;
            const numPos = this.polarToCartesian(centerX, centerY, numRadius, numAngle);
            const numText = this.createText(
                numPos.x, numPos.y,
                this.toRoman(i + 1),
                colors.text,
                '0.6rem',
                'middle'
            );
            numText.setAttribute('opacity', '0.4');
            svg.appendChild(numText);
        }
    },

    /**
     * Dibuja la órbita donde se colocarán los planetas
     */
    drawPlanetOrbit(svg) {
        const { centerX, centerY, planetRadius, colors } = this.config;
        
        const orbit = this.createCircle(centerX, centerY, planetRadius, 'none', colors.planetOrbit, 1);
        orbit.setAttribute('stroke-dasharray', '3,3');
        svg.appendChild(orbit);
    },

    /**
     * Dibuja los planetas en sus posiciones
     */
    drawPlanets(svg, planets) {
        const { centerX, centerY, planetRadius, colors } = this.config;
        
        // Agrupar planetas que están muy cerca
        const positions = this.adjustPlanetPositions(planets);
        
        positions.forEach((planetData, index) => {
            const angle = planetData.position - 90; // Ajustar para que 0° esté arriba
            const pos = this.polarToCartesian(centerX, centerY, planetRadius + planetData.offset, angle);
            
            // Grupo para el planeta
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'planet-marker');
            
            // Círculo de fondo
            const bgCircle = this.createCircle(pos.x, pos.y, 15, 'rgba(10, 10, 18, 0.8)', colors.gold, 1);
            group.appendChild(bgCircle);
            
            // Símbolo del planeta
            const symbol = this.createText(
                pos.x, pos.y + 1,
                planetData.planet.symbol,
                colors.gold,
                '0.9rem',
                'middle'
            );
            symbol.setAttribute('filter', 'url(#glow)');
            group.appendChild(symbol);
            
            // Línea conectora al anillo zodiacal
            const innerPos = this.polarToCartesian(centerX, centerY, this.config.innerRadius - 5, angle);
            const line = this.createLine(
                innerPos.x, innerPos.y,
                pos.x, pos.y,
                colors.gold,
                0.5
            );
            line.setAttribute('opacity', '0.3');
            svg.appendChild(line);
            
            // Añadir tooltip con información
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${planetData.planet.name} en ${planetData.sign.name} ${planetData.formattedDegree}`;
            group.appendChild(title);
            
            svg.appendChild(group);
        });
    },

    /**
     * Ajusta las posiciones de los planetas para evitar superposiciones
     */
    adjustPlanetPositions(planets) {
        const positions = planets.map(p => ({
            ...p,
            offset: 0
        }));
        
        // Ordenar por posición
        positions.sort((a, b) => a.position - b.position);
        
        // Ajustar planetas que están muy cerca
        for (let i = 1; i < positions.length; i++) {
            const prev = positions[i - 1];
            const curr = positions[i];
            const diff = Math.abs(curr.position - prev.position);
            
            if (diff < 10) {
                // Alternar hacia adentro y afuera
                curr.offset = (i % 2 === 0) ? -25 : 25;
            }
        }
        
        return positions;
    },

    /**
     * Dibuja el marcador del ascendente
     */
    drawAscendantMarker(svg, ascendant) {
        const { centerX, centerY, outerRadius, colors } = this.config;
        
        // El ascendente siempre está en el punto este (lado izquierdo de la carta tradicional)
        const ascIndex = Astrology.zodiacSigns.findIndex(s => s.name === ascendant.sign.name);
        const angle = -90; // Punto del ascendente (izquierda en carta tradicional = arriba aquí)
        
        // Flecha del ascendente
        const arrowStart = this.polarToCartesian(centerX, centerY, outerRadius + 10, angle);
        const arrowEnd = this.polarToCartesian(centerX, centerY, outerRadius - 5, angle);
        
        const arrow = this.createLine(arrowStart.x, arrowStart.y, arrowEnd.x, arrowEnd.y, colors.gold, 3);
        arrow.setAttribute('filter', 'url(#glow)');
        svg.appendChild(arrow);
        
        // Etiqueta ASC
        const labelPos = this.polarToCartesian(centerX, centerY, outerRadius + 25, angle);
        const label = this.createText(labelPos.x, labelPos.y, 'ASC', colors.gold, '0.7rem', 'middle');
        label.setAttribute('font-weight', 'bold');
        svg.appendChild(label);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UTILIDADES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Convierte coordenadas polares a cartesianas
     */
    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees) * Math.PI / 180;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    },

    /**
     * Crea un elemento círculo SVG
     */
    createCircle(cx, cy, r, fill, stroke, strokeWidth = 1) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', fill);
        circle.setAttribute('stroke', stroke);
        circle.setAttribute('stroke-width', strokeWidth);
        return circle;
    },

    /**
     * Crea un elemento línea SVG
     */
    createLine(x1, y1, x2, y2, stroke, strokeWidth = 1) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', stroke);
        line.setAttribute('stroke-width', strokeWidth);
        return line;
    },

    /**
     * Crea un elemento texto SVG
     */
    createText(x, y, content, fill, fontSize, textAnchor = 'start') {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('fill', fill);
        text.setAttribute('font-size', fontSize);
        text.setAttribute('text-anchor', textAnchor);
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('font-family', "'Cinzel', serif");
        text.textContent = content;
        return text;
    },

    /**
     * Crea un sector (porción de anillo) SVG
     */
    createSector(cx, cy, innerRadius, outerRadius, startAngle, endAngle, fillColor) {
        const start1 = this.polarToCartesian(cx, cy, outerRadius, startAngle);
        const end1 = this.polarToCartesian(cx, cy, outerRadius, endAngle);
        const start2 = this.polarToCartesian(cx, cy, innerRadius, endAngle);
        const end2 = this.polarToCartesian(cx, cy, innerRadius, startAngle);
        
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
        
        const d = [
            'M', start1.x, start1.y,
            'A', outerRadius, outerRadius, 0, largeArcFlag, 1, end1.x, end1.y,
            'L', start2.x, start2.y,
            'A', innerRadius, innerRadius, 0, largeArcFlag, 0, end2.x, end2.y,
            'Z'
        ].join(' ');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', fillColor);
        path.setAttribute('stroke', 'none');
        
        return path;
    },

    /**
     * Obtiene el color basado en el elemento
     */
    getElementColor(element) {
        const colors = {
            fire: 'rgba(255, 107, 53, 0.1)',
            earth: 'rgba(139, 195, 74, 0.1)',
            air: 'rgba(255, 193, 7, 0.1)',
            water: 'rgba(0, 188, 212, 0.1)'
        };
        return colors[element] || 'rgba(212, 175, 55, 0.1)';
    },

    /**
     * Convierte número a numeral romano
     */
    toRoman(num) {
        const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        return roman[num - 1] || num.toString();
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartRenderer;
}
