import type { Request, Response, NextFunction } from "express"
import Routine, { IRoutine } from "../models/Routine"
import { createResponse } from "../utils/response"
import mongoose from "mongoose"

declare global {
    namespace Express {
        interface Request {
            routine: IRoutine
        }
    }
}

export async function routineExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json(createResponse('Invalid ID', false))
            return
        }

        const routine = await Routine.findById(id).populate('exercises')
        if (!routine) {
            res.status(404).json(createResponse('Routine not found', false))
            return
        }

        req.routine = routine
        next()
    } catch (error) {
        res.status(500).json(createResponse('There was an error', false))
    }
}

export function routineBelongsToUser(req: Request, res: Response, next: NextFunction) {
    if (req.routine.userId.toString() !== req.user.id.toString()) {
        res.status(400).json(createResponse('Invalid action', false))
        return
    }
    next()
}