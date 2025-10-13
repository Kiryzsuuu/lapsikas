import csv, os, json
from datetime import datetime
from email.message import EmailMessage
import aiosmtplib

ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(ROOT, 'data')
CSV_PATH = os.path.join(DATA_DIR, 'satkers.csv')
CFG_PATH = os.path.join(DATA_DIR, 'config.json')
LOG_PATH = os.path.join(DATA_DIR, 'send.log')

os.makedirs(DATA_DIR, exist_ok=True)

def read_csv():
    if not os.path.exists(CSV_PATH): return []
    with open(CSV_PATH, newline='', encoding='utf8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def write_csv(rows):
    if not rows:
        # ensure header still present
        with open(CSV_PATH, 'w', newline='', encoding='utf8') as f:
            f.write('id,nama,email,status,deadline,catatan\n')
        return
    keys = rows[0].keys()
    with open(CSV_PATH, 'w', newline='', encoding='utf8') as f:
        writer = csv.DictWriter(f, fieldnames=list(keys))
        writer.writeheader()
        writer.writerows(rows)

def read_config():
    if not os.path.exists(CFG_PATH): return None
    with open(CFG_PATH,'r',encoding='utf8') as f: return json.load(f)

def write_config(cfg):
    with open(CFG_PATH,'w',encoding='utf8') as f: json.dump(cfg,f,indent=2)

async def send_mail(smtp, to, subject, text):
    msg = EmailMessage()
    msg['From'] = smtp.get('auth',{}).get('user') or smtp.get('user')
    msg['To'] = to
    msg['Subject'] = subject
    msg.set_content(text)
    host = smtp.get('host','smtp.gmail.com')
    port = int(smtp.get('port',587))
    username = smtp.get('auth',{}).get('user') or smtp.get('user')
    password = smtp.get('auth',{}).get('pass') or smtp.get('pass')
    await aiosmtplib.send(msg, hostname=host, port=port, username=username, password=password, start_tls=True)
    with open(LOG_PATH,'a',encoding='utf8') as f: f.write(f"{datetime.utcnow().isoformat()} SENT to={to} subject={subject}\n")
    return True
