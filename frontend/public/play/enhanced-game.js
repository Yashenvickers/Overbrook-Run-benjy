// Enhanced Game Configuration
const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        speed: 150,
        dashSpeed: 300,
        dashCooldown: 1000,
        size: 16,
        maxHealth: 100,
        invulnerabilityTime: 1500
    },
    enemies: {
        chaser: { speed: 80, size: 14, health: 1, points: 100, color: '#1a1a1a' },
        shooter: { speed: 60, size: 16, health: 2, points: 150, color: '#2a2a2a', shootInterval: 2000 },
        tank: { speed: 40, size: 20, health: 3, points: 200, color: '#3a3a3a' },
        runner: { speed: 120, size: 12, health: 1, points: 80, color: '#0a0a0a' }
    },
    powerups: {
        spawnRate: 8000,
        duration: 10000,
        types: {
            shield: { color: '#0E3A5B', duration: 15000 },
            doublePoints: { color: '#0B8A53', duration: 12000 },
            rapidFire: { color: '#FFB000', duration: 8000 },
            lightning: { color: '#61dafb', uses: 3 }
        }
    },
    game: {
        maxLives: 3,
        comboDecay: 3000,
        waveSystem: true,
        streetBuzzInterval: 60000
    },
    audio: {
        masterVolume: 0.3,
        sfxVolume: 0.5,
        musicVolume: 0.2
    }
};

// Enhanced Audio System
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.music = null;
        this.muted = true;
        this.masterVolume = CONFIG.audio.masterVolume;
        this.initAudio();
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.loadSounds();
        } catch (error) {
            console.log('Audio initialization failed:', error);
        }
    }

    async loadSounds() {
        // Create simple procedural sounds
        this.sounds = {
            shoot: this.createTone(800, 0.1, 'square'),
            hit: this.createTone(400, 0.2, 'sawtooth'),
            pickup: this.createTone(1200, 0.15, 'sine'),
            powerup: this.createTone(1600, 0.3, 'triangle'),
            dash: this.createNoise(0.1),
            enemyHit: this.createTone(200, 0.3, 'sawtooth'),
            gameOver: this.createTone(150, 1.0, 'square'),
            combo: this.createTone(2000, 0.1, 'sine')
        };
    }

    createTone(frequency, duration, type = 'sine') {
        return {
            frequency,
            duration,
            type,
            play: () => {
                if (this.muted || !this.audioContext) return;

                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = type;

                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * CONFIG.audio.sfxVolume, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }
        };
    }

    createNoise(duration) {
        return {
            duration,
            play: () => {
                if (this.muted || !this.audioContext) return;

                const bufferSize = this.audioContext.sampleRate * duration;
                const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const data = buffer.getChannelData(0);

                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }

                const source = this.audioContext.createBufferSource();
                const gainNode = this.audioContext.createGain();

                source.buffer = buffer;
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                gainNode.gain.setValueAtTime(this.masterVolume * CONFIG.audio.sfxVolume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

                source.start();
            }
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

// Enhanced Game State
class EnhancedGameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.score = 0;
        this.lives = CONFIG.game.maxLives;
        this.health = CONFIG.player.maxHealth;
        this.combo = 0;
        this.time = 0;
        this.wave = 1;
        this.gameStarted = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.activePowerups = new Map();
        this.lastComboTime = 0;
        this.lastStreetBuzz = 0;
        this.enemiesDefeated = 0;
        this.totalPickups = 0;
        this.muted = true;
        this.playerInvulnerable = false;
        this.invulnerabilityEndTime = 0;
    }

    addActivePowerup(type, config) {
        this.activePowerups.set(type, {
            ...config,
            startTime: Date.now(),
            endTime: Date.now() + config.duration
        });
    }

    updatePowerups() {
        const now = Date.now();
        for (const [type, powerup] of this.activePowerups) {
            if (now > powerup.endTime || (powerup.uses !== undefined && powerup.uses <= 0)) {
                this.activePowerups.delete(type);
            }
        }
    }

    hasPowerup(type) {
        return this.activePowerups.has(type);
    }

    usePowerup(type) {
        const powerup = this.activePowerups.get(type);
        if (powerup && powerup.uses !== undefined) {
            powerup.uses--;
            if (powerup.uses <= 0) {
                this.activePowerups.delete(type);
            }
        }
    }
}

