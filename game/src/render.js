import {
  COUNTER_ORDER,
  INGREDIENTS,
  LAYOUT,
  MAX_TICKETS,
  SHIFT_SECONDS,
  binRect,
  plateRect,
  serveRect,
  ticketRect,
} from './config.js';
import { drawBurner, drawIngredient, roundRect } from './food.js';
import { isRush, matchingTicket } from './state.js';

const VIEW_W = LAYOUT.hud.w;
const VIEW_H = LAYOUT.footer.y + LAYOUT.footer.h;

function text(ctx, str, x, y, size = 14, color = '#f1f5f9', weight = 'normal', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function formatClock(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function drawTickets(ctx, state) {
  const match = matchingTicket(state);

  for (let i = 0; i < MAX_TICKETS; i++) {
    const r = ticketRect(i);
    const x = r.x;
    const y = r.y + 12;
    const w = r.w;
    const h = r.h - 12;
    const ticket = state.tickets[i];

    ctx.save();
    roundRect(ctx, x, y, w, h, 10);

    if (!ticket) {
      ctx.fillStyle = '#17202b';
      ctx.fill();
      ctx.strokeStyle = '#2b384a';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'WAITING FOR ORDERS…', x + w / 2, y + h / 2, 12, '#64748b', 'bold', 'center');
      ctx.restore();
      continue;
    }

    const isMatch = match && match.id === ticket.id;
    const ratio = ticket.maxPatience > 0
      ? Math.max(0, Math.min(1, ticket.patience / ticket.maxPatience))
      : 0;
    const urgent = ratio < 0.35;

    ctx.fillStyle = isMatch ? '#162d24' : '#18222e';
    ctx.fill();
    ctx.strokeStyle = isMatch ? '#4ade80' : (urgent ? '#ef4444' : '#324155');
    ctx.lineWidth = isMatch ? 2.5 : (urgent ? 2 : 1.5);
    ctx.stroke();

    text(ctx, ticket.name.toUpperCase(), x + 10, y + 15, 13, '#f8fafc', 'bold', 'left');
    text(ctx, `#${ticket.id}`, x + w - 10, y + 15, 11, '#94a3b8', 'bold', 'right');

    for (let j = 0; j < ticket.items.length; j++) {
      drawIngredient(ctx, ticket.items[j], x + 24 + j * 34, y + 45, 13);
    }

    text(ctx, `${ticket.base} PTS`, x + w - 10, y + 38, 12, '#f5c542', 'bold', 'right');
    if (isMatch) {
      text(ctx, 'MATCH — SERVE!', x + w - 10, y + 56, 11, '#4ade80', 'bold', 'right');
    } else if (urgent) {
      text(ctx, `URGENT ${Math.ceil(ticket.patience)}s`, x + w - 10, y + 56, 11, '#f87171', 'bold', 'right');
    }

    const barX = x + 10;
    const barY = y + h - 16;
    const barW = w - 20;
    const barH = 8;
    roundRect(ctx, barX, barY, barW, barH, 4);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    if (ratio > 0) {
      roundRect(ctx, barX, barY, Math.max(4, barW * ratio), barH, 4);
      ctx.fillStyle = urgent ? '#ef4444' : '#4ade80';
      ctx.fill();
    }

    ctx.restore();
  }
}

function drawCounter(ctx) {
  text(ctx, 'COUNTER', 16, 464, 10, '#94a3b8', 'bold', 'left');

  for (let i = 0; i < COUNTER_ORDER.length; i++) {
    const r = binRect(i);
    const spec = INGREDIENTS[COUNTER_ORDER[i]];

    ctx.save();
    roundRect(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fillStyle = '#18222e';
    ctx.fill();
    ctx.strokeStyle = '#324155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawIngredient(ctx, spec.id, r.x + r.w / 2, r.y + 46, 28);
    text(ctx, spec.name, r.x + r.w / 2, r.y + 90, 13, '#f8fafc', 'bold', 'center');

    if (spec.raw || !spec.band) {
      text(ctx, 'RAW → PLATE', r.x + r.w / 2, r.y + 110, 11, '#4ade80', 'bold', 'center');
    } else {
      text(ctx, `${spec.band[0]}°–${spec.band[1]}°`, r.x + r.w / 2, r.y + 110, 11, '#f5c542', 'bold', 'center');
    }

    ctx.restore();
  }
}

function drawPlate(ctx, state) {
  const p = plateRect();
  const s = serveRect();
  const match = matchingTicket(state);

  ctx.save();
  roundRect(ctx, p.x, p.y, p.w, p.h, 10);
  ctx.fillStyle = '#18222e';
  ctx.fill();
  ctx.strokeStyle = match ? '#4ade80' : '#324155';
  ctx.lineWidth = match ? 2 : 1.5;
  ctx.stroke();

  text(ctx, 'ASSEMBLY PLATE', p.x + 14, p.y + 16, 11, '#94a3b8', 'bold', 'left');
  if (state.plate.length > 0) {
    text(ctx, 'click plate to clear', p.x + p.w - 14, p.y + 16, 10, '#64748b', 'normal', 'right');
  }

  const cx = p.x + p.w / 2;
  const cy = p.y + 74;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 185, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, cy, 162, 31, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (state.plate.length === 0) {
    text(ctx, 'empty — build a dish', cx, cy, 12, '#64748b', 'bold', 'center');
  } else {
    const count = state.plate.length;
    const step = Math.min(54, 260 / Math.max(1, count));
    const startX = cx - ((count - 1) * step) / 2;
    const radius = count > 5 ? 16 : 20;
    for (let i = 0; i < count; i++) {
      drawIngredient(ctx, state.plate[i], startX + i * step, cy, radius);
    }
  }

  const passX = p.x;
  const passY = 608;
  const passW = s.x - p.x - 12;
  const passH = 48;

  roundRect(ctx, passX, passY, passW, passH, 8);
  ctx.fillStyle = '#151e29';
  ctx.fill();
  ctx.strokeStyle = state.passDish ? '#4ade80' : '#2b384a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (state.passDish) {
    text(ctx, 'PASS — READY TO SERVE', passX + 12, passY + 16, 10, '#4ade80', 'bold', 'left');
    text(ctx, state.passDish.name, passX + 12, passY + 34, 12, '#f8fafc', 'bold', 'left');

    const items = state.passDish.items || [];
    const rightEdge = passX + passW - 18;
    for (let i = 0; i < items.length; i++) {
      const ix = rightEdge - (items.length - 1 - i) * 24;
      drawIngredient(ctx, items[i], ix, passY + 25, 11);
    }
  } else {
    text(ctx, 'PASS', passX + 12, passY + 16, 10, '#64748b', 'bold', 'left');
    text(ctx, 'nothing waiting', passX + 12, passY + 34, 11, '#64748b', 'normal', 'left');
  }

  roundRect(ctx, s.x, s.y, s.w, s.h, 8);
  ctx.fillStyle = match ? '#16a34a' : '#2a3441';
  ctx.fill();
  ctx.strokeStyle = match ? '#4ade80' : '#475569';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'SERVE [Space]', s.x + s.w / 2, s.y + s.h / 2, 13, match ? '#ffffff' : '#94a3b8', 'bold', 'center');

  ctx.restore();
}

