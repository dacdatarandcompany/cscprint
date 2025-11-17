const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* ============================
   LOCAL JSON DATABASE
============================ */
const DB_FILE = "data.json";

// Create DB file if missing
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(
      {
        users: [
          {
            id: 1,
            name: "Admin",
            email: "admin9368@gmail.com",
            password: "admin9368",
            role: "admin"
          }
        ],
        prints: []
      },
      null,
      2
    )
  );
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* ============================
   ROOT
============================ */
app.get("/", (req, res) => {
  res.send("Print Portal Backend Running");
});

/* ============================
   REGISTER
============================ */
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const db = readDB();
  const exists = db.users.find(u => u.email === email);

  if (exists) return res.status(400).json({ error: "Email already exists" });

  const user = {
    id: Date.now(),
    name,
    email,
    password,
    role: "user"
  };

  db.users.push(user);
  writeDB(db);

  res.json({ success: true, message: "Registered successfully" });
});

/* ============================
   LOGIN
============================ */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const db = readDB();

  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user)
    return res.status(400).json({ error: "Invalid email or password" });

  res.json({ success: true, message: "Login successful", user });
});

/* ============================
   ADD PRINT REQUEST
============================ */
app.post("/print", (req, res) => {
  const { user_id, file_name, notes } = req.body;

  const db = readDB();

  const request = {
    id: Date.now(),
    user_id,
    file_name,
    notes,
    created_at: new Date().toISOString()
  };

  db.prints.push(request);
  writeDB(db);

  res.json({ success: true, message: "Print request added", request });
});

/* ============================
   GET ALL PRINT REQUESTS
============================ */
app.get("/prints", (req, res) => {
  const db = readDB();
  res.json(db.prints);
});

/* ============================
   SERVER
============================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on " + PORT));
