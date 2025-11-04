/**
 * WORKOUT SESSION - Gestion robuste de la séance en cours
 * Version améliorée avec validation et Maps
 */

export class WorkoutSession {
    constructor(storage) {
        // Validation du storage
        if (!storage) {
            throw new Error('Storage is required for WorkoutSession');
        }
        
        // Vérification des méthodes storage requises
        const requiredMethods = ['saveCompletedSets', 'loadCompletedSets', 'saveCustomWeights', 'loadCustomWeights'];
        requiredMethods.forEach(method => {
            if (typeof storage[method] !== 'function') {
                console.warn(`⚠️ Storage manque la méthode: ${method}`);
            }
        });
        
        this.storage = storage;
        this.currentWeek = 1;
        this.currentDay = 'dimanche';
        this.exercises = [];
        // Utilisation de Maps pour une meilleure performance
        this.completedSets = new Map();
        this.customWeights = new Map();
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Démarre une nouvelle séance avec validation des paramètres
     */
    start(week, day, exercises) {
        // Validation des paramètres
        if (!Number.isInteger(week) || week < 1 || week > 26) {
            console.error('❌ Semaine invalide:', week);
            return;
        }
        
        if (typeof day !== 'string' || !day) {
            console.error('❌ Jour invalide:', day);
            return;
        }
        
        if (!Array.isArray(exercises)) {
            console.error('❌ Exercises doit être un tableau:', exercises);
            return;
        }
        
        this.currentWeek = week;
        this.currentDay = day;
        this.exercises = exercises;
        // Sérialisation ISO 8601 pour startTime
        this.startTime = new Date().toISOString();
        
        // Charger les données sauvegardées
        this.loadProgress();
        
        console.log(`🏋️ Séance démarrée: S${week} - ${day}`);
    }

    /**
     * Charge la progression sauvegardée avec vérification storage
     */
    loadProgress() {
        if (!this.storage?.loadCompletedSets || !this.storage?.loadCustomWeights) {
            console.warn('⚠️ Méthodes de chargement storage non disponibles');
            return;
        }
        
        this.exercises.forEach(exercise => {
            const exerciseId = exercise.id || exercise.nom;
            
            if (!exerciseId) {
                console.warn('⚠️ Exercice sans ID ou nom:', exercise);
                return;
            }
            
            // Charger les séries cochées
            const completed = this.storage.loadCompletedSets(
                this.currentWeek,
                this.currentDay,
                exerciseId
            );
            if (completed && Array.isArray(completed) && completed.length > 0) {
                this.completedSets.set(exerciseId, new Set(completed));
            }

            // Charger les poids personnalisés
            const weights = this.storage.loadCustomWeights(
                this.currentWeek,
                this.currentDay,
                exerciseId
            );
            if (weights && typeof weights === 'object') {
                this.customWeights.set(exerciseId, weights);
            }
        });
    }

    /**
     * Marque une série comme complétée avec validation
     */
    completeSet(exerciseId, setIndex) {
        // Validation des paramètres
        if (!exerciseId || typeof exerciseId !== 'string') {
            console.error('❌ exerciseId invalide:', exerciseId);
            return;
        }
        
        if (!Number.isInteger(setIndex) || setIndex < 0) {
            console.error('❌ setIndex invalide:', setIndex);
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
     * Décoche une série avec validation
     */
    uncompleteSet(exerciseId, setIndex) {
        if (!exerciseId || typeof exerciseId !== 'string') {
            console.error('❌ exerciseId invalide:', exerciseId);
            return;
        }
        
        if (!Number.isInteger(setIndex) || setIndex < 0) {
            console.error('❌ setIndex invalide:', setIndex);
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
        if (!this.completedSets.has(exerciseId)) return false;
        return this.completedSets.get(exerciseId).has(setIndex);
    }

    /**
     * Modifie le poids d'une série avec validation
     */
    updateWeight(exerciseId, setIndex, newWeight) {
        // Validation des paramètres
        if (!exerciseId || typeof exerciseId !== 'string') {
            console.error('❌ exerciseId invalide:', exerciseId);
            return;
        }
        
        const weight = Number(newWeight);
        if (!Number.isFinite(weight) || weight < 0) {
            console.error('❌ newWeight invalide:', newWeight);
            return;
        }
        
        if (!this.customWeights.has(exerciseId)) {
            this.customWeights.set(exerciseId, {});
        }
        
        // Si setIndex est undefined, appliquer à tous les sets
        if (setIndex === undefined) {
            const weights = this.customWeights.get(exerciseId);
            // Obtenir le nombre de séries pour cet exercice
            const exercise = this.exercises.find(ex => (ex.id || ex.nom) === exerciseId);
            if (exercise && exercise.series) {
                const numSets = Array.isArray(exercise.series) ? exercise.series.length : exercise.sets || 0;
                for (let i = 0; i < numSets; i++) {
                    weights[i] = weight;
                }
            }
        } else {
            this.customWeights.get(exerciseId)[setIndex] = weight;
        }
        
        this.saveWeights(exerciseId);
        
        console.log(`💪 Poids modifié: ${exerciseId}${setIndex !== undefined ? ` série ${setIndex + 1}` : ''} → ${weight}kg`);
    }

    /**
     * Récupère le poids d'une série
     */
    getWeight(exerciseId, setIndex, defaultWeight) {
        if (!this.customWeights.has(exerciseId)) {
            return defaultWeight;
        }
        
        const weights = this.customWeights.get(exerciseId);
        return weights[setIndex] !== undefined ? weights[setIndex] : defaultWeight;
    }

    /**
     * Sauvegarde la progression d'un exercice avec vérification storage
     */
    saveProgress(exerciseId) {
        if (!this.storage?.saveCompletedSets) {
            console.warn('⚠️ saveCompletedSets non disponible');
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
     * Sauvegarde les poids personnalisés avec vérification storage
     */
    saveWeights(exerciseId) {
        if (!this.storage?.saveCustomWeights) {
            console.warn('⚠️ saveCustomWeights non disponible');
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
     * Termine la séance avec timestamps ISO
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
                    const reps = Number.parseInt(set.reps, 10) || 0;
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
        if (this.storage?.saveCompletedSets && this.storage?.saveCustomWeights) {
            this.exercises.forEach(exercise => {
                const exerciseId = exercise.id || exercise.nom;
                if (exerciseId) {
                    this.storage.saveCompletedSets(this.currentWeek, this.currentDay, exerciseId, []);
                    this.storage.saveCustomWeights(this.currentWeek, this.currentDay, exerciseId, {});
                }
            });
        }
        
        console.log('🔄 Séance réinitialisée');
    }

    /**
     * Récupère l'état actuel avec Maps sérialisées
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
