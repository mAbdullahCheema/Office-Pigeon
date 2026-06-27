/** Region-restricted interstitial for /pakistan, ported 1:1 from server.ts. */
export const pakistanRestrictedPage = (): string => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Region-Specific Page | Office Pigeon</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 24px; background: #FAF9F6; color: #1A1A1A; font-family: Manrope, ui-sans-serif, system-ui, sans-serif; overflow: hidden; }
    body::before { content: ""; position: fixed; top: -120px; right: -140px; width: 520px; height: 520px; border-radius: 999px; background: radial-gradient(circle, rgba(249,115,22,.22), rgba(244,63,94,.08), transparent 65%); filter: blur(42px); pointer-events: none; }
    body::after { content: ""; position: fixed; bottom: -180px; left: -160px; width: 520px; height: 520px; border-radius: 999px; background: radial-gradient(circle, rgba(245,158,11,.20), rgba(249,115,22,.08), transparent 65%); filter: blur(48px); pointer-events: none; }
    main { width: min(720px, 100%); position: relative; z-index: 1; text-align: center; background: rgba(255,255,255,.86); border: 1px solid rgba(0,0,0,.06); border-radius: 36px; padding: clamp(28px, 6vw, 56px); box-shadow: 0 44px 90px rgba(0,0,0,.055); }
    .mark { width: 58px; height: 58px; margin: 0 auto 22px; border-radius: 999px; display: grid; place-items: center; background: linear-gradient(135deg, #f97316, #e11d48, #f59e0b); box-shadow: 0 18px 38px rgba(249,115,22,.18); }
    .mark img { width: 31px; height: 31px; }
    .eyebrow { display: inline-flex; align-items: center; justify-content: center; padding: 7px 13px; border-radius: 999px; background: #fff7ed; border: 1px solid rgba(249,115,22,.18); color: #ea580c; font: 800 11px/1 JetBrains Mono, ui-monospace, monospace; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 20px 0 14px; font-size: clamp(34px, 7vw, 58px); line-height: 1.02; letter-spacing: -.025em; text-transform: uppercase; }
    p { margin: 0 auto; max-width: 560px; color: #4b5563; font-size: 15px; line-height: 1.7; font-weight: 600; }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 30px; }
    a { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 22px; border-radius: 999px; text-decoration: none; font: 900 12px/1 JetBrains Mono, ui-monospace, monospace; text-transform: uppercase; letter-spacing: .045em; }
    .primary { background: #111; color: #fff; }
    .secondary { background: #F0EEEA; color: #1f2937; border: 1px solid rgba(0,0,0,.06); }
    .note { margin-top: 22px; color: #667085; font-size: 12px; }
  </style>
</head>
<body>
  <main>
    <div class="mark"><img src="/logos/office-pigeon-icon.svg" alt="Office Pigeon" /></div>
    <div class="eyebrow">Region-Specific Page</div>
    <h1>Region-Specific Page</h1>
    <p>This Office Pigeon Pakistan page is currently available for visitors in Pakistan only. You may have reached a region-specific page.</p>
    <p class="note">Please visit our main website for international services.</p>
    <div class="actions">
      <a class="primary" href="/">Go to Office Pigeon Home</a>
      <a class="secondary" href="mailto:contactus@officepigeon.com">Contact Office Pigeon</a>
    </div>
  </main>
</body>
</html>`;
