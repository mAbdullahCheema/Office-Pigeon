import { Fx } from '@/components/ui/Fx';
import { appFor } from '@/lib/catalog';
import type { CatalogEntry } from '@/lib/site-content';

import { ProductPage } from './ProductPage';

const app = appFor('recipes')!;

const pantry = ['Spinach 4kg', 'Chicken thigh 9kg', 'Yoghurt 3L', 'Basmati 12kg', 'Tomato 7kg', 'Paneer 2kg'];

const dishes = [
  { icon: '🥬', name: 'Palak paneer, 12 portions', cost: '$1.10', sell: '$4.50', margin: '76%' },
  { icon: '🍗', name: 'Chicken karahi, 18 portions', cost: '$1.85', sell: '$6.00', margin: '69%' },
  { icon: '🍚', name: 'Yakhni pulao, 20 portions', cost: '$0.72', sell: '$3.20', margin: '78%' },
];

function HeroCard() {
  return (
    <Fx s="background:#fff;border-radius:38px;padding:20px;box-shadow:0 26px 54px rgba(196,120,74,.2), inset 0 2px 4px rgba(255,255,255,.95);animation:pop .9s cubic-bezier(.34,1.4,.64,1) .1s both">
      <Fx s="display:flex;align-items:center;gap:10px">
        <Fx as="span" s="width:9px;height:9px;border-radius:50%;background:#E8480F;animation:glow 2s ease-in-out infinite" />
        <Fx
          as="span"
          s="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(36,26,22,.45)"
        >
          Tonight&apos;s specials · 6 covers costed
        </Fx>
      </Fx>
      <Fx s="background:#FFF6F1;border-radius:24px;padding:18px 20px;margin-top:16px">
        <Fx s="font-size:13px;font-weight:700;color:rgba(36,26,22,.55)">In the store room</Fx>
        <Fx s="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px">
          {pantry.map((item) => (
            <Fx
              key={item}
              as="span"
              s="background:#fff;border-radius:999px;padding:8px 14px;font-size:12.5px;font-weight:700;box-shadow:0 6px 14px rgba(196,120,74,.12)"
            >
              {item}
            </Fx>
          ))}
        </Fx>
      </Fx>
      <Fx s="display:flex;flex-direction:column;gap:8px;margin-top:10px">
        {dishes.map((dish) => (
          <Fx key={dish.name} s="display:flex;align-items:center;gap:12px;background:#FFEDE3;border-radius:20px;padding:14px 16px">
            <Fx
              as="span"
              s="width:34px;height:34px;flex:none;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:15px"
            >
              {dish.icon}
            </Fx>
            <Fx as="span" s="flex:1;min-width:0;line-height:1.35">
              <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:14px">
                {dish.name}
              </Fx>
              <Fx as="span" s="display:block;font-size:12px;color:rgba(36,26,22,.55)">
                Cost {dish.cost} · sell {dish.sell}
              </Fx>
            </Fx>
            <Fx as="span" className="tt" s="font-weight:800;font-size:14px;color:#0F9C6E">
              {dish.margin}
            </Fx>
          </Fx>
        ))}
      </Fx>
      <Fx s="display:flex;align-items:center;gap:12px;background:#FFF4D8;border-radius:20px;padding:14px 16px;margin-top:10px">
        <Fx
          as="span"
          s="width:34px;height:34px;flex:none;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:15px"
        >
          ⏳
        </Fx>
        <Fx as="span" s="font-size:13.5px;line-height:1.5;color:rgba(36,26,22,.72)">
          <strong>4kg spinach</strong> turns in two days — put the palak special on tonight.
        </Fx>
      </Fx>
    </Fx>
  );
}

