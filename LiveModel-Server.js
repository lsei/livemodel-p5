// Watch local files and notify client via websocket when they have changed

const fs = require("fs");
const WebSocket = require("ws");

// The directory we want to watch. We can pass it through the command line or default to models.
const watchDir = process.argv[2] || "models";
const PORT = 5001;

// List of watchers. A map of filename:ws connection. This makes it
// easy to pick out the right connection to send the file to.
const watchers = {};

console.log("Starting websocket server on port", PORT);
const wss = new WebSocket.Server({ port: PORT });
wss.on("connection", (ws, request) => {
    // remove preceding non word characters
    let filePath = request.url.replace(/^\W+/, "");

    console.log("new connection for", filePath);

    // Create key if nobody is watching this yet.
    if (!watchers[filePath]) {
        watchers[filePath] = [];
    }

    // Add to list of watchers for file
    watchers[filePath].push(ws);
});

// Start file watcher in watch dir
console.log("Watching changes for files in:", watchDir);

fs.watch(watchDir, { recursive: true }, (event, filename) => {
    console.log("[fs.watch event]", event, filename);
    if (event == "change" && watchers[filename]) {
        watchers[filename].forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                console.log("sending update message to socket");
                send(ws, ["fileupdated", filename, new Date()]);
            }
        });
    }
});

// A little helper function to send data as json strings
send = (ws, data) => {
    if (typeof data !== "string") {
        data = JSON.stringify(data);
    }
    ws.send(data);
};
