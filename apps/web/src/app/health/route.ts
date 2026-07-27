export async function GET() {
  return Response.json({
    status: "ok",
    service: "citepath-web",
    time: new Date().toISOString(),
  });
}
