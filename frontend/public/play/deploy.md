# 56ers — Overbrook Run Deployment Guide

## Quick Deploy

### Static Hosts (Recommended)
1. **HuggingFace Spaces**: Upload the `/play/` folder to your space
2. **Netlify**: Drag and drop the folder or connect to Git
3. **Vercel**: Import project and set output directory to `/play/`
4. **GitHub Pages**: Push to `gh-pages` branch
5. **Any CDN**: Upload files to CDN with proper MIME types

### Build & Optimize

```bash
# Install dependencies (optional - for optimization only)
npm install

# Build production version
npm run build

# Create deployment package
npm run deploy
```

## Integration with Existing Sites

### Embed in Your Website

Add this to your site's `<head>`:

```html
<!-- Prefetch game resources -->
<link rel="prefetch" href="/play/index.html" as="document">
<link rel="prefetch" href="/play/final-game.js" as="script">
<link rel="dns-prefetch" href="//fonts.googleapis.com">

<!-- Game launch button -->
<style>
.game-launch-btn {
    background: linear-gradient(135deg, #0E3A5B 0%, #1a4d6b 100%);
    color: #F5F1E8;
    padding: 16px 32px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 700;
    font-size: 18px;
    border: 3px solid #FFB000;
    transition: all 0.3s ease;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(14, 58, 91, 0.3);
}

.game-launch-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(14, 58, 91, 0.4);
    border-color: #FFFFFF;
}

.game-launch-btn:before {
    content: "🎮 ";
    margin-right: 8px;
}
</style>

<a href="/play/" class="game-launch-btn">
    Play 56ers — Overbrook Run
</a>
```

### WordPress Integration

```php
// Add to functions.php
function enqueue_game_assets() {
    wp_enqueue_script('game-prefetch', '', array(), '1.0.0', true);
    wp_add_inline_script('game-prefetch', '
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = "/play/index.html";
        link.as = "document";
        document.head.appendChild(link);
    ');
}
add_action('wp_enqueue_scripts', 'enqueue_game_assets');

// Shortcode for game button
function game_button_shortcode($atts) {
    $atts = shortcode_atts(array(
        'text' => 'Play 56ers — Overbrook Run',
        'class' => 'game-launch-btn'
    ), $atts);
    
    return '<a href="/play/" class="' . esc_attr($atts['class']) . '">' . 
           esc_html($atts['text']) . '</a>';
}
add_shortcode('overbrook_game', 'game_button_shortcode');
```

## Server Configuration

### Nginx

```nginx
# Add to your nginx.conf
location /play/ {
    try_files $uri $uri/ /play/index.html;
    
    # Enable compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### Apache (.htaccess)

```apache
# Place in /play/.htaccess
RewriteEngine On

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
</IfModule>

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "no-referrer-when-downgrade"
```

## Performance Optimization

### Bundle Size Optimization
- Current bundle: ~45KB gzipped
- Target: <50KB total
- Uses vanilla JS (no framework overhead)
- Lazy loads non-critical assets

### Loading Performance
- Critical CSS inlined
- Game assets prefetched
- Progressive loading strategy
- Mobile-first approach

### Runtime Performance
- 60 FPS target maintained
- Efficient collision detection
- Object pooling for particles
- Automatic quality scaling

## Analytics Setup

### Google Analytics 4

```javascript
// Add to index.html after game scripts
gtag('config', 'GA_MEASUREMENT_ID', {
    custom_map: {
        'custom_parameter_1': 'game_score',
        'custom_parameter_2': 'game_duration'
    }
});

// Track game events
window.game.api.trackAnalytics = function(eventType, data) {
    gtag('event', eventType, {
        game_score: data.score || 0,
        game_duration: data.duration || 0,
        custom_parameter_1: data.score,
        custom_parameter_2: data.duration
    });
};
```

### Custom Analytics

```javascript
// Replace the analytics function in final-game.js
async trackAnalytics(eventType, data = {}) {
    // Your custom analytics endpoint
    await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: eventType,
            data: data,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            sessionId: this.sessionId
        })
    });
}
```

## SEO Optimization

### Structured Data

Add to `<head>` in index.html:

```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "56ers — Overbrook Run",
    "description": "Run the 5600 blocks in a West Philly arcade rush. Collect Franklin keys, dodge hazards, and keep your combo alive.",
    "genre": "Arcade",
    "gamePlatform": "Web Browser",
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "author": {
        "@type": "Person",
        "name": "Benjy 5600"
    }
}
</script>
```

## Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https://huggingface.co;
    connect-src 'self' https://api.yourdomain.com;
">
```

### Rate Limiting

```javascript
// Add to backend API
const rateLimit = require('express-rate-limit');

const gameApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});

app.use('/api/game', gameApiLimiter);
```

## Monitoring & Maintenance

### Health Checks

```javascript
// Add monitoring endpoint
app.get('/play/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
```

### Error Tracking

```javascript
// Add to final-game.js
window.addEventListener('error', (event) => {
    fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        })
    }).catch(() => {}); // Fail silently
});
```

## Deployment Checklist

- [ ] Test game functionality on desktop and mobile
- [ ] Verify all assets load correctly
- [ ] Check API endpoints are accessible
- [ ] Validate SEO meta tags
- [ ] Test social sharing functionality
- [ ] Confirm analytics tracking
- [ ] Verify performance metrics (60 FPS, <3s load)
- [ ] Test on iOS Safari, Android Chrome, Desktop browsers
- [ ] Check accessibility features
- [ ] Validate Content Security Policy
- [ ] Test offline functionality (graceful degradation)
- [ ] Verify error handling and fallbacks

## Support & Updates

For support or feature requests:
- GitHub Issues: [Repository URL]
- Email: support@yourdomain.com
- Documentation: /play/README.md

---

**Version**: 1.0.0  
**Last Updated**: September 2025  
**Compatibility**: iOS Safari 16+, Android Chrome 90+, Desktop browsers