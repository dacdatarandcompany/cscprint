const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// File database
const DB_FILE = "data.json";

// Check if database exists, if not create it
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

// Read DB
function readDB() {
    return JSON.parse(fs.readFileSync(DB_FILE));
}

// Write DB
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ------------------------------
// ROOT ROUTE
// ------------------------------
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// ------------------------------
// REGISTER
// ------------------------------
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    const db = readDB();

    const exists = db.users.find(u => u.email === email);
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const user = {
        id: Date.now(),
        name,
        email,
        password
    };

    db.users.push(user);
    writeDB(db);

    res.json({ success: true, message: "Registered successfully" });
});

// ------------------------------
// LOGIN
// ------------------------------
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const db = readDB();

    const user = db.users.find(u => u.email === email && u.password === password);

    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    res.json({ success: true, message: "Login success", user });
});

// ------------------------------
// GET ALL USERS
// ------------------------------
app.get("/users", (req, res) => {
    const db = readDB();
    res.json(db.users);
});

// ------------------------------
// SERVER LISTEN
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