// Enhanced Vector2 utility
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
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

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

// Enhanced Entity Base Class
class Entity {
    constructor(x, y, size, color = '#ffffff') {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2();
        this.size = size;
        this.color = color;
        this.active = true;
        this.health = 1;
        this.maxHealth = 1;
        this.animationTime = 0;
        this.hitFlashTime = 0;
    }

    update(deltaTime) {
        if (!this.active) return;
        
        this.animationTime += deltaTime / 1000;
        
        if (this.hitFlashTime > 0) {
            this.hitFlashTime -= deltaTime;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        
        const flashColor = this.hitFlashTime > 0 ? '#ffffff' : this.color;
        ctx.fillStyle = flashColor;
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

    takeDamage(amount) {
        this.health -= amount;
        this.hitFlashTime = 200; // Flash for 200ms
        if (this.health <= 0) {
            this.active = false;
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}

// Enhanced Player Class
class EnhancedPlayer extends Entity {
    constructor(x, y) {
        super(x, y, CONFIG.player.size, '#FFB000');
        this.maxHealth = CONFIG.player.maxHealth;
        this.health = this.maxHealth;
        this.canDash = true;
        this.isDashing = false;
        this.dashEndTime = 0;
        this.lastShotTime = 0;
        this.invulnerable = false;
        this.invulnerabilityEndTime = 0;
        this.walkCycle = 0;
    }

    update(deltaTime, input, gameState) {
        super.update(deltaTime);
        
        if (!this.active) return;

        // Handle invulnerability
        if (this.invulnerable && Date.now() > this.invulnerabilityEndTime) {
            this.invulnerable = false;
            gameState.playerInvulnerable = false;
        }

        // Movement
        this.velocity = new Vector2();
        if (input.left) this.velocity.x -= 1;
        if (input.right) this.velocity.x += 1;
        if (input.up) this.velocity.y -= 1;
        if (input.down) this.velocity.y += 1;

        this.velocity = this.velocity.normalize();

        // Update walk animation
        if (this.velocity.magnitude() > 0) {
            this.walkCycle += deltaTime / 1000 * 8; // 8 cycles per second
        }

        // Dash logic
        if (input.dash && this.canDash) {
            this.isDashing = true;
            this.canDash = false;
            this.dashEndTime = Date.now() + 200;
            setTimeout(() => { this.canDash = true; }, CONFIG.player.dashCooldown);
            window.audioManager?.play('dash');
        }

        if (this.isDashing && Date.now() > this.dashEndTime) {
            this.isDashing = false;
        }

        // Apply movement with powerup effects
        let speed = CONFIG.player.speed;
        if (gameState.hasPowerup('rapidFire')) {
            speed *= 1.2; // 20% speed boost with rapid fire
        }
        
        if (this.isDashing) {
            speed = CONFIG.player.dashSpeed;
            this.invulnerable = true; // Invulnerable while dashing
        }

        const movement = this.velocity.multiply(speed * deltaTime / 1000);
        this.position = this.position.add(movement);

        // Keep player in bounds
        this.position.x = Math.max(this.size/2, Math.min(CONFIG.canvas.width - this.size/2, this.position.x));
        this.position.y = Math.max(this.size/2, Math.min(CONFIG.canvas.height - this.size/2, this.position.y));
    }

    draw(ctx) {
        if (!this.active) return;

        // Draw player with enhanced sprite
        const flashColor = this.hitFlashTime > 0 ? '#ffffff' : 
                          this.isDashing ? '#FFF' : 
                          this.invulnerable ? '#FFB000' : this.color;
        
        // Draw body
        ctx.fillStyle = flashColor;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );

        // Draw face
        ctx.fillStyle = '#0A0A0A';
        const eyeOffset = Math.sin(this.walkCycle) * 1;
        ctx.fillRect(this.position.x - 4, this.position.y - 4 + eyeOffset, 2, 2);
        ctx.fillRect(this.position.x + 2, this.position.y - 4 + eyeOffset, 2, 2);
        
        // Draw mouth
        ctx.fillRect(this.position.x - 2, this.position.y + 1, 4, 1);

        // Draw health bar
        this.drawHealthBar(ctx);

        // Draw powerup indicators
        this.drawPowerupIndicators(ctx);
    }

    drawHealthBar(ctx) {
        const barWidth = this.size + 4;
        const barHeight = 3;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size / 2 - 8;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.6 ? '#0B8A53' : 
                           healthPercent > 0.3 ? '#FFB000' : '#FF4444';
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }

    drawPowerupIndicators(ctx) {
        // Draw small indicators around player for active powerups
        const powerups = window.game?.state?.activePowerups;
        if (!powerups) return;

        let index = 0;
        for (const [type, powerup] of powerups) {
            const angle = (index * Math.PI * 2) / powerups.size;
            const radius = this.size + 8;
            const x = this.position.x + Math.cos(angle) * radius;
            const y = this.position.y + Math.sin(angle) * radius;

            ctx.fillStyle = CONFIG.powerups.types[type]?.color || '#FFF';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();

            index++;
        }
    }

    takeDamage(amount) {
        if (this.invulnerable || this.isDashing) return false;

        super.takeDamage(amount);
        this.invulnerable = true;
        this.invulnerabilityEndTime = Date.now() + CONFIG.player.invulnerabilityTime;
        window.audioManager?.play('hit');
        return true;
    }
}

// Enhanced Enemy Classes
class ChaserEnemy extends Entity {
    constructor(x, y) {
        const config = CONFIG.enemies.chaser;
        super(x, y, config.size, config.color);
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.points = config.points;
        this.type = 'chaser';
    }

    update(deltaTime, target) {
        super.update(deltaTime);
        if (!this.active || !target) return;

        // Move towards player
        const direction = new Vector2(
            target.position.x - this.position.x,
            target.position.y - this.position.y
        ).normalize();

        this.velocity = direction.multiply(this.speed);
        const movement = this.velocity.multiply(deltaTime / 1000);
        this.position = this.position.add(movement);
    }

    draw(ctx) {
        if (!this.active) return;

        const flashColor = this.hitFlashTime > 0 ? '#ffffff' : this.color;
        
        // Draw hooded figure
        ctx.fillStyle = flashColor;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );

        // Draw hood
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(
            this.position.x - this.size / 3,
            this.position.y - this.size / 2,
            this.size * 2/3,
            this.size / 3
        );
    }
}

class ShooterEnemy extends Entity {
    constructor(x, y) {
        const config = CONFIG.enemies.shooter;
        super(x, y, config.size, config.color);
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.points = config.points;
        this.type = 'shooter';
        this.lastShotTime = 0;
        this.shootInterval = config.shootInterval;
        this.projectiles = [];
    }

    update(deltaTime, target) {
        super.update(deltaTime);
        if (!this.active || !target) return;

        // Move towards player but maintain distance
        const direction = new Vector2(
            target.position.x - this.position.x,
            target.position.y - this.position.y
        );
        const distance = direction.magnitude();
        
        if (distance > 150) {
            // Move closer
            this.velocity = direction.normalize().multiply(this.speed);
        } else if (distance < 100) {
            // Move away
            this.velocity = direction.normalize().multiply(-this.speed * 0.5);
        } else {
            // Circle strafe
            const perpendicular = new Vector2(-direction.y, direction.x).normalize();
            this.velocity = perpendicular.multiply(this.speed * 0.7);
        }

        const movement = this.velocity.multiply(deltaTime / 1000);
        this.position = this.position.add(movement);

        // Shooting logic
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime > this.shootInterval && distance < 200) {
            this.shoot(target);
            this.lastShotTime = currentTime;
        }

        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update(deltaTime);
            return projectile.active;
        });
    }

    shoot(target) {
        const direction = new Vector2(
            target.position.x - this.position.x,
            target.position.y - this.position.y
        ).normalize();

        this.projectiles.push(new EnemyProjectile(
            this.position.x,
            this.position.y,
            direction
        ));
    }

    draw(ctx) {
        if (!this.active) return;

        const flashColor = this.hitFlashTime > 0 ? '#ffffff' : this.color;
        
        // Draw shooter enemy
        ctx.fillStyle = flashColor;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );

        // Add weapon indicator
        ctx.fillStyle = '#444';
        ctx.fillRect(
            this.position.x - 2,
            this.position.y - this.size / 2 - 4,
            4,
            6
        );

        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.draw(ctx));
    }
}