function drawHud(ctx, state) {
  const hud = LAYOUT.hud;
  const rush = isRush(state);
  const lowTime = state.timeLeft < 20;

  ctx.save();
  ctx.fillStyle = '#111822';
  ctx.fillRect(hud.x, hud.y, hud.w, hud.h);

  text(ctx, 'EMBER LINE', 18, 22, 20, '#f5c542', 'bold', 'left');
  text(ctx, 'TEMPERATURE-BAND KITCHEN', 18, 44, 10, '#94a3b8', 'bold', 'left');

  const clockColor = lowTime ? '#ef4444' : (rush ? '#f5c542' : '#f8fafc');
  text(ctx, formatClock(state.timeLeft), VIEW_W / 2, rush ? 21 : 29, 26, clockColor, 'bold', 'center');
  if (rush) {
    text(ctx, 'RUSH HOUR', VIEW_W / 2, 46, 11, '#f59e0b', 'bold', 'center');
  }

  text(ctx, 'SCORE', 970, 16, 10, '#94a3b8', 'bold', 'center');
  text(ctx, String(state.score), 970, 38, 18, '#f5c542', 'bold', 'center');

  text(ctx, 'SERVED', 1100, 16, 10, '#94a3b8', 'bold', 'center');
  text(ctx, String(state.served), 1100, 38, 18, '#f8fafc', 'bold', 'center');

  text(ctx, 'COMBO', 1220, 16, 10, '#94a3b8', 'bold', 'center');
  text(ctx, `x${state.combo}`, 1220, 38, 18, state.combo > 0 ? '#4ade80' : '#94a3b8', 'bold', 'center');

  ctx.fillStyle = '#0c121a';
  ctx.fillRect(0, 58, VIEW_W, 4);
  const progress = Math.max(0, Math.min(1, 1 - state.timeLeft / SHIFT_SECONDS));
  ctx.fillStyle = lowTime ? '#ef4444' : (rush ? '#f59e0b' : '#4ade80');
  ctx.fillRect(0, 58, VIEW_W * progress, 4);

  ctx.restore();
}

