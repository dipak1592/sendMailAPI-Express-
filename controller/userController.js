import { User } from '../models/user.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create user and send email
export const createUser = async (req, res) => {
  const { name, email, password, message } = req.body;

  // Save user to MongoDB
  const newUser = new User({ name, email, password, message });

  try {
    // Save the user
    await newUser.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for your message!',
      text: `Hello ${name},\n\nThank you for reaching out!\n\nYour message: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email', error });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(201).json({ message: 'User created and email sent successfully' });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user or sending email', error });
  }
};
