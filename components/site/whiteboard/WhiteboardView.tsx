import Link from 'next/link';

import { Fx } from '@/components/ui/Fx';
import { routes } from '@/lib/routes';

import { Board } from './Board';

const trialGrid = [
  { h: 'Two board themes', b: 'Cream paper or chalkboard, with the ink palette swapped to suit.' },
  { h: 'Eight tools', b: 'Pen, highlighter, shapes, arrows, text and a stroke eraser.' },
  { h: 'Keyboard first', b: 'P, H, L, A, R, O, T, E and Ctrl+Z, the way a teacher works.' },
  { h: 'PNG download', b: 'Take the finished board with you before the tab closes.' },
];

const unlocked = [
  'Boards saved between lessons',
  'Multi-page boards and templates',
  'Hand out to a class and watch live',
  'Replay the lesson and export PDFs',
];

export function WhiteboardView() {
  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:26px 20px 18px">
        <Fx s="max-width:1300px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:22px;flex-wrap:wrap">
          <Fx>
            <Fx s="display:inline-flex;align-items:center;gap:9px;background:#fff;border-radius:999px;padding:7px 16px 7px 8px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:12.5px;font-weight:700;color:rgba(36,26,22,.7);animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
              <Fx
                as="span"
                s="display:flex;align-items:center;gap:6px;background:#FFF4D8;color:#96690A;padding:5px 11px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.05em"
              >
                FREE TO USE
              </Fx>
              No card, no limit, no download
            </Fx>
            <Fx as="h1" s="font-size:clamp(30px,3.6vw,44px);margin:16px 0 0;max-width:22ch">
              A board that keeps up with the lesson.
            </Fx>
          </Fx>
          <Fx s="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <Fx s="display:flex;align-items:center;gap:11px;background:#fff;border-radius:22px;padding:12px 18px;box-shadow:0 12px 26px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)">
              <Fx as="span" s="width:9px;height:9px;border-radius:50%;background:#21C08B;animation:glow 1.9s ease-in-out infinite" />
              <Fx as="span" s="font-size:13.5px;font-weight:700;color:#241A16">
                Free, unlimited · this tab only
              </Fx>
            </Fx>
            <Fx
              as={Link}
              href={routes.apps.whiteboard}
              s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#241A16;font-weight:700;font-size:14.5px;padding:14px 20px;border-radius:999px;background:#fff;box-shadow:0 12px 24px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .28s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              Open on whiteboard.officepigeon.com
            </Fx>
            <Fx
              as={Link}
              href={routes.pricing}
              s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:700;font-size:14.5px;padding:14px 22px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.34), inset 0 2px 3px rgba(255,255,255,.4);transition:transform .28s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              Unlock full board
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Board />

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:34px 20px 88px">
        <Fx className="wb-cta" s="max-width:1300px;margin:0 auto;display:grid;grid-template-columns:1.15fr 1fr;gap:16px">
          <Fx s="background:#fff;border-radius:32px;padding:34px 36px;box-shadow:0 18px 40px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.19em;text-transform:uppercase;color:#B4795A">
              What the free board gives you
            </Fx>
            <Fx as="h2" s="font-size:26px;margin:12px 0 0">
              The whole board, as often as you like.
            </Fx>
            <Fx
              as="p"
              s="font-size:15.5px;line-height:1.7;color:rgba(36,26,22,.68);margin:12px 0 0;max-width:54ch;text-wrap:pretty"
            >
              Pen, highlighter, shapes, text and both board themes are live and unlimited — nothing is greyed out,
              nothing is counted. The one thing the free board cannot do is remember: it lives in this tab only, and
              closing it wipes the ink.
            </Fx>
            <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:22px">
              {trialGrid.map((entry) => (
                <Fx key={entry.h} s="background:#FFF7F1;border-radius:20px;padding:15px 17px">
                  <Fx s="font-weight:700;font-size:14.5px;color:#241A16">{entry.h}</Fx>
                  <Fx s="font-size:13px;line-height:1.55;color:rgba(36,26,22,.6);margin-top:4px">{entry.b}</Fx>
                </Fx>
              ))}
            </Fx>
          </Fx>
          <Fx s="background:linear-gradient(160deg,#2A1A12,#3D2317 60%,#241A16);border-radius:32px;padding:34px 36px;box-shadow:0 22px 46px rgba(60,32,18,.26);display:flex;flex-direction:column">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.19em;text-transform:uppercase;color:#FFB58A">
              With an account
            </Fx>
            <Fx as="h2" s="font-size:26px;margin:12px 0 0;color:#FFEFE5">
              Boards that survive the bell.
            </Fx>
            <Fx s="display:flex;flex-direction:column;gap:10px;margin-top:20px;flex:1">
              {unlocked.map((item) => (
                <Fx key={item} s="display:flex;gap:11px;align-items:center">
                  <Fx
                    as="span"
                    s="width:21px;height:21px;flex:none;border-radius:50%;background:rgba(255,239,229,.13);color:#FFB58A;display:flex;align-items:center;justify-content:center;font-size:11px"
                  >
                    ✓
                  </Fx>
                  <Fx as="span" s="font-size:14.5px;color:rgba(255,239,229,.86)">
                    {item}
                  </Fx>
                </Fx>
              ))}
            </Fx>
            <Fx
              as={Link}
              href={routes.login}
              s="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:24px;text-decoration:none;color:#241A16;font-weight:700;font-size:15.5px;padding:17px 22px;border-radius:20px;background:#FFEFE5;transition:transform .28s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              Create a free account
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </>
  );
}
