export async function GET() {
  try {
    const { prisma } = await import("@citepath/db");
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ready",
      checks: { database: "ok" },
      time: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      {
        status: "not_ready",
        checks: { database: "fail" },
        time: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
