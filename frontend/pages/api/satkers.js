const { readCsv, writeCsv } = require('../../lib');

export default function handler(req,res){
  if (req.method === 'GET'){
    const rows = readCsv(); res.status(200).json({ ok:true, rows });
  } else if (req.method === 'POST'){
    const rows = req.body.rows || [];
    writeCsv(rows);
    res.status(200).json({ ok:true });
  } else res.status(405).end();
}
