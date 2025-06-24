import { Request, Response } from "express"
import Routine from "../models/Routine"
import { createResponse } from "../utils/response"

export class RoutineController {
    static createRoutine = async (req: Request, res: Response) => {
        try {
            const routine = new Routine(req.body)
            routine.userId = req.user.id
            await routine.save()
            res.json(createResponse('Routine created successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static getAllRoutines = async (req: Request, res: Response) => {
        try {
            const routines = await Routine.find({ userId: req.user.id })
            res.json(createResponse('Routines fetched successfully', true, routines))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static getRoutineById = async (req: Request, res: Response) => {
        try {
            res.json(createResponse('Routine fetched successfully', true, req.routine))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static updateRoutine = async (req: Request, res: Response) => {
        try {
            req.routine.routineName = req.body.routineName
            req.routine.routineDays = req.body.routineDays
            await req.routine.save()
            res.json(createResponse('Routine updated successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static addExerciseToRoutine = async (req: Request, res: Response) => {
        try {
            const { exerciseId } = req.body

            await Routine.findByIdAndUpdate(req.routine.id, {
                $addToSet: { exercises: exerciseId }
            })

            res.json(createResponse('Exercise added to routine successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static removeExerciseFromRoutine = async (req: Request, res: Response) => {
        try {
            const { exerciseId } = req.body

            await Routine.findByIdAndUpdate(req.routine.id, {
                $pull: { exercises: exerciseId }
            })

            res.json(createResponse('Exercise removed from routine successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static deleteteRoutine = async (req: Request, res: Response) => {
        try {
            await req.routine.deleteOne()
            res.json(createResponse('Routine delete successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }
}