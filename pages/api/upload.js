import connectMongoDB from '../../lib/mongodb';
import File from '../../models/File';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['.pdf', '.xlsx', '.xls', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

// Manual multipart parser for serverless environment
function parseMultipart(body, contentType) {
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) throw new Error('No boundary found');
  
  const boundaryBytes = Buffer.from(`--${boundary}`, 'ascii');
  const parts = [];
  let start = 0;
  
  while (start < body.length) {
    let end = body.indexOf(boundaryBytes, start);
    if (end === -1) break;
    
    if (start > 0) {
      const part = body.slice(start, end);
      const headerEnd = part.indexOf(Buffer.from('\r\n\r\n', 'ascii'));
      
      if (headerEnd > 0) {
        const headers = part.slice(0, headerEnd).toString('ascii');
        const content = part.slice(headerEnd + 4);
        
        if (content.length > 2) {
          const finalContent = content.slice(0, -2); // Remove trailing \r\n
          parts.push({ headers, content: finalContent });
        }
      }
    }
    
    start = end + boundaryBytes.length + 2;
  }
  
  return parts;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    await connectMongoDB();

    // Get raw body as buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ ok: false, error: 'File too large' });
    }

    // Parse multipart data
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ ok: false, error: 'Invalid content type' });
    }

    const parts = parseMultipart(buffer, contentType);
    const filePart = parts.find(part => part.headers.includes('filename='));

    if (!filePart) {
      return res.status(400).json({ ok: false, error: 'No file found' });
    }

    // Extract filename
    const filenameMatch = filePart.headers.match(/filename="([^"]+)"/);
    if (!filenameMatch) {
      return res.status(400).json({ ok: false, error: 'Invalid filename' });
    }
    
    const originalname = filenameMatch[1];
    const ext = originalname.substring(originalname.lastIndexOf('.')).toLowerCase();
    
    if (!ALLOWED_TYPES.includes(ext)) {
      return res.status(400).json({ ok: false, error: 'File type not allowed' });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + ext;

    // Convert to base64 and save to database
    const base64Content = filePart.content.toString('base64');
    const contentType_file = filePart.headers.match(/Content-Type: ([^\r\n]+)/)?.[1] || 'application/octet-stream';

    const file = new File({
      filename: filename,
      originalname: originalname,
      size: filePart.content.length,
      contentType: contentType_file,
      content: base64Content,
      uploadedAt: new Date()
    });

    await file.save();

    res.json({
      ok: true,
      filename: filename,
      originalname: originalname,
      size: filePart.content.length,
      path: `/api/files/${filename}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Upload failed',
      details: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};