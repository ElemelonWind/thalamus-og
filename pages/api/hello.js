// app/api/route.ts
export const runtime = 'nodejs';
// This is required to enable streaming
export const dynamic = 'force-dynamic';

export default async function GET() {

  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  writer.write(encoder.encode('Vercel is a platform for....'));

  // Send a message every second
  const interval = setInterval(() => {
    writer.write(encoder.encode('Vercel is a platform for....'));
  }, 1000);

  // Close the stream after 10 seconds
  setTimeout(() => {
    writer.write(encoder.encode('End of stream'));
    writer.close();
    clearInterval(interval);
  }, 10000);

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}