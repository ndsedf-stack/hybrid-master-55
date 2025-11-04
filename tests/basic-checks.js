/**
 * Basic checks and console tests for Hybrid Master 51
 * Run this in the browser console after loading index.html
 */

console.log('🧪 Running Basic Checks and Console Tests...\n');

// Test 1: Check if app instance exists
console.log('1️⃣ Testing App Instance:');
if (typeof app !== 'undefined') {
    console.log('✅ App instance exists');
    console.log('   - Event listeners setup:', app._workoutEventsSetup);
} else {
    console.error('❌ App instance not found');
}

// Test 2: Check Timer Manager
console.log('\n2️⃣ Testing Timer Manager:');
if (typeof app !== 'undefined' && app.timer) {
    const timerState = app.timer.getState();
    console.log('✅ Timer exists');
    console.log('   - State:', timerState);
    console.log('   - Has finished property:', 'isFinished' in timerState);
} else {
    console.error('❌ Timer not found');
}

// Test 3: Check Workout Session
console.log('\n3️⃣ Testing Workout Session:');
if (typeof app !== 'undefined' && app.session) {
    console.log('✅ Session exists');
    console.log('   - Uses Maps for completedSets:', app.session.completedSets instanceof Map);
    console.log('   - Uses Maps for customWeights:', app.session.customWeights instanceof Map);
    console.log('   - Has start method:', typeof app.session.start === 'function');
} else {
    console.error('❌ Session not found');
}

// Test 4: Check ProgramData and RPE
console.log('\n4️⃣ Testing Program Data and RPE:');
try {
    const workout = ProgramData.getWorkout(1, 'dimanche');
    console.log('✅ Program data accessible');
    console.log('   - Workout exercises:', workout.exercises.length);
    
    if (workout.exercises.length > 0) {
        const firstExercise = workout.exercises[0];
        console.log('   - First exercise name:', firstExercise.name);
        console.log('   - First exercise RPE:', firstExercise.rpe);
        
        const allHaveRPE = workout.exercises.every(ex => ex.rpe);
        if (allHaveRPE) {
            console.log('✅ All exercises have RPE values');
        } else {
            console.warn('⚠️  Some exercises missing RPE');
        }
    }
} catch (error) {
    console.error('❌ Error accessing program data:', error.message);
}

// Test 5: Event Listener Tests
console.log('\n5️⃣ Testing Event Listeners:');
try {
    console.log('Testing start-rest-timer event...');
    document.dispatchEvent(new CustomEvent('start-rest-timer', {
        detail: { seconds: 3 }
    }));
    console.log('✅ start-rest-timer event dispatched');
    
    console.log('Testing set-completed event...');
    document.dispatchEvent(new CustomEvent('set-completed', {
        detail: { exerciseId: 'test_ex1', setIndex: 0, completed: true }
    }));
    console.log('✅ set-completed event dispatched');
    
    console.log('Testing weight-changed event...');
    document.dispatchEvent(new CustomEvent('weight-changed', {
        detail: { exerciseId: 'test_ex1', setIndex: 0, newWeight: 50 }
    }));
    console.log('✅ weight-changed event dispatched');
} catch (error) {
    console.error('❌ Event listener error:', error.message);
}

// Test 6: DOM Elements
console.log('\n6️⃣ Testing DOM Elements:');
const requiredIds = [
    'app', 'workout-container', 'week-display',
    'prev-week', 'next-week',
    'timer-display', 'timer-start', 'timer-pause', 'timer-reset'
];

let missingElements = [];
requiredIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) {
        missingElements.push(id);
    }
});

if (missingElements.length === 0) {
    console.log('✅ All required DOM elements present');
} else {
    console.error('❌ Missing DOM elements:', missingElements);
}

// Test 7: Notification Permission
console.log('\n7️⃣ Testing Notification Support:');
if ('Notification' in window) {
    console.log('✅ Notifications supported');
    console.log('   - Permission:', Notification.permission);
} else {
    console.warn('⚠️  Notifications not supported');
}

// Test 8: Unicode/UTF-8
console.log('\n8️⃣ Testing Unicode/UTF-8:');
const unicodeElements = {
    prevBtn: document.getElementById('prev-week')?.textContent?.includes('◀'),
    nextBtn: document.getElementById('next-week')?.textContent?.includes('▶'),
    startBtn: document.getElementById('timer-start')?.textContent?.includes('▶️'),
    pauseBtn: document.getElementById('timer-pause')?.textContent?.includes('⏸️'),
    resetBtn: document.getElementById('timer-reset')?.textContent?.includes('🔄'),
    title: document.querySelector('.app-title')?.textContent?.includes('💪')
};

const unicodeOK = Object.values(unicodeElements).every(v => v === true);
if (unicodeOK) {
    console.log('✅ All Unicode symbols display correctly');
} else {
    console.warn('⚠️  Some Unicode symbols may be missing:', unicodeElements);
}

console.log('\n' + '='.repeat(50));
console.log('🎉 Basic Checks Complete!');
console.log('='.repeat(50));
