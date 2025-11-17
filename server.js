/ server.js — Print Portal with admin auto-create
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB FILE
const DB_FILE = "data.json";
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], prints: [] }, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- create admin if not exists ---
(function ensureAdmin(){
  const ADMIN_EMAIL = "admin@datarandcompany.com";
  const ADMIN_PASS = "Admin9368"; // from you
  const db = readDB();
  const found = db.users.find(u => u.email === ADMIN_EMAIL);
  if (!found) {
    db.users.push({
      id: Date.now() + 1,
      name: "Administrator",
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
      role: "admin"
    });
    writeDB(db);
    console.log("Admin user created:", ADMIN_EMAIL);
  } else {
    // ensure admin role
    if (!found.role) { found.role = "admin"; writeDB(db); }
  }
})();

// ---------------- ROOT ----------------
app.get("/", (req, res) => {
  res.send("Print Portal Backend Running");
});

// ---------------- REGISTER ----------------
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const db = readDB();
  if (db.users.find(u => u.email === email)) return res.status(400).json({ error: "Email already exists" });

  const user = { id: Date.now(), name, email, password, role: "user" };
  db.users.push(user);
  writeDB(db);
  res.json({ success: true, message: "Registered", user: { name: user.name, email: user.email } });
});

// ---------------- LOGIN ----------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const db = readDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ error: "Invalid email or password" });

  // return role so frontend can show admin panel
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role || "user" } });
});

// ---------------- ADD PRINT REQUEST ----------------
app.post("/print/add", (req, res) => {
  const { userEmail, fileName, notes } = req.body;
  if (!userEmail || !fileName) return res.status(400).json({ error: "Missing fields" });

  const db = readDB();
  const printReq = {
    id: Date.now(),
    userEmail,
    fileName,
    notes: notes || "",
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  db.prints.push(printReq);
  writeDB(db);
  res.json({ success: true, print: printReq });
});

// ---------------- USER PRINT LIST ----------------
app.get("/print/my/:email", (req, res) => {
  const db = readDB();
  const email = req.params.email;
  const list = db.prints.filter(p => p.userEmail === email);
  res.json({ success: true, prints: list });
});

// ---------------- ADMIN — ALL PRINT REQUESTS ----------------
app.get("/admin/prints", (req, res) => {
  const db = readDB();
  res.json({ success: true, prints: db.prints });
});

// ---------------- ADMIN — UPDATE STATUS ----------------
app.post("/admin/print/update", (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).json({ error: "Missing fields" });

  const db = readDB();
  const idx = db.prints.findIndex(r => r.id == id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  db.prints[idx].status = status;
  writeDB(db);
  res.json({ success: true, print: db.prints[idx] });
});

// ---------------- LIST USERS (admin) ----------------
app.get("/admin/users", (req, res) => {
  const db = readDB();
  res.json({ success: true, users: db.users.map(u=>({name:u.name,email:u.email,role:u.role||'user'})) });
});

// LISTEN
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Print Portal Backend Running on", PORT));
