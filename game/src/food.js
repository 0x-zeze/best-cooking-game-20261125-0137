import {
  INGREDIENTS,
  TEMP_MAX,
  burnerRect,
  burnerPan,
  burnerGauge,
  burnerMinus,
  burnerPlus,
} from './config.js';
import { bandZone } from './heat.js';

export function roundRect(ctx, x, y, w, h, r = 8) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function drawIngredient(ctx, ing, cx, cy, r) {
  const spec = typeof ing === 'string' ? INGREDIENTS[ing] : ing;
  if (!spec) return;

  ctx.save();
  ctx.lineWidth = Math.max(1.5, r * 0.08);
  ctx.lineJoin = 'round';

  switch (spec.id) {
    case 'bun': {
      ctx.fillStyle = spec.color;
      ctx.strokeStyle = spec.dark;
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.22, r * 0.88, Math.PI, 0);
      ctx.lineTo(cx + r * 0.88, cy + r * 0.42);
      ctx.quadraticCurveTo(cx, cy + r * 0.56, cx - r * 0.88, cy + r * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = spec.dark;
      ctx.fillRect(cx - r * 0.78, cy + r * 0.3, r * 1.56, r * 0.12);

      ctx.fillStyle = '#fff3d1';
      const seeds = [
        [-0.38, -0.18],
        [0, -0.34],
        [0.36, -0.16],
        [-0.18, 0.04],
        [0.2, 0.05],
      ];
      for (const [sx, sy] of seeds) {
        ctx.beginPath();
        ctx.ellipse(cx + sx * r, cy + sy * r, r * 0.09, r * 0.05, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'patty': {
      const pw = r * 1.85;
      const ph = r * 0.82;
      roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, ph * 0.45);
      ctx.fillStyle = spec.color;
      ctx.strokeStyle = spec.dark;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = spec.dark;
      const dots = [
        [-0.55, -0.12],
        [-0.18, 0.12],
        [0.16, -0.14],
        [0.52, 0.08],
        [-0.4, 0.16],
        [0.36, -0.02],
      ];
      for (const [dx, dy] of dots) {
        ctx.beginPath();
        ctx.arc(cx + dx * r, cy + dy * r, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'cheese': {
      ctx.fillStyle = spec.color;
      ctx.strokeStyle = spec.dark;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.85, cy + r * 0.55);
      ctx.lineTo(cx + r * 0.9, cy + r * 0.25);
      ctx.lineTo(cx - r * 0.22, cy - r * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = spec.dark;
      const holes = [
        [-0.25, 0.14, 0.14],
        [0.18, 0.12, 0.1],
        [-0.14, -0.26, 0.09],
      ];
      for (const [hx, hy, hr] of holes) {
        ctx.beginPath();
        ctx.arc(cx + hx * r, cy + hy * r, hr * r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'tomato': {
      ctx.fillStyle = spec.color;
      ctx.strokeStyle = spec.dark;
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.08, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = Math.max(2, r * 0.1);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.08, r * 0.52, Math.PI * 1.12, Math.PI * 1.48);
      ctx.stroke();

      ctx.fillStyle = '#3f9e3a';
      ctx.strokeStyle = '#245e21';
      ctx.lineWidth = Math.max(1, r * 0.05);
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.88);
      ctx.lineTo(cx + r * 0.12, cy - r * 0.62);
      ctx.lineTo(cx + r * 0.36, cy - r * 0.66);
      ctx.lineTo(cx + r * 0.14, cy - r * 0.48);
      ctx.lineTo(cx, cy - r * 0.56);
      ctx.lineTo(cx - r * 0.14, cy - r * 0.48);
      ctx.lineTo(cx - r * 0.36, cy - r * 0.66);
      ctx.lineTo(cx - r * 0.12, cy - r * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'onion': {
      ctx.fillStyle = spec.color;
      ctx.strokeStyle = spec.dark;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const rings = [
        [0.62, '#f3d9ea'],
        [0.44, spec.dark],
        [0.28, '#f3d9ea'],
        [0.12, spec.dark],
      ];
      for (const [scale, stroke] of rings) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = Math.max(1.5, r * 0.09);
        ctx.beginPath();
        ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    case 'lettuce': {
      ctx.fillStyle = spec.color;
      ctx.strokeStyle = spec.dark;
      const petals = 6;
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * 0.38, cy + Math.sin(a) * r * 0.38, r * 0.44, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9be88a';
      ctx.lineWidth = Math.max(1.2, r * 0.06);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r * 0.42, cy + Math.sin(a) * r * 0.42);
        ctx.stroke();
      }
      break;
    }

    default: {
      ctx.fillStyle = spec.color;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

export function drawHeatGauge(ctx, burner, item) {
  const g = burnerGauge(burner.id);
  const tempToY = (t) => {
    const clamped = Math.max(0, Math.min(TEMP_MAX, t));
    return g.y + g.h - (clamped / TEMP_MAX) * g.h;
  };

  ctx.save();

  roundRect(ctx, g.x - 4, g.y - 4, g.w + 8, g.h + 8, 6);
  ctx.fillStyle = '#11141c';
  ctx.fill();
  ctx.strokeStyle = '#333a4d';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const grad = ctx.createLinearGradient(0, g.y + g.h, 0, g.y);
  grad.addColorStop(0, '#3b82f6');
  grad.addColorStop(0.5, '#f5c542');
  grad.addColorStop(1, '#ef4444');

  ctx.save();
  ctx.globalAlpha = 0.28;
  roundRect(ctx, g.x, g.y, g.w, g.h, 4);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  const tempY = tempToY(burner.temp);
  const fillH = g.y + g.h - tempY;
  if (fillH > 0.5) {
    ctx.save();
    roundRect(ctx, g.x, g.y, g.w, g.h, 4);
    ctx.clip();
    ctx.fillStyle = grad;
    ctx.fillRect(g.x, tempY, g.w, fillH);
    ctx.restore();
  }

  const spec = item ? INGREDIENTS[item.id] : null;
  if (spec && spec.band) {
    const [low, high] = spec.band;
    const yTop = tempToY(high);
    const yBot = tempToY(low);
    const bandH = Math.max(4, yBot - yTop);

    ctx.fillStyle = 'rgba(74, 222, 128, 0.28)';
    ctx.fillRect(g.x - 2, yTop, g.w + 4, bandH);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.strokeRect(g.x - 2, yTop, g.w + 4, bandH);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${low}-${high}`, g.x + g.w + 7, (yTop + yBot) / 2);
  }

  const setY = tempToY(burner.setpoint);
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.moveTo(g.x - 6, setY);
  ctx.lineTo(g.x - 1, setY - 4);
  ctx.lineTo(g.x - 1, setY + 4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(g.x - 4, tempY);
  ctx.lineTo(g.x + g.w + 4, tempY);
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${Math.round(burner.temp)}°`, g.x + g.w / 2, g.y + g.h + 5);

  ctx.restore();
}

export function drawBurner(ctx, state, burner) {
  const r = burnerRect(burner.id);
  const pan = burnerPan(burner.id);
  const minus = burnerMinus(burner.id);
  const plus = burnerPlus(burner.id);
  const selected = state.selectedBurner === burner.id;
  const item = burner.item;

  ctx.save();

  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fillStyle = selected ? '#232938' : '#1b202b';
  ctx.fill();
  ctx.strokeStyle = selected ? '#f5c542' : '#32394b';
  ctx.lineWidth = selected ? 3 : 1.5;
  ctx.stroke();

  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = selected ? '#f5c542' : '#cbd5e1';
  ctx.fillText(`BURNER ${burner.id + 1} [${burner.id + 1}]`, r.x + 14, r.y + 22);

  ctx.textAlign = 'right';
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`SET ${Math.round(burner.setpoint)}°`, r.x + r.w - 14, r.y + 22);

  const heatRatio = Math.max(0, Math.min(1, (burner.temp - 24) / (TEMP_MAX - 24)));
  if (heatRatio > 0.02) {
    const glowR = pan.r + 14 * heatRatio;
    const glow = ctx.createRadialGradient(pan.cx, pan.cy, pan.r * 0.45, pan.cx, pan.cy, glowR);
    glow.addColorStop(0, `rgba(255, 130, 35, ${(0.45 * heatRatio).toFixed(3)})`);
    glow.addColorStop(0.7, `rgba(255, 70, 20, ${(0.35 * heatRatio).toFixed(3)})`);
    glow.addColorStop(1, 'rgba(255, 50, 10, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(pan.cx, pan.cy, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(pan.cx, pan.cy, pan.r, 0, Math.PI * 2);
  ctx.fillStyle = '#2d3342';
  ctx.fill();
  ctx.strokeStyle = '#525b70';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pan.cx, pan.cy, pan.r - 8, 0, Math.PI * 2);
  ctx.fillStyle = '#151821';
  ctx.fill();
  ctx.strokeStyle = '#384052';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (!item) {
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EMPTY PAN', pan.cx, pan.cy);
  } else {
    drawIngredient(ctx, item.id, pan.cx, pan.cy, 34);

    if (item.state === 'burnt') {
      ctx.beginPath();
      ctx.arc(pan.cx, pan.cy, pan.r - 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 10, 10, 0.74)';
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('BURNT', pan.cx, pan.cy - 8);
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('click to trash', pan.cx, pan.cy + 12);
    } else {
      const zone = bandZone(burner.temp, item.id);
      const ringColor = item.state === 'ready'
        ? (item.perfect ? '#f5c542' : '#4ade80')
        : (zone === 'hot' ? '#ef4444' : zone === 'cold' ? '#60a5fa' : '#4ade80');

      ctx.beginPath();
      ctx.arc(pan.cx, pan.cy, pan.r - 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 5;
      ctx.stroke();

      const frac = Math.max(0, Math.min(1, item.progress / 100));
      if (frac > 0) {
        ctx.beginPath();
        ctx.arc(pan.cx, pan.cy, pan.r - 4, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      let label = 'IN THE BAND';
      let labelColor = '#4ade80';
      if (item.state === 'ready') {
        if (zone === 'hot') {
          label = 'TOO HOT!';
          labelColor = '#f87171';
          ctx.fillStyle = item.perfect ? '#f5c542' : '#4ade80';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.perfect ? 'PERFECT' : 'READY', pan.cx, pan.cy - 40);
        } else {
          label = item.perfect ? 'PERFECT' : 'READY';
          labelColor = item.perfect ? '#f5c542' : '#4ade80';
        }
      } else if (zone === 'hot') {
        label = 'TOO HOT!';
        labelColor = '#f87171';
      } else if (zone === 'cold') {
        label = 'TOO COLD';
        labelColor = '#60a5fa';
      }

      ctx.fillStyle = labelColor;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pan.cx, r.y + 191);

      if (item.burn > 0) {
        const bx = r.x + 56;
        const by = r.y + 201;
        const bw = 124;
        const bh = 7;
        roundRect(ctx, bx, by, bw, bh, 3);
        ctx.fillStyle = '#291a1c';
        ctx.fill();
        const fillW = Math.max(2, bw * Math.min(1, item.burn));
        roundRect(ctx, bx, by, fillW, bh, 3);
        ctx.fillStyle = item.burn > 0.65 ? '#ef4444' : '#f97316';
        ctx.fill();
      }
    }
  }

  drawHeatGauge(ctx, burner, item);

  for (const [btn, sym] of [[minus, '-'], [plus, '+']]) {
    roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8);
    ctx.fillStyle = '#2a3142';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sym, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HEAT', r.x + r.w / 2, minus.y + minus.h / 2);

  ctx.restore();
}
