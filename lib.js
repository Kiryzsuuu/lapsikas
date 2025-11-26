const fs = require('fs');
const path = require('path');
const { parse: csvParse } = require('csv-parse/sync');
const { stringify: csvStringify } = require('csv-stringify/sync');
const nodemailer = require('nodemailer');

const DATA_DIR = path.join(__dirname, 'data');
const CSV_PATH = path.join(DATA_DIR, 'satkers.csv');
const LOG_PATH = path.join(DATA_DIR, 'send.log');

function ensure(){ 
  if(!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readCsv(){ ensure(); if(!fs.existsSync(CSV_PATH)) return []; const raw = fs.readFileSync(CSV_PATH,'utf8'); return csvParse(raw, { columns:true, skip_empty_lines:true }); }

function writeCsv(rows){ ensure(); const out = csvStringify(rows, { header:true }); fs.writeFileSync(CSV_PATH, out, 'utf8'); }

async function sendMail(smtpConfig, to, subject, text){
  const transporter = nodemailer.createTransport(smtpConfig);
  const info = await transporter.sendMail({ from: smtpConfig.auth.user, to, subject, text });
  log(`SENT to=${to} subject=${subject} res=${info.messageId}`);
  return info;
}

function log(line){ 
  try {
    ensure(); 
    const ts = (new Date()).toISOString(); 
    fs.appendFileSync(LOG_PATH, `${ts} ${line}\n`);
  } catch (err) {
    // Fallback to console.log on serverless (read-only filesystem)
    console.log('[LOG]', line);
  }
}

const api = { readCsv, writeCsv, sendMail, log, CSV_PATH, DATA_DIR };
module.exports = api;
exports.readCsv = readCsv;
exports.writeCsv = writeCsv;
exports.sendMail = sendMail;
exports.log = log;
exports.CSV_PATH = CSV_PATH;
exports.DATA_DIR = DATA_DIR;
