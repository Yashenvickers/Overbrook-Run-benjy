# 56ers — Overbrook Run

A mobile-friendly browser game set in West Philadelphia (5600 block). Run through the streets of Overbrook, collect Franklin keys, dodge the ops, and build your combo!

## Game Features

- **Top-down arcade gameplay** with smooth 60 FPS performance
- **Mobile-friendly controls** with virtual joystick and action buttons
- **Desktop controls** with WASD movement, mouse aiming, and keyboard shortcuts
- **Combo system** that rewards consecutive pickups
- **Powerup system** with special abilities
- **Local score tracking** with best score persistence
- **Social sharing** functionality
- **Responsive design** that works on all screen sizes

## Controls

### Desktop
- **WASD** or **Arrow Keys**: Move Benjy
- **Mouse**: Aim shooting direction
- **Left Click**: Shoot mic blasts
- **Space**: Dash (with cooldown)
- **P**: Pause game

### Mobile
- **Left Virtual Stick**: Move Benjy
- **Shoot Button**: Fire projectiles in movement direction
- **Dash Button**: Quick dash with cooldown
- **Touch Controls**: All UI interactions

## Gameplay

1. **Objective**: Survive as long as possible while collecting Franklin keys
2. **Enemies**: Avoid the anonymous "ops" (hooded figures)
3. **Scoring**: Collect keys to build your score and combo multiplier
4. **Combos**: Chain pickups together for higher points
5. **Lives**: Start with 3 lives, lose one when hit by enemies
6. **Powerups**: Special abilities spawn periodically

## Build & Deploy

### Development
```bash
# Serve the files locally
python -m http.server 8080
# or
npx serve .
```

### Production Deploy
Simply upload the `/play/` folder to any static host:
- GitHub Pages
- Netlify
- Vercel
- HuggingFace Spaces
- Any web server

### Integration Snippet
Add this to your existing website:

```html
<!-- Prefetch game resources -->
<link rel="prefetch" href="/play/index.html" as="document">
<link rel="prefetch" href="/play/game.js" as="script">

<!-- Game launch button -->
<a class="btn-game" href="/play/" style="
    background: linear-gradient(135deg, #0E3A5B 0%, #1a4d6b 100%);
    color: #F5F1E8;
    padding: 12px 24px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    border: 2px solid #FFB000;
    transition: all 0.3s ease;
">
    🎮 Play 56ers — Overbrook Run
</a>
```

## Technical Details

- **Engine**: Vanilla JavaScript with HTML5 Canvas
- **Bundle Size**: < 50KB (well under 2MB limit)
- **Performance**: Optimized for 60 FPS on mobile devices
- **Compatibility**: Works on iOS Safari 16+, Android Chrome, and all modern browsers
- **Storage**: Uses localStorage for scores and preferences
- **Audio**: Optional background music and SFX (muted by default on mobile)

## Brand Colors

```css
:root {
    --franklin: #0E3A5B;  /* Ben Franklin Blue */
    --money: #0B8A53;     /* Money Green */
    --amber: #FFB000;     /* Amber/Gold */
    --ink: #0A0A0A;       /* Deep Ink */
    --cream: #F5F1E8;     /* Cream */
    --copper: #B87333;    /* Copper */
}
```

## Analytics Events

The game tracks these events (can be connected to your analytics):
- `game_start`: When player starts a new game
- `run_end`: When game ends (includes score and duration)
- `share_click`: When player shares their score
- `cta_click`: When player clicks social links

## Content Safety

- No real-world gang affiliations or brands
- Abstract silhouette enemies (no faces or insignia)
- Family-friendly content appropriate for all ages
- Violence is abstract (projectiles as music notes/light effects)

## Mobile Optimization

- Touch-friendly UI with proper hit targets
- Responsive canvas scaling
- Virtual controls optimized for thumb use
- Performance settings for older devices
- Respects mobile autoplay policies (muted by default)

---

**Built for the 5600 block. Stay safe, play hard.** 🎵