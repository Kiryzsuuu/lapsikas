const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  const { path: filePath } = req.query;
  
  if (!filePath || filePath.length === 0) {
    return res.status(400).json({ error: 'File path required' });
  }
  
  const fullPath = path.join(process.cwd(), 'data', 'uploads', ...filePath);
  
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  try {
    const stat = fs.statSync(fullPath);
    const fileBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`);
    
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Error reading file' });
  }
}