class TankEnemy extends Entity {
    constructor(x, y) {
        const config = CONFIG.enemies.tank;
        super(x, y, config.size, config.color);
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.points = config.points;
        this.type = 'tank';
        this.chargeTime = 0;
        this.isCharging = false;
    }

    update(deltaTime, target) {
        super.update(deltaTime);
        if (!this.active || !target) return;

        const direction = new Vector2(
            target.position.x - this.position.x,
            target.position.y - this.position.y
        );
        const distance = direction.magnitude();

        // Charge attack logic
        if (distance < 120 && !this.isCharging) {
            this.chargeTime += deltaTime;
            if (this.chargeTime > 1000) { // 1 second charge time
                this.isCharging = true;
                this.chargeTime = 0;
            }
        } else if (this.isCharging) {
            // Charge towards player
            this.velocity = direction.normalize().multiply(this.speed * 3);
            this.chargeTime += deltaTime;
            if (this.chargeTime > 500) { // 0.5 second charge duration
                this.isCharging = false;
                this.chargeTime = 0;
            }
        } else {
            // Normal movement
            this.velocity = direction.normalize().multiply(this.speed);
            this.chargeTime = Math.max(0, this.chargeTime - deltaTime);
        }

        const movement = this.velocity.multiply(deltaTime / 1000);
        this.position = this.position.add(movement);
    }

