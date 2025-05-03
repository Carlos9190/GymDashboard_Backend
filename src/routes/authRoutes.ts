import { Router } from "express"
import { body } from "express-validator"
import { AuthController } from "../controllers/AuthController"
import { handleInputErrors } from "../middleware/validation"

const router = Router()

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('User name is required'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password should be 8 characters length minimum'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match')
        }
        return true
    }),
    body('email')
        .isEmail().withMessage('Invalid email'),
    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token')
        .notEmpty().withMessage('The token is required'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body('email')
        .isEmail().withMessage('Invalid email'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleInputErrors,
    AuthController.login
)

export default router