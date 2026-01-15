// app/api/schedule/now/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from '@/sanity/env';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Fresh data is better for live radio
});

export async function GET() {
  try {
    // 1. Get current South Africa Time (UTC+2)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const sastOffset = 2 * 60 * 60 * 1000;
    const sastDate = new Date(utc + sastOffset);
    const currentHour = sastDate.getHours();

    // 2. Fetch Show + Image URL
    // We added "imageUrl": thumbnail.asset->url to the query
    const query = `
      *[_type == "show" && timeSlot <= $hour] | order(timeSlot desc)[0] {
        title,
        streamUrl,
        "imageUrl": thumbnail.asset->url, 
        "hosts": hosts[]->{
          name,
          "imageUrl": image.asset->url
        }
      }
    `;

    const show = await client.fetch(query, { hour: currentHour });

    if (!show) {
      return NextResponse.json({ error: "No show scheduled." }, { status: 404 });
    }

    return NextResponse.json({
      now: currentHour,
      show: show
    });

  } catch (error) {
    console.error("Schedule API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}