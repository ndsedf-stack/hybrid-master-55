/**
 * WORKOUT SESSION - Gestion de la séance en cours
 */

export class WorkoutSession {
    constructor(storage) {
        // Validate storage parameter
        if (!storage) {
            throw new Error('WorkoutSession requires a storage instance');
        }
        
        this.storage = storage;
        this.currentWeek = 1;
        this.currentDay = 'dimanche';
        this.exercises = [];
        
        // Use Maps for better performance and data structure
        this.completedSets = new Map();
        this.customWeights = new Map();
        
        // Store startTime as ISO string for serialization
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Démarre une nouvelle séance
     * Alias: start() for compatibility
     */
    start(week, day, exercises) {
        // Validate parameters
        if (!week || week < 1 || week > 26) {
            console.warn('⚠️ Invalid week number:', week);
            return;
        }
        if (!day || typeof day !== 'string') {
            console.warn('⚠️ Invalid day:', day);
            return;
        }
        if (!Array.isArray(exercises)) {
            console.warn('⚠️ Invalid exercises array:', exercises);
            exercises = [];
        }
        
        this.currentWeek = week;
        this.currentDay = day;
        this.exercises = exercises;
        
        // Store as ISO string for proper serialization
        this.startTime = new Date().toISOString();
        
        // Charger les données sauvegardées
        this.loadProgress();
        
        console.log(`🏋️ Séance démarrée: S${week} - ${day}`);
    }

    /**
     * Charge la progression sauvegardée
     */
    loadProgress() {
        // Check if storage has the required methods
        if (!this.storage || typeof this.storage.loadCompletedSets !== 'function') {
            console.warn('⚠️ Storage does not support loadCompletedSets');
            return;
        }
        
        this.exercises.forEach(exercise => {
            const exerciseId = exercise.id || exercise.nom;
            
            // Charger les séries cochées
            const completed = this.storage.loadCompletedSets(
                this.currentWeek,
                this.currentDay,
                exerciseId
            );
            if (completed && completed.length > 0) {
                this.completedSets.set(exerciseId, new Set(completed));
            }

            // Charger les poids personnalisés
            if (typeof this.storage.loadCustomWeights === 'function') {
                const weights = this.storage.loadCustomWeights(
                    this.currentWeek,
                    this.currentDay,
                    exerciseId
                );
                if (weights) {
                    this.customWeights.set(exerciseId, weights);
                }
            }
        });
    }

    /**
     * Marque une série comme complétée
     */
    completeSet(exerciseId, setIndex) {
        if (!exerciseId || setIndex == null) {
            console.warn('⚠️ Invalid exerciseId or setIndex');
            return;
        }
        
        if (!this.completedSets.has(exerciseId)) {
            this.completedSets.set(exerciseId, new Set());
        }
        
        this.completedSets.get(exerciseId).add(setIndex);
        this.saveProgress(exerciseId);
        
        console.log(`✅ Série ${setIndex + 1} complétée pour ${exerciseId}`);
    }

    /**
     * Décoche une série
     */
    uncompleteSet(exerciseId, setIndex) {
        if (!exerciseId || setIndex == null) {
            console.warn('⚠️ Invalid exerciseId or setIndex');
            return;
        }
        
        if (this.completedSets.has(exerciseId)) {
            this.completedSets.get(exerciseId).delete(setIndex);
            this.saveProgress(exerciseId);
        }
    }

    /**
     * Vérifie si une série est complétée
     */
    isSetCompleted(exerciseId, setIndex) {
        if (!exerciseId || setIndex == null) return false;
        if (!this.completedSets.has(exerciseId)) return false;
        return this.completedSets.get(exerciseId).has(setIndex);
    }

    /**
     * Modifie le poids d'une série
     */
    updateWeight(exerciseId, setIndex, newWeight) {
        if (!exerciseId || setIndex == null || newWeight == null) {
            console.warn('⚠️ Invalid parameters for updateWeight');
            return;
        }
        
        if (!this.customWeights.has(exerciseId)) {
            this.customWeights.set(exerciseId, {});
        }
        
        this.customWeights.get(exerciseId)[setIndex] = newWeight;
        this.saveWeights(exerciseId);
        
        console.log(`💪 Poids modifié: ${exerciseId} série ${setIndex + 1} → ${newWeight}kg`);
    }

    /**
     * Récupère le poids d'une série
     */
    getWeight(exerciseId, setIndex, defaultWeight) {
        if (!exerciseId || setIndex == null) {
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
        // Check if storage has the required method
        if (!this.storage || typeof this.storage.saveCompletedSets !== 'function') {
            console.warn('⚠️ Storage does not support saveCompletedSets');
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
        // Check if storage has the required method
        if (!this.storage || typeof this.storage.saveCustomWeights !== 'function') {
            console.warn('⚠️ Storage does not support saveCustomWeights');
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
        // Store as ISO string for proper serialization
        this.endTime = new Date().toISOString();
        
        const startDate = new Date(this.startTime);
        const endDate = new Date(this.endTime);
        const duration = Math.floor((endDate - startDate) / 1000);
        
        const stats = this.getStats();
        console.log(`🏁 Séance terminée en ${this.formatDuration(duration)}`);
        console.log('📊 Statistiques:', stats);
        
        return {
            duration,
            stats,
            startTime: this.startTime,
            endTime: this.endTime
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
            const exerciseId = exercise.id || exercise.nom;
            const sets = Array.isArray(exercise.series) ? exercise.series : [];
            
            totalSets += sets.length;

            sets.forEach((set, index) => {
                // Compter les séries complétées
                if (this.isSetCompleted(exerciseId, index)) {
                    completedSetsCount++;
                    
                    // Calculer le volume (poids × reps)
                    const weight = this.getWeight(exerciseId, index, set.poids || 0);
                    const reps = parseInt(set.reps, 10) || 0;
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
     * Formate une durée en secondes
     */
    formatDuration(seconds) {
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
        this.exercises.forEach(exercise => {
            const exerciseId = exercise.id || exercise.nom;
            if (this.storage && typeof this.storage.saveCompletedSets === 'function') {
                this.storage.saveCompletedSets(this.currentWeek, this.currentDay, exerciseId, []);
            }
            if (this.storage && typeof this.storage.saveCustomWeights === 'function') {
                this.storage.saveCustomWeights(this.currentWeek, this.currentDay, exerciseId, {});
            }
        });
        
        console.log('🔄 Séance réinitialisée');
    }

    /**
     * Récupère l'état actuel (with proper Map serialization)
     */
    getState() {
        return {
            week: this.currentWeek,
            day: this.currentDay,
            completedSets: Array.from(this.completedSets.entries()).map(([id, sets]) => ({
                exerciseId: id,
                sets: Array.from(sets)
            })),
            customWeights: Array.from(this.customWeights.entries()).map(([id, weights]) => ({
                exerciseId: id,
                weights
            })),
            startTime: this.startTime, // Already ISO string
            stats: this.getStats()
        };
    }
}
