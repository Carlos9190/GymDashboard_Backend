import { Request, Response } from "express"
import Exercise from "../models/Exercise"
import { createResponse } from "../utils/response"
import { deleteImage, uploadImage } from "../utils/image"
import formidable from "formidable"
import Routine from "../models/Routine"

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

                await Routine.updateMany(
                    { _id: { $in: routineIds } },
                    {
                        $addToSet: {
                            exercises: exercise._id,
                            exerciseOrder: exercise._id
                        }
                    }
                )

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
                const routineIds: string[] = routineId
                    ? routineId.split(',').map((id: string) => id.trim())
                    : []

                req.exercise.exerciseName = exerciseName

                if (!files || !files.file?.[0]) {
                } else {
                    await deleteImage(req.exercise.exerciseImage)
                    const { imageUrl, success } = await uploadImage(files.file[0].filepath)
                    if (!success) {
                        return res.status(500).json(createResponse('There was an error while uploading the image', success))
                    }
                    req.exercise.exerciseImage = imageUrl
                }

                await req.exercise.save()

                await Routine.updateMany(
                    { exercises: req.exercise._id },
                    {
                        $pull: {
                            exercises: req.exercise._id,
                            exerciseOrder: req.exercise._id
                        }
                    }
                )

                await Routine.updateMany(
                    { _id: { $in: routineIds } },
                    {
                        $addToSet: {
                            exercises: req.exercise._id,
                            exerciseOrder: req.exercise._id
                        }
                    }
                )

                res.json(createResponse('Exercise updated successfully', true))
            })
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static deleteExercise = async (req: Request, res: Response) => {
        try {
            await Promise.allSettled([
                deleteImage(req.exercise.exerciseImage),
                Routine.updateMany(
                    { exercises: req.exercise._id },
                    {
                        $pull: {
                            exercises: req.exercise._id,
                            exerciseOrder: req.exercise._id
                        }
                    }
                ),
                req.exercise.deleteOne()
            ])

            res.json(createResponse('Exercise deleted successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }
}