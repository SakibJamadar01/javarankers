import type { Request, Response } from "express";
import { z } from "zod";
import nodemailer from "nodemailer";
import "dotenv/config";
import { sanitizeHtml, checkRateLimit } from "../utils/security.js";

const feedbackSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(191),
  feedback: z.string().min(1).max(2000)
});

export async function submitFeedback(req: Request, res: Response) {
  if (!checkRateLimit(`feedback_${req.ip}`, 3, 300000)) {
    return res.status(429).json({ error: "Too many feedback requests" });
  }

  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { name, email, feedback } = parsed.data;
  
  // Sanitize inputs to prevent XSS
  const sanitizedName = sanitizeHtml(name);
  const sanitizedFeedback = sanitizeHtml(feedback);

  try {
    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `JavaRanker Feedback from ${sanitizedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            🚀 New Feedback from JavaRanker
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #334155;">📧 Contact Information</h3>
            <p><strong>Name:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #334155;">💬 Feedback Message</h3>
            <p style="line-height: 1.6; color: #475569; white-space: pre-wrap;">${sanitizedFeedback}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              📱 This feedback was submitted through the JavaRanker platform.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log('✅ Feedback email sent successfully');
    return res.json({ 
      success: true, 
      message: "Feedback sent successfully" 
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Fallback: Log feedback to console
    console.log('\n=== FEEDBACK LOGGED (EMAIL FAILED) ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Name:', sanitizedName);
    console.log('Email:', email);
    console.log('Feedback:', sanitizedFeedback);
    console.log('=====================================\n');
    
    return res.json({ 
      success: true, 
      message: "Feedback received and logged. We'll get back to you soon!" 
    });
  }
}