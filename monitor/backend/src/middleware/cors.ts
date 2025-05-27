import cors from 'cors';

export const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite default port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

export const corsMiddleware = cors(corsOptions);