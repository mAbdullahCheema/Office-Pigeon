import { Fx } from '@/components/ui/Fx';

/**
 * Shown while a dashboard screen loads. This boundary sits inside the dashboard
 * layout, so the nav and the rail stay put and only the content column is
 * replaced — moving between dashboard sections keeps its frame.
 */
export default function DashboardLoading() {
  return (
    <Fx aria-busy="true" aria-label="Loading" s="display:flex;flex-direction:column;gap:18px">
      <Fx className="sk" s="height:150px;border-radius:38px" />

      <Fx className="four" s="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px">
        <Fx className="sk" s="height:104px;border-radius:26px" />
        <Fx className="sk" s="height:104px;border-radius:26px" />
        <Fx className="sk" s="height:104px;border-radius:26px" />
        <Fx className="sk" s="height:104px;border-radius:26px" />
      </Fx>

      <Fx className="sk" s="height:236px;border-radius:32px" />
      <Fx className="sk" s="height:300px;border-radius:32px" />
    </Fx>
  );
}
