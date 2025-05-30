import { Request, Response } from "express"
import Routine from "../models/Routine"
import { createResponse } from "../utils/response"

export class RoutineController {
    static createRoutine = async (req: Request, res: Response) => {
        try {
            const routine = new Routine(req.body)
            routine.userId = req.user.id
            await routine.save()
            res.send(createResponse('Routine created successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static getAllRoutines = async (req: Request, res: Response) => {
        try {
            const routines = await Routine.find({ userId: req.user._id })
            res.send(createResponse('Routines fetched successfully', true, routines))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static getRoutineById = async (req: Request, res: Response) => {
        const id = req.params.id
        try {
            const routine = await Routine.findById(id)
            if (!routine) {
                res.status(404).json(createResponse('Routine not found', false))
                return
            }

            if (routine.userId.toString() !== req.user.id.toString()) {
                res.status(403).json(createResponse('This routine does not belong to you', false))
                return
            }

            res.json(createResponse('Routine fetched successfully', true, routine))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static updateRoutine = async (req: Request, res: Response) => {
        const id = req.params.id
        try {
            const routine = await Routine.findByIdAndUpdate(id, req.body)
            if (!routine) {
                res.status(404).json(createResponse('Routine not found', false))
                return
            }

            if (routine.userId.toString() !== req.user.id.toString()) {
                res.status(403).json(createResponse('Only the owner can update this routine', false))
                return
            }

            res.json(createResponse('Routine updated successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static deleteteRoutine = async (req: Request, res: Response) => {
        const id = req.params.id
        try {
            const routine = await Routine.findByIdAndDelete(id)
            if (!routine) {
                res.status(404).json(createResponse('Routine not found', false))
                return
            }

            if (routine.userId.toString() !== req.user.id.toString()) {
                res.status(403).json(createResponse('Only the owner can delete this routine', false))
                return
            }

            res.json(createResponse('Routine delete successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }
}