// ============================================================================
// 💪 WORKOUT SESSION - Gestion des séances
// ============================================================================

export default class WorkoutSession {
    constructor() {
        this.currentWorkout = null;
        this.completedSets = new Map(); // exerciseId -> Set de numéros de séries
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Initialiser la session
     */
    init() {
        console.log('🎯 Session initialisée');
        this.loadFromStorage();
    }

    /**
     * Démarrer une nouvelle séance
     */
    startWorkout(workoutData) {
        this.currentWorkout = workoutData;
        this.startTime = new Date();
        this.completedSets.clear();
        
        console.log('💪 Séance démarrée:', workoutData);
    }

    /**
     * Marquer une série comme complétée
     */
    markSetCompleted(exerciseId, setNumber, isCompleted) {
        if (!this.completedSets.has(exerciseId)) {
            this.completedSets.set(exerciseId, new Set());
        }

        const sets = this.completedSets.get(exerciseId);
        
        if (isCompleted) {
            sets.add(setNumber);
            console.log(`✅ Série ${setNumber} de ${exerciseId} complétée`);
        } else {
            sets.delete(setNumber);
            console.log(`❌ Série ${setNumber} de ${exerciseId} annulée`);
        }

        this.saveToStorage();
    }

    /**
     * Vérifier si une série est complétée
     */
    isSetCompleted(exerciseId, setNumber) {
        if (!this.completedSets.has(exerciseId)) {
            return false;
        }
        return this.completedSets.get(exerciseId).has(setNumber);
    }

    /**
     * Obtenir le nombre de séries complétées pour un exercice
     */
    getCompletedSetsCount(exerciseId) {
        if (!this.completedSets.has(exerciseId)) {
            return 0;
        }
        return this.completedSets.get(exerciseId).size;
    }

    /**
     * Terminer la séance
     */
    endWorkout() {
        this.endTime = new Date();
        const duration = (this.endTime - this.startTime) / 1000 / 60; // minutes
        
        console.log(`🏁 Séance terminée en ${duration.toFixed(0)} minutes`);
        
        this.saveToStorage();
        return {
            duration,
            completedExercises: this.completedSets.size,
            totalSets: Array.from(this.completedSets.values()).reduce((sum, sets) => sum + sets.size, 0)
        };
    }

    /**
     * Sauvegarder dans le localStorage
     */
    saveToStorage() {
        try {
            const data = {
                completedSets: Array.from(this.completedSets.entries()).map(([key, value]) => [
                    key,
                    Array.from(value)
                ]),
                startTime: this.startTime,
                currentWorkout: this.currentWorkout
            };
            
            localStorage.setItem('workout-session', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ Impossible de sauvegarder:', error);
        }
    }

    /**
     * Charger depuis le localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('workout-session');
            if (!stored) return;

            const data = JSON.parse(stored);
            
            // Reconstruire la Map
            this.completedSets = new Map(
                data.completedSets.map(([key, value]) => [key, new Set(value)])
            );
            
            this.startTime = data.startTime ? new Date(data.startTime) : null;
            this.currentWorkout = data.currentWorkout;
            
            console.log('📥 Session restaurée');
        } catch (error) {
            console.warn('⚠️ Impossible de charger:', error);
        }
    }

    /**
     * Réinitialiser la session
     */
    reset() {
        this.completedSets.clear();
        this.currentWorkout = null;
        this.startTime = null;
        this.endTime = null;
        
        try {
            localStorage.removeItem('workout-session');
        } catch (error) {
            console.warn('⚠️ Impossible de supprimer:', error);
        }
        
        console.log('🔄 Session réinitialisée');
    }
}
