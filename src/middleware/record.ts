import type { Request, Response, NextFunction } from "express"
import Record, { IRecord } from "../models/Records"
import { createResponse } from "../utils/response"
import mongoose from "mongoose"

declare global {
    namespace Express {
        interface Request {
            record: IRecord
        }
    }
}

export async function recordExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { recordId } = req.params
        if (!mongoose.Types.ObjectId.isValid(recordId)) {
            res.status(400).json(createResponse('Invalid ID', false))
            return
        }

        const record = await Record.findById(recordId)
        if (!record) {
            res.status(404).json(createResponse('Exercise record not found', false))
            return
        }

        req.record = record
        next()
    } catch (error) {
        res.status(500).json(createResponse('There was an error', false))
    }
}

export function recordBelongsToProject(req: Request, res: Response, next: NextFunction) {
    if (req.record.exercise.toString() !== req.exercise.id.toString()) {
        res.status(400).json(createResponse('Invalid action', false))
        return
    }
    next()
}