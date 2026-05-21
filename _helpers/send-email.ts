import nodemailer from 'nodemailer';
import config from '../config.json';

export default async function sendEmail({ to, subject, html, from }: any) {
    try {
        let envFrom = process.env.EMAIL_FROM ? process.env.EMAIL_FROM.replace(/\r/g, '').trim() : undefined;
        let finalFrom = from || envFrom || (config as any).emailFrom;
        if (typeof finalFrom === 'string') {
            finalFrom = finalFrom.replace(/\r/g, '').trim();
        }

        let smtpOptions: any;
        if (process.env.SMTP_HOST) {
            const host = process.env.SMTP_HOST.replace(/\r/g, '').trim();
            const portStr = (process.env.SMTP_PORT || '587').replace(/\r/g, '').trim();
            const port = parseInt(portStr);
            const user = process.env.SMTP_USER ? process.env.SMTP_USER.replace(/\r/g, '').trim() : undefined;
            const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\r/g, '').trim() : undefined;
            smtpOptions = {
                host,
                port,
                secure: port === 465, // true for SSL on port 465, false for STARTTLS on 587
                auth: { user, pass }
            };
        } else {
            smtpOptions = { ...(config as any).smtpOptions };
            if (smtpOptions.host) smtpOptions.host = smtpOptions.host.replace(/\r/g, '').trim();
            if (smtpOptions.auth) {
                if (smtpOptions.auth.user) smtpOptions.auth.user = smtpOptions.auth.user.replace(/\r/g, '').trim();
                if (smtpOptions.auth.pass) smtpOptions.auth.pass = smtpOptions.auth.pass.replace(/\r/g, '').trim();
            }
        }

        console.log(`Sending email to ${to} via ${smtpOptions.host}:${smtpOptions.port} (secure=${smtpOptions.secure})`);
        const transporter = nodemailer.createTransport(smtpOptions);
        await transporter.sendMail({ from: finalFrom, to, subject, html });
        console.log(`Email sent successfully to ${to}`);
    } catch (err) {
        console.error('Email sending failed (non-fatal):', err);
    }
}