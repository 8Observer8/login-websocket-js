const express = require("express");
const http = require("http");
const ws = require("ws");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.static(path.join(__dirname, "./public")));
app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "index.html")) });

const httpServer = http.createServer(app);
const wss = new ws.Server({ server: httpServer });
wss.on("connection",
    (ws) =>
    {
        console.log("Client connected");

        let isLoggedin = false;

        const content = fs.readFileSync("users.json", "utf8");
        const users = JSON.parse(content);

        ws.onmessage =
            (event) =>
            {
                const msg = JSON.parse(event.data);

                if (msg.login)
                {
                    console.log(msg.login + ", " + msg.password);

                    if (!isLoggedin)
                    {
                        users.forEach(
                            user =>
                            {
                                if (user.login === msg.login && user.password === msg.password)
                                {
                                    isLoggedin = true;
                                    console.log("Ok")
                                    return;
                                }
                            });
                    }
                    console.log("isLoggedin: " + isLoggedin);
                    // Send an answer
                    ws.send(JSON.stringify({ isLoggedin: isLoggedin }));
                }
            }
    });

const port = process.env.PORT || 3000;
httpServer.listen(port, () => { console.log("Server started. Port: ", port); });
