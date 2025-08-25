import type { Request, Response, NextFunction } from "express";
import Exercise, { IExercise } from "../models/Exercise";
import { createResponse } from "../utils/response";
import mongoose from "mongoose";

declare global {
    namespace Express {
        interface Request {
            exercise: IExercise;
        }
    }
}

export async function exerciseExists(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { exerciseId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
            res.status(400).json(createResponse("Invalid ID", false));
            return;
        }

        const exercise =
            await Exercise.findById(exerciseId).populate("records");
        if (!exercise) {
            res.status(404).json(createResponse("Exercise not found", false));
            return;
        }

        req.exercise = exercise;
        next();
    } catch (error) {
        res.status(500).json(createResponse("There was an error", false));
    }
}

export function exerciseBelongsToUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.exercise.userId.toString() !== req.user.id.toString()) {
        res.status(400).json(createResponse("Invalid action", false));
        return;
    }
    next();
}
