/**
 * Utilitaires pour l'application Hybrid Master
 * @namespace Helpers
 */

export const Helpers = {
    /**
     * Formate un temps en secondes vers MM:SS
     * @param {number} seconds - Temps en secondes
     * @returns {string} Temps formaté
     */
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        return [
            mins.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    },

    /**
     * Calcule le 1RM (One Rep Max)
     * @param {number} weight - Poids soulevé
     * @param {number} reps - Nombre de répétitions
     * @returns {number} 1RM estimé
     */
    calculate1RM(weight, reps) {
        if (reps === 1) return weight;
        // Formule d'Epley
        return Math.round(weight * (1 + reps / 30));
    },

    /**
     * Détermine le groupe musculaire
     * @param {string} exerciseName - Nom de l'exercice
     * @returns {string} Groupe musculaire
     */
    getMuscleGroup(exerciseName) {
        if (!exerciseName) return 'other';
        
        const name = exerciseName.toLowerCase();
        const muscleGroups = {
            pectoraux: ['bench', 'press', 'pec', 'chest', 'développé', 'écarté', 'dumbbell press', 'fly'],
            dos: ['row', 'pull', 'lat', 'back', 'tirage', 'traction', 'trap bar', 'deadlift'],
            jambes: ['squat', 'leg', 'lunge', 'calf', 'quad', 'hamstring', 'mollet', 'goblet'],
            épaules: ['shoulder', 'press', 'lateral', 'military', 'deltoid', 'raises', 'landmine'],
            biceps: ['curl', 'biceps', 'hammer', 'spider', 'incline'],
            triceps: ['extension', 'triceps', 'pushdown', 'overhead'],
            abdominaux: ['crunch', 'ab', 'situp', 'plank']
        };

        for (const [group, keywords] of Object.entries(muscleGroups)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return group;
            }
        }

        return 'other';
    },

    /**
     * Valide un poids
     * @param {number} weight - Poids à valider
     * @returns {boolean} Valide ou non
     */
    validateWeight(weight) {
        return !isNaN(weight) && weight >= 0 && weight <= 1000;
    },

    /**
     * Calcule le volume d'entraînement
     * @param {number} sets - Nombre de séries
     * @param {number} reps - Nombre de répétitions
     * @param {number} weight - Poids
     * @returns {number} Volume total
     */
    calculateVolume(sets, reps, weight) {
        return sets * reps * weight;
    },

    /**
     * Génère un ID unique
     * @returns {string} ID unique
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Debounce une fonction
     * @param {Function} func - Fonction à debouncer
     * @param {number} wait - Temps d'attente en ms
     * @returns {Function} Fonction debouncée
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Formate une date en français
     * @param {Date} date - Date à formater
     * @returns {string} Date formatée
     */
    formatDate(date) {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

export default Helpers;
