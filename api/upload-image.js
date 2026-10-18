/**
 * Vercel Serverless Function: ImgBB Cloud Image Uploader
 * Endpoint: POST /api/upload-image
 * Accepts multipart/form-data or JSON { image: base64, name: string }
 */

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || process.env.VITE_IMGBB_API_KEY || 'b395f6864d45d106edff4457768f6fae';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let base64Image = '';
    let imageName = 'beli_upload';

    // Parse request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (body && body.image) {
      base64Image = body.image;
      if (body.name) imageName = body.name;
    } else {
      return res.status(400).json({ error: 'Missing image in request body' });
    }

    // Strip data URI prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const form = new FormData();
    form.append('key', IMGBB_API_KEY);
    form.append('image', cleanBase64);
    if (imageName) form.append('name', imageName);

    const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form
    });

    const data = await imgbbRes.json();
    if (!imgbbRes.ok || !data.success) {
      return res.status(imgbbRes.status || 500).json({
        error: data?.error?.message || 'Failed to upload to ImgBB',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      url: data.data.url,
      displayUrl: data.data.display_url,
      thumbUrl: data.data.thumb?.url || data.data.url,
      deleteUrl: data.data.delete_url,
      data: data.data
    });
  } catch (error) {
    console.error('Server error uploading to ImgBB:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