function drawFooter(ctx, state) {
  const f = LAYOUT.footer;

  ctx.save();
  ctx.fillStyle = '#131b24';
  ctx.fillRect(f.x, f.y, f.w, f.h);
  ctx.strokeStyle = '#263344';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, f.y);
  ctx.lineTo(VIEW_W, f.y);
  ctx.stroke();

  text(ctx, 'HOW TO PLAY', 20, f.y + 22, 12, '#f5c542', 'bold', 'left');
  text(
    ctx,
    'KEYS: [1-4] select burner | [W/S] or [Up/Down] heat | Click bin to place, pan to plate/trash | [Space] serve | [T] trash | [P] pause | [R] restart | [M] mute',
    20,
    f.y + 48,
    12,
    '#cbd5e1',
    'normal',
    'left',
  );
  text(
    ctx,
    'BAND RULE: Hold each burner inside the ingredient\'s green temperature band to cook — cold pauses, hot burns. Lettuce goes raw straight to the plate.',
    20,
    f.y + 72,
    12,
    '#cbd5e1',
    'normal',
    'left',
  );
  if (state.muted) {
    text(ctx, 'MUTED [M]', VIEW_W - 20, f.y + 22, 11, '#f87171', 'bold', 'right');
  }

  if (state.toast) {
    ctx.font = 'bold 13px monospace';
    const tw = Math.max(180, ctx.measureText(state.toast).width + 36);
    const th = 34;
    const tx = (VIEW_W - tw) / 2;
    const ty = f.y + 96;
    roundRect(ctx, tx, ty, tw, th, th / 2);
    ctx.fillStyle = 'rgba(17, 24, 34, 0.94)';
    ctx.fill();
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, state.toast, VIEW_W / 2, ty + th / 2, 13, '#f8fafc', 'bold', 'center');
  } else {
    text(
      ctx,
      'PERFECT & COMBO: Never enter the hot zone for PERFECT (+25) | Fast serves earn speed bonus | Chain serves for COMBO (+10/streak); burnt or expired orders reset combo.',
      20,
      f.y + 96,
      12,
      '#94a3b8',
      'normal',
      'left',
    );
  }

  if (state.paused && state.screen === 'play') {
    ctx.fillStyle = 'rgba(10, 15, 22, 0.72)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    roundRect(ctx, 460, 320, 360, 150, 14);
    ctx.fillStyle = '#18222e';
    ctx.fill();
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 2;
    ctx.stroke();

    text(ctx, 'PAUSED', VIEW_W / 2, 376, 36, '#f5c542', 'bold', 'center');
    text(ctx, 'Press [P] to resume', VIEW_W / 2, 428, 14, '#cbd5e1', 'normal', 'center');
  }

  ctx.restore();
}

