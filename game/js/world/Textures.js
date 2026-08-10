// Textures.js — all textures are generated at runtime on <canvas>, so the
// project ships zero binary image assets. Swap any of these for a real
// texture file later by loading with THREE.TextureLoader instead.
import * as THREE from 'three';

function canvasTex(size, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function brickTexture(base = '#7a3b2e', mortar = '#3a2620') {
  return canvasTex(128, (ctx, s) => {
    ctx.fillStyle = mortar; ctx.fillRect(0, 0, s, s);
    const rows = 8, bh = s / rows;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * 16;
      for (let x = -16; x < s + 16; x += 32) {
        ctx.fillStyle = base;
        const shade = Math.random() * 18 - 9;
        ctx.fillStyle = shadeColor(base, shade);
        ctx.fillRect(x + offset, r * bh, 28, bh - 3);
      }
    }
  }, [3, 2]);
}

function shadeColor(hex, amt) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + amt, g = ((num >> 8) & 0xff) + amt, b = (num & 0xff) + amt;
  r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); b = Math.min(255, Math.max(0, b));
  return `rgb(${r},${g},${b})`;
}

export function windowLitTexture() {
  return canvasTex(128, (ctx, s) => {
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, s, s);
    const cols = 4, rows = 6;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const lit = Math.random() > 0.55;
        ctx.fillStyle = lit ? '#ffcf6b' : '#101418';
        const w = s / cols, h = s / rows;
        ctx.fillRect(x * w + 4, y * h + 4, w - 8, h - 8);
      }
    }
  }, [1, 1]);
}

export function graffitiTexture(seedColor = '#c8ff5a') {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = '#1b1b1b'; ctx.fillRect(0, 0, s, s);
    // abstract spray-paint style shapes (non-representational, original)
    const colors = [seedColor, '#ffb020', '#c9d2cc', '#2f7a4a'];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      const cx = Math.random() * s, cy = Math.random() * s, r = 20 + Math.random() * 50;
      ctx.moveTo(cx + r, cy);
      for (let a = 0; a <= Math.PI * 2; a += 0.4) {
        const rr = r * (0.7 + Math.random() * 0.3);
        ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(s / 2, s / 2);
    ctx.rotate(-0.06);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 6;
    ctx.strokeText('5600', 0, 16);
    ctx.fillStyle = seedColor;
    ctx.fillText('5600', 0, 16);
    ctx.restore();
  });
}

export function asphaltTexture() {
  return canvasTex(128, (ctx, s) => {
    ctx.fillStyle = '#1c1c1e'; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
      ctx.fillRect(Math.random() * s, Math.random() * s, 1, 1);
    }
  }, [24, 96]);
}

export function sidewalkTexture() {
  return canvasTex(64, (ctx, s) => {
    ctx.fillStyle = '#8a8a86'; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#5c5c58'; ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, s, s);
  }, [10, 60]);
}

export function courtTexture() {
  return canvasTex(256, (ctx, s) => {
    ctx.fillStyle = '#5b3a24'; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#e8d9b0'; ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, s - 20, s - 20);
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 40, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s / 2, 10); ctx.lineTo(s / 2, s - 10); ctx.stroke();
  });
}

export function skyGradient() {
  return canvasTex(256, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#050a08');
    g.addColorStop(0.4, '#0c2317');
    g.addColorStop(0.75, '#173a24');
    g.addColorStop(1, '#274d30');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  }, [1, 1]);
}

export function metalTexture() {
  return canvasTex(64, (ctx, s) => {
    ctx.fillStyle = '#6b7078'; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 8) {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(s, i); ctx.stroke();
    }
  }, [4, 4]);
}
