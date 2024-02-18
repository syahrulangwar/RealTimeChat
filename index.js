const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Sesuaikan dengan username MySQL Anda
  password: "", // Sesuaikan dengan password MySQL Anda
  database: "chat_app",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("chat message", (msg) => {
    console.log("message: " + msg);

    const message = {
      username: socket.username,
      message: msg,
    };

    io.emit("chat message", message);

    // Simpan pesan ke database
    db.query("INSERT INTO messages SET ?", message, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("Message saved to database");
    });
  });

  socket.on("add user", (username) => {
    socket.username = username;
    console.log("User added: " + username);
  });
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
