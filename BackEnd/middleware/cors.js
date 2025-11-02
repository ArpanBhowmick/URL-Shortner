import cors from "cors";

const corsMiddleware = cors({
  origin: [
    "http://localhost:5173", 
    "https://url-shortner-two-phi.vercel.app"
  ],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
});

export default corsMiddleware;


// Why?:

// CORS lets your frontend (running on port 5173) talk to your backend (running on port 5000).

// Without this, your browser will block requests due to security rules.
