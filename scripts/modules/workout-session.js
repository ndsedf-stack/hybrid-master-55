/**
 * WORKOUT SESSION - Gestion de la séance en cours (version robuste)
 */

export class WorkoutSession {
    constructor(storage) {
        this.storage = storage;
        this.currentWeek = 1;
        this.currentDay = 'dimanche';
        this.exercises = [];
        this.completedSets = new Map();
        this.customWeights = new Map();
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Démarre une nouvelle séance
     */
    start(week, day, exercises) {
        // Validation des paramètres
        if (!week || !day || !Array.isArray(exercises)) {
            console.error('❌ Paramètres invalides pour démarrer une séance');
            return;
        }
        
        this.currentWeek = week;
        this.currentDay = day;
        this.exercises = exercises;
        this.startTime = new Date();
        
        // Charger les données sauvegardées
        if (typeof this.loadProgress === 'function') {
            this.loadProgress();
        }
        
        console.log(`🏋️ Séance démarrée: S${week} - ${day}`);
    }

    /**
     * Charge la progression sauvegardée
     */
    loadProgress() {
        if (!this.storage) {
            console.warn('⚠️ Pas de storage disponible pour charger la progression');
            return;
        }
        
        this.exercises.forEach(exercise => {
            const exerciseId = exercise.id || exercise.nom || exercise.name;
            if (!exerciseId) return;
            
            // Charger les séries cochées
            if (typeof this.storage.loadCompletedSets === 'function') {
                const completed = this.storage.loadCompletedSets(
                    this.currentWeek,
                    this.currentDay,
                    exerciseId
                );
                if (completed && Array.isArray(completed) && completed.length > 0) {
                    this.completedSets.set(exerciseId, new Set(completed));
                }
            }

            // Charger les poids personnalisés
            if (typeof this.storage.loadCustomWeights === 'function') {
                const weights = this.storage.loadCustomWeights(
                    this.currentWeek,
                    this.currentDay,
                    exerciseId
                );
                if (weights && typeof weights === 'object') {
                    this.customWeights.set(exerciseId, weights);
                }
            }
        });
    }

    /**
     * Marque une série comme complétée
     */
    completeSet(exerciseId, setIndex) {
        if (!exerciseId || setIndex === undefined || setIndex === null) {
            console.error('❌ Paramètres invalides pour completeSet');
            return;
        }
        
        if (!this.completedSets.has(exerciseId)) {
            this.completedSets.set(exerciseId, new Set());
        }
        
        this.completedSets.get(exerciseId).add(setIndex);
        
        if (typeof this.saveProgress === 'function') {
            this.saveProgress(exerciseId);
        }
        
        console.log(`✅ Série ${setIndex + 1} complétée pour ${exerciseId}`);
    }

    /**
     * Décoche une série
     */
    uncompleteSet(exerciseId, setIndex) {
        if (!exerciseId || setIndex === undefined || setIndex === null) {
            console.error('❌ Paramètres invalides pour uncompleteSet');
            return;
        }
        
        if (this.completedSets.has(exerciseId)) {
            this.completedSets.get(exerciseId).delete(setIndex);
            
            if (typeof this.saveProgress === 'function') {
                this.saveProgress(exerciseId);
            }
        }
    }

    /**
     * Vérifie si une série est complétée
     */
    isSetCompleted(exerciseId, setIndex) {
        if (!exerciseId || setIndex === undefined || setIndex === null) {
            return false;
        }
        if (!this.completedSets.has(exerciseId)) return false;
        return this.completedSets.get(exerciseId).has(setIndex);
    }

    /**
     * Modifie le poids d'une série
     */
    updateWeight(exerciseId, setIndex, newWeight) {
        if (!exerciseId || setIndex === undefined || setIndex === null) {
            console.error('❌ Paramètres invalides pour updateWeight');
            return;
        }
        
        const weight = parseFloat(newWeight);
        if (isNaN(weight)) {
            console.error('❌ Poids invalide:', newWeight);
            return;
        }
        
        if (!this.customWeights.has(exerciseId)) {
            this.customWeights.set(exerciseId, {});
        }
        
        this.customWeights.get(exerciseId)[setIndex] = weight;
        
        if (typeof this.saveWeights === 'function') {
            this.saveWeights(exerciseId);
        }
        
        console.log(`💪 Poids modifié: ${exerciseId} série ${setIndex + 1} → ${weight}kg`);
    }

    /**
     * Récupère le poids d'une série
     */
    getWeight(exerciseId, setIndex, defaultWeight) {
        if (!exerciseId || setIndex === undefined || setIndex === null) {
            return defaultWeight;
        }
        
        if (!this.customWeights.has(exerciseId)) {
            return defaultWeight;
        }
        
        const weights = this.customWeights.get(exerciseId);
        return weights[setIndex] !== undefined ? weights[setIndex] : defaultWeight;
    }

    /**
     * Sauvegarde la progression d'un exercice
     */
    saveProgress(exerciseId) {
        if (!this.storage || typeof this.storage.saveCompletedSets !== 'function') {
            console.warn('⚠️ Impossible de sauvegarder la progression');
            return;
        }
        
        const completed = this.completedSets.has(exerciseId)
            ? Array.from(this.completedSets.get(exerciseId))
            : [];
        
        this.storage.saveCompletedSets(
            this.currentWeek,
            this.currentDay,
            exerciseId,
            completed
        );
    }

    /**
     * Sauvegarde les poids personnalisés
     */
    saveWeights(exerciseId) {
        if (!this.storage || typeof this.storage.saveCustomWeights !== 'function') {
            console.warn('⚠️ Impossible de sauvegarder les poids');
            return;
        }
        
        const weights = this.customWeights.get(exerciseId);
        
        this.storage.saveCustomWeights(
            this.currentWeek,
            this.currentDay,
            exerciseId,
            weights
        );
    }

    /**
     * Termine la séance
     */
    end() {
        this.endTime = new Date();
        const duration = Math.floor((this.endTime - this.startTime) / 1000);
        
        const stats = this.getStats();
        console.log(`🏁 Séance terminée en ${this.formatDuration(duration)}`);
        console.log('📊 Statistiques:', stats);
        
        return {
            duration,
            stats,
            startTime: this.startTime ? this.startTime.toISOString() : null,
            endTime: this.endTime ? this.endTime.toISOString() : null
        };
    }

    /**
     * Calcule les statistiques de la séance
     */
    getStats() {
        let totalSets = 0;
        let completedSetsCount = 0;
        let totalVolume = 0;

        this.exercises.forEach(exercise => {
            const exerciseId = exercise.id || exercise.nom || exercise.name;
            const sets = Array.isArray(exercise.series) ? exercise.series : 
                         (Array.isArray(exercise.sets) ? exercise.sets : []);
            
            totalSets += sets.length;

            sets.forEach((set, index) => {
                // Compter les séries complétées
                if (this.isSetCompleted(exerciseId, index)) {
                    completedSetsCount++;
                    
                    // Calculer le volume (poids × reps)
                    const weight = this.getWeight(exerciseId, index, set.poids || set.weight || 0);
                    const reps = parseInt(set.reps) || 0;
                    totalVolume += weight * reps;
                }
            });
        });

        return {
            totalExercises: this.exercises.length,
            totalSets,
            completedSets: completedSetsCount,
            completionRate: totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0,
            totalVolume,
            averageVolumePerSet: completedSetsCount > 0 ? Math.round(totalVolume / completedSetsCount) : 0
        };
    }

    /**
     * Récupère la progression de la séance (avec sérialisation ISO)
     */
    getSessionProgress() {
        return {
            week: this.currentWeek,
            day: this.currentDay,
            startTime: this.startTime ? this.startTime.toISOString() : null,
            endTime: this.endTime ? this.endTime.toISOString() : null,
            completedSets: Array.from(this.completedSets.entries()).map(([id, sets]) => ({
                exerciseId: id,
                sets: Array.from(sets)
            })),
            customWeights: Array.from(this.customWeights.entries()).map(([id, weights]) => ({
                exerciseId: id,
                weights
            })),
            stats: this.getStats()
        };
    }

    /**
     * Formate une durée en secondes
     */
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) {
            return '0min';
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes}min`;
    }

    /**
     * Réinitialise la séance
     */
    reset() {
        this.completedSets.clear();
        this.customWeights.clear();
        
        // Effacer les données sauvegardées
        if (this.storage) {
            this.exercises.forEach(exercise => {
                const exerciseId = exercise.id || exercise.nom || exercise.name;
                if (!exerciseId) return;
                
                if (typeof this.storage.saveCompletedSets === 'function') {
                    this.storage.saveCompletedSets(this.currentWeek, this.currentDay, exerciseId, []);
                }
                if (typeof this.storage.saveCustomWeights === 'function') {
                    this.storage.saveCustomWeights(this.currentWeek, this.currentDay, exerciseId, {});
                }
            });
        }
        
        console.log('🔄 Séance réinitialisée');
    }

    /**
     * Récupère l'état actuel (alias de getSessionProgress pour compatibilité)
     */
    getState() {
        return this.getSessionProgress();
    }
}
