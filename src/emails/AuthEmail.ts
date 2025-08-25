import { transporter } from "../config/nodemailer";

interface IEmail {
    email: string;
    name: string;
    token: string;
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        await transporter.sendMail({
            from: "GymDashboard <admin@gymdashboard.com>",
            to: user.email,
            subject: "GymDashboard - Confirm your account",
            text: "GymDashboard - Confirm your account",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
            <h2 style="text-align: center; color: #e11d48;">GymDashboard</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>You've just created a new account on <strong>GymDashboard</strong>. You're almost done! Please confirm your account to get started by entering the following code:</p>
            <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 6px;">
                ${user.token}
            </div>
            <p>This code expires in 10 minutes.</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e2e2;" />
            <p>Sincerely,</p>
            <p style="font-weight: bold; margin: 0;">The GymDashboard team</p>
        </div>
      `,
        });
    };

    static sendPasswordResetToken = async (user: IEmail) => {
        await transporter.sendMail({
            from: "GymDashboard <admin@gymdashboard.com>",
            to: user.email,
            subject: "GymDashboard - Reset your password",
            text: "GymDashboard - Reset your password",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
            <h2 style="text-align: center; color: #e11d48;">GymDashboard</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>We've received a request to reset your password. Reset your password by entering the following code:</p>
            <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 6px;">
                ${user.token}
            </div>
            <p>This code expires in 10 minutes.</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e2e2;" />
            <p>Sincerely,</p>
            <p style="font-weight: bold; margin: 0;">The GymDashboard team</p>
        </div>
      `,
        });
    };
}
