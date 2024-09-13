import { User } from '../models/user.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

// Create or use existing user and send email
export const createUser = async (req, res) => {
  const { name, email, password, message } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });

    // If user doesn't exist, create a new one
    if (!user) {
      // Hash the password before saving to MongoDB
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create a new user
      user = new User({ name, email, password: hashedPassword, message });

      // Save the new user
      await user.save();
    }

    // HTML content for the admin email
    const emailHtmlContentAdmin = `
      <h2>Hello Admin,</h2>
      <p>A new user has reached out. Here's the message:</p>
      <p>UserName:- ${name}</p>
      <p>EmailId:- ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p>Check out the user's social media:</p>
      <a href="https://wa.me/1234567890" target="_blank">
        <img src="https://example.com/icons/whatsapp.png" alt="WhatsApp" style="width:30px;"/>
      </a>
      <a href="https://instagram.com/username" target="_blank">
        <img src="https://example.com/icons/instagram.png" alt="Instagram" style="width:30px;"/>
      </a>
      <a href="https://linkedin.com/in/username" target="_blank">
        <img src="https://example.com/icons/linkedin.png" alt="LinkedIn" style="width:30px;"/>
      </a>
    `;

    // HTML content for the user email
    const emailHtmlContentUser = `
      <h2>Hello ${name},</h2>
      <p>Thank you for reaching out!</p>
      <p>Follow us on our social media:</p>
      <a href="https://wa.me/1234567890" target="_blank">
        <img src="https://example.com/icons/whatsapp.png" alt="WhatsApp" style="width:30px;"/>
      </a>
      <a href="https://instagram.com/username" target="_blank">
        <img src="https://example.com/icons/instagram.png" alt="Instagram" style="width:30px;"/>
      </a>
      <a href="https://linkedin.com/in/username" target="_blank">
        <img src="https://example.com/icons/linkedin.png" alt="LinkedIn" style="width:30px;"/>
      </a>
      <br/>
      <a href="https://example.com/form" style="background-color:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Submit More Info</a>
    `;

    // Send email to Admin
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptionsAdmin = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,  // Send to Admin
      subject: 'New User Message!',
      html: emailHtmlContentAdmin, // Use the admin HTML content
    };

    const mailOptionsUser = {
      from: process.env.EMAIL_USER,
      to: email,  // Send to User
      subject: 'Thank you for your message!',
      html: emailHtmlContentUser, // Use the user HTML content
    };

    // Send email to Admin
    transporter.sendMail(mailOptionsAdmin, (error, info) => {
      if (error) {
        console.error('Error sending email to Admin:', error);
      } else {
        console.log('Admin email sent: ' + info.response);
      }
    });

    // Send email to User
    transporter.sendMail(mailOptionsUser, (error, info) => {
      if (error) {
        console.error('Error sending email to User:', error);
        return res.status(500).json({ message: 'Error sending email to user', error });
      } else {
        console.log('User email sent: ' + info.response);
        return res.status(201).json({ message: 'Emails sent successfully' });
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Error handling request', error });
  }
};
