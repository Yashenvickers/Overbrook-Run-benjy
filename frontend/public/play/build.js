#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 Building 56ers — Overbrook Run...');

// Build configuration
const BUILD_CONFIG = {
    version: "1.0.0",
    buildDate: new Date().toISOString(),
    minify: process.env.NODE_ENV === 'production',
    sourceMap: process.env.NODE_ENV !== 'production'
};

async function build() {
    try {
        // Create build directory
        const buildDir = path.join(__dirname, 'dist');
        if (!fs.existsSync(buildDir)) {
            fs.mkdirSync(buildDir, { recursive: true });
        }

        // Copy HTML file
        console.log('📄 Processing HTML...');
        let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        
        // Inject build info
        html = html.replace(
            '<meta name="description"',
            `<meta name="build-version" content="${BUILD_CONFIG.version}">
            <meta name="build-date" content="${BUILD_CONFIG.buildDate}">
            <meta name="description"`
        );

        fs.writeFileSync(path.join(buildDir, 'index.html'), html);

        // Copy JavaScript files
        console.log('📦 Processing JavaScript...');
        const jsFiles = [
            'build-config.js',
            'enhanced-game.js', 
            'final-game.js'
        ];

        jsFiles.forEach(file => {
            const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
            fs.writeFileSync(path.join(buildDir, file), content);
        });

        // Copy other assets
        console.log('📋 Copying assets...');
        const otherFiles = [
            'README.md',
            'CHANGELOG.md',
            'favicon.ico'
        ];

        otherFiles.forEach(file => {
            if (fs.existsSync(path.join(__dirname, file))) {
                fs.copyFileSync(
                    path.join(__dirname, file),
                    path.join(buildDir, file)
                );
            }
        });

        // Generate deployment info
        const deployInfo = {
            version: BUILD_CONFIG.version,
            buildDate: BUILD_CONFIG.buildDate,
            files: fs.readdirSync(buildDir),
            size: calculateDirectorySize(buildDir),
            checksum: generateChecksum(buildDir)
        };

        fs.writeFileSync(
            path.join(buildDir, 'deploy-info.json'),
            JSON.stringify(deployInfo, null, 2)
        );

        console.log('✅ Build completed successfully!');
        console.log(`📦 Build size: ${(deployInfo.size / 1024).toFixed(2)} KB`);
        console.log(`📁 Output directory: ${buildDir}`);
        
        return deployInfo;

    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

function calculateDirectorySize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
            size += stats.size;
        } else if (stats.isDirectory()) {
            size += calculateDirectorySize(filePath);
        }
    });
    
    return size;
}

function generateChecksum(dir) {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5');
    
    const files = fs.readdirSync(dir).sort();
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath);
            hash.update(content);
        }
    });
    
    return hash.digest('hex');
}

// Run build if called directly
if (require.main === module) {
    build();
}

module.exports = { build, BUILD_CONFIG };