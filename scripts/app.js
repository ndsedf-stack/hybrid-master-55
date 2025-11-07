<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#0A0E14">
  
  <title>ðŸ† Hybrid Master 51</title>
  
  <!-- iOS App Icons -->
  <link rel="apple-touch-icon" sizes="180x180" href="icon-180.png">
  
  <!-- Styles -->
  <link rel="stylesheet" href="styles/01-reset.css">
  <link rel="stylesheet" href="styles/02-variables.css">
  <link rel="stylesheet" href="styles/03-base.css">
  <link rel="stylesheet" href="styles/04-layout.css">
  <link rel="stylesheet" href="styles/05-components.css">
  <link rel="stylesheet" href="styles/08-responsive.css">
</head>
<body>
  
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <div class="header-title">
        <span class="header-icon">ðŸ†</span>
        <span>Hybrid Master 51</span>
      </div>
      <div class="header-actions">
        <button class="btn-icon btn-secondary">
          âš™ï¸
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content" id="app">
    <div class="container">
      
      <!-- Week Navigation -->
      <div class="week-navigation slide-up">
        <button class="week-nav-btn" id="prev-week">
          â†
        </button>
        <div class="week-info" id="week-display">
          <div class="week-current">Semaine 1/26</div>
          <div class="week-date">Bloc 1 â€¢ Tempo 3-1-2</div>
        </div>
        <button class="week-nav-btn" id="next-week">
          â†’
        </button>
      </div>

      <!-- Timer Section -->
      <div class="timer-section" style="display: none;">
        <div id="timer-display" class="timer-display">00:00</div>
        <div class="timer-controls">
          <button id="timer-start" class="btn-primary">DÃ©marrer</button>
          <button id="timer-pause" class="btn-secondary">Pause</button>
          <button id="timer-reset" class="btn-secondary">RÃ©initialiser</button>
        </div>
      </div>

      <!-- Workout Container (sera rempli dynamiquement) -->
      <div id="workout-container">
        <!-- Le contenu sera gÃ©nÃ©rÃ© par JavaScript -->
        <div class="loading-message">
          <p>Chargement du programme...</p>
        </div>
      </div>

    </div>
  </main>

  <!-- Bottom Navigation -->
  <nav class="bottom-nav">
    <div class="bottom-nav-content">
      <div class="nav-item active">
        <span class="nav-item-icon">ðŸ’ª</span>
        <span class="nav-item-label">SÃ©ance</span>
      </div>
      <div class="nav-item">
        <span class="nav-item-icon">ðŸ“Š</span>
        <span class="nav-item-label">Stats</span>
      </div>
      <div class="nav-item">
        <span class="nav-item-icon">ðŸ“ˆ</span>
        <span class="nav-item-label">ProgrÃ¨s</span>
      </div>
      <div class="nav-item">
        <span class="nav-item-icon">ðŸ‘¤</span>
        <span class="nav-item-label">Profil</span>
      </div>
    </div>
  </nav>

  <!-- Scripts -->
  <script src="scripts/core/program-data.js" type="module"></script>
  <script src="scripts/core/progression-engine.js" type="module"></script>
  <script src="scripts/app.js" type="module"></script>
</body>
</html>
