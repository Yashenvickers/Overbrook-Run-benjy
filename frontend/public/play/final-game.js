// Final Game - Enhanced Game with Backend Integration

// Backend API Integration
class GameAPI {
    constructor() {
        this.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
        this.apiURL = `${this.baseURL}/api/game`;
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async submitScore(scoreData) {
        try {
            const response = await fetch(`${this.apiURL}/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...scoreData,
                    session_id: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting score:', error);
            return null;
        }
    }

    async getLeaderboard(timeframe = 'all', limit = 10) {
        try {
            const response = await fetch(`${this.apiURL}/leaderboard?timeframe=${timeframe}&limit=${limit}&session_id=${this.sessionId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    }

    async getGameStats() {
        try {
            const response = await fetch(`${this.apiURL}/stats`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting game stats:', error);
            return null;
        }
    }

    async trackAnalytics(eventType, data = {}) {
        try {
            await fetch(`${this.apiURL}/analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_type: eventType,
                    session_id: this.sessionId,
                    data: data
                })
            });
        } catch (error) {
            console.error('Error tracking analytics:', error);
        }
    }

    async getPlayerRank() {
        try {
            const response = await fetch(`${this.apiURL}/player/${this.sessionId}/rank`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting player rank:', error);
            return null;
        }
    }
}

// Enhanced Main Game Class with Backend Integration
class FinalGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = new EnhancedGameState();
        this.input = new InputManager();
        this.api = new GameAPI();
        
        this.player = new EnhancedPlayer(CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
        this.enemies = [];
        this.projectiles = [];
        this.pickups = [];
        this.enemyProjectiles = [];
        
        this.lastTime = 0;
        this.lastEnemySpawn = 0;
        this.lastPickupSpawn = 0;
        this.lastShotTime = 0;
        this.waveTimer = 0;
        
        // Visual effects
        this.particles = [];
        this.screenShake = 0;
        
        this.setupUI();
        this.showTutorial();
        this.loadLeaderboard();
        
        // Start game loop
        this.gameLoop();
    }

    setupUI() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('muteBtn').addEventListener('click', () => {
            this.toggleMute();
        });

        // Overlay buttons
        document.getElementById('skipTutorial').addEventListener('click', () => {
            this.hideTutorial();
        });

        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareScore();
        });

        document.getElementById('shareScoreBtn').addEventListener('click', () => {
            this.shareScore();
        });

        // Social links
        document.getElementById('spotifyBtn').href = 'https://open.spotify.com/artist/your-artist-id';
        document.getElementById('youtubeBtn').href = 'https://youtube.com/@your-channel';

        // Add leaderboard button to game over screen
        this.addLeaderboardButton();
    }

    addLeaderboardButton() {
        const gameOverButtons = document.querySelector('#gameOverOverlay .overlay-buttons');
        const leaderboardBtn = document.createElement('button');
        leaderboardBtn.className = 'control-btn';
        leaderboardBtn.id = 'leaderboardBtn';
        leaderboardBtn.textContent = 'Leaderboard';
        leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        gameOverButtons.appendChild(leaderboardBtn);
    }

    async showLeaderboard() {
        const leaderboard = await this.api.getLeaderboard();
        const stats = await this.api.getGameStats();
        
        // Create leaderboard overlay
        this.showLeaderboardOverlay(leaderboard, stats);
    }

    showLeaderboardOverlay(leaderboard, stats) {
        // Remove existing leaderboard overlay if present
        const existing = document.getElementById('leaderboardOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.id = 'leaderboardOverlay';
        overlay.style.display = 'flex';

        overlay.innerHTML = `
            <div class="overlay-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <h2>Leaderboard</h2>
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <h3 style="color: var(--amber); font-size: 1.2rem; margin-bottom: 10px;">Top Players</h3>
                        <div id="leaderboardList" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">
                            ${leaderboard.map(entry => `
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); ${entry.is_current_player ? 'background: rgba(255, 176, 0, 0.2); border-radius: 4px; padding: 8px;' : ''}">
                                    <span>${entry.rank}. ${entry.player_name} ${entry.is_current_player ? '(You)' : ''}</span>
                                    <span>${entry.score.toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${stats ? `
                    <div style="flex: 1;">
                        <h3 style="color: var(--money); font-size: 1.2rem; margin-bottom: 10px;">Game Stats</h3>
                        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; font-size: 14px;">
                            <div>Total Games: ${stats.total_games.toLocaleString()}</div>
                            <div>Players: ${stats.total_players.toLocaleString()}</div>
                            <div>Avg Score: ${Math.round(stats.average_score).toLocaleString()}</div>
                            <div>Top Score: ${stats.top_score.toLocaleString()}</div>
                            <div>Enemies Defeated: ${stats.total_enemies_defeated.toLocaleString()}</div>
                            <div>Keys Collected: ${stats.total_pickups.toLocaleString()}</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="overlay-buttons">
                    <button class="control-btn" onclick="document.getElementById('leaderboardOverlay').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    async loadLeaderboard() {
        try {
            const leaderboard = await this.api.getLeaderboard('all', 5);
            // You could show a mini leaderboard in the UI here
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }

    showTutorial() {
        const skipTutorial = localStorage.getItem('skipTutorial') === 'true';
        if (!skipTutorial) {
            document.getElementById('tutorialOverlay').style.display = 'flex';
        }
    }

    hideTutorial() {
        document.getElementById('tutorialOverlay').style.display = 'none';
        const dontShowAgain = document.getElementById('dontShowAgain').checked;
        if (dontShowAgain) {
            localStorage.setItem('skipTutorial', 'true');
        }
    }

    async startGame() {
        this.state.gameStarted = true;
        this.state.gamePaused = false;
        this.state.gameOver = false;
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'block';
        
        // Hide all overlays
        document.getElementById('tutorialOverlay').style.display = 'none';
        document.getElementById('pauseOverlay').style.display = 'none';
        document.getElementById('gameOverOverlay').style.display = 'none';
        
        // Track game start
        await this.api.trackAnalytics('game_start', {
            difficulty: 'normal',
            timestamp: Date.now()
        });
    }

    togglePause() {
        if (!this.state.gameStarted || this.state.gameOver) return;
        
        this.state.gamePaused = !this.state.gamePaused;
        
        if (this.state.gamePaused) {
            document.getElementById('pauseOverlay').style.display = 'flex';
        } else {
            document.getElementById('pauseOverlay').style.display = 'none';
        }
    }

    toggleMute() {
        const muted = window.audioManager?.toggleMute();
        this.state.muted = muted;
        const muteBtn = document.getElementById('muteBtn');
        muteBtn.textContent = muted ? '🔇 Audio' : '🔊 Audio';
    }

    restartGame() {
        this.state.reset();
        this.player = new EnhancedPlayer(CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
        this.enemies = [];
        this.projectiles = [];
        this.pickups = [];
        this.enemyProjectiles = [];
        this.particles = [];
        
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('pauseOverlay').style.display = 'none';
        document.getElementById('gameOverOverlay').style.display = 'none';
        
        this.updateUI();
    }

    async gameOver() {
        this.state.gameOver = true;
        this.state.gameStarted = false;
        
        // Submit score to backend
        const playerName = localStorage.getItem('playerName') || 'Anonymous';
        await this.submitScore(playerName);
        
        // Update best score locally
        const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        if (this.state.score > bestScore) {
            localStorage.setItem('bestScore', this.state.score.toString());
        }
        
        // Show game over screen with updated info
        await this.showGameOverScreen();
        
        // Track game end
        await this.api.trackAnalytics('run_end', {
            score: this.state.score,
            duration: this.state.time,
            enemies_defeated: this.state.enemiesDefeated,
            pickups_collected: this.state.totalPickups,
            wave_reached: this.state.wave,
            combo_max: Math.max(...(this.comboHistory || [0]))
        });
    }

    async submitScore(playerName) {
        try {
            const scoreData = {
                player_name: playerName,
                score: this.state.score,
                time_survived: this.state.time,
                enemies_defeated: this.state.enemiesDefeated,
                pickups_collected: this.state.totalPickups,
                combo_max: Math.max(...(this.comboHistory || [0])),
                wave_reached: this.state.wave,
                powerups_used: Array.from(this.state.activePowerups.keys()),
                difficulty: 'normal'
            };

            await this.api.submitScore(scoreData);
        } catch (error) {
            console.error('Failed to submit score:', error);
        }
    }

    async showGameOverScreen() {
        const playerRank = await this.api.getPlayerRank();
        
        document.getElementById('finalScore').textContent = this.state.score.toLocaleString();
        document.getElementById('bestScore').textContent = Math.max(
            this.state.score, 
            parseInt(localStorage.getItem('bestScore') || '0')
        ).toLocaleString();
        
        // Add rank information if available
        if (playerRank) {
            const rankElement = document.getElementById('playerRank') || this.createRankElement();
            rankElement.textContent = `Global Rank: #${playerRank.rank} (Top ${playerRank.percentile}%)`;
        }
        
        document.getElementById('gameOverOverlay').style.display = 'flex';
    }

    createRankElement() {
        const gameOverContent = document.querySelector('#gameOverOverlay .overlay-content');
        const rankElement = document.createElement('p');
        rankElement.id = 'playerRank';
        rankElement.style.color = 'var(--amber)';
        rankElement.style.fontWeight = 'bold';
        gameOverContent.insertBefore(rankElement, gameOverContent.querySelector('.overlay-buttons'));
        return rankElement;
    }

    async shareScore() {
        const url = `${window.location.href}?score=${this.state.score}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '56ers — Overbrook Run',
                    text: `I just scored ${this.state.score.toLocaleString()} points in 56ers — Overbrook Run!`,
                    url: url
                });
            } catch (error) {
                // Fallback to clipboard
                this.copyToClipboard(url);
            }
        } else {
            this.copyToClipboard(url);
        }
        
        await this.api.trackAnalytics('share_click', { score: this.state.score });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Score link copied to clipboard!');
        }).catch(() => {
            this.showToast('Unable to copy link');
        });
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--franklin);
            color: var(--cream);
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid var(--amber);
            z-index: 1000;
            font-weight: 600;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    spawnEnemy() {
        const enemyTypes = ['chaser', 'chaser', 'runner', 'shooter', 'tank']; // Weighted spawn
        const waveMultiplier = Math.min(this.state.wave, 10);
        
        // Increase enemy variety with waves
        let availableTypes = ['chaser'];
        if (this.state.wave >= 2) availableTypes.push('runner');
        if (this.state.wave >= 3) availableTypes.push('shooter');
        if (this.state.wave >= 5) availableTypes.push('tank');
        
        const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // Top
                x = Math.random() * CONFIG.canvas.width;
                y = -20;
                break;
            case 1: // Right
                x = CONFIG.canvas.width + 20;
                y = Math.random() * CONFIG.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * CONFIG.canvas.width;
                y = CONFIG.canvas.height + 20;
                break;
            case 3: // Left
                x = -20;
                y = Math.random() * CONFIG.canvas.height;
                break;
        }
        
        let enemy;
        switch(enemyType) {
            case 'shooter':
                enemy = new ShooterEnemy(x, y);
                break;
            case 'tank':
                enemy = new TankEnemy(x, y);
                break;
            case 'runner':
                enemy = new RunnerEnemy(x, y);
                break;
            default:
                enemy = new ChaserEnemy(x, y);
        }
        
        this.enemies.push(enemy);
    }

    spawnPickup() {
        const pickupTypes = ['key', 'key', 'key', 'health', 'shield', 'doublePoints', 'rapidFire', 'lightning'];
        const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
        
        const x = Math.random() * (CONFIG.canvas.width - 50) + 25;
        const y = Math.random() * (CONFIG.canvas.height - 50) + 25;
        
        this.pickups.push(new EnhancedPickup(x, y, type));
    }

    createParticle(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                color: color,
                life: 1.0,
                decay: 0.02
            });
        }
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            particle.life -= particle.decay;
            return particle.life > 0;
        });
    }

    drawParticles(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            ctx.restore();
        });
    }

    update(deltaTime) {
        if (!this.state.gameStarted || this.state.gamePaused || this.state.gameOver) return;

        const currentTime = Date.now();
        this.state.time += deltaTime;
        this.waveTimer += deltaTime;

        // Wave progression
        if (this.waveTimer > 30000) { // New wave every 30 seconds
            this.state.wave++;
            this.waveTimer = 0;
            this.showToast(`Wave ${this.state.wave}!`);
        }

        // Update player
        const input = this.input.getInput();
        this.player.update(deltaTime, input, this.state);

        // Handle shooting
        const shootCooldown = this.state.hasPowerup('rapidFire') ? 100 : 200;
        if (input.shoot && currentTime - this.lastShotTime > shootCooldown) {
            let direction;
            
            if (this.input.joystick.active) {
                direction = new Vector2(this.input.joystick.x, this.input.joystick.y).normalize();
            } else {
                direction = new Vector2(
                    this.input.mouse.x - this.player.position.x,
                    this.input.mouse.y - this.player.position.y
                ).normalize();
            }
            
            if (direction.magnitude() > 0) {
                this.projectiles.push(new EnhancedProjectile(
                    this.player.position.x,
                    this.player.position.y,
                    direction,
                    this.state.activePowerups
                ));
                this.lastShotTime = currentTime;
                window.audioManager?.play('shoot');
            }
        }

        // Update entities
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player);
            
            // Update enemy projectiles for shooters
            if (enemy.projectiles) {
                this.enemyProjectiles.push(...enemy.projectiles.filter(p => p.active));
                enemy.projectiles = [];
            }
        });
        
        this.projectiles.forEach(projectile => projectile.update(deltaTime));
        this.pickups.forEach(pickup => pickup.update(deltaTime));
        this.enemyProjectiles.forEach(projectile => projectile.update(deltaTime));
        
        // Update particles and effects
        this.updateParticles(deltaTime);
        this.state.updatePowerups();
        
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake -= deltaTime / 1000;
        }

        // Spawn enemies (increased with waves)
        const spawnRate = Math.max(800, CONFIG.enemies.chaser.speed - (this.state.wave * 100));
        if (currentTime - this.lastEnemySpawn > spawnRate) {
            this.spawnEnemy();
            this.lastEnemySpawn = currentTime;
        }

        // Spawn pickups
        if (currentTime - this.lastPickupSpawn > CONFIG.powerups.spawnRate) {
            this.spawnPickup();
            this.lastPickupSpawn = currentTime;
        }

        // Check collisions
        this.checkCollisions();

        // Clean up inactive entities
        this.enemies = this.enemies.filter(e => e.active);
        this.projectiles = this.projectiles.filter(p => p.active);
        this.pickups = this.pickups.filter(p => p.active);
        this.enemyProjectiles = this.enemyProjectiles.filter(p => p.active);

        // Combo decay
        if (currentTime - this.state.lastComboTime > CONFIG.game.comboDecay) {
            this.state.combo = 0;
        }

        // Update UI
        this.updateUI();
    }

    checkCollisions() {
        // Player vs enemies
        this.enemies.forEach(enemy => {
            if (this.player.checkCollision(enemy)) {
                if (this.player.takeDamage(1)) {
                    this.createParticle(this.player.position.x, this.player.position.y, '#FF4444', 8);
                    this.screenShake = 0.5;
                    this.state.combo = 0;
                    
                    // Check for game over
                    if (this.player.health <= 0) {
                        this.state.lives--;
                        if (this.state.lives <= 0) {
                            this.gameOver();
                        } else {
                            // Reset player
                            this.player = new EnhancedPlayer(CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
                        }
                    }
                }
                enemy.active = false;
            }
        });

        // Player vs enemy projectiles
        this.enemyProjectiles.forEach(projectile => {
            if (this.player.checkCollision(projectile)) {
                if (this.player.takeDamage(1)) {
                    this.createParticle(this.player.position.x, this.player.position.y, '#FF4444', 6);
                    this.screenShake = 0.3;
                }
                projectile.active = false;
            }
        });

        // Projectiles vs enemies
        this.projectiles.forEach(projectile => {
            this.enemies.forEach(enemy => {
                if (projectile.checkCollision(enemy)) {
                    if (!projectile.piercing) {
                        projectile.active = false;
                    }
                    
                    enemy.takeDamage(projectile.damage);
                    this.createParticle(enemy.position.x, enemy.position.y, '#FFB000', 4);
                    window.audioManager?.play('enemyHit');
                    
                    if (!enemy.active) {
                        this.state.enemiesDefeated++;
                        this.addScore(enemy.points);
                        this.createParticle(enemy.position.x, enemy.position.y, '#0B8A53', 8);
                    }
                }
            });
        });

        // Player vs pickups
        this.pickups.forEach(pickup => {
            if (this.player.checkCollision(pickup)) {
                pickup.active = false;
                this.collectPickup(pickup);
            }
        });
    }

    collectPickup(pickup) {
        this.state.totalPickups++;
        this.createParticle(pickup.position.x, pickup.position.y, pickup.color, 6);
        window.audioManager?.play('pickup');
        
        switch (pickup.type) {
            case 'key':
                this.state.combo++;
                this.state.lastComboTime = Date.now();
                
                const basePoints = 50;
                const comboMultiplier = Math.min(this.state.combo, 10);
                const points = basePoints * comboMultiplier;
                
                this.addScore(points);
                window.audioManager?.play('combo');
                break;
                
            case 'health':
                this.player.heal(20);
                break;
                
            case 'shield':
                this.state.addActivePowerup('shield', CONFIG.powerups.types.shield);
                this.showToast('Shield Active!');
                break;
                
            case 'doublePoints':
                this.state.addActivePowerup('doublePoints', CONFIG.powerups.types.doublePoints);
                this.showToast('Double Points!');
                break;
                
            case 'rapidFire':
                this.state.addActivePowerup('rapidFire', CONFIG.powerups.types.rapidFire);
                this.showToast('Rapid Fire!');
                break;
                
            case 'lightning':
                this.state.addActivePowerup('lightning', CONFIG.powerups.types.lightning);
                this.showToast('Lightning Power!');
                break;
        }
        
        window.audioManager?.play('powerup');
    }

    addScore(points) {
        let finalPoints = points;
        
        if (this.state.hasPowerup('doublePoints')) {
            finalPoints *= 2;
        }
        
        this.state.score += finalPoints;
    }

    updateUI() {
        document.getElementById('score').textContent = this.state.score.toLocaleString();
        document.getElementById('lives').textContent = this.state.lives;
        document.getElementById('combo').textContent = this.state.combo;
        
        const minutes = Math.floor(this.state.time / 60000);
        const seconds = Math.floor((this.state.time % 60000) / 1000);
        document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Show active powerups
        const activePowerups = Array.from(this.state.activePowerups.keys());
        document.getElementById('powerup').textContent = activePowerups.length > 0 ? activePowerups.join(', ') : 'None';
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0A0A0A';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Apply screen shake
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake * 10;
            const shakeY = (Math.random() - 0.5) * this.screenShake * 10;
            this.ctx.translate(shakeX, shakeY);
        }

        // Draw enhanced background with parallax
        this.drawEnhancedBackground();

        // Draw entities with z-ordering
        this.pickups.forEach(pickup => pickup.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        this.enemyProjectiles.forEach(projectile => projectile.draw(this.ctx));
        this.player.draw(this.ctx);
        
        // Draw particle effects
        this.drawParticles(this.ctx);

        // Reset transform
        if (this.screenShake > 0) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    drawEnhancedBackground() {
        const ctx = this.ctx;
        
        // Animated street grid with depth
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        
        const offset = (Date.now() / 1000) % 1;
        
        // Vertical lines with animation
        for (let x = -80; x < CONFIG.canvas.width + 80; x += 80) {
            const animatedX = x + offset * 20;
            ctx.beginPath();
            ctx.moveTo(animatedX, 0);
            ctx.lineTo(animatedX, CONFIG.canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines with animation  
        for (let y = -80; y < CONFIG.canvas.height + 80; y += 80) {
            const animatedY = y + offset * 20;
            ctx.beginPath();
            ctx.moveTo(0, animatedY);
            ctx.lineTo(CONFIG.canvas.width, animatedY);
            ctx.stroke();
        }

        // Enhanced building silhouettes with windows
        this.drawBuildings(ctx);
        
        // Street details
        this.drawStreetDetails(ctx);
    }

    drawBuildings(ctx) {
        // Building 1
        ctx.fillStyle = '#0E1A1A';
        ctx.fillRect(100, 100, 60, 80);
        
        // Windows
        ctx.fillStyle = '#FFB000';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                if (Math.random() > 0.7) { // Some windows are lit
                    ctx.fillRect(110 + i * 15, 110 + j * 15, 8, 8);
                }
            }
        }

        // Building 2
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(300, 150, 80, 60);
        
        // Building 3
        ctx.fillStyle = '#16213e';
        ctx.fillRect(500, 120, 70, 70);
        
        // Building 4
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(650, 180, 50, 50);
    }

    drawStreetDetails(ctx) {
        // Street lamps
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(200, 300, 4, 30);
        ctx.fillRect(400, 200, 4, 30);
        ctx.fillRect(600, 400, 4, 30);
        
        // Light glow
        ctx.fillStyle = '#FFB000';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(202, 295, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(402, 195, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(602, 395, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Replace the basic game with enhanced version
    window.game = new FinalGame();
    console.log('🎮 56ers — Overbrook Run Enhanced Edition loaded!');
});