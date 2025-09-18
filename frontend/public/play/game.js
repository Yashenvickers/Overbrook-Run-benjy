// Game Configuration
const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        speed: 150,
        dashSpeed: 300,
        dashCooldown: 1000,
        size: 16
    },
    enemy: {
        speed: 80,
        size: 14,
        spawnRate: 2000
    },
    powerup: {
        spawnRate: 8000,
        duration: 10000
    },
    game: {
        maxLives: 3,
        comboDecay: 3000
    }
};

// Game State
class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.score = 0;
        this.lives = CONFIG.game.maxLives;
        this.combo = 0;
        this.time = 0;
        this.gameStarted = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.powerup = null;
        this.lastComboTime = 0;
        this.muted = true; // Default muted for mobile
    }
}

// Vector2 utility
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y);
        if (length === 0) return new Vector2(0, 0);
        return new Vector2(this.x / length, this.y / length);
    }

    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Game Entities
class Entity {
    constructor(x, y, size, color = '#ffffff') {
        this.position = new Vector2(x, y);
        this.size = size;
        this.color = color;
        this.active = true;
    }

    draw(ctx) {
        if (!this.active) return;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );
    }

    checkCollision(other) {
        if (!this.active || !other.active) return false;
        
        const distance = this.position.distance(other.position);
        return distance < (this.size + other.size) / 2;
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, CONFIG.player.size, '#FFB000');
        this.velocity = new Vector2();
        this.canDash = true;
        this.isDashing = false;
        this.dashEndTime = 0;
    }

    update(deltaTime, input) {
        if (!this.active) return;

        // Movement
        this.velocity = new Vector2();
        if (input.left) this.velocity.x -= 1;
        if (input.right) this.velocity.x += 1;
        if (input.up) this.velocity.y -= 1;
        if (input.down) this.velocity.y += 1;

        this.velocity = this.velocity.normalize();

        // Dash logic
        if (input.dash && this.canDash) {
            this.isDashing = true;
            this.canDash = false;
            this.dashEndTime = Date.now() + 200; // Dash duration
            setTimeout(() => { this.canDash = true; }, CONFIG.player.dashCooldown);
        }

        if (this.isDashing && Date.now() > this.dashEndTime) {
            this.isDashing = false;
        }

        // Apply movement
        const speed = this.isDashing ? CONFIG.player.dashSpeed : CONFIG.player.speed;
        const movement = this.velocity.multiply(speed * deltaTime / 1000);
        this.position = this.position.add(movement);

        // Keep player in bounds
        this.position.x = Math.max(this.size/2, Math.min(CONFIG.canvas.width - this.size/2, this.position.x));
        this.position.y = Math.max(this.size/2, Math.min(CONFIG.canvas.height - this.size/2, this.position.y));
    }

    draw(ctx) {
        if (!this.active) return;

        // Draw Benjy (player sprite)
        ctx.fillStyle = this.isDashing ? '#FFF' : this.color;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );

        // Add simple face
        ctx.fillStyle = '#0A0A0A';
        ctx.fillRect(this.position.x - 3, this.position.y - 3, 2, 2);
        ctx.fillRect(this.position.x + 1, this.position.y - 3, 2, 2);
    }
}

class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, CONFIG.enemy.size, '#1a1a1a');
        this.velocity = new Vector2();
        this.target = null;
    }

    update(deltaTime, target) {
        if (!this.active || !target) return;

        // Move towards player
        const direction = new Vector2(
            target.position.x - this.position.x,
            target.position.y - this.position.y
        ).normalize();

        this.velocity = direction.multiply(CONFIG.enemy.speed);
        const movement = this.velocity.multiply(deltaTime / 1000);
        this.position = this.position.add(movement);
    }

    draw(ctx) {
        if (!this.active) return;

        // Draw hooded figure silhouette
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );

        // Hood
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(
            this.position.x - this.size / 3,
            this.position.y - this.size / 2,
            this.size * 2/3,
            this.size / 3
        );
    }
}

class Projectile extends Entity {
    constructor(x, y, direction) {
        super(x, y, 4, '#0E3A5B');
        this.velocity = direction.multiply(400);
        this.lifetime = 2000; // 2 seconds
        this.createdAt = Date.now();
    }

