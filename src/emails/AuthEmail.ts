import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        await transporter.sendMail({
            from: 'GymDashboard <admin@gymdashboard.com>',
            to: user.email,
            subject: 'GymDashboard - Confirm your account',
            text: 'GymDashboard - Confirm your account',
            html: `<p>Hello: ${user.name}, you have created your GymDashboard account, everything is almost ready, you just need to confirm your account.</p>
                <p>Visit the following link:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm account</a>
                <p>And enter the following token: <b>${user.token}</b></p>
                <p>This token will expire in 10 minutes.</p>
            `
        })
    }

    static sendPasswordResetToken = async (user: IEmail) => {
        await transporter.sendMail({
            from: 'GymDashboard <admin@gymdashboard.com>',
            to: user.email,
            subject: 'GymDashboard - Reset your password',
            text: 'GymDashboard - Reset your password',
            html: `<p>Hello: ${user.name}, you have requested to reset your password.</p>
                <p>Visit the following link:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset password</a>
                <p>And enter the following token: <b>${user.token}</b></p>
                <p>This token will expire in 10 minutes.</p>
            `
        })
    }
}