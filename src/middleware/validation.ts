import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import { createResponse } from "../utils/responses"

export const handleInputErrors = (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.status(400).json(createResponse('Validation error', false, { errors: errors.array() }))
        return
    }

    next()
    return
}