function drawTitle(ctx) {
  ctx.save();

  ctx.fillStyle = '#202b38';
  ctx.fillRect(0, 200, VIEW_W, 270);
  ctx.strokeStyle = '#2a3747';
  ctx.lineWidth = 1;
  for (let x = 80; x < VIEW_W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 200);
    ctx.lineTo(x, 470);
    ctx.stroke();
  }

  text(ctx, 'EMBER LINE', VIEW_W / 2, 96, 62, '#f5c542', 'bold', 'center');
  text(
    ctx,
    'cook in the temperature band: 4 burners, 3 heat zones, 12 timed orders, 1 rush hour',
    VIEW_W / 2,
    154,
    15,
    '#e2e8f0',
    'bold',
    'center',
  );

  const featured = ['bun', 'patty', 'cheese', 'tomato'];
  const cardW = 240;
  const cardH = 224;
  const gap = 24;
  const startX = (VIEW_W - (featured.length * cardW + (featured.length - 1) * gap)) / 2;
  const cardY = 222;

  for (let i = 0; i < featured.length; i++) {
    const spec = INGREDIENTS[featured[i]];
    const cx = startX + i * (cardW + gap);

    roundRect(ctx, cx, cardY, cardW, cardH, 12);
    ctx.fillStyle = '#1b202b';
    ctx.fill();
    ctx.strokeStyle = i === 1 ? '#f5c542' : '#32394b';
    ctx.lineWidth = i === 1 ? 2.5 : 1.5;
    ctx.stroke();

    text(ctx, `BURNER ${i + 1}`, cx + 14, cardY + 20, 12, '#94a3b8', 'bold', 'left');
    text(ctx, `${spec.band[0]}°–${spec.band[1]}°`, cx + cardW - 14, cardY + 20, 12, '#4ade80', 'bold', 'right');

    const panX = cx + cardW / 2;
    const panY = cardY + 112;
    const glow = ctx.createRadialGradient(panX, panY, 24, panX, panY, 70);
    glow.addColorStop(0, 'rgba(255, 130, 35, 0.38)');
    glow.addColorStop(1, 'rgba(255, 50, 10, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(panX, panY, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(panX, panY, 56, 0, Math.PI * 2);
    ctx.fillStyle = '#2d3342';
    ctx.fill();
    ctx.strokeStyle = '#525b70';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(panX, panY, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#151821';
    ctx.fill();

    drawIngredient(ctx, spec.id, panX, panY, 32);
    text(ctx, spec.name.toUpperCase(), panX, cardY + 196, 13, '#f8fafc', 'bold', 'center');
  }

  text(
    ctx,
    'Dial each burner into an ingredient\'s green heat band to cook — too cold stalls, too hot scorches.',
    VIEW_W / 2,
    508,
    15,
    '#cbd5e1',
    'normal',
    'center',
  );
  text(
    ctx,
    'Plate cooked items + raw lettuce to match active tickets, then press [Space] or click SERVE before time runs out.',
    VIEW_W / 2,
    538,
    14,
    '#94a3b8',
    'normal',
    'center',
  );

  const btnX = 500;
  const btnY = 592;
  const btnW = 280;
  const btnH = 64;
  roundRect(ctx, btnX, btnY, btnW, btnH, 12);
  ctx.fillStyle = '#16a34a';
  ctx.fill();
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  text(ctx, 'CLICK TO START', VIEW_W / 2, btnY + btnH / 2, 20, '#ffffff', 'bold', 'center');

  text(ctx, 'or press [Space] / [Enter]', VIEW_W / 2, 682, 12, '#64748b', 'normal', 'center');

  ctx.restore();
}

function drawOver(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(10, 15, 22, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  roundRect(ctx, 340, 160, 600, 490, 16);
  ctx.fillStyle = '#18222e';
  ctx.fill();
  ctx.strokeStyle = '#324155';
  ctx.lineWidth = 2;
  ctx.stroke();

  text(ctx, 'SHIFT OVER', VIEW_W / 2, 226, 42, '#f5c542', 'bold', 'center');
  text(ctx, 'FINAL SCORE', VIEW_W / 2, 286, 14, '#94a3b8', 'bold', 'center');
  text(ctx, String(state.score), VIEW_W / 2, 340, 56, '#ffffff', 'bold', 'center');

  const stats = `Served: ${state.served}   |   Perfect: ${state.perfectCooks}   |   Burnt: ${state.burntCount}   |   Expired: ${state.expiredCount}`;
  text(ctx, stats, VIEW_W / 2, 424, 15, '#e2e8f0', 'bold', 'center');
  text(ctx, `BEST COMBO: x${state.bestCombo}`, VIEW_W / 2, 472, 18, '#4ade80', 'bold', 'center');

  roundRect(ctx, 540, 560, 200, 60, 10);
  ctx.fillStyle = '#16a34a';
  ctx.fill();
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'PLAY AGAIN [R]', 640, 590, 16, '#ffffff', 'bold', 'center');

  ctx.restore();
}

export function drawGame(ctx, state) {
  ctx.fillStyle = '#1b2530';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  if (state.screen === 'title') {
    drawTitle(ctx, state);
    return;
  }

  ctx.save();
  ctx.fillStyle = '#202b38';
  ctx.fillRect(0, 64, VIEW_W, 396);
  ctx.strokeStyle = '#283546';
  ctx.lineWidth = 1;
  for (let x = 80; x < VIEW_W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 64);
    ctx.lineTo(x, 460);
    ctx.stroke();
  }
  ctx.strokeStyle = '#2f3f52';
  ctx.beginPath();
  ctx.moveTo(0, 460);
  ctx.lineTo(VIEW_W, 460);
  ctx.stroke();
  ctx.restore();

  text(ctx, 'ORDER BOARD', 16, 71, 10, '#94a3b8', 'bold', 'left');
  drawTickets(ctx, state);

  text(ctx, 'STOVE', 16, 177, 10, '#94a3b8', 'bold', 'left');
  for (const burner of state.burners) {
    drawBurner(ctx, state, burner);
  }

  drawCounter(ctx, state);
  drawPlate(ctx, state);
  drawHud(ctx, state);
  drawFooter(ctx, state);

  if (state.screen === 'over') {
    drawOver(ctx, state);
  }
}
