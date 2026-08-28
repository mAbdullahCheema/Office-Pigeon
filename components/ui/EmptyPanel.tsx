import type { ReactNode } from 'react';

import { Fx } from './Fx';

/**
 * What a public list shows when it has nothing to show.
 *
 * Every filtered list on the site can be narrowed to nothing — a category with
 * no entries yet, a section whose content has not been published. Without this
 * the page simply ends after the filter chips, which reads as a broken page
 * rather than an empty one.
 */
export function EmptyPanel({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Fx
      role="status"
      s="background:#fff;border-radius:34px;padding:52px 32px;text-align:center;box-shadow:0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);animation:pop .45s cubic-bezier(.34,1.4,.64,1) both"
    >
      <Fx
        as="span"
        s="width:62px;height:62px;margin:0 auto;border-radius:24px;background:#FFF0E7;display:flex;align-items:center;justify-content:center;font-size:26px"
      >
        {icon}
      </Fx>
      <Fx as="h3" className="tt" s="font-size:23px;font-weight:800;margin-top:20px">
        {title}
      </Fx>
      <Fx
        as="p"
        s="font-size:15px;line-height:1.66;color:rgba(36,26,22,.6);margin:12px auto 0;max-width:42ch;text-wrap:pretty"
      >
        {body}
      </Fx>
      {action ? <Fx s="margin-top:24px;display:flex;justify-content:center">{action}</Fx> : null}
    </Fx>
  );
}
