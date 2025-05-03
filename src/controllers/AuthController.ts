import type { Request, Response } from "express"
import User from "../models/User"
import { chechPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"

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

            res.send('Authenticated...')
        } catch (error) {
            res.status(500).json({ error: 'There was an error' })
        }
    }
}