import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ hasFish: false, error: 'Görsel bulunamadı' }, { status: 400 });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;
    const modelId = process.env.ROBOFLOW_MODEL_ID;

    // Eğer Roboflow API anahtarı tanımlanmamışsa, geliştirme ortamında 
    // fotoğrafların önü kesilmesin diye şimdilik geçerli kabul edelim 
    // (Gerçek AI doğrulaması için Roboflow anahtarı gereklidir).
    if (!apiKey || !modelId) {
      return NextResponse.json({ hasFish: true });
    }

    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await fetch(
      `https://serverless.roboflow.com/${modelId}?api_key=${apiKey}&confidence=0.4`,
      {
        method: 'POST',
        body: base64Image,
        headers: {
          'Content-Type': 'application/text',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ hasFish: false }, { status: 500 });
    }

    const result = await response.json();
    const predictions = result.predictions || [];
    
    const hasFish = predictions.some(
      (pred: any) => 
        (pred.class.toLowerCase() === 'fish' || pred.class.toLowerCase() === 'balik') && 
        pred.confidence >= 0.4
    );

    return NextResponse.json({ hasFish });
  } catch (err) {
    console.error('API Verify Image Error:', err);
    return NextResponse.json({ hasFish: false }, { status: 500 });
  }
}