// app/api/proxy-metadata/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const streamUrl = searchParams.get('url');

  if (!streamUrl) {
    return NextResponse.json({ title: "" });
  }

  try {
    // 1. Request the stream with the "Icy-MetaData" header
    const response = await fetch(streamUrl, {
      headers: { 'Icy-MetaData': '1' },
    });

    // 2. Get the metadata interval (how many bytes of music before the text appears)
    const metaInt = response.headers.get('icy-metaint');
    
    if (!metaInt) {
      // If the station doesn't support metadata, fallback to station name
      return NextResponse.json({ title: response.headers.get('icy-name') || "Live Broadcast" });
    }

    const intMetaInt = parseInt(metaInt);
    const reader = response.body?.getReader();
    
    if (!reader) {
      return NextResponse.json({ title: "Live Broadcast" });
    }

    // 3. Read the stream just enough to find the first metadata block
    let receivedBytes = 0;
    let title = "Live Broadcast";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // We have a chunk of data. We need to find the byte at position 'intMetaInt'
      // Since 'value' is a chunk, we map the global position to this chunk.
      const startPos = receivedBytes;
      const endPos = receivedBytes + value.length;

      // Check if the metadata byte falls within this chunk
      if (intMetaInt >= startPos && intMetaInt < endPos) {
        const offset = intMetaInt - startPos;
        const metaLenByte = value[offset];
        
        // Metadata length is the byte value * 16
        const metaLen = metaLenByte * 16;
        
        if (metaLen > 0) {
          // Extract the metadata string
          // We need to be careful if the metadata splits across chunks, but for 
          // a quick check, it's usually in the same chunk.
          // Safely slice the buffer
          const metaBytes = value.slice(offset + 1, offset + 1 + metaLen);
          const decoder = new TextDecoder("utf-8");
          const metaString = decoder.decode(metaBytes);
          
          // Look for StreamTitle='Song Name';
          const match = metaString.match(/StreamTitle='([^']*)'/);
          if (match && match[1]) {
            title = match[1];
          }
        }
        // We found what we came for, stop reading the stream
        reader.cancel();
        break;
      }

      receivedBytes += value.length;
      
      // Timeout safety: if we read 1MB and find nothing, give up
      if (receivedBytes > intMetaInt + 40000) { 
        reader.cancel();
        break; 
      }
    }

    return NextResponse.json({ title });

  } catch (error) {
    console.error("Metadata Proxy Error:", error);
    return NextResponse.json({ title: "Live Broadcast" });
  }
}