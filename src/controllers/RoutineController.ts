import { Request, Response } from "express"
import Routine from "../models/Routine"
import { createResponse } from "../utils/response"
import mongoose from "mongoose"

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
            if (req.routine.exercises) {
                req.routine.exercises.sort((a, b) => a.order - b.order)
            }

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

            const newExercise = {
                exercise: exerciseId,
                order: (req.routine.exercises?.length ?? 0) + 1
            }

            req.routine.exercises?.push(newExercise)
            await req.routine.save()

            res.json(createResponse('Exercise added to routine successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static reorderRoutineExercises = async (req: Request, res: Response) => {
        try {
            const { orderedExerciseIds } = req.body

            const newExercises = orderedExerciseIds.map((id: string, index: number) => ({
                exercise: new mongoose.Types.ObjectId(id),
                order: index + 1
            }))

            req.routine.exercises = newExercises
            await req.routine.save()

            res.json(createResponse('Exercises reordered successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static removeExerciseFromRoutine = async (req: Request, res: Response) => {
        try {
            const { exerciseId } = req.body

            req.routine.exercises = req.routine.exercises?.filter(exerciseItem => {
                const currentId = exerciseItem.exercise._id.toString()
                return currentId !== exerciseId
            })

            req.routine.exercises?.forEach((exerciseItem, index) => {
                exerciseItem.order = index + 1
            })

            await req.routine.save()

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