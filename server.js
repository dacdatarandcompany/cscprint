const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Running on port", PORT));
