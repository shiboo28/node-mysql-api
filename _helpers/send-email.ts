import * as nodemailer from 'nodemailer';

async function getTransporter() {
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        const testAccount = await nodemailer.createTestAccount();
        console.log(`📧 Ethereal test account: ${testAccount.user}`);
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }
}

async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    const transport = await getTransporter();
    const info = await transport.sendMail({
        from: process.env.EMAIL_FROM || '"Angular Auth App" <noreply@angular-auth.com>',
        to,
        subject,
        html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`📧 Preview: ${previewUrl}`);

    return info;
}

async function sendVerificationEmail(account: any, origin: string) {
    const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
    await sendEmail({
        to: account.email,
        subject: 'Angular Auth - Verify Your Email',
        html: `
      <h2>Verify Your Email</h2>
      <p>Thanks for registering!</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    `
    });
}

async function sendPasswordResetEmail(account: any, origin: string) {
    const resetUrl = `${origin}/account/reset-password?token=${account.resetToken}`;
    await sendEmail({
        to: account.email,
        subject: 'Angular Auth - Reset Your Password',
        html: `
      <h2>Reset Password</h2>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Link valid for 24 hours.</p>
    `
    });
}

export { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
export default sendEmail;