    draw(ctx) {
        if (!this.active) return;

        const flashColor = this.hitFlashTime > 0 ? '#ffffff' : 
                          this.isCharging ? '#FF4444' : this.color;
        
        // Draw tank enemy (larger)
        ctx.fillStyle = flashColor;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );

        // Draw armor plating
        ctx.fillStyle = '#555';
        ctx.fillRect(
            this.position.x - this.size / 3,
            this.position.y - this.size / 3,
            this.size * 2/3,
            this.size * 2/3
        );

        // Charging indicator
        if (this.chargeTime > 0 && !this.isCharging) {
            const chargePercent = this.chargeTime / 1000;
            ctx.fillStyle = `rgba(255, 68, 68, ${chargePercent})`;
            ctx.fillRect(
                this.position.x - this.size / 2 - 2,
                this.position.y - this.size / 2 - 6,
                (this.size + 4) * chargePercent,
                2
            );
        }
    }
}

class RunnerEnemy extends Entity {
    constructor(x, y) {
        const config = CONFIG.enemies.runner;
        super(x, y, config.size, config.color);
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.points = config.points;
        this.type = 'runner';
        this.changeDirectionTime = 0;
        this.targetDirection = new Vector2();
    }

    update(deltaTime, target) {
        super.update(deltaTime);
        if (!this.active || !target) return;

        this.changeDirectionTime += deltaTime;

        // Change direction every 1-2 seconds or when close to player
        const distanceToPlayer = this.position.distance(target.position);
        if (this.changeDirectionTime > 1000 + Math.random() * 1000 || distanceToPlayer < 60) {
            // Erratic movement - sometimes towards player, sometimes random
            if (Math.random() < 0.6) {
                this.targetDirection = new Vector2(
                    target.position.x - this.position.x,
                    target.position.y - this.position.y
                ).normalize();
            } else {
                this.targetDirection = new Vector2(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ).normalize();
            }
            this.changeDirectionTime = 0;
        }

        this.velocity = this.targetDirection.multiply(this.speed);
        const movement = this.velocity.multiply(deltaTime / 1000);
        this.position = this.position.add(movement);

        // Keep in bounds
        if (this.position.x < 0 || this.position.x > CONFIG.canvas.width ||
            this.position.y < 0 || this.position.y > CONFIG.canvas.height) {
            this.targetDirection = this.targetDirection.multiply(-1);
        }
    }

    draw(ctx) {
        if (!this.active) return;

        const flashColor = this.hitFlashTime > 0 ? '#ffffff' : this.color;
        
        // Draw runner (smaller, more erratic)
        ctx.fillStyle = flashColor;
        const wobble = Math.sin(this.animationTime * 10) * 2;
        ctx.fillRect(
            this.position.x - this.size / 2 + wobble,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );

        // Movement trail
        ctx.fillStyle = `${flashColor}44`;
        ctx.fillRect(
            this.position.x - this.size / 2 - this.velocity.x * 0.1,
            this.position.y - this.size / 2 - this.velocity.y * 0.1,
            this.size,
            this.size
        );
    }
}

