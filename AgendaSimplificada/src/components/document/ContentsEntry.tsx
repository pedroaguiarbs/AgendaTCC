import type { ContentsEntryData } from "../../data/contents";
import { pagePlan } from "../../data/page-plan";
export function ContentsEntry({
  entry,
  compact = false,
  final = false,
}: {
  entry: ContentsEntryData;
  compact?: boolean;
  final?: boolean;
}) {
  const definition = pagePlan.find((page) => page.id === entry.pageId);
  if (!definition || definition.number === null)
    throw new Error(`Página inválida no sumário: ${entry.pageId}`);
  return (
    <div className={`tocLine${final ? " tocFinal" : ""}`}>
      {" "}
      <span className="tocText">{entry.label}</span>
      {!compact && " "}
      <span className="tocDots" aria-hidden={compact ? undefined : true} />
      {!compact && " "}
      <span className="tocNum">{definition.number}</span>{" "}
    </div>
  );
}
