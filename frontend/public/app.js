let satkers = [];

function el(tag, cls){ const e = document.createElement(tag); if(cls) e.className = cls; return e }

function render(){
  const list = document.getElementById('list'); list.innerHTML='';
  satkers.forEach((s, i)=>{
    const row = el('div','row');
    row.innerHTML = `
      <input data-i="${i}" class="nama" value="${s.nama||''}" />
      <input data-i="${i}" class="email" value="${s.email||''}" />
      <input data-i="${i}" class="deadline" value="${s.deadline||''}" />
      <select data-i="${i}" class="status">
        <option ${s.status==='Belum Kirim'?'selected':''}>Belum Kirim</option>
        <option ${s.status==='Sudah Diterima'?'selected':''}>Sudah Diterima</option>
        <option ${s.status==='Revisi Diperlukan'?'selected':''}>Revisi Diperlukan</option>
      </select>
      <button data-i="${i}" class="send">Kirim</button>
      <button data-i="${i}" class="del">Hapus</button>
    `;
    list.appendChild(row);
  });
}

async function load(){
  const res = await fetch('/api/satkers');
  const j = await res.json();
  if (!j.ok) return alert('Gagal muat: '+j.error);
  satkers = j.rows;
  render();
}

function collect(){
  const rows = Array.from(document.querySelectorAll('#list .row')).map(r=>{
    const i = r.querySelector('[data-i]').getAttribute('data-i');
    return {
      id: satkers[i].id || (Date.now()+''),
      nama: r.querySelector('.nama').value,
      email: r.querySelector('.email').value,
      deadline: r.querySelector('.deadline').value,
      status: r.querySelector('.status').value
    };
  });
  return rows;
}

async function save(){
  const rows = collect();
  const res = await fetch('/api/satkers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ rows }) });
  const j = await res.json();
  if (!j.ok) alert('Gagal simpan: '+j.error); else alert('Tersimpan');
}

async function sendEmail(to,name){
  const smtp = { host: 'smtp.gmail.com', port: 587, secure: false, auth: { user: '', pass: '' } };
  const subject = 'Pengingat Pengiriman Sisa Kas';
  const text = `Yth. ${name},\n\nMohon dikirimkan sisa kas sesuai deadline. Terima kasih.`;
  const res = await fetch('/api/send', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ smtp, to, subject, text }) });
  const j = await res.json();
  return j;
}

document.addEventListener('click', async (e)=>{
  if (e.target.id==='reload') load();
  if (e.target.id==='add'){ satkers.push({ id: Date.now()+'', nama:'', email:'', status:'Belum Kirim', deadline:'' }); render(); }
  if (e.target.id==='save') save();
  if (e.target.id==='import'){
    const file = document.getElementById('fileInput').files[0];
    if(!file) return alert('Pilih file CSV');
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/import', { method:'POST', body: fd }); const j = await r.json(); if(!j.ok) alert('Gagal impor: '+j.error); else { alert('Impor OK'); load(); }
  }
  if (e.target.classList.contains('del')){ const i = e.target.getAttribute('data-i'); satkers.splice(i,1); render(); }
  if (e.target.classList.contains('send')){ const i = e.target.getAttribute('data-i'); const j = await sendEmail(satkers[i].email, satkers[i].nama); alert(j.ok? 'Terkirim':'Gagal: '+j.error); }
  if (e.target.id==='sendAll'){
    for(const s of satkers){ if (!s.email) continue; const r = await sendEmail(s.email,s.nama); const log = document.getElementById('log'); log.innerText += `${s.nama} -> ${r.ok? 'OK':'ERR '+r.error}\n`; }
  }
});

window.addEventListener('DOMContentLoaded', ()=>{ load(); });
