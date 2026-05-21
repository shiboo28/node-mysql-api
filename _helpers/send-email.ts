import nodemailer from 'nodemailer';
import config from '../config.json';

export default async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM || (config as any).emailFrom }: any) {
    try {
        let smtpOptions: any;
        if (process.env.SMTP_HOST) {
            const port = parseInt(process.env.SMTP_PORT || '587');
            smtpOptions = {
                host: process.env.SMTP_HOST,
                port,
                secure: port === 465, // true for SSL on port 465, false for STARTTLS on 587
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            };
        } else {
            smtpOptions = (config as any).smtpOptions;
        }

        console.log(`Sending email to ${to} via ${smtpOptions.host}:${smtpOptions.port} (secure=${smtpOptions.secure})`);
        const transporter = nodemailer.createTransport(smtpOptions);
        await transporter.sendMail({ from, to, subject, html });
        console.log(`Email sent successfully to ${to}`);
    } catch (err) {
        console.error('Email sending failed (non-fatal):', err);
    }
}