    update(deltaTime) {
        if (!this.active) return;

        // Check lifetime
        if (Date.now() - this.createdAt > this.lifetime) {
            this.active = false;
            return;
        }

        // Move
        const movement = this.velocity.multiply(deltaTime / 1000);
        this.position = this.position.add(movement);

        // Check bounds
        if (this.position.x < 0 || this.position.x > CONFIG.canvas.width ||
            this.position.y < 0 || this.position.y > CONFIG.canvas.height) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        // Draw "mic blast" projectile
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.strokeStyle = '#61dafb';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class Pickup extends Entity {
    constructor(x, y, type = 'key') {
        super(x, y, 12, '#0B8A53');
        this.type = type;
        this.animationOffset = Math.random() * Math.PI * 2;
    }

    update(deltaTime) {
        if (!this.active) return;
        
        // Floating animation
        this.animationOffset += deltaTime / 1000 * 3;
    }

    draw(ctx) {
        if (!this.active) return;

        const offset = Math.sin(this.animationOffset) * 2;
        
        // Draw Franklin key
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2 + offset,
            this.size,
            this.size
        );

        // Key details
        ctx.fillStyle = '#FFB000';
        ctx.fillRect(
            this.position.x - this.size / 4,
            this.position.y - this.size / 4 + offset,
            this.size / 2,
            this.size / 2
        );
    }
}

// Input Manager
class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, pressed: false };
        this.joystick = { x: 0, y: 0, active: false };
        this.mobile = { shoot: false, dash: false };
        
        this.setupKeyboard();
        this.setupMouse();
        this.setupMobile();
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyP') {
                game.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setupMouse() {
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * (CONFIG.canvas.width / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (CONFIG.canvas.height / rect.height);
        });

        canvas.addEventListener('mousedown', () => {
            this.mouse.pressed = true;
        });

        canvas.addEventListener('mouseup', () => {
            this.mouse.pressed = false;
        });
    }

    setupMobile() {
        const joystick = document.getElementById('joystick');
        const joystickKnob = document.getElementById('joystick-knob');
        const shootBtn = document.getElementById('shootBtn');
        const dashBtn = document.getElementById('dashBtn');

        // Virtual joystick
        let joystickActive = false;
        let joystickCenter = { x: 0, y: 0 };

        const startJoystick = (e) => {
            joystickActive = true;
            const rect = joystick.getBoundingClientRect();
            joystickCenter.x = rect.left + rect.width / 2;
            joystickCenter.y = rect.top + rect.height / 2;
            this.joystick.active = true;
        };

        const moveJoystick = (e) => {
            if (!joystickActive) return;
            
            const touch = e.touches ? e.touches[0] : e;
            const dx = touch.clientX - joystickCenter.x;
            const dy = touch.clientY - joystickCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 25;

            if (distance <= maxDistance) {
                this.joystick.x = dx / maxDistance;
                this.joystick.y = dy / maxDistance;
                joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
            } else {
                this.joystick.x = dx / distance;
                this.joystick.y = dy / distance;
                joystickKnob.style.transform = `translate(${this.joystick.x * maxDistance}px, ${this.joystick.y * maxDistance}px)`;
            }
        };

        const endJoystick = () => {
            joystickActive = false;
            this.joystick.x = 0;
            this.joystick.y = 0;
            this.joystick.active = false;
            joystickKnob.style.transform = 'translate(0px, 0px)';
        };

        joystick.addEventListener('touchstart', startJoystick);
        joystick.addEventListener('mousedown', startJoystick);
        document.addEventListener('touchmove', moveJoystick);
        document.addEventListener('mousemove', moveJoystick);
        document.addEventListener('touchend', endJoystick);
        document.addEventListener('mouseup', endJoystick);

        // Action buttons
        shootBtn.addEventListener('touchstart', () => { this.mobile.shoot = true; });
        shootBtn.addEventListener('mousedown', () => { this.mobile.shoot = true; });
        shootBtn.addEventListener('touchend', () => { this.mobile.shoot = false; });
        shootBtn.addEventListener('mouseup', () => { this.mobile.shoot = false; });

        dashBtn.addEventListener('touchstart', () => { this.mobile.dash = true; });
        dashBtn.addEventListener('mousedown', () => { this.mobile.dash = true; });
        dashBtn.addEventListener('touchend', () => { this.mobile.dash = false; });
        dashBtn.addEventListener('mouseup', () => { this.mobile.dash = false; });
    }

    getInput() {
        return {
            left: this.keys['KeyA'] || this.keys['ArrowLeft'] || this.joystick.x < -0.3,
            right: this.keys['KeyD'] || this.keys['ArrowRight'] || this.joystick.x > 0.3,
            up: this.keys['KeyW'] || this.keys['ArrowUp'] || this.joystick.y < -0.3,
            down: this.keys['KeyS'] || this.keys['ArrowDown'] || this.joystick.y > 0.3,
            shoot: this.mouse.pressed || this.mobile.shoot,
            dash: this.keys['Space'] || this.mobile.dash
        };
    }
}

// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = new GameState();
        this.input = new InputManager();
        
        this.player = new Player(CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
        this.enemies = [];
        this.projectiles = [];
        this.pickups = [];
        
        this.lastTime = 0;
        this.lastEnemySpawn = 0;
        this.lastPickupSpawn = 0;
        
        this.setupUI();
        this.showTutorial();
        
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

        // Social links (mock for now)
        document.getElementById('spotifyBtn').href = '#spotify';
        document.getElementById('youtubeBtn').href = '#youtube';
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

    startGame() {
        this.state.gameStarted = true;
        this.state.gamePaused = false;
        this.state.gameOver = false;
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'block';
        
        // Hide all overlays
        document.getElementById('tutorialOverlay').style.display = 'none';
        document.getElementById('pauseOverlay').style.display = 'none';
        document.getElementById('gameOverOverlay').style.display = 'none';
        
        this.analytics('game_start');
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
        this.state.muted = !this.state.muted;
        const muteBtn = document.getElementById('muteBtn');
        muteBtn.textContent = this.state.muted ? '🔇 Audio' : '🔊 Audio';
    }

    restartGame() {
        this.state.reset();
        this.player = new Player(CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
        this.enemies = [];
        this.projectiles = [];
        this.pickups = [];
        
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('pauseOverlay').style.display = 'none';
        document.getElementById('gameOverOverlay').style.display = 'none';
        
        this.updateUI();
    }

    gameOver() {
        this.state.gameOver = true;
        this.state.gameStarted = false;
        
        // Update best score
        const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        if (this.state.score > bestScore) {
            localStorage.setItem('bestScore', this.state.score.toString());
        }
        
        document.getElementById('finalScore').textContent = this.state.score;
        document.getElementById('bestScore').textContent = Math.max(this.state.score, bestScore);
        document.getElementById('gameOverOverlay').style.display = 'flex';
        
        this.analytics('run_end', { score: this.state.score, duration: this.state.time });
    }

    shareScore() {
        const url = `${window.location.href}?score=${this.state.score}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Score link copied to clipboard!');
        });
        this.analytics('share_click', { score: this.state.score });
    }

    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // Top
                x = Math.random() * CONFIG.canvas.width;
                y = -CONFIG.enemy.size;
                break;
            case 1: // Right
                x = CONFIG.canvas.width + CONFIG.enemy.size;
                y = Math.random() * CONFIG.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * CONFIG.canvas.width;
                y = CONFIG.canvas.height + CONFIG.enemy.size;
                break;
            case 3: // Left
                x = -CONFIG.enemy.size;
                y = Math.random() * CONFIG.canvas.height;
                break;
        }
        
        this.enemies.push(new Enemy(x, y));
    }

    spawnPickup() {
        const x = Math.random() * (CONFIG.canvas.width - 50) + 25;
        const y = Math.random() * (CONFIG.canvas.height - 50) + 25;
        this.pickups.push(new Pickup(x, y));
    }

    update(deltaTime) {
        if (!this.state.gameStarted || this.state.gamePaused || this.state.gameOver) return;

        const currentTime = Date.now();
        this.state.time += deltaTime;

        // Update player
        const input = this.input.getInput();
        this.player.update(deltaTime, input);

        // Handle shooting
        if (input.shoot && currentTime - this.lastShotTime > 200) { // Rate limit
            const direction = new Vector2(
                this.input.mouse.x - this.player.position.x,
                this.input.mouse.y - this.player.position.y
            ).normalize();
            
            if (this.input.joystick.active) {
                // Use joystick direction for mobile
                direction.x = this.input.joystick.x;
                direction.y = this.input.joystick.y;
            }
            
            this.projectiles.push(new Projectile(
                this.player.position.x,
                this.player.position.y,
                direction
            ));
            this.lastShotTime = currentTime;
        }

        // Update entities
        this.enemies.forEach(enemy => enemy.update(deltaTime, this.player));
        this.projectiles.forEach(projectile => projectile.update(deltaTime));
        this.pickups.forEach(pickup => pickup.update(deltaTime));

        // Spawn enemies
        if (currentTime - this.lastEnemySpawn > CONFIG.enemy.spawnRate) {
            this.spawnEnemy();
            this.lastEnemySpawn = currentTime;
        }

        // Spawn pickups
        if (currentTime - this.lastPickupSpawn > CONFIG.powerup.spawnRate) {
            this.spawnPickup();
            this.lastPickupSpawn = currentTime;
        }

        // Check collisions
        this.checkCollisions();

        // Clean up inactive entities
        this.enemies = this.enemies.filter(e => e.active);
        this.projectiles = this.projectiles.filter(p => p.active);
        this.pickups = this.pickups.filter(p => p.active);

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
            if (this.player.checkCollision(enemy) && !this.player.isDashing) {
                this.takeDamage();
                enemy.active = false;
            }
        });

        // Projectiles vs enemies
        this.projectiles.forEach(projectile => {
            this.enemies.forEach(enemy => {
                if (projectile.checkCollision(enemy)) {
                    projectile.active = false;
                    enemy.active = false;
                    this.addScore(100);
                }
            });
        });

        // Player vs pickups
        this.pickups.forEach(pickup => {
            if (this.player.checkCollision(pickup)) {
                pickup.active = false;
                this.collectPickup();
            }
        });
    }

    takeDamage() {
        this.state.lives--;
        this.state.combo = 0;
        
        if (this.state.lives <= 0) {
            this.gameOver();
        }
    }

    collectPickup() {
        this.state.combo++;
        this.state.lastComboTime = Date.now();
        
        const basePoints = 50;
        const comboMultiplier = Math.min(this.state.combo, 10);
        const points = basePoints * comboMultiplier;
        
        this.addScore(points);
    }

    addScore(points) {
        this.state.score += points;
    }

    updateUI() {
        document.getElementById('score').textContent = this.state.score;
        document.getElementById('lives').textContent = this.state.lives;
        document.getElementById('combo').textContent = this.state.combo;
        
        const minutes = Math.floor(this.state.time / 60000);
        const seconds = Math.floor((this.state.time % 60000) / 1000);
        document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('powerup').textContent = this.state.powerup || 'None';
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0A0A0A';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Draw city grid background
        this.drawBackground();

        // Draw entities
        this.pickups.forEach(pickup => pickup.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        this.player.draw(this.ctx);
    }

    drawBackground() {
        const ctx = this.ctx;
        
        // Street grid
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        
        // Vertical lines
        for (let x = 0; x < CONFIG.canvas.width; x += 80) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CONFIG.canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < CONFIG.canvas.height; y += 80) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CONFIG.canvas.width, y);
            ctx.stroke();
        }

        // Add some building silhouettes
        ctx.fillStyle = '#0E1A1A';
        ctx.fillRect(100, 100, 60, 80);
        ctx.fillRect(300, 150, 80, 60);
        ctx.fillRect(500, 120, 70, 70);
        ctx.fillRect(650, 180, 50, 50);
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    analytics(event, data = {}) {
        // Mock analytics - can be replaced with real implementation
        console.log(`Analytics: ${event}`, data);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});