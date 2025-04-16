import { NextResponse, NextRequest } from "next/server";
import { CallConfig } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: CallConfig = await request.json();
    console.log("body", body);

    const response = await fetch("https://api.ultravox.ai/api/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": `${process.env.ULTRAVOX_API_KEY}`,
      },
      body: JSON.stringify({ ...body }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Voho API error in post request");
      throw new Error(`Voho API error: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Error calling Voho API", details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred." },
        { status: 500 }
      );
    }
  }
}
