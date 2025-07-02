import { Request, Response } from "express"
import Exercise from "../models/Exercise"
import { createResponse } from "../utils/response"
import { deleteImage, uploadImage } from "../utils/image"
import formidable from "formidable"
import Routine from "../models/Routine"
import mongoose from "mongoose"

export class ExerciseController {
    static createExercise = async (req: Request, res: Response) => {
        const form = formidable({ multiples: false })

        try {
            form.parse(req, async (error, fields, files) => {
                if (error) {
                    return res.status(500).json(createResponse('Error parsing the form', false))
                }

                const exerciseName = fields.exerciseName?.[0]
                if (!exerciseName) {
                    return res.status(400).json(createResponse('Exercise name is required', false))
                }

                const routineId = fields.routineId?.[0]
                const routineIds: string[] = routineId
                    ? routineId.split(',').map((id: string) => id.trim())
                    : []

                const exercise = new Exercise({
                    exerciseName,
                    userId: req.user.id
                })

                if (!files || !files.file?.[0]) {
                    exercise.exerciseImage = ''
                } else {
                    const { imageUrl, success } = await uploadImage(files.file[0].filepath)
                    if (!success) {
                        return res.status(500).json(createResponse('There was an error while uploading the image', success))
                    }
                    exercise.exerciseImage = imageUrl
                }

                await exercise.save()

                for (const routineId of routineIds) {
                    const routine = await Routine.findById(routineId)
                    if (!routine) continue

                    const alreadyExists = routine.exercises?.some(exercises => exercises.exercise.toString() === exercise._id.toString())
                    if (alreadyExists) continue

                    const newExercise: { exercise: mongoose.Types.ObjectId; order: number } = {
                        exercise: exercise._id as mongoose.Types.ObjectId,
                        order: (routine.exercises?.length ?? 0) + 1
                    }

                    routine.exercises?.push(newExercise)
                    await routine.save()
                }

                res.json(createResponse('Exercise created successfully', true))
            })
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static getAllExercises = async (req: Request, res: Response) => {
        try {
            const exercises = await Exercise.find({ userId: req.user.id })

            res.json(createResponse('Exercises fetched successfully', true, exercises))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static getExerciseById = async (req: Request, res: Response) => {
        try {
            res.json(createResponse('Exercise fetched successfully', true, req.exercise))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static updateExercise = async (req: Request, res: Response) => {
        const form = formidable({ multiples: false })

        try {
            form.parse(req, async (error, fields, files) => {
                if (error) {
                    return res.status(500).json(createResponse('Error parsing the form', false))
                }

                const exerciseName = fields.exerciseName?.[0]
                if (!exerciseName) {
                    return res.status(400).json(createResponse('Exercise name is required', false))
                }

                const routineId = fields.routineId?.[0]
                const selectedRoutineIds: string[] = routineId
                    ? routineId.split(',').map((id: string) => id.trim())
                    : []

                req.exercise.exerciseName = exerciseName

                if (!files || !files.file?.[0]) {
                } else {
                    if (req.exercise.exerciseImage) {
                        await deleteImage(req.exercise.exerciseImage)
                    }
                    const { imageUrl, success } = await uploadImage(files.file[0].filepath)
                    if (!success) {
                        return res.status(500).json(createResponse('There was an error while uploading the image', success))
                    }
                    req.exercise.exerciseImage = imageUrl
                }

                await req.exercise.save()

                const allRoutines = await Routine.find({ 'exercises.exercise': req.exercise._id })

                for (const routine of allRoutines) {
                    const isSelected = selectedRoutineIds.includes(routine._id.toString())

                    if (!isSelected) {
                        routine.exercises = routine.exercises?.filter(
                            exercises => exercises.exercise.toString() !== req.exercise._id.toString()
                        ) ?? []

                        routine.exercises.forEach((exercises, index) => {
                            exercises.order = index + 1
                        })

                        await routine.save()
                    }
                }

                for (const id of selectedRoutineIds) {
                    const routine = await Routine.findById(id)
                    if (!routine) continue

                    const alreadyIn = routine.exercises?.some(
                        exercises => exercises.exercise.toString() === req.exercise._id.toString()
                    )

                    if (!alreadyIn) {
                        routine.exercises?.push({
                            exercise: req.exercise._id as mongoose.Types.ObjectId,
                            order: (routine.exercises?.length ?? 0) + 1
                        })
                        await routine.save()
                    }
                }

                res.json(createResponse('Exercise updated successfully', true))
            })
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static deleteExercise = async (req: Request, res: Response) => {
        try {
            if (req.exercise.exerciseImage) {
                await deleteImage(req.exercise.exerciseImage)
            }

            const routinesWithExercise = await Routine.find({
                'exercises.exercise': req.exercise._id
            })

            const updateRoutines = routinesWithExercise.map(async routine => {
                routine.exercises = routine.exercises?.filter(
                    exercises =>
                        (exercises.exercise instanceof mongoose.Types.ObjectId
                            ? exercises.exercise.toString()
                            : exercises.exercise._id?.toString()) !== req.exercise._id.toString()
                )

                routine.exercises?.forEach((exercises, index) => {
                    exercises.order = index + 1
                })

                await routine.save()
            })

            const deleteExercisePromise = req.exercise.deleteOne()

            await Promise.allSettled([
                deleteExercisePromise,
                ...updateRoutines
            ])

            res.json(createResponse('Exercise deleted successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }
}