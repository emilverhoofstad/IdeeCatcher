// This is a Vercel Serverless Function. 
// It should be placed in the `/api` directory at the root of your project.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

/**
 * A wrapper to handle CORS preflight requests.
 */
const allowCors = (fn: (req: VercelRequest, res: VercelResponse) => Promise<void>) => async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // Allow requests from any origin. For production, you might want to restrict this
  // to your actual frontend domain, e.g., 'https://your-app-name.vercel.app'.
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  return await fn(req, res);
};

async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. Extract data from the request body
  const { recipient, subject, body } = req.body;

  // 3. Validate input
  if (!recipient || !subject || !body) {
    return res.status(400).json({ message: 'Missing required fields: recipient, subject, or body.' });
  }

  // 4. Check for required environment variables
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables.');
      return res.status(500).json({ message: 'Server configuration error: Missing email credentials.' });
  }

  // 5. Configure Nodemailer transporter using a Gmail App Password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  // 6. Define email options
  const mailOptions = {
    from: `"Idee Catcher" <${GMAIL_USER}>`,
    to: recipient,
    subject: subject,
    text: body,
  };

  // 7. Send the email and handle the response
  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Provide a generic error message to the client for security
    return res.status(500).json({ message: 'Failed to send email.' });
  }
}

// Export the CORS-wrapped handler
export default allowCors(handler);