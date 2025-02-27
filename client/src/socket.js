// socket.js
import { io } from "socket.io-client";

const BACKEND_URL =
    process.env.NODE_ENV === "production"
        ? "wss://racetrack-ns5c.onrender.com" // Replace with your actual backend WebSocket URL
        : "http://localhost:3000"; // Local backend for development

// Initialize the Socket.IO client
const socket = io(BACKEND_URL, {
    transports: ['websocket'], // Use WebSocket transport
    //forceNew: true,             // Force new connection
    reconnection: true, // Enable automatic reconnection
    reconnectionAttempts: 5, // Number of reconnection attempts
    reconnectionDelay: 1000, // Delay between reconnection attempts
});

export default socket; // Export the socket instance
