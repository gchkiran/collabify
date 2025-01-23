require('dotenv').config();
const express = require('express')
const app = express()
const http = require('http')
const {Server} = require('socket.io')
const cors = require("cors");
const axios = require("axios");
const server = http.createServer(app)

const userSocketMap = {};

const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

const path = require('path');

const languageConfig = {
    python3: { versionIndex: "3" },
    java: { versionIndex: "3" },
    cpp: { versionIndex: "4" },
    nodejs: { versionIndex: "3" },
    c: { versionIndex: "4" },
    ruby: { versionIndex: "3" },
    go: { versionIndex: "3" },
    scala: { versionIndex: "3" },
    bash: { versionIndex: "3" },
    sql: { versionIndex: "3" },
    pascal: { versionIndex: "2" },
    csharp: { versionIndex: "3" },
    php: { versionIndex: "3" },
    swift: { versionIndex: "3" },
    rust: { versionIndex: "3" },
    r: { versionIndex: "3" },
  };

  app.use(cors());
  
  app.use(express.json());

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  }

const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId]
            }
        }
    ); 
}



io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on('join', ({roomId, username}) => {
        console.log(`User ${username} joined room ${roomId}`)
        userSocketMap[socket.id] = username
        socket.join(roomId)
        const clients = getAllConnectedClients(roomId)
        clients.forEach(({socketId}) => {
            io.to(socketId).emit("joined",{
                clients,
                username,
                socketId: socket.id
            })
        })
    });

    socket.on("code-change", ({roomId, code}) => {
        socket.in(roomId).emit("code-change", {code})
    })

    socket.on("sync-code", ({socketId, code}) => {
        io.to(socketId).emit("code-change", {code})
    })

    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms]
        rooms.forEach((roomId) => {
            socket.in(roomId).emit("disconnected", {
                socketId: socket.id,
                username: userSocketMap[socket.id]
            })
        })
        delete userSocketMap[socket.id]
        socket.leave()
    })
});

app.post("/compile", async (req, res) => {
    const { code, language } = req.body;
  
    try {
      const response = await axios.post("https://api.jdoodle.com/v1/execute", {
        script: code,
        language: language,
        versionIndex: languageConfig[language].versionIndex,
        clientId: process.env.jDoodle_clientId,
        clientSecret: process.env.jDoodle_clientSecret,
      });
  
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to compile code" });
    }
  });

const PORT = process.env.PORT || 5028
server.listen(PORT, () => console.log('Server is running'))

