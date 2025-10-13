const { readCsv, sendMail, log } = require('./lib');
const path = require('path');
const fs = require('fs');

// Config file for SMTP creds and schedule rules
const CFG_PATH = path.join(__dirname, 'data', 'config.json');

function loadConfig(){ if(!fs.existsSync(CFG_PATH)) return null; return JSON.parse(fs.readFileSync(CFG_PATH,'utf8')); }

function daysBetween(a,b){ return Math.ceil((b - a) / (1000*60*60*24)); }

async function runOnce(){
  const cfg = loadConfig();
  if(!cfg || !cfg.smtp){ console.error('SMTP not configured in data/config.json'); return; }
  // smtp.password may be empty if stored separately; server should merge password before saving
  const rows = readCsv();
  const now = new Date();
  for(const r of rows){
    if(!r.deadline) continue;
    const dl = new Date(r.deadline);
    const diff = daysBetween(now, dl);
    // send H-3 or H-1
    if ([3,1].includes(diff)){
      try{
        const subject = `Pengingat pengiriman sisa kas - ${r.nama || ''}`;
        const text = `Yth. ${r.nama || ''},\n\nMohon dikirimkan sisa kas sesuai deadline ${r.deadline}. Terima kasih.`;
        await sendMail(cfg.smtp, r.email, subject, text);
        log(`AUTO_SENT ${r.email} deadline=${r.deadline} diff=${diff}`);
      }catch(err){ log(`AUTO_ERR ${r.email} ${err.message}`); }
    }
  }
}

module.exports = runOnce;

if (require.main === module){
  runOnce().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(2); });
}
