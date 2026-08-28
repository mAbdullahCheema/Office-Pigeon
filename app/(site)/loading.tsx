import { Fx } from '@/components/ui/Fx';

/**
 * Shown while a public page is being rendered on the server.
 *
 * Pages here read live content, so a navigation has a real wait in it. Without
 * a boundary the browser stayed on the previous page for the whole of it and
 * the site looked frozen; this gives the click an immediate answer.
 *
 * The first block mirrors the nav's geometry so the header does not appear to
 * vanish and the page does not jump when the real content arrives.
 */
export default function SiteLoading() {
  return (
    <Fx as="main" aria-busy="true" aria-label="Loading" s="min-height:100dvh">
      <Fx s="padding:14px 20px">
        <Fx className="sk" s="max-width:1300px;height:68px;margin:0 auto;border-radius:26px" />
      </Fx>

      <Fx s="max-width:1300px;margin:0 auto;padding:48px 20px 96px;display:flex;flex-direction:column;gap:18px">
        <Fx className="sk" s="width:min(220px,60%);height:34px;border-radius:999px" />
        <Fx className="sk" s="width:min(680px,100%);height:64px" />
        <Fx className="sk" s="width:min(540px,92%);height:64px" />
        <Fx className="sk" s="width:min(460px,86%);height:22px;margin-top:10px" />
        <Fx className="sk" s="width:min(380px,74%);height:22px" />

        <Fx
          className="three"
          s="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:34px"
        >
          <Fx className="sk" s="height:212px;border-radius:30px" />
          <Fx className="sk" s="height:212px;border-radius:30px" />
          <Fx className="sk" s="height:212px;border-radius:30px" />
        </Fx>
      </Fx>
    </Fx>
  );
}
