const fs = require('fs');
const path = require('path');
const { parse: csvParse } = require('csv-parse/sync');
const { stringify: csvStringify } = require('csv-stringify/sync');

const TICKETS_FILE = path.join(process.cwd(), 'data', 'tickets.csv');

function readTickets() {
  if (!fs.existsSync(TICKETS_FILE)) return [];
  const raw = fs.readFileSync(TICKETS_FILE, 'utf8');
  return csvParse(raw, { columns: true, skip_empty_lines: true });
}

function writeTickets(tickets) {
  const csv = csvStringify(tickets, { header: true });
  fs.writeFileSync(TICKETS_FILE, csv, 'utf8');
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const tickets = readTickets();
      res.json({ ok: true, tickets });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { subject, category, priority, description, user, user_name } = req.body;
      const tickets = readTickets();
      
      const newTicket = {
        id: Date.now().toString(),
        subject,
        category,
        priority,
        description,
        user,
        user_name,
        status: 'Open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tickets.push(newTicket);
      writeTickets(tickets);
      
      res.json({ ok: true, ticket: newTicket });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    res.status(405).end();
  }
}