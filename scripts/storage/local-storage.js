/**
 * LOCAL STORAGE - Gestion de la persistance des données
 */

export class LocalStorage {
    constructor() {
        this.prefix = 'hybrid_master_';
        this.available = this.checkAvailability();
    }

    /**
     * Vérifie la disponibilité de localStorage
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('⚠️ localStorage non disponible:', e);
            return false;
        }
    }

    /**
     * Sauvegarde une valeur
     */
    save(key, value) {
        if (!this.available) {
            console.warn('⚠️ Impossible de sauvegarder, localStorage non disponible');
            return false;
        }

        try {
            const fullKey = this.prefix + key;
            const jsonValue = JSON.stringify(value);
            localStorage.setItem(fullKey, jsonValue);
            return true;
        } catch (e) {
            console.error('❌ Erreur lors de la sauvegarde:', e);
            return false;
        }
    }

    /**
     * Récupère une valeur
     */
    load(key, defaultValue = null) {
        if (!this.available) {
            return defaultValue;
        }

        try {
            const fullKey = this.prefix + key;
            const jsonValue = localStorage.getItem(fullKey);
            
            if (jsonValue === null) {
                return defaultValue;
            }

            return JSON.parse(jsonValue);
        } catch (e) {
            console.error('❌ Erreur lors du chargement:', e);
            return defaultValue;
        }
    }

    /**
     * Supprime une valeur
     */
    remove(key) {
        if (!this.available) return false;

        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.error('❌ Erreur lors de la suppression:', e);
            return false;
        }
    }

    /**
     * Efface toutes les données de l'app
     */
    clear() {
        if (!this.available) return false;

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('🗑️ Données effacées');
            return true;
        } catch (e) {
            console.error('❌ Erreur lors de l\'effacement:', e);
            return false;
        }
    }

    /**
     * Sauvegarde l'état de navigation
     */
    saveNavigationState(week, day) {
        return this.save('navigation', { week, day });
    }

    /**
     * Charge l'état de navigation
     */
    loadNavigationState() {
        return this.load('navigation', { week: 1, day: 'dimanche' });
    }

    /**
     * Sauvegarde la progression d'un exercice
     */
    saveExerciseProgress(week, day, exerciseId, data) {
        const key = `progress_w${week}_${day}_${exerciseId}`;
        return this.save(key, data);
    }

    /**
     * Charge la progression d'un exercice
     */
    loadExerciseProgress(week, day, exerciseId) {
        const key = `progress_w${week}_${day}_${exerciseId}`;
        return this.load(key, null);
    }

    /**
     * Sauvegarde toutes les séries cochées
     */
    saveCompletedSets(week, day, exerciseId, completedSets) {
        return this.saveExerciseProgress(week, day, exerciseId, {
            completedSets,
            lastUpdate: new Date().toISOString()
        });
    }

    /**
     * Charge les séries cochées
     */
    loadCompletedSets(week, day, exerciseId) {
        const data = this.loadExerciseProgress(week, day, exerciseId);
        return data ? data.completedSets : [];
    }

    /**
     * Sauvegarde les poids modifiés
     */
    saveCustomWeights(week, day, exerciseId, weights) {
        const key = `weights_w${week}_${day}_${exerciseId}`;
        return this.save(key, {
            weights,
            lastUpdate: new Date().toISOString()
        });
    }

    /**
     * Charge les poids modifiés
     */
    loadCustomWeights(week, day, exerciseId) {
        const key = `weights_w${week}_${day}_${exerciseId}`;
        const data = this.load(key, null);
        return data ? data.weights : null;
    }

    /**
     * Sauvegarde l'état du timer
     */
    saveTimerState(seconds, isRunning) {
        return this.save('timer', {
            seconds,
            isRunning,
            timestamp: Date.now()
        });
    }

    /**
     * Charge l'état du timer
     */
    loadTimerState() {
        const data = this.load('timer', null);
        
        // Vérifier si le timer a expiré (plus de 1h)
        if (data && (Date.now() - data.timestamp) > 3600000) {
            return null;
        }

        return data;
    }

    /**
     * Exporte toutes les données
     */
    exportAll() {
        if (!this.available) return null;

        const data = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                const shortKey = key.replace(this.prefix, '');
                data[shortKey] = localStorage.getItem(key);
            }
        });

        return data;
    }

    /**
     * Importe des données
     */
    importAll(data) {
        if (!this.available || !data) return false;

        try {
            Object.keys(data).forEach(key => {
                const fullKey = this.prefix + key;
                localStorage.setItem(fullKey, data[key]);
            });
            console.log('✅ Données importées');
            return true;
        } catch (e) {
            console.error('❌ Erreur lors de l\'import:', e);
            return false;
        }
    }

    /**
     * Récupère la taille des données stockées
     */
    getStorageSize() {
        if (!this.available) return 0;

        let size = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                size += localStorage.getItem(key).length;
            }
        });

        return size;
    }

    /**
     * Formate la taille en Ko
     */
    getStorageSizeFormatted() {
        const bytes = this.getStorageSize();
        return `${(bytes / 1024).toFixed(2)} Ko`;
    }
}
