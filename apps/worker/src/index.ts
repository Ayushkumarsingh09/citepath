import { Worker, Queue, type ConnectionOptions } from "bullmq";
import { prisma } from "@citepath/db";

const connection: ConnectionOptions = {
  url: process.env.REDIS_URL ?? "redis://localhost:6380",
  maxRetriesPerRequest: null,
};

export const scanQueue = new Queue("citepath-scans", { connection });
export const deadLetterQueue = new Queue("citepath-dlq", { connection });

const DEFAULT_ATTEMPTS = 5;

async function processScan(workspaceId: string, jobId?: string) {
  const record = await prisma.jobRecord.create({
    data: {
      workspaceId,
      type: "reddit.scan",
      payloadJson: { workspaceId, jobId },
      status: "running",
      startedAt: new Date(),
      attempts: 1,
    },
  });

  try {
    // Production: call shared scanner package. Web route remains sync fallback for local demos.
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    // Worker records intent; actual scan triggered via internal hook when WORKER_SCAN_TOKEN set
    if (process.env.WORKER_SCAN_TOKEN) {
      await fetch(`${appUrl}/api/v1/scans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-worker-token": process.env.WORKER_SCAN_TOKEN,
        },
      });
    }

    await prisma.jobRecord.update({
      where: { id: record.id },
      data: { status: "succeeded", completedAt: new Date() },
    });
    console.log(`[worker] scan job recorded for workspace ${workspaceId}`);
  } catch (err) {
    await prisma.jobRecord.update({
      where: { id: record.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        error: err instanceof Error ? err.message : "unknown",
      },
    });
    throw err;
  }
}

const worker = new Worker(
  "citepath-scans",
  async (job) => {
    if (job.name === "scan") {
      await processScan(String(job.data.workspaceId), job.id);
    }
  },
  {
    connection,
    settings: {
      backoffStrategy: (attemptsMade: number) => Math.min(60_000, 2 ** attemptsMade * 1000),
    },
  },
);

worker.on("ready", () => console.log("[worker] CitePath worker ready"));
worker.on("failed", async (job, err) => {
  console.error("[worker] job failed", job?.id, err.message);
  const attempts = job?.attemptsMade ?? 0;
  const max = job?.opts.attempts ?? DEFAULT_ATTEMPTS;
  if (attempts >= max && job) {
    await deadLetterQueue.add(
      "dead",
      { original: job.name, data: job.data, error: err.message, failedAt: new Date().toISOString() },
      { removeOnComplete: 1000 },
    );
    console.error("[worker] moved to DLQ", job.id);
  }
});

worker.on("error", (err) => {
  console.error("[worker] redis/worker error", err.message);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});

export async function enqueueScan(workspaceId: string) {
  return scanQueue.add(
    "scan",
    { workspaceId },
    {
      attempts: DEFAULT_ATTEMPTS,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  );
}
