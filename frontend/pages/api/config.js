import fs from 'fs';
import path from 'path';
const CFG = path.join(process.cwd(),'data','config.json');

export default function handler(req,res){
  if (req.method === 'GET'){
    if (fs.existsSync(CFG)) res.status(200).json({ ok:true, cfg: JSON.parse(fs.readFileSync(CFG,'utf8')) });
    else res.status(200).json({ ok:true, cfg:null });
  } else if (req.method === 'POST'){
    fs.writeFileSync(CFG, JSON.stringify(req.body, null, 2), 'utf8');
    res.status(200).json({ ok:true });
  } else res.status(405).end();
}
