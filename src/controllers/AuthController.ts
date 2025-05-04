import type { Request, Response } from "express"
import User from "../models/User"
import { chechPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            // Prevent duplicates
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('Already existing user')
                res.status(409).json({ error: error.message })
                return
            }

            // Create an user
            const user = new User(req.body)

            // Hash password
            user.password = await hashPassword(password)

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Send Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Account created, check your email to confirm it')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Invalid token')
                res.status(404).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Successfully confirmed account')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('User not found')
                res.status(404).json({ error: error.message })
                return
            }

            if (!user.confirmed) {
                // Generate token
                const token = new Token()
                token.token = generateToken()
                token.user = user.id
                await token.save()

                // Send Email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('User account has not been confirmed, check your email to confirm it')
                res.status(401).json({ error: error.message })
                return
            }

            // Check password
            const isPasswordCorrect = await chechPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('Incorrect password')
                res.status(401).json({ error: error.message })
                return
            }

            // Send JWT
            const token = generateJWT({ id: user.id })

            res.send(token)
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('User not found')
                res.status(404).json({ error: error.message })
                return
            }

            if (user.confirmed) {
                const error = new Error('Already existing user')
                res.status(409).json({ error: error.message })
                return
            }

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Send Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('A new token was sent, check your email')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('User not found')
                res.status(404).json({ error: error.message })
                return
            }

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Send Email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Check your email for instructions')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Invalid token')
                res.status(404).json({ error: error.message })
                return
            }

            await tokenExists.deleteOne()

            res.send('Valid token, set your new password')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Invalid token')
                res.status(404).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('The password was changed successfully')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }
}