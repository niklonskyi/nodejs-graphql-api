import { Server } from "socket.io";

let io;

function init(httpServer, options) {
  options
    ? (io = new Server(httpServer, options))
    : (io = new Server(httpServer));
  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
}
export { init, getIO };
