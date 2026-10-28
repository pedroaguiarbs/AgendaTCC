import { orderFor, type Attempt, type Method, type Phase } from "./protocol";
/** Await every exporter before starting the next; retain incomplete pairs. */
export async function collectBlocks(
  phase: Phase,
  target: number,
  maxAttempts: number,
  execute: (block: number, order: number, method: Method) => Promise<Attempt>,
  persist: (pair: Attempt[]) => Promise<void>,
  signal?: AbortSignal,
) {
  let accepted = 0;
  for (let block = 1; block <= maxAttempts && accepted < target; block++) {
    const pair: Attempt[] = [];
    for (const [index, method] of orderFor(block).entries()) {
      signal?.throwIfAborted();
      pair.push(await execute(block, index + 1, method));
    }
    if (pair.every((record) => record.status === "valid")) {
      accepted++;
      for (const record of pair) {
        record.acceptedBlock = accepted;
        record.includedInPrimaryAnalysis = phase === "measured";
        record.exclusionReason = phase === "warmup" ? "warmup" : undefined;
      }
    }
    if (pair.some((record) => record.status !== "valid"))
      for (const record of pair)
        record.exclusionReason = "paired-counterpart-invalid";
    await persist(pair);
  }
  if (accepted !== target)
    throw new Error(
      `${phase}: incomplete (${accepted}/${target} paired blocks)`,
    );
}
