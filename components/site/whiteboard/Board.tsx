'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import { css, Fx } from '@/components/ui/Fx';
import { routes } from '@/lib/routes';

/**
 * The AI Whiteboard demo. Ink lives in this tab only — the free board keeps
 * strokes in sessionStorage and nothing leaves the device.
 */

const SESS_KEY = 'op-wb-session';
const INK_KEY = 'op-wb-ink';

type ToolId = 'pen' | 'hi' | 'line' | 'arrow' | 'rect' | 'ell' | 'text' | 'erase';

type Stroke = {
  t: ToolId;
  c: string;
  w: number;
  pts: [number, number][];
  text?: string;
};

const THEMES = {
  paper: {
    label: 'Chalkboard',
    bg: '#FFFDF9',
    rule: 'rgba(36,26,22,.06)',
    inks: [
      { name: 'Ink', v: '#241A16' },
      { name: 'Clay', v: '#E8480F' },
      { name: 'Amber', v: '#E8A33C' },
      { name: 'Green', v: '#0F9C6E' },
      { name: 'Teal', v: '#1E8FA8' },
      { name: 'Indigo', v: '#5A48D6' },
      { name: 'Plum', v: '#B4239B' },
      { name: 'Slate', v: '#6B5A52' },
    ],
  },
  chalk: {
    label: 'Paper',
    bg: '#1F2E27',
    rule: 'rgba(255,255,255,.05)',
    inks: [
      { name: 'Chalk', v: '#F4EFE8' },
      { name: 'Coral', v: '#FF9B72' },
      { name: 'Butter', v: '#F5D98B' },
      { name: 'Mint', v: '#8DE3BE' },
      { name: 'Sky', v: '#93D4E8' },
      { name: 'Lilac', v: '#B8AEF7' },
      { name: 'Rose', v: '#F3A8DC' },
      { name: 'Ash', v: '#B9AFA7' },
    ],
  },
} as const;

const TOOLS: { id: ToolId; name: string; icon: string; key: string; hint: string }[] = [
  { id: 'pen', name: 'Pen', icon: '✎', key: 'P', hint: 'Draw freehand. Shift for a straight run.' },
  { id: 'hi', name: 'Highlighter', icon: '▨', key: 'H', hint: 'Wide, translucent ink over your working.' },
  { id: 'line', name: 'Line', icon: '╱', key: 'L', hint: 'Drag from start to end.' },
  { id: 'arrow', name: 'Arrow', icon: '↗', key: 'A', hint: 'Drag to point at something.' },
  { id: 'rect', name: 'Rectangle', icon: '▭', key: 'R', hint: 'Drag out a box.' },
  { id: 'ell', name: 'Ellipse', icon: '◯', key: 'O', hint: 'Drag out a circle or oval.' },
  { id: 'text', name: 'Text', icon: 'T', key: 'T', hint: 'Click the board, type, press Enter.' },
  { id: 'erase', name: 'Eraser', icon: '⌫', key: 'E', hint: 'Drag over ink to remove whole strokes.' },
];

const WIDTHS = [
  { w: 2, dot: 5 },
  { w: 4, dot: 8 },
  { w: 8, dot: 12 },
  { w: 16, dot: 16 },
];