// Enemy Projectile
class EnemyProjectile extends Entity {
    constructor(x, y, direction) {
        super(x, y, 4, '#FF4444');
        this.velocity = direction.multiply(250);
        this.lifetime = 3000;
        this.createdAt = Date.now();
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (!this.active) return;

        if (Date.now() - this.createdAt > this.lifetime) {
            this.active = false;
            return;
        }

        const movement = this.velocity.multiply(deltaTime / 1000);
        this.position = this.position.add(movement);

        if (this.position.x < 0 || this.position.x > CONFIG.canvas.width ||
            this.position.y < 0 || this.position.y > CONFIG.canvas.height) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add danger glow
        ctx.strokeStyle = '#FF8888';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// Enhanced Projectile
class EnhancedProjectile extends Entity {
    constructor(x, y, direction, powerups = null) {
        super(x, y, 4, '#0E3A5B');
        this.velocity = direction.multiply(400);
        this.lifetime = 2000;
        this.createdAt = Date.now();
        this.damage = 1;
        this.piercing = false;
        this.lightning = false;

        // Apply powerup effects
        if (powerups?.has('rapidFire')) {
            this.velocity = this.velocity.multiply(1.5);
            this.color = '#FFB000';
        }
        if (powerups?.has('lightning')) {
            this.lightning = true;
            this.piercing = true;
            this.damage = 2;
            this.color = '#61dafb';
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (!this.active) return;

        if (Date.now() - this.createdAt > this.lifetime) {
            this.active = false;
            return;
        }

        const movement = this.velocity.multiply(deltaTime / 1000);
        this.position = this.position.add(movement);

        if (this.position.x < 0 || this.position.x > CONFIG.canvas.width ||
            this.position.y < 0 || this.position.y > CONFIG.canvas.height) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        if (this.lightning) {
            // Lightning effect
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const x = this.position.x + Math.cos(angle) * 8;
                const y = this.position.y + Math.sin(angle) * 8;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.lightning) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

// Enhanced Pickup with different types
class EnhancedPickup extends Entity {
    constructor(x, y, type = 'key') {
        const colors = {
            key: '#0B8A53',
            shield: '#0E3A5B',
            doublePoints: '#FFB000',
            rapidFire: '#FF6B35',
            lightning: '#61dafb',
            health: '#FF69B4'
        };
        
        super(x, y, 12, colors[type] || colors.key);
        this.type = type;
        this.animationOffset = Math.random() * Math.PI * 2;
        this.floatHeight = 0;
        this.rotationSpeed = type === 'key' ? 2 : 4;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (!this.active) return;
        
        this.animationOffset += deltaTime / 1000 * this.rotationSpeed;
        this.floatHeight = Math.sin(this.animationOffset) * 3;
    }

    draw(ctx) {
        if (!this.active) return;

        const y = this.position.y + this.floatHeight;
        
        ctx.save();
        ctx.translate(this.position.x, y);
        ctx.rotate(this.animationOffset);

        switch (this.type) {
            case 'key':
                this.drawKey(ctx);
                break;
            case 'shield':
                this.drawShield(ctx);
                break;
            case 'doublePoints':
                this.drawDoublePoints(ctx);
                break;
            case 'rapidFire':
                this.drawRapidFire(ctx);
                break;
            case 'lightning':
                this.drawLightning(ctx);
                break;
            case 'health':
                this.drawHealth(ctx);
                break;
            default:
                this.drawKey(ctx);
        }

        ctx.restore();

        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    drawKey(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.fillStyle = '#FFB000';
        ctx.fillRect(-this.size/4, -this.size/4, this.size/2, this.size/2);
    }

    drawShield(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawDoublePoints(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('2X', 0, 3);
    }

    drawRapidFire(ctx) {
        ctx.fillStyle = this.color;
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * 4;
            ctx.fillRect(offset - 2, -this.size/2, 2, this.size);
        }
    }

    drawLightning(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-this.size/3, -this.size/2);
        ctx.lineTo(0, 0);
        ctx.lineTo(this.size/3, this.size/2);
        ctx.stroke();
    }

    drawHealth(ctx) {
        ctx.fillStyle = this.color;
        // Draw cross
        ctx.fillRect(-this.size/6, -this.size/2, this.size/3, this.size);
        ctx.fillRect(-this.size/2, -this.size/6, this.size, this.size/3);
    }
}

// Initialize global audio manager
window.audioManager = new AudioManager();

console.log('Enhanced game engine loaded! 🎮');