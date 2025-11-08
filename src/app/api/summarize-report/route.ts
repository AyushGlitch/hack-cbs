import { NextRequest, NextResponse } from 'next/server';

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = buffer.toString('base64');

  // Google Vision API
  const visionPayload = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: 'TEXT_DETECTION' }],
      },
    ],
  };

  // You should set GOOGLE_API_KEY in your environment
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Google API key not set.' }, { status: 500 });

  const visionRes = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visionPayload),
  });
  const visionData = await visionRes.json();
  const extractedText = visionData?.responses?.[0]?.fullTextAnnotation?.text || '';

  if (!extractedText) return NextResponse.json({ error: 'No text found in image.' }, { status: 400 });

  // Gemini API prompt
  const geminiPrompt = `You are a medical report summarizer for laypersons. Given the following medical report, provide:\n1. Alerts or things to be concerned about\n2. Things that seem right or normal\n3. Questions to ask the doctor on next visit.\n\nReport:\n${extractedText}`;

  const geminiPayload = {
    contents: [{ parts: [{ text: geminiPrompt }] }],
  };
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });

  const geminiRes = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geminiPayload),
  });
  const geminiData = await geminiRes.json();
  const summary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return NextResponse.json({ summary });
}
