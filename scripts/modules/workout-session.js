/**
 * WORKOUT SESSION - Gestion de la séance en cours (Robust Implementation)
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
        if (!week || !day || !Array.isArray(exercises)) {
            console.warn('Invalid parameters for session start');
            return;
        }
        
        this.currentWeek = week;
        this.currentDay = day;
        this.exercises = exercises;
        this.startTime = new Date().toISOString();
        
        // Charger les données sauvegardées
        this.loadProgress();
        
        console.log(`🏋️ Séance démarrée: S${week} - ${day}`);
    }

    /**
     * Charge la progression sauvegardée
     */
    loadProgress() {
        if (!Array.isArray(this.exercises)) return;
        
        this.exercises.forEach(exercise => {
            const exerciseId = exercise.id || exercise.nom;
            if (!exerciseId) return;
            
            // Charger les séries cochées
            try {
                const completed = this.storage.loadCompletedSets(
                    this.currentWeek,
                    this.currentDay,
                    exerciseId
                );
                if (Array.isArray(completed) && completed.length > 0) {
                    this.completedSets.set(exerciseId, new Set(completed));
                }
            } catch (e) {
                console.warn(`Failed to load completed sets for ${exerciseId}:`, e);
            }

            // Charger les poids personnalisés
            try {
                const weights = this.storage.loadCustomWeights(
                    this.currentWeek,
                    this.currentDay,
                    exerciseId
                );
                if (weights && typeof weights === 'object') {
                    this.customWeights.set(exerciseId, weights);
                }
            } catch (e) {
                console.warn(`Failed to load custom weights for ${exerciseId}:`, e);
            }
        });
    }

    /**
     * Marque une série comme complétée
     */
    completeSet(exerciseId, setIndex) {
        if (!exerciseId || typeof setIndex !== 'number' || setIndex < 0) {
            console.warn('Invalid parameters for completeSet');
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
        if (!exerciseId || typeof setIndex !== 'number') {
            console.warn('Invalid parameters for uncompleteSet');
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
        if (!exerciseId || typeof setIndex !== 'number') return false;
        if (!this.completedSets.has(exerciseId)) return false;
        return this.completedSets.get(exerciseId).has(setIndex);
    }

    /**
     * Modifie le poids d'une série
     */
    updateWeight(exerciseId, setIndex, newWeight) {
        if (!exerciseId) {
            console.warn('Invalid exerciseId for updateWeight');
            return;
        }
        
        const weight = Number(newWeight);
        if (!Number.isFinite(weight)) {
            console.warn('Invalid weight value');
            return;
        }
        
        if (!this.customWeights.has(exerciseId)) {
            this.customWeights.set(exerciseId, {});
        }
        
        // If setIndex is undefined, update the general weight
        const key = setIndex !== undefined ? setIndex : 'default';
        this.customWeights.get(exerciseId)[key] = weight;
        this.saveWeights(exerciseId);
        
        console.log(`💪 Poids modifié: ${exerciseId} série ${setIndex !== undefined ? setIndex + 1 : 'général'} → ${weight}kg`);
    }

    /**
     * Récupère le poids d'une série
     */
    getWeight(exerciseId, setIndex, defaultWeight) {
        if (!exerciseId) return defaultWeight;
        
        if (!this.customWeights.has(exerciseId)) {
            return defaultWeight;
        }
        
        const weights = this.customWeights.get(exerciseId);
        const key = setIndex !== undefined ? setIndex : 'default';
        return weights[key] !== undefined ? weights[key] : defaultWeight;
    }

    /**
     * Sauvegarde la progression d'un exercice
     */
    saveProgress(exerciseId) {
        if (!exerciseId || !this.storage) return;
        
        try {
            const completed = this.completedSets.has(exerciseId)
                ? Array.from(this.completedSets.get(exerciseId))
                : [];
            
            this.storage.saveCompletedSets(
                this.currentWeek,
                this.currentDay,
                exerciseId,
                completed
            );
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }

    /**
     * Sauvegarde les poids personnalisés
     */
    saveWeights(exerciseId) {
        if (!exerciseId || !this.storage) return;
        
        try {
            const weights = this.customWeights.get(exerciseId);
            
            this.storage.saveCustomWeights(
                this.currentWeek,
                this.currentDay,
                exerciseId,
                weights
            );
        } catch (e) {
            console.error('Failed to save weights:', e);
        }
    }

    /**
     * Termine la séance
     */
    end() {
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

        if (!Array.isArray(this.exercises)) {
            return {
                totalExercises: 0,
                totalSets: 0,
                completedSets: 0,
                completionRate: 0,
                totalVolume: 0,
                averageVolumePerSet: 0
            };
        }

        this.exercises.forEach(exercise => {
            const exerciseId = exercise.id || exercise.nom;
            if (!exerciseId) return;
            
            const sets = Array.isArray(exercise.series) ? exercise.series : [];
            
            totalSets += sets.length;

            sets.forEach((set, index) => {
                // Compter les séries complétées
                if (this.isSetCompleted(exerciseId, index)) {
                    completedSetsCount++;
                    
                    // Calculer le volume (poids × reps)
                    const weight = this.getWeight(exerciseId, index, set.poids || 0);
                    const reps = parseInt(set.reps) || 0;
                    if (Number.isFinite(weight) && Number.isFinite(reps)) {
                        totalVolume += weight * reps;
                    }
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
        if (!Number.isFinite(seconds) || seconds < 0) return '0min';
        
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
        if (Array.isArray(this.exercises) && this.storage) {
            this.exercises.forEach(exercise => {
                const exerciseId = exercise.id || exercise.nom;
                if (!exerciseId) return;
                
                try {
                    this.storage.saveCompletedSets(this.currentWeek, this.currentDay, exerciseId, []);
                    this.storage.saveCustomWeights(this.currentWeek, this.currentDay, exerciseId, {});
                } catch (e) {
                    console.error('Failed to reset exercise data:', e);
                }
            });
        }
        
        console.log('🔄 Séance réinitialisée');
    }

    /**
     * Récupère l'état actuel
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
            startTime: this.startTime,
            stats: this.getStats()
        };
    }
}
