import { transporter } from "../config/nodemailer";

interface IEmail {
    email: string;
    name: string;
    token: string;
}

const BASE_URL = process.env.FRONTEND_URL;

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        const confirmUrl = `${BASE_URL}/auth/confirm-account`;
        await transporter.sendMail({
            from: "GymDashboard <admin@carlos-fullstack.com>",
            to: user.email,
            subject: "GymDashboard - Confirm your account",
            text: `Hello ${user.name}, confirm your GymDashboard account using this code: ${user.token}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
                    <h2 style="text-align: center; color: #e11d48;">GymDashboard</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>You've just created a new account on <strong>GymDashboard</strong>. To activate your account, please confirm it by entering the following code:</p>

                    <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 6px;">
                        ${user.token}
                    </div>

                    <p style="margin-top: 20px;">You can enter this code on the confirmation page below:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${confirmUrl}" target="_blank" style="background-color: #e11d48; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                            Go to Confirmation Page
                        </a>
                    </div>

                    <p>This code expires in 10 minutes.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e2e2;" />
                    <p>Sincerely,</p>
                    <p style="font-weight: bold; margin: 0;">The GymDashboard Team</p>
                </div>
            `,
        });
    };

    static sendPasswordResetToken = async (user: IEmail) => {
        const resetUrl = `${BASE_URL}/auth/forgot-password`;
        await transporter.sendMail({
            from: "GymDashboard <admin@carlos-fullstack.com>",
            to: user.email,
            subject: "GymDashboard - Reset your password",
            text: `Hello ${user.name}, reset your GymDashboard password using this code: ${user.token}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
                    <h2 style="text-align: center; color: #e11d48;">GymDashboard</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>We received a request to reset your password. Use the following code to set a new one:</p>

                    <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 6px;">
                        ${user.token}
                    </div>

                    <p style="margin-top: 20px;">You can enter this code on the reset password page:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${resetUrl}" target="_blank" style="background-color: #e11d48; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                            Go to Reset Page
                        </a>
                    </div>

                    <p>This code expires in 10 minutes.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e2e2;" />
                    <p>Sincerely,</p>
                    <p style="font-weight: bold; margin: 0;">The GymDashboard Team</p>
                </div>
            `,
        });
    };
}