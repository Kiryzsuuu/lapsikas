from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, os
from backend.lib import read_csv, write_csv, send_mail, read_config, write_config

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Rows(BaseModel):
    rows: list

@app.get('/satkers')
def get_satkers():
    try:
        rows = read_csv()
        return { 'ok': True, 'rows': rows }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/satkers')
def post_satkers(r: Rows):
    try:
        write_csv(r.rows)
        return { 'ok': True }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/import')
async def import_csv(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode('utf8')
    rows = []
    # naive parse
    lines = [l for l in text.splitlines() if l.strip()]
    if not lines: return { 'ok': False, 'error': 'Empty file' }
    headers = [h.strip().strip('"') for h in lines[0].split(',')]
    for l in lines[1:]:
        cols = [c.strip().strip('"') for c in l.split(',')]
        obj = { headers[i]: (cols[i] if i < len(cols) else '') for i in range(len(headers)) }
        rows.append(obj)
    write_csv(rows)
    return { 'ok': True }

@app.get('/config')
def get_config():
    return { 'ok': True, 'cfg': read_config() }

@app.post('/config')
def post_config(cfg: dict):
    write_config(cfg)
    return { 'ok': True }

@app.post('/send')
async def api_send(payload: dict):
    try:
        info = await send_mail(payload['smtp'], payload['to'], payload['subject'], payload['text'])
        return { 'ok': True, 'info': str(info) }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/run-scheduler')
async def api_run_scheduler():
    from backend.scheduler import run_once
    await run_once()
    return { 'ok': True }
