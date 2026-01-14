/**
 * ═══════════════════════════════════════════════════════════════════════
 * ASTROLOGY.JS - Cálculos Astrológicos Online
 * Motor de cálculos para cartas natales con geocodificación API
 * ═══════════════════════════════════════════════════════════════════════
 */

const Astrology = {
    // Símbolos de los signos zodiacales
    zodiacSigns: [
        { name: 'Aries', symbol: '♈', element: 'fire', quality: 'cardinal', ruler: 'Marte' },
        { name: 'Tauro', symbol: '♉', element: 'earth', quality: 'fixed', ruler: 'Venus' },
        { name: 'Géminis', symbol: '♊', element: 'air', quality: 'mutable', ruler: 'Mercurio' },
        { name: 'Cáncer', symbol: '♋', element: 'water', quality: 'cardinal', ruler: 'Luna' },
        { name: 'Leo', symbol: '♌', element: 'fire', quality: 'fixed', ruler: 'Sol' },
        { name: 'Virgo', symbol: '♍', element: 'earth', quality: 'mutable', ruler: 'Mercurio' },
        { name: 'Libra', symbol: '♎', element: 'air', quality: 'cardinal', ruler: 'Venus' },
        { name: 'Escorpio', symbol: '♏', element: 'water', quality: 'fixed', ruler: 'Plutón' },
        { name: 'Sagitario', symbol: '♐', element: 'fire', quality: 'mutable', ruler: 'Júpiter' },
        { name: 'Capricornio', symbol: '♑', element: 'earth', quality: 'cardinal', ruler: 'Saturno' },
        { name: 'Acuario', symbol: '♒', element: 'air', quality: 'fixed', ruler: 'Urano' },
        { name: 'Piscis', symbol: '♓', element: 'water', quality: 'mutable', ruler: 'Neptuno' }
    ],

    // Planetas y sus parámetros orbitales (VSOP87 simplificado)
    planets: [
        { name: 'Sol', symbol: '☉', orbit: 365.25, L0: 280.46646, L1: 36000.76983, e0: 0.016708634, e1: -0.000042037 },
        { name: 'Luna', symbol: '☽', orbit: 27.32, L0: 218.3165, L1: 481267.8813 },
        { name: 'Mercurio', symbol: '☿', orbit: 87.97, L0: 252.2509, L1: 149472.6746, a: 0.387098 },
        { name: 'Venus', symbol: '♀', orbit: 224.7, L0: 181.9798, L1: 58517.8157, a: 0.723330 },
        { name: 'Marte', symbol: '♂', orbit: 686.98, L0: 355.4330, L1: 19140.2993, a: 1.523679 },
        { name: 'Júpiter', symbol: '♃', orbit: 4332.59, L0: 34.3515, L1: 3034.9057, a: 5.202603 },
        { name: 'Saturno', symbol: '♄', orbit: 10759.22, L0: 50.0774, L1: 1222.1138, a: 9.554909 },
        { name: 'Urano', symbol: '♅', orbit: 30688.5, L0: 314.0550, L1: 428.4669, a: 19.21845 },
        { name: 'Neptuno', symbol: '♆', orbit: 60182, L0: 304.3487, L1: 218.4602, a: 30.11039 },
        { name: 'Plutón', symbol: '♇', orbit: 90560, L0: 238.9286, L1: 145.2078, a: 39.48168 }
    ],

    // Casas astrológicas
    houses: [
        { number: 1, name: 'Casa I', meaning: 'Yo, personalidad, apariencia' },
        { number: 2, name: 'Casa II', meaning: 'Recursos, valores, posesiones' },
        { number: 3, name: 'Casa III', meaning: 'Comunicación, hermanos, viajes cortos' },
        { number: 4, name: 'Casa IV', meaning: 'Hogar, familia, raíces' },
        { number: 5, name: 'Casa V', meaning: 'Creatividad, romance, hijos' },
        { number: 6, name: 'Casa VI', meaning: 'Salud, trabajo, servicio' },
        { number: 7, name: 'Casa VII', meaning: 'Relaciones, matrimonio, socios' },
        { number: 8, name: 'Casa VIII', meaning: 'Transformación, sexualidad, herencias' },
        { number: 9, name: 'Casa IX', meaning: 'Filosofía, viajes largos, educación superior' },
        { number: 10, name: 'Casa X', meaning: 'Carrera, reputación, estatus' },
        { number: 11, name: 'Casa XI', meaning: 'Amistades, grupos, aspiraciones' },
        { number: 12, name: 'Casa XII', meaning: 'Subconsciente, secretos, karma' }
    ],

    // Interpretaciones de los signos solares
    sunSignInterpretations: {
        'Aries': 'Eres una persona con espíritu pionero, valiente y llena de energía. Tu naturaleza es impulsiva y competitiva, siempre listo para iniciar nuevos proyectos. Posees un liderazgo natural y una determinación inquebrantable.',
        'Tauro': 'Tu esencia es estable, práctica y sensual. Valoras la seguridad y los placeres de la vida. Eres persistente en tus objetivos y tienes una conexión profunda con el mundo material y la naturaleza.',
        'Géminis': 'Posees una mente ágil, curiosa y versátil. Te adaptas fácilmente a diferentes situaciones y personas. La comunicación es tu fuerte, y tienes una sed insaciable de conocimiento.',
        'Cáncer': 'Tu núcleo emocional es profundo y sensible. Eres protector con los que amas y tienes una fuerte conexión con el hogar y la familia. Tu intuición es poderosa y guía tus decisiones.',
        'Leo': 'Irradias carisma, creatividad y generosidad. Tienes un corazón noble y una necesidad de expresarte. El reconocimiento es importante para ti, y tienes una capacidad natural para inspirar a otros.',
        'Virgo': 'Eres analítico, práctico y orientado al detalle. Tu mente busca la perfección y la eficiencia. Tienes un profundo deseo de servir y mejorar todo lo que te rodea.',
        'Libra': 'Buscas el equilibrio, la armonía y la belleza en todo. Las relaciones son fundamentales para tu bienestar. Tienes un sentido innato de la justicia y la diplomacia.',
        'Escorpio': 'Tu naturaleza es intensa, apasionada y transformadora. Buscas la verdad más profunda y no temes enfrentar las sombras. Tienes una capacidad única de regeneración.',
        'Sagitario': 'Eres optimista, aventurero y filosófico. Buscas expandir tus horizontes a través de viajes, estudios y experiencias. La libertad es esencial para tu espíritu.',
        'Capricornio': 'Tu esencia es ambiciosa, disciplinada y responsable. Tienes una visión a largo plazo y la determinación para alcanzar tus metas. El éxito profesional es importante para ti.',
        'Acuario': 'Eres innovador, humanitario y original. Tu mente está orientada al futuro y buscas contribuir al bien colectivo. La independencia intelectual te define.',
        'Piscis': 'Tu naturaleza es compasiva, intuitiva y artística. Tienes una conexión profunda con el mundo espiritual y emocional. Tu imaginación no tiene límites.'
    },

    // Interpretaciones de la Luna
    moonSignInterpretations: {
        'Aries': 'Tus emociones son intensas y directas. Necesitas acción y movimiento para sentirte equilibrado. Reaccionas rápidamente y con pasión ante las situaciones.',
        'Tauro': 'Buscas seguridad emocional y estabilidad. Te reconfortan los placeres simples y la rutina. Eres leal y constante en tus afectos.',
        'Géminis': 'Procesas tus emociones a través del pensamiento y la comunicación. Tu estado de ánimo puede ser variable y necesitas estimulación mental constante.',
        'Cáncer': 'Tu sensibilidad emocional es profunda y te conectas intuitivamente con los demás. El hogar y la familia son tu refugio emocional.',
        'Leo': 'Necesitas reconocimiento y expresión creativa para sentirte emocionalmente satisfecho. Eres generoso con tu afecto y dramático en tus sentimientos.',
        'Virgo': 'Analizas tus emociones buscando entenderlas. Te sientes útil cuando ayudas a otros. La crítica puede afectarte profundamente.',
        'Libra': 'Buscas armonía en tus relaciones y te afectan los conflictos. Necesitas compañía y equilibrio emocional para sentirte en paz.',
        'Escorpio': 'Tus emociones son profundas, intensas y transformadoras. Sientes con gran pasión y buscas conexiones emocionales auténticas.',
        'Sagitario': 'Necesitas libertad emocional y aventura. El optimismo caracteriza tu mundo interno. Buscas el significado detrás de tus sentimientos.',
        'Capricornio': 'Controlas tus emociones y puede costarte expresarlas. Buscas seguridad y logros para sentirte emocionalmente estable.',
        'Acuario': 'Te aproximas a las emociones de manera racional. Valoras la independencia emocional y las amistades que respeten tu espacio.',
        'Piscis': 'Eres extremadamente empático y sensible. Tu mundo emocional es vasto y a veces te cuesta establecer límites.'
    },

    // Interpretaciones del Ascendente
    risingSignInterpretations: {
        'Aries': 'Te presentas al mundo como alguien dinámico, directo y asertivo. Tu primera impresión es de energía y determinación.',
        'Tauro': 'Proyectas estabilidad, calma y sensualidad. Los demás te perciben como alguien confiable y práctico.',
        'Géminis': 'Tu imagen es la de alguien comunicativo, curioso y adaptable. Pareces siempre interesante y versátil.',
        'Cáncer': 'Proyectas una imagen protectora y empática. Los demás sienten tu naturaleza cuidadora desde el primer momento.',
        'Leo': 'Te presentas con carisma, confianza y presencia. Tu aura natural atrae la atención y el respeto.',
        'Virgo': 'Proyectas modestia, competencia y atención al detalle. Pareces organizado y servicial.',
        'Libra': 'Tu imagen es elegante, diplomática y encantadora. Buscas la armonía en todas tus interacciones.',
        'Escorpio': 'Proyectas misterio, intensidad y magnetismo. Tu presencia es poderosa y no pasa desapercibida.',
        'Sagitario': 'Te presentas como optimista, aventurero y filosófico. Tu entusiasmo es contagioso.',
        'Capricornio': 'Proyectas seriedad, ambición y madurez. Los demás te ven como alguien responsable y capaz.',
        'Acuario': 'Tu imagen es única, original e independiente. Pareces alguien que marcha a su propio ritmo.',
        'Piscis': 'Proyectas sensibilidad, empatía y misterio. Tu aura etérea atrae a quienes buscan profundidad.'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // API DE GEOCODIFICACIÓN ONLINE
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Obtiene las coordenadas geográficas de una ubicación usando la API de Nominatim
     * @param {string} location - Nombre de la ciudad/lugar
     * @returns {Promise<{lat: number, lon: number, displayName: string}>}
     */
    async geocodeLocation(location) {
        const encodedLocation = encodeURIComponent(location);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1&accept-language=es`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'AstralChart/1.0 (Educational Astrology App)'
                }
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    displayName: data[0].display_name
                };
            }
            
            // Si no se encuentra, usar coordenadas por defecto
            console.warn(`Ubicación "${location}" no encontrada, usando coordenadas por defecto`);
            return {
                lat: 40.4168,
                lon: -3.7038,
                displayName: location
            };
            
        } catch (error) {
            console.error('Error al geocodificar:', error);
            // Fallback a coordenadas por defecto
            return {
                lat: 40.4168,
                lon: -3.7038,
                displayName: location
            };
        }
    },

    /**
     * Obtiene la zona horaria aproximada basada en la longitud
     * @param {number} longitude - Longitud en grados
     * @returns {number} - Offset en horas desde UTC
     */
    getTimezoneOffset(longitude) {
        // Aproximación simple: cada 15° de longitud = 1 hora
        return Math.round(longitude / 15);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CÁLCULOS ASTRONÓMICOS MEJORADOS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calcula el Día Juliano
     */
    calculateJulianDay(date, hours = 12) {
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        const d = date.getDate() + hours / 24;
        
        if (m <= 2) {
            y -= 1;
            m += 12;
        }
        
        const A = Math.floor(y / 100);
        const B = 2 - A + Math.floor(A / 4);
        
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
    },

    /**
     * Calcula los siglos Julianos desde J2000.0
     */
    julianCenturies(jd) {
        return (jd - 2451545.0) / 36525.0;
    },

    /**
     * Normaliza un ángulo a 0-360 grados
     */
    normalizeAngle(angle) {
        let result = angle % 360;
        if (result < 0) result += 360;
        return result;
    },

    /**
     * Convierte grados a radianes
     */
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },

    /**
     * Convierte radianes a grados
     */
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    /**
     * Calcula la posición del Sol con mayor precisión (VSOP87 simplificado)
     */
    calculateSunPosition(jd) {
        const T = this.julianCenturies(jd);
        
        // Longitud media del Sol
        let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
        L0 = this.normalizeAngle(L0);
        
        // Anomalía media del Sol
        let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
        M = this.normalizeAngle(M);
        const Mrad = this.toRadians(M);
        
        // Ecuación del centro
        const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
                + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
                + 0.000289 * Math.sin(3 * Mrad);
        
        // Longitud verdadera del Sol
        let sunLong = L0 + C;
        sunLong = this.normalizeAngle(sunLong);
        
        return sunLong;
    },

    /**
     * Calcula la posición de la Luna con mayor precisión
     */
    calculateMoonPositionPrecise(jd) {
        const T = this.julianCenturies(jd);
        
        // Longitud media de la Luna
        let Lp = 218.3164477 + 481267.88123421 * T 
                - 0.0015786 * T * T 
                + T * T * T / 538841 
                - T * T * T * T / 65194000;
        
        // Elongación media de la Luna
        let D = 297.8501921 + 445267.1114034 * T 
               - 0.0018819 * T * T 
               + T * T * T / 545868 
               - T * T * T * T / 113065000;
        
        // Anomalía media del Sol
        let M = 357.5291092 + 35999.0502909 * T 
               - 0.0001536 * T * T 
               + T * T * T / 24490000;
        
        // Anomalía media de la Luna
        let Mp = 134.9633964 + 477198.8675055 * T 
                + 0.0087414 * T * T 
                + T * T * T / 69699 
                - T * T * T * T / 14712000;
        
        // Argumento de latitud de la Luna
        let F = 93.2720950 + 483202.0175233 * T 
               - 0.0036539 * T * T 
               - T * T * T / 3526000 
               + T * T * T * T / 863310000;
        
        // Normalizar
        Lp = this.normalizeAngle(Lp);
        D = this.normalizeAngle(D);
        M = this.normalizeAngle(M);
        Mp = this.normalizeAngle(Mp);
        F = this.normalizeAngle(F);
        
        // Convertir a radianes
        const Drad = this.toRadians(D);
        const Mrad = this.toRadians(M);
        const Mprad = this.toRadians(Mp);
        const Frad = this.toRadians(F);
        
        // Términos principales de la serie
        let sumL = 0;
        
        // Términos más significativos
        sumL += 6288774 * Math.sin(Mprad);
        sumL += 1274027 * Math.sin(2 * Drad - Mprad);
        sumL += 658314 * Math.sin(2 * Drad);
        sumL += 213618 * Math.sin(2 * Mprad);
        sumL += -185116 * Math.sin(Mrad);
        sumL += -114332 * Math.sin(2 * Frad);
        sumL += 58793 * Math.sin(2 * Drad - 2 * Mprad);
        sumL += 57066 * Math.sin(2 * Drad - Mrad - Mprad);
        sumL += 53322 * Math.sin(2 * Drad + Mprad);
        sumL += 45758 * Math.sin(2 * Drad - Mrad);
        sumL += -40923 * Math.sin(Mrad - Mprad);
        sumL += -34720 * Math.sin(Drad);
        sumL += -30383 * Math.sin(Mrad + Mprad);
        sumL += 15327 * Math.sin(2 * Drad - 2 * Frad);
        sumL += -12528 * Math.sin(Mprad + 2 * Frad);
        sumL += 10980 * Math.sin(Mprad - 2 * Frad);
        
        // Longitud eclíptica de la Luna
        let longitude = Lp + sumL / 1000000;
        longitude = this.normalizeAngle(longitude);
        
        return longitude;
    },

    /**
     * Calcula la posición de un planeta (aproximación VSOP87 simplificada)
     */
    calculatePlanetPositionPrecise(jd, planet) {
        const T = this.julianCenturies(jd);
        
        // Longitud media heliocéntrica
        let L = planet.L0 + planet.L1 * T;
        L = this.normalizeAngle(L);
        
        // Conversión aproximada a longitud geocéntrica
        // (simplificación - en realidad requiere transformación completa)
        const sunLong = this.calculateSunPosition(jd);
        
        // Para planetas interiores
        if (planet.name === 'Mercurio' || planet.name === 'Venus') {
            // Usar elongación máxima aproximada
            const elongation = (planet.a < 1) ? Math.asin(planet.a) * 180 / Math.PI : 0;
            L = this.normalizeAngle(sunLong + (L - sunLong) * 0.5);
        }
        
        return L;
    },

    /**
     * Calcula el Tiempo Sidéreo Local
     */
    calculateLST(jd, longitude) {
        const T = this.julianCenturies(jd);
        
        // Tiempo sidéreo medio en Greenwich a 0h UT
        let GMST = 280.46061837 
                  + 360.98564736629 * (jd - 2451545.0)
                  + 0.000387933 * T * T 
                  - T * T * T / 38710000;
        
        GMST = this.normalizeAngle(GMST);
        
        // Tiempo sidéreo local
        let LST = GMST + longitude;
        LST = this.normalizeAngle(LST);
        
        return LST;
    },

    /**
     * Calcula el Ascendente con precisión
     */
    calculateAscendantPrecise(jd, latitude, longitude) {
        const LST = this.calculateLST(jd, longitude);
        const LSTrad = this.toRadians(LST);
        const latRad = this.toRadians(latitude);
        
        // Oblicuidad de la eclíptica
        const T = this.julianCenturies(jd);
        let epsilon = 23.439291 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T;
        const epsRad = this.toRadians(epsilon);
        
        // Calcular el ascendente
        const y = -Math.cos(LSTrad);
        const x = Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(LSTrad);
        
        let asc = this.toDegrees(Math.atan2(y, x));
        asc = this.normalizeAngle(asc);
        
        return asc;
    },

    /**
     * Calcula el signo solar basado en la fecha de nacimiento
     */
    calculateSunSign(birthDate) {
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        
        const signDates = [
            { sign: 0, startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
            { sign: 1, startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
            { sign: 2, startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
            { sign: 3, startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
            { sign: 4, startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
            { sign: 5, startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
            { sign: 6, startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
            { sign: 7, startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
            { sign: 8, startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
            { sign: 9, startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
            { sign: 10, startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
            { sign: 11, startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 }
        ];

        for (const range of signDates) {
            if (range.startMonth <= range.endMonth) {
                if ((month === range.startMonth && day >= range.startDay) ||
                    (month === range.endMonth && day <= range.endDay) ||
                    (month > range.startMonth && month < range.endMonth)) {
                    return this.zodiacSigns[range.sign];
                }
            } else {
                if ((month === range.startMonth && day >= range.startDay) ||
                    (month === range.endMonth && day <= range.endDay)) {
                    return this.zodiacSigns[range.sign];
                }
            }
        }
        
        return this.zodiacSigns[9];
    },

    /**
     * Convierte grados a signo zodiacal y grado dentro del signo
     */
    degreesToSign(degrees) {
        degrees = this.normalizeAngle(degrees);
        const signIndex = Math.floor(degrees / 30) % 12;
        const degreeInSign = degrees % 30;
        const minutes = Math.floor((degreeInSign % 1) * 60);
        return {
            sign: this.zodiacSigns[signIndex],
            degree: degreeInSign,
            formattedDegree: `${Math.floor(degreeInSign)}° ${minutes}'`
        };
    },

    /**
     * Calcula las 12 casas usando el sistema de casas iguales
     */
    calculateHouses(ascendantSign) {
        const startIndex = this.zodiacSigns.findIndex(s => s.name === ascendantSign.name);
        return this.houses.map((house, i) => ({
            ...house,
            sign: this.zodiacSigns[(startIndex + i) % 12]
        }));
    },

    /**
     * Genera la interpretación personalizada
     */
    generateInterpretation(sunSign, moonSign, risingSign) {
        return {
            sun: {
                title: `Sol en ${sunSign.name}`,
                symbol: sunSign.symbol,
                text: this.sunSignInterpretations[sunSign.name]
            },
            moon: {
                title: `Luna en ${moonSign.name}`,
                symbol: moonSign.symbol,
                text: this.moonSignInterpretations[moonSign.name]
            },
            rising: {
                title: `Ascendente en ${risingSign.name}`,
                symbol: risingSign.symbol,
                text: this.risingSignInterpretations[risingSign.name]
            }
        };
    },

    // ═══════════════════════════════════════════════════════════════════════
    // GENERACIÓN DE CARTA ASTRAL (ASYNC - ONLINE)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Genera la carta natal completa (versión asíncrona con API online)
     * @param {string} name - Nombre de la persona
     * @param {string} birthDate - Fecha de nacimiento (YYYY-MM-DD)
     * @param {string} birthTime - Hora de nacimiento (HH:MM)
     * @param {string} location - Lugar de nacimiento
     * @returns {Promise<Object>} - Datos de la carta astral
     */
    async generateChartOnline(name, birthDate, birthTime, location) {
        console.log('🌟 Consultando coordenadas online...');
        
        // Obtener coordenadas geográficas online
        const geoData = await this.geocodeLocation(location);
        console.log(`📍 Coordenadas obtenidas: ${geoData.lat.toFixed(4)}°, ${geoData.lon.toFixed(4)}°`);
        
        const date = new Date(birthDate);
        const [hours, minutes] = birthTime.split(':').map(Number);
        const decimalHours = hours + minutes / 60;
        
        // Calcular el Día Juliano
        const jd = this.calculateJulianDay(date, decimalHours);
        console.log(`📅 Día Juliano: ${jd.toFixed(4)}`);
        
        // Calcular posiciones planetarias con mayor precisión
        const planetPositions = this.planets.map(planet => {
            let position;
            
            if (planet.name === 'Sol') {
                position = this.calculateSunPosition(jd);
            } else if (planet.name === 'Luna') {
                position = this.calculateMoonPositionPrecise(jd);
            } else {
                position = this.calculatePlanetPositionPrecise(jd, planet);
            }
            
            const signData = this.degreesToSign(position);
            
            return {
                planet: planet,
                position: position,
                sign: signData.sign,
                degree: signData.degree,
                formattedDegree: signData.formattedDegree
            };
        });

        // Calcular el Ascendente con las coordenadas reales
        const ascendantDegrees = this.calculateAscendantPrecise(jd, geoData.lat, geoData.lon);
        const ascendant = this.degreesToSign(ascendantDegrees);
        console.log(`⬆️ Ascendente calculado: ${ascendant.sign.name} ${ascendant.formattedDegree}`);

        // Obtener los tres grandes
        const sunSign = this.calculateSunSign(date);
        const moonPosition = planetPositions.find(p => p.planet.name === 'Luna');

        // Calcular las casas
        const houses = this.calculateHouses(ascendant.sign);

        return {
            name: name,
            birthDate: birthDate,
            birthTime: birthTime,
            location: geoData.displayName || location,
            coordinates: {
                latitude: geoData.lat,
                longitude: geoData.lon
            },
            julianDay: jd,
            sunSign: sunSign,
            moonSign: moonPosition.sign,
            risingSign: ascendant.sign,
            ascendantDegree: ascendant,
            planets: planetPositions,
            houses: houses,
            interpretation: this.generateInterpretation(sunSign, moonPosition.sign, ascendant.sign)
        };
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Astrology;
}
