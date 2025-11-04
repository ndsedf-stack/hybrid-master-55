/**
 * WORKOUT SESSION - Gestion de la séance en cours (corrigé)
 *
 * - Utilise Map pour completedSets et customWeights
 * - Sérialise startTime en ISO dans saveProgress
 * - Méthodes saveProgress/loadProgress robustes : supporte storage.saveProgress/loadProgress
 *   mais garde la compatibilité avec storage.saveCompletedSets / saveCustomWeights / loadCompletedSets / loadCustomWeights
 * - Validation des paramètres et protections null-safe
 */

export class WorkoutSession {
    constructor(storage) {
        this.storage = storage;
        this.currentWeek = 1;
        this.currentDay = 'dimanche';
        this.exercises = [];
        this.completedSets = new Map(); // exerciseId -> Set(setIndex)
        this.customWeights = new Map(); // exerciseId -> { setIndex: weight, ... }
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Alias start() existant - conserve l'API actuelle
     * start(week, day, exercises)
     */
    start(week, day, exercises) {
        // Validation légère
        this.currentWeek = Number.isFinite(Number(week)) ? Number(week) : this.currentWeek;
        this.currentDay = day || this.currentDay;
        this.exercises = Array.isArray(exercises) ? exercises : [];
        this.startTime = new Date();

        // Charger les données sauvegardées (si présentes)
        this.loadProgress();

        console.log(`🏋️ Séance démarrée: S${this.currentWeek} - ${this.currentDay} (${this.exercises.length} exercices)`);
    }

    /**
     * Alias compat : startSession -> délègue à start
     */
    startSession(week, day, exercises) {
        return this.start(week, day, exercises);
    }

    /**
     * Charge la progression sauvegardée.
     * - Si storage.loadProgress() existe, on l'utilise.
     * - Sinon, on tente de lire par-exercice avec loadCompletedSets/loadCustomWeights (ancienne API).
     */
    loadProgress() {
        try {
            if (!this.storage) return null;

            // Prefer unified loadProgress if available
            if (typeof this.storage.loadProgress === 'function') {
                const progress = this.storage.loadProgress() || {};
                // completedSets: { exerciseId: [indices...] }
                if (progress.completedSets && typeof progress.completedSets === 'object') {
                    this.completedSets = new Map(
                        Object.entries(progress.completedSets).map(([id, arr]) => [id, new Set(Array.isArray(arr) ? arr.map(n => Number(n)) : [])])
                    );
                }

                // customWeights: { exerciseId: { setIndex: weight, ... } }
                if (progress.customWeights && typeof progress.customWeights === 'object') {
                    this.customWeights = new Map(
                        Object.entries(progress.customWeights).map(([id, obj]) => [id, typeof obj === 'object' ? obj : {}])
                    );
                }

                if (progress.startTime) {
                    this.startTime = new Date(progress.startTime);
                }

                return progress;
            }

            // Fallback: per-exercise storages (older API)
            if (Array.isArray(this.exercises)) {
                this.exercises.forEach(exercise => {
                    const exerciseId = exercise.id ?? exercise.nom ?? null;
                    if (!exerciseId) return;

                    // loadCompletedSets(week, day, exerciseId) -> array of indices
                    if (typeof this.storage.loadCompletedSets === 'function') {
                        const completed = this.storage.loadCompletedSets(this.currentWeek, this.currentDay, exerciseId) || [];
                        this.completedSets.set(exerciseId, new Set(Array.isArray(completed) ? completed.map(n => Number(n)) : []));
                    }

                    // loadCustomWeights -> object or array
                    if (typeof this.storage.loadCustomWeights === 'function') {
                        const weights = this.storage.loadCustomWeights(this.currentWeek, this.currentDay, exerciseId) || {};
                        this.customWeights.set(exerciseId, weights);
                    }
                });
            }

            return null;
        } catch (err) {
            console.warn('loadProgress error', err);
            return null;
        }
    }

    /**
     * Sauvegarde la progression complète (fallback ou méthode unifiée)
     * - Si storage.saveProgress exists, stocke l'objet complet.
     * - Sinon, tombe back sur saveCompletedSets / saveCustomWeights par exercice.
     */
    saveProgress() {
        try {
            if (!this.storage) return;

            // Préparer structure sérialisable
            const completedSetsObj = {};
            for (const [exerciseId, set] of this.completedSets.entries()) {
                completedSetsObj[exerciseId] = Array.from(set).map(n => Number(n));
            }

            const customWeightsObj = {};
            for (const [exerciseId, weights] of this.customWeights.entries()) {
                // weights peut être objet (setIndex->value) ou Map-like ; on suppose objet ici
                customWeightsObj[exerciseId] = weights;
            }

            const progress = {
                week: this.currentWeek,
                day: this.currentDay,
                completedSets: completedSetsObj,
                customWeights: customWeightsObj,
                startTime: this.startTime ? this.startTime.toISOString() : null,
                lastUpdated: new Date().toISOString()
            };

            if (typeof this.storage.saveProgress === 'function') {
                this.storage.saveProgress(progress);
                return;
            }

            // Fallback per-exercise
            for (const exercise of this.exercises) {
                const exerciseId = exercise.id ?? exercise.nom ?? null;
                if (!exerciseId) continue;

                const completed = Array.from(this.completedSets.get(exerciseId) ?? []);
                if (typeof this.storage.saveCompletedSets === 'function') {
                    this.storage.saveCompletedSets(this.currentWeek, this.currentDay, exerciseId, completed);
                }

                const weights = this.customWeights.get(exerciseId) ?? {};
                if (typeof this.storage.saveCustomWeights === 'function') {
                    this.storage.saveCustomWeights(this.currentWeek, this.currentDay, exerciseId, weights);
                }
            }
        } catch (err) {
            console.warn('saveProgress error', err);
        }
    }

    /**
     * Sauvegarde la progression d'un exercice (compatibilité avec l'ancienne API)
     */
    saveProgressForExercise(exerciseId) {
        const completed = this.completedSets.has(exerciseId) ? Array.from(this.completedSets.get(exerciseId)) : [];
        const weights = this.customWeights.get(exerciseId) ?? {};

        if (this.storage) {
            if (typeof this.storage.saveCompletedSets === 'function') {
                this.storage.saveCompletedSets(this.currentWeek, this.currentDay, exerciseId, completed);
            }
            if (typeof this.storage.saveCustomWeights === 'function') {
                this.storage.saveCustomWeights(this.currentWeek, this.currentDay, exerciseId, weights);
            }
            // Also try unified saveProgress if available
            if (typeof this.storage.saveProgress === 'function') {
                this.saveProgress();
            }
        }
    }

    /**
     * Marque une série comme complétée
     */
    completeSet(exerciseId, setIndex) {
        if (!exerciseId || !Number.isInteger(setIndex) || setIndex < 0) return;

        if (!this.completedSets.has(exerciseId)) {
            this.completedSets.set(exerciseId, new Set());
        }

        this.completedSets.get(exerciseId).add(Number(setIndex));
        this.saveProgressForExercise(exerciseId);
        console.log(`✅ Série ${setIndex + 1} complétée pour ${exerciseId}`);
    }

    /**
     * Décoche une série
     */
    uncompleteSet(exerciseId, setIndex) {
        if (!exerciseId || !Number.isInteger(setIndex) || setIndex < 0) return;
        if (!this.completedSets.has(exerciseId)) return;

        this.completedSets.get(exerciseId).delete(Number(setIndex));
        this.saveProgressForExercise(exerciseId);
        console.log(`❌ Série ${setIndex + 1} décochée pour ${exerciseId}`);
    }

    /**
     * Vérifie si une série est complétée
     */
    isSetCompleted(exerciseId, setIndex) {
        if (!exerciseId || !Number.isInteger(setIndex)) return false;
        if (!this.completedSets.has(exerciseId)) return false;
        return this.completedSets.get(exerciseId).has(Number(setIndex));
    }

    /**
     * Modifie le poids d'une série
     */
    updateWeight(exerciseId, setIndex, newWeight) {
        if (!exerciseId) return;
        const w = Number(newWeight);
        if (!Number.isFinite(w)) return;

        if (!this.customWeights.has(exerciseId)) {
            this.customWeights.set(exerciseId, {});
        }

        const weights = this.customWeights.get(exerciseId);
        weights[Number(setIndex)] = w;
        this.customWeights.set(exerciseId, weights);

        this.saveProgressForExercise(exerciseId);
        console.log(`💪 Poids modifié: ${exerciseId} série ${Number(setIndex) + 1} → ${w}kg`);
    }

    /**
     * Récupère le poids d'une série
     */
    getWeight(exerciseId, setIndex, defaultWeight = 0) {
        if (!exerciseId) return defaultWeight;
        const weights = this.customWeights.get(exerciseId);
        if (!weights) return defaultWeight;
        return weights[Number(setIndex)] !== undefined ? weights[Number(setIndex)] : defaultWeight;
    }

    /**
     * Termine la séance
     */
    end() {
        this.endTime = new Date();
        const duration = Math.floor((this.endTime - (this.startTime || this.endTime)) / 1000);

        const stats = this.getStats();
        console.log(`🏁 Séance terminée en ${this.formatDuration(duration)}`);
        console.log('📊 Statistiques:', stats);

        // Save final progress snapshot
        this.saveProgress();

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
            const exerciseId = exercise.id ?? exercise.nom ?? null;
            const sets = Array.isArray(exercise.series) ? exercise.series : (Array.isArray(exercise.sets) ? exercise.sets : []);
            totalSets += sets.length;

            sets.forEach((set, index) => {
                if (this.isSetCompleted(exerciseId, index)) {
                    completedSetsCount++;

                    const weight = this.getWeight(exerciseId, index, set.poids ?? set.weight ?? 0);
                    const reps = Number.parseInt(set.reps ?? set.repetitions ?? 0, 10) || 0;
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
     * Réinitialise la séance (internals + storage)
     */
    reset() {
        this.completedSets.clear();
        this.customWeights.clear();

        // Effacer les données sauvegardées (per-exercise if available)
        if (Array.isArray(this.exercises)) {
            this.exercises.forEach(exercise => {
                const exerciseId = exercise.id ?? exercise.nom ?? null;
                if (!exerciseId) return;
                if (typeof this.storage.saveCompletedSets === 'function') {
                    this.storage.saveCompletedSets(this.currentWeek, this.currentDay, exerciseId, []);
                }
                if (typeof this.storage.saveCustomWeights === 'function') {
                    this.storage.saveCustomWeights(this.currentWeek, this.currentDay, exerciseId, {});
                }
            });
        }

        // Also save unified empty progress if supported
        this.saveProgress();

        console.log('🔄 Séance réinitialisée');
    }

    /**
     * Récupère l'état actuel de la session sous forme sérialisable
     */
    getState() {
        const completed = {};
        for (const [id, set] of this.completedSets.entries()) {
            completed[id] = Array.from(set);
        }
        const customWeights = {};
        for (const [id, weights] of this.customWeights.entries()) {
            customWeights[id] = weights;
        }

        return {
            week: this.currentWeek,
            day: this.currentDay,
            completedSets: completed,
            customWeights,
            startTime: this.startTime ? this.startTime.toISOString() : null,
            stats: this.getStats()
        };
    }
}
