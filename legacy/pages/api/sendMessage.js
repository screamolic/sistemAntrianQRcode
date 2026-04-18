import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

export default function sendMessage(req = NextApiRequest, res = NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  
  // Validate environment variables
  if (!accountSid || !token) {
    return res.status(500).json({ 
      success: false,
      error: 'Twilio configuration missing' 
    });
  }

  const client = twilio(accountSid, token);
  const { phone, message } = req.body;
  
  // Validate input
  if (!phone || !message) {
    return res.status(400).json({ 
      success: false,
      error: 'Phone and message are required' 
    });
  }
  
  // Validate phone number format (basic validation)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid phone number format' 
    });
  }
  
  // Sanitize message to prevent injection
  const sanitizedMessage = String(message).slice(0, 1600); // Twilio limit
  
  client.messages
    .create({
      body: sanitizedMessage,
      from: '+17752777748',
      to: '+91'+phone,
    })
    .then((message) =>
      res.json({
        success: true,
        messageId: message.sid
      })
    )
    .catch((error) => {
      console.error("Twilio error:", error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message'
      });
    });
}