const trialRules = [
  'Draw as often as you like. There is no session limit and no card, and every tool is unlocked.',
  'The board lives in this browser tab only. Close the tab and the ink is gone — nothing is uploaded, nothing is kept on our side.',
  'Download a PNG whenever you want to keep the working. Saving boards between lessons needs an account.',
];

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke.c;
  ctx.fillStyle = stroke.c;
  ctx.lineWidth = stroke.w;
  if (stroke.t === 'hi') {
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = stroke.w * 4;
  }

  const p = stroke.pts;
  if (stroke.t === 'text') {
    ctx.font = `700 ${16 + stroke.w * 3}px var(--font-bricolage), system-ui, sans-serif`;
    ctx.fillText(stroke.text ?? '', p[0][0], p[0][1]);
  } else if (stroke.t === 'pen' || stroke.t === 'hi') {
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i += 1) {
      const mx = (p[i - 1][0] + p[i][0]) / 2;
      const my = (p[i - 1][1] + p[i][1]) / 2;
      ctx.quadraticCurveTo(p[i - 1][0], p[i - 1][1], mx, my);
    }
    ctx.stroke();
  } else if (stroke.t === 'rect') {
    ctx.strokeRect(p[0][0], p[0][1], p[1][0] - p[0][0], p[1][1] - p[0][1]);
  } else if (stroke.t === 'ell') {
    const cx = (p[0][0] + p[1][0]) / 2;
    const cy = (p[0][1] + p[1][1]) / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(p[1][0] - p[0][0]) / 2, Math.abs(p[1][1] - p[0][1]) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    ctx.lineTo(p[1][0], p[1][1]);
    ctx.stroke();
    if (stroke.t === 'arrow') {
      const angle = Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]);
      const len = 10 + stroke.w * 2;
      ctx.beginPath();
      ctx.moveTo(p[1][0], p[1][1]);
      ctx.lineTo(p[1][0] - len * Math.cos(angle - 0.4), p[1][1] - len * Math.sin(angle - 0.4));
      ctx.moveTo(p[1][0], p[1][1]);
      ctx.lineTo(p[1][0] - len * Math.cos(angle + 0.4), p[1][1] - len * Math.sin(angle + 0.4));
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function Board() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef<{ w: number; h: number } | null>(null);
  const erasingRef = useRef(false);

  const [phase, setPhase] = useState<'intro' | 'live'>('intro');
  const [tool, setTool] = useState<ToolId>('pen');
  const [inkIndex, setInkIndex] = useState(0);
  const [width, setWidth] = useState(4);
  const [theme, setTheme] = useState<keyof typeof THEMES>('paper');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [draft, setDraft] = useState<Stroke | null>(null);
  const [text, setText] = useState<{ x: number; y: number; v: string } | null>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [full, setFull] = useState(false);

  const palette = THEMES[theme];
  const ink = palette.inks[inkIndex].v;

  const save = useCallback((next: Stroke[]) => {
    try {
      sessionStorage.setItem(INK_KEY, JSON.stringify(next));
    } catch {
      /* private mode — the board still works for this session */
    }
  }, []);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const size = sizeRef.current;
    if (!canvas || !size) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = size;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = palette.rule;
    ctx.lineWidth = 1;
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    const all = draft ? strokes.concat([draft]) : strokes;
    all.forEach((stroke) => drawStroke(ctx, stroke));
    ctx.restore();
  }, [draft, palette.bg, palette.rule, strokes]);

  const fit = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    sizeRef.current = { w: rect.width, h: rect.height };
    paint();
  }, [paint]);

  useEffect(() => {
    let active = false;
    try {
      active = sessionStorage.getItem(SESS_KEY) === '1';
    } catch {
      active = false;
    }
    if (active) {
      // Session ink is browser-only, so it can only be read after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('live');
      try {
        setStrokes(JSON.parse(sessionStorage.getItem(INK_KEY) || '[]') as Stroke[]);
      } catch {
        setStrokes([]);
      }
    }
    fit();
    requestAnimationFrame(fit);

    // The board sizes to its container, which settles after fonts and layout.
    const observer = new ResizeObserver(() => fit());
    if (wrapRef.current) observer.observe(wrapRef.current);

    const onResize = () => fit();
    const onFullscreen = () => {
      setFull(Boolean(document.fullscreenElement));
      requestAnimationFrame(fit);
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [fit]);

  useEffect(() => {
    paint();
  }, [paint]);

  // History moves read the current arrays directly — nesting one setState
  // inside another updater drops the inner update.
  const undo = useCallback(() => {
    if (strokes.length === 0) return;
    const next = strokes.slice(0, -1);
    save(next);
    setStrokes(next);
    setRedoStack((stack) => stack.concat([strokes[strokes.length - 1]]));
  }, [save, strokes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const restored = redoStack[redoStack.length - 1];
    const next = strokes.concat([restored]);
    save(next);
    setStrokes(next);
    setRedoStack(redoStack.slice(0, -1));
  }, [redoStack, save, strokes]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (phase !== 'live' || text) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const match = TOOLS.find((entry) => entry.key.toLowerCase() === event.key.toLowerCase());
      if (match) setTool(match.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, redo, text, undo]);

  function pointFrom(event: ReactPointerEvent<HTMLCanvasElement>): [number, number] {
    const rect = event.currentTarget.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  function erase(point: [number, number]) {
    const kept = strokes.filter(
      (stroke) => !stroke.pts.some((p) => Math.hypot(p[0] - point[0], p[1] - point[1]) < 16),
    );
    if (kept.length === strokes.length) return;
    save(kept);
    setStrokes(kept);
  }

  function commitText() {
    if (!text) return;
    if (text.v.trim()) {
      const stroke: Stroke = { t: 'text', c: ink, w: width, pts: [[text.x, text.y + 22]], text: text.v };
      const next = strokes.concat([stroke]);
      save(next);
      setStrokes(next);
      setRedoStack([]);
    }
    setText(null);
  }

  const live = phase === 'live';
  const activeTool = TOOLS.find((entry) => entry.id === tool);

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 20px">
        <div
          ref={wrapRef}
          style={css(
            'max-width:1300px;height:clamp(520px,76vh,760px);margin:0 auto;position:relative;border-radius:34px;overflow:hidden;box-shadow:0 26px 56px rgba(196,120,74,.2), inset 0 2px 3px rgba(255,255,255,.9);background:#fff',
          )}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={(event) => {
              if (!live || text) return;
              const point = pointFrom(event);
              if (tool === 'text') {
                setText({ x: point[0], y: point[1], v: '' });
                return;
              }
              try {
                event.currentTarget.setPointerCapture(event.pointerId);
              } catch {
                // Some pointers cannot be captured; drawing still works.
              }
              if (tool === 'erase') {
                erasingRef.current = true;
                erase(point);
                return;
              }
              setDraft({ t: tool, c: ink, w: width, pts: [point, point] });
            }}
            onPointerMove={(event) => {
              if (!live) return;
              const point = pointFrom(event);
              if (erasingRef.current) {
                erase(point);
                return;
              }
              setDraft((current) => {
                if (!current) return current;
                const pts: [number, number][] =
                  current.t === 'pen' || current.t === 'hi' ? current.pts.concat([point]) : [current.pts[0], point];
                return { ...current, pts };
              });
            }}
            onPointerUp={() => {
              erasingRef.current = false;
              if (!draft) return;
              const last = draft.pts[draft.pts.length - 1];
              const moved = Math.hypot(last[0] - draft.pts[0][0], last[1] - draft.pts[0][1]);
              const keep = draft.t === 'pen' || draft.t === 'hi' ? draft.pts.length > 1 : moved > 4;
              if (keep) {
                const next = strokes.concat([draft]);
                save(next);
                setStrokes(next);
                setRedoStack([]);
              }
              setDraft(null);
            }}
            onPointerLeave={() => {
              erasingRef.current = false;
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              touchAction: 'none',
              cursor: 'crosshair',
            }}
          />

          {text ? (
            <Fx
              as="input"
              autoFocus
              value={text.v}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setText((current) => (current ? { ...current, v: event.target.value } : current))
              }
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') commitText();
                if (event.key === 'Escape') setText(null);
              }}
              onBlur={commitText}
              placeholder="Type, then Enter"
              s={`position:absolute;left:${text.x}px;top:${text.y}px;z-index:6;border:0;outline:2px solid rgba(239,90,31,.5);border-radius:10px;padding:6px 10px;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:700;font-size:26px;background:rgba(255,255,255,.9);color:#241A16;min-width:min(220px, 60vw)`}
            />
          ) : null}

          <Fx
            className="wb-dock"
            s="position:absolute;left:16px;top:50%;transform:translateY(-50%);max-height:calc(100% - 32px);overflow:auto;z-index:5;display:flex;flex-direction:column;gap:4px;background:rgba(255,255,255,.92);backdrop-filter:blur(14px);border-radius:26px;padding:8px;box-shadow:0 18px 38px rgba(60,32,18,.18)"
          >
            {TOOLS.map((entry) => (
              <Fx
                key={entry.id}
                as="button"
                type="button"
                onClick={() => setTool(entry.id)}
                onMouseEnter={(event: React.MouseEvent<HTMLButtonElement>) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setTip({
                    text: `${entry.name} (${entry.key}) — ${entry.hint}`,
                    x: Math.min(Math.max(rect.left + rect.width / 2, 130), window.innerWidth - 130),
                    y: rect.top - 10,
                  });
                }}
                onMouseLeave={() => setTip(null)}
                title={entry.name}
                aria-label={entry.name}
                aria-pressed={tool === entry.id}
                s={`width:44px;height:44px;flex:none;border:0;cursor:pointer;border-radius:18px;background:${
                  tool === entry.id ? '#EF5A1F' : 'transparent'
                };color:${
                  tool === entry.id ? '#fff' : '#241A16'
                };font-size:18px;font-family:inherit;display:flex;align-items:center;justify-content:center;transition:background .2s, transform .25s cubic-bezier(.34,1.56,.64,1)`}
                hover="transform:scale(1.06)"
              >
                {entry.icon}
              </Fx>
            ))}
          </Fx>

          <Fx
            className="wb-opts"
            s="position:absolute;left:82px;top:16px;z-index:5;display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:rgba(255,255,255,.92);backdrop-filter:blur(14px);border-radius:22px;padding:10px 16px;box-shadow:0 18px 38px rgba(60,32,18,.16)"
          >
            <Fx s="display:flex;gap:6px">
              {palette.inks.map((entry, index) => (
                <Fx
                  key={entry.name}
                  as="button"
                  type="button"
                  onClick={() => setInkIndex(index)}
                  aria-label={entry.name}
                  title={entry.name}
                  s={`width:26px;height:26px;border:0;cursor:pointer;border-radius:50%;background:${entry.v};box-shadow:${
                    inkIndex === index ? '0 0 0 3px #fff, 0 0 0 5px #EF5A1F' : '0 0 0 2px rgba(36,26,22,.08)'
                  };transition:transform .25s cubic-bezier(.34,1.56,.64,1)`}
                  hover="transform:scale(1.12)"
                />
              ))}
            </Fx>
            <Fx as="span" s="width:1px;height:24px;background:rgba(36,26,22,.12)" />
            <Fx s="display:flex;align-items:center;gap:6px">
              {WIDTHS.map((entry) => (
                <Fx
                  key={entry.w}
                  as="button"
                  type="button"
                  onClick={() => setWidth(entry.w)}
                  aria-label={`${entry.w} px`}
                  title={`${entry.w} px`}
                  s={`width:30px;height:30px;border:0;cursor:pointer;border-radius:12px;background:${
                    width === entry.w ? '#FFEDE3' : 'transparent'
                  };display:flex;align-items:center;justify-content:center;transition:background .2s`}
                >
                  <Fx
                    as="span"
                    s={`width:${entry.dot}px;height:${entry.dot}px;border-radius:50%;background:#241A16`}
                  />
                </Fx>
              ))}
            </Fx>
            <Fx as="span" s="width:1px;height:24px;background:rgba(36,26,22,.12)" />
            <Fx as="span" s="font-size:12.5px;font-weight:700;color:rgba(36,26,22,.55)">
              {activeTool?.hint}
            </Fx>
          </Fx>

          <Fx
            className="wb-hist"
            s="position:absolute;left:82px;bottom:16px;z-index:5;display:flex;gap:6px;background:rgba(255,255,255,.92);backdrop-filter:blur(14px);border-radius:20px;padding:7px;box-shadow:0 18px 38px rgba(60,32,18,.16)"
          >
            <Fx
              as="button"
              type="button"
              onClick={undo}
              title="Undo"
              aria-label="Undo"
              s="width:42px;height:42px;border:0;cursor:pointer;border-radius:16px;background:#FFF7F1;color:#241A16;font-size:16px;font-family:inherit;transition:background .2s"
              hover="background:#FFEDE3"
            >
              ↺
            </Fx>
            <Fx
              as="button"
              type="button"
              onClick={redo}
              title="Redo"
              aria-label="Redo"
              s="width:42px;height:42px;border:0;cursor:pointer;border-radius:16px;background:#FFF7F1;color:#241A16;font-size:16px;font-family:inherit;transition:background .2s"
              hover="background:#FFEDE3"
            >
              ↻
            </Fx>
            <Fx
              as="button"
              type="button"
              onClick={() => {
                save([]);
                setStrokes([]);
                setRedoStack([]);
                setDraft(null);
              }}
              title="Clear board"
              aria-label="Clear board"
              s="height:42px;padding:0 16px;border:0;cursor:pointer;border-radius:16px;background:#FFF7F1;color:#241A16;font-size:13.5px;font-weight:700;font-family:inherit;transition:background .2s"
              hover="background:#FFEDE3"
            >
              Clear
            </Fx>
          </Fx>

          <Fx
            className="wb-side"
            s="position:absolute;right:16px;bottom:16px;z-index:5;display:flex;gap:6px;background:rgba(255,255,255,.92);backdrop-filter:blur(14px);border-radius:20px;padding:7px;box-shadow:0 18px 38px rgba(60,32,18,.16)"
          >
            <Fx
              as="button"
              type="button"
              onClick={() => setTheme((current) => (current === 'paper' ? 'chalk' : 'paper'))}
              title="Switch board theme"
              aria-label="Switch board theme"
              s="height:42px;padding:0 16px;border:0;cursor:pointer;border-radius:16px;background:#FFF7F1;color:#241A16;font-size:13.5px;font-weight:700;font-family:inherit;transition:background .2s"
              hover="background:#FFEDE3"
            >
              {palette.label}
            </Fx>
            <Fx
              as="button"
              type="button"
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const link = document.createElement('a');
                link.download = 'office-pigeon-board.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
              }}
              title="Download PNG"
              aria-label="Download PNG"
              s="height:42px;padding:0 16px;border:0;cursor:pointer;border-radius:16px;background:#FFF7F1;color:#241A16;font-size:13.5px;font-weight:700;font-family:inherit;transition:background .2s"
              hover="background:#FFEDE3"
            >
              Download
            </Fx>
            <Fx
              as="button"
              type="button"
              onClick={() => {
                const wrap = wrapRef.current;
                if (!wrap) return;
                if (document.fullscreenElement) document.exitFullscreen();
                else wrap.requestFullscreen?.();
              }}
              title="Full screen"
              aria-label="Full screen"
              s="width:42px;height:42px;border:0;cursor:pointer;border-radius:16px;background:#FFF7F1;color:#241A16;font-size:15px;font-family:inherit;transition:background .2s"
              hover="background:#FFEDE3"
            >
              {full ? '⤫' : '⤢'}
            </Fx>
            <Fx
              as={Link}
              href={routes.login}
              title="Save this board to an account"
              s="display:flex;align-items:center;height:42px;padding:0 16px;border-radius:16px;background:#241A16;color:#fff;text-decoration:none;font-size:13.5px;font-weight:700;transition:transform .25s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-2px);color:#fff"
            >
              Save to account
            </Fx>
          </Fx>

          {tip ? (
            <Fx
              s={`position:fixed;left:${tip.x}px;top:${tip.y}px;z-index:40;transform:translate(-50%,-100%);pointer-events:none;background:#241A16;color:#FFEFE5;font-size:12.5px;font-weight:600;line-height:1.4;padding:9px 13px;border-radius:13px;max-width:250px;box-shadow:0 14px 30px rgba(36,26,22,.3);animation:tipIn .18s ease-out both`}
            >
              {tip.text}
            </Fx>
          ) : null}

          {phase === 'intro' ? (
            <Fx s="position:absolute;inset:0;z-index:8;background:rgba(36,26,22,.42);backdrop-filter:blur(9px);display:flex;align-items:center;justify-content:center;padding:24px">
              <Fx s="width:min(560px,100%);background:#fff;border-radius:34px;padding:38px 38px 32px;box-shadow:0 34px 76px rgba(36,26,22,.36);animation:pop .5s cubic-bezier(.34,1.4,.64,1) both">
                <Fx s="display:flex;align-items:center;gap:13px">
                  <Fx
                    as="span"
                    s="width:48px;height:48px;flex:none;border-radius:18px;background:#FFF4D8;display:flex;align-items:center;justify-content:center;font-size:22px"
                  >
                    🖍️
                  </Fx>
                  <Fx>
                    <Fx as="h2" s="font-size:26px">
                      Take the board for a run
                    </Fx>
                    <Fx s="font-size:13.5px;font-weight:700;color:#E8480F;margin-top:4px">
                      Free and unlimited · nothing saved
                    </Fx>
                  </Fx>
                </Fx>
                <Fx s="display:flex;flex-direction:column;gap:11px;margin-top:22px">
                  {trialRules.map((rule) => (
                    <Fx key={rule} s="display:flex;gap:11px;align-items:flex-start">
                      <Fx
                        as="span"
                        s="width:21px;height:21px;flex:none;border-radius:50%;background:#FFF3EB;color:#E8480F;display:flex;align-items:center;justify-content:center;font-size:11px;margin-top:2px"
                      >
                        •
                      </Fx>
                      <Fx as="span" s="font-size:14.5px;line-height:1.62;color:rgba(36,26,22,.72)">
                        {rule}
                      </Fx>
                    </Fx>
                  ))}
                </Fx>
                <Fx
                  as="button"
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.setItem(SESS_KEY, '1');
                      sessionStorage.setItem(INK_KEY, '[]');
                    } catch {
                      /* private mode — the board still runs */
                    }
                    setPhase('live');
                    setStrokes([]);
                    setRedoStack([]);
                    setDraft(null);
                    requestAnimationFrame(fit);
                  }}
                  s="width:100%;margin-top:24px;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:16px;padding:17px;border-radius:20px;color:#fff;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 16px 30px rgba(226,78,23,.36), inset 0 2px 3px rgba(255,255,255,.4);transition:transform .28s cubic-bezier(.34,1.56,.64,1)"
                  hover="transform:translateY(-3px)"
                >
                  Start drawing
                </Fx>
                <Fx s="font-size:12.5px;color:rgba(36,26,22,.5);margin-top:12px;text-align:center">
                  Nothing leaves your device during the trial.{' '}
                  <Link href={`${routes.legal}#privacy`}>How we handle data</Link>
                </Fx>
              </Fx>
            </Fx>
          ) : null}
        </div>
      </Fx>
    </>
  );
}
