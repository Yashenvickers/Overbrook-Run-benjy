// Build and deployment configuration
const BuildConfig = {
    // Version info
    version: "1.0.0",
    buildDate: new Date().toISOString(),
    
    // Asset optimization
    assets: {
        // Preload critical assets
        preload: [
            './enhanced-game.js',
            './final-game.js'
        ],
        
        // Lazy load non-critical assets
        lazyLoad: [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
        ]
    },
    
    // Performance settings
    performance: {
        targetFPS: 60,
        maxParticles: 100,
        maxEnemies: 15,
        enableLowFXMode: false
    },
    
    // Feature flags
    features: {
        analytics: true,
        leaderboards: true,
        soundEffects: true,
        backgroundMusic: false,
        socialSharing: true,
        tutorials: true
    },
    
    // API configuration
    api: {
        baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000',
        timeout: 10000,
        retries: 3
    },
    
    // Analytics configuration
    analytics: {
        enabled: true,
        events: [
            'game_start',
            'run_end', 
            'share_click',
            'cta_click',
            'powerup_collected',
            'wave_completed'
        ]
    },
    
    // Social links
    social: {
        spotify: 'https://open.spotify.com/artist/your-artist-id',
        youtube: 'https://youtube.com/@your-channel',
        website: 'https://your-website.com'
    },
    
    // Game balance
    balance: {
        difficulty: {
            easy: {
                enemySpeed: 0.8,
                spawnRate: 1.5,
                playerHealth: 150
            },
            normal: {
                enemySpeed: 1.0,
                spawnRate: 1.0,
                playerHealth: 100
            },
            hard: {
                enemySpeed: 1.3,
                spawnRate: 0.7,
                playerHealth: 75
            }
        }
    },
    
    // Deployment settings
    deployment: {
        staticPath: '/play/',
        cdnEnabled: false,
        compressionEnabled: true,
        cacheVersion: 'v1.0.0'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuildConfig;
}

// Make available globally
window.BuildConfig = BuildConfig;

console.log(`🚀 Build Config loaded - Version ${BuildConfig.version}`);