export function AiRecipesView({ entry, licensed }: { entry: CatalogEntry; licensed: boolean }) {
  return (
    <ProductPage
      app={app}
      entry={entry}
      licensed={licensed}
      badge={{ pill: '7-DAY FREE TRIAL', note: 'No card. Full kitchen.' }}
      title="Menus from what is already in your store room."
      lede="Tell AI Recipes what you stock and what it costs. It writes the dishes, prices every portion, flags what is about to turn, and hands the shopping list to each supplier — sized for next week, not for a guess."
      buyLabel="Buy it from $49/mo"
      heroCard={<HeroCard />}
      stats={[
        { value: '18%', label: 'less food waste' },
        { value: '30 min', label: 'menu planning, not a day' },
        { value: 'Live', label: 'margin on every dish' },
        { value: '1 order', label: 'per supplier, per week' },
      ]}
      featuresTitle="Written for a kitchen at 6am, not a food blog."
      features={[
        {
          icon: '📦',
          title: 'Menus from your stock',
          body: 'It only suggests dishes you can cook tonight with what is on the shelf — quantities included, scaled to your covers.',
        },
        {
          icon: '💰',
          title: 'Costed to the portion',
          body: 'Supplier prices roll up per dish, so you see the plate cost and margin change the moment onions go up.',
        },
        {
          icon: '🧾',
          title: 'Shopping list per supplier',
          body: 'One consolidated order each, sized to next week from your own sales history. Send it straight to WhatsApp.',
        },
        {
          icon: '⏳',
          title: 'Waste flagged early',
          body: 'Ingredients about to turn become tomorrow’s special before they become a bin bag.',
        },
        {
          icon: '📋',
          title: 'Prep sheets for the line',
          body: 'Every dish prints as a station card: mise en place, quantities, timings, allergens.',
        },
        {
          icon: '🌱',
          title: 'Allergens and swaps',
          body: 'Mark a dish gluten-free or halal and it rewrites the method with substitutions your suppliers actually carry.',
        },
      ]}
      stepsTitle="One afternoon to set up, then it runs weekly."
      steps={[
        {
          n: '1',
          title: 'Load stock and prices',
          body: 'Type or paste your store-room list with what you paid. Two hundred lines takes about an hour, once.',
        },
        {
          n: '2',
          title: 'Set covers and style',
          body: 'Tell it how many you serve, your cuisine and target plate cost. It proposes a week of menus.',
        },
        {
          n: '3',
          title: 'Cook, then repeat',
          body: 'Each week it reorders on your usage, keeps margins visible and learns which specials sold out.',
        },
      ]}
      planIncludes={{
        'rec-std': [
          'One kitchen, unlimited dishes',
          'Supplier price book',
          'Prep sheets and station cards',
          'Weekly shopping lists',
        ],
      }}
      trialPanel={{
        kicker: 'Try before you buy',
        title: 'Seven days, your real menu.',
        body: "Load your stock list and last week's supplier prices. Cost a full menu, print the shopping list, see the margin. Everything you build in the trial carries over if you buy.",
      }}
      panel={{
        bg: 'linear-gradient(160deg,#2A1A12,#3D2317 55%,#241A16)',
        fg: '#FFEFE5',
        kicker: '#FFB58A',
        body: 'rgba(255,239,229,.7)',
        btnBg: '#FFB58A',
      }}
      panelBesidePlans
      faqsTitle="Questions chefs ask first"
      faqs={[
        {
          q: 'Do I have to type in every ingredient price?',
          a: 'Once, at the start — and we do it with you on a call if your list is long. After that prices update when you correct an invoice, and the whole menu recosts itself.',
        },
        {
          q: 'Will it invent dishes my cooks cannot make?',
          a: 'It works from the cuisines and techniques you set up. If your line does not do sous-vide, it never suggests it. You can also lock it to a fixed dish list and use it purely for costing.',
        },
        {
          q: 'We run three branches. Does that work?',
          a: 'Standard covers one kitchen. For several branches with shared suppliers we set up a group account — talk to us and we will price it properly rather than multiplying the plan.',
        },
        {
          q: 'Does it connect to my POS?',
          a: 'Sales import from a CSV export today, and we build direct connections on request. Even without it, usage patterns come from your own stock counts.',
        },
      ]}
    />
  );
}
