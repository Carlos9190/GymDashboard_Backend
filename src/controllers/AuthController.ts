import type { Request, Response } from "express"
import User from "../models/User"
import { chechPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"
import { createResponse } from "../utils/response"

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            // Prevent duplicates
            const userExists = await User.findOne({ email })
            if (userExists) {
                res.status(409).json(createResponse('Already existing user', false))
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
            res.send(createResponse('Account created, check your email to confirm it', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                res.status(404).json(createResponse('Invalid token', false))
                return
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send(createResponse('Successfully confirmed account', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            const user = await User.findOne({ email })

            if (!user) {
                res.status(404).json(createResponse('User not found', false))
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

                res.status(401).json(createResponse('User account has not been confirmed, check your email to confirm it', false))
                return
            }

            // Check password
            const isPasswordCorrect = await chechPassword(password, user.password)
            if (!isPasswordCorrect) {
                res.status(401).json(createResponse('Incorrect password', false))
                return
            }

            // Send JWT
            const token = generateJWT({ id: user.id })
            res.send(createResponse('User authenticated successfully', true, token))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            const user = await User.findOne({ email })
            if (!user) {
                res.status(404).json(createResponse('User not found', false))
                return
            }

            if (user.confirmed) {
                res.status(409).json(createResponse('Already existing user', false))
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
            res.send(createResponse('A new token was sent, check your email', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            const user = await User.findOne({ email })
            if (!user) {
                res.status(404).json(createResponse('User not found', false))
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

            res.send(createResponse('Check your email for instructions', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                res.status(404).json(createResponse('Invalid token', false))
                return
            }

            res.send(createResponse('Valid token, set your new password', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                res.status(404).json(createResponse('Invalid token', false))
                return
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send(createResponse('The password was changed successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(createResponse('User retrieved successfully', true, req.user))
        return
    }
}