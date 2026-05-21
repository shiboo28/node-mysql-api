import nodemailer from 'nodemailer';
import config from '../config.json';

export default async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM || (config as any).emailFrom }: any) {
    try {
        const smtpOptions = process.env.SMTP_HOST ? {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        } : (config as any).smtpOptions;

        const transporter = nodemailer.createTransport(smtpOptions);
        await transporter.sendMail({ from, to, subject, html });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error('Email sending failed (non-fatal):', err);
    }
}