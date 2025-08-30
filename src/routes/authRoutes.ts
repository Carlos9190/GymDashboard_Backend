import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
    "/create-account",
    body("name").notEmpty().withMessage("User name is required"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be 8 characters length minimum"),
    body("password_confirmation").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match");
        }
        return true;
    }),
    body("email").isEmail().withMessage("Invalid email"),
    handleInputErrors,
    AuthController.createAccount
);

router.post(
    "/confirm-account",
    body("token").notEmpty().withMessage("Token is required"),
    handleInputErrors,
    AuthController.confirmAccount
);

router.post(
    "/login",
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
    handleInputErrors,
    AuthController.login
);

router.post(
    "/request-code",
    body("email").isEmail().withMessage("Invalid email"),
    handleInputErrors,
    AuthController.requestConfirmationCode
);

router.post(
    "/forgot-password",
    body("email").isEmail().withMessage("Invalid email"),
    handleInputErrors,
    AuthController.forgotPassword
);

router.post(
    "/validate-token",
    body("token").notEmpty().withMessage("Token is required"),
    handleInputErrors,
    AuthController.validateToken
);

router.post(
    "/update-password/:token",
    param("token").isNumeric().withMessage("Invalid token"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be 8 characters length minimum"),
    body("password_confirmation").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match");
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
);

router.get("/user", authenticate, AuthController.user);

// Routes for profile
router.patch(
    "/profile",
    authenticate,
    body("name").notEmpty().withMessage("User name is required"),
    handleInputErrors,
    AuthController.updateProfile
);

router.patch(
    "/update-password",
    authenticate,
    body("current_password")
        .notEmpty()
        .withMessage("Current password is required"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be 8 characters length minimum"),
    body("password_confirmation").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match");
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
);

export default router;
