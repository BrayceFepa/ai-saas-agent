import { AssemblyAI } from "assemblyai"
import { NextResponse } from "next/server";

// console.log("tokenKey",process.env.ASSEMBLY_API_KEY)
const assemblyAi = new AssemblyAI({apiKey:process.env.ASSEMBLY_API_KEY})
export async function GET(req) {
    const token = await assemblyAi.realtime.createTemporaryToken({ expires_in: 3600 });
    return NextResponse.json(token);
}