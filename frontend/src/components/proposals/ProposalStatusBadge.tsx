const STATUS_STYLES: Record<string,string> = { DRAFT:'bg-gray-100 text-gray-600', SENT:'bg-blue-100 text-blue-700', VIEWED:'bg-yellow-100 text-yellow-700', APPROVED:'bg-green-100 text-green-700', REJECTED:'bg-red-100 text-red-600', EXPIRED:'bg-orange-100 text-orange-700' };
export function ProposalStatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status]||STATUS_STYLES.DRAFT}`}>{status}</span>;
}
