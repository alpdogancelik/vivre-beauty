import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bookingsHandler from '../api/bookings.js';
import loginHandler from '../api/auth/login.js';
import registerHandler from '../api/auth/register.js';
import myBookingHandler from '../api/my-booking.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Wrap serverless-style handlers
function wrap(h) {
    return (req, res) => {
        // adapt to (req,res)
        h(req, res);
    };
}

app.options('/api/bookings', (req, res) => { res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*'); res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Admin-Token'); return res.status(200).end(); });
app.all('/api/bookings', wrap(bookingsHandler));
app.all('/api/auth/login', wrap(loginHandler));
app.all('/api/auth/register', wrap(registerHandler));
app.all('/api/my-booking', wrap(myBookingHandler));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('API listening on', port));
