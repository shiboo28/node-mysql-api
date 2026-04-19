import nodemailer from 'nodemailer';
import config from '../config.json';

export default async function sendEmail({ to, subject, html, from = (config as any).emailFrom }: any) {
    const transporter = nodemailer.createTransport((config as any).smtpOptions);
    await transporter.sendMail({ from, to, subject, html });
}