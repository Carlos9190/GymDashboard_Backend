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

                if (routineIds.length > 0) {
                    await Routine.updateMany(
                        { _id: { $in: routineIds } },
                        { $addToSet: { exercises: exercise._id } }
                    )
                }

                res.json(createResponse('Exercise created successfully', true))
            })
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static getAllExercises = async (req: Request, res: Response) => {
        try {
            const exercises = await Exercise.find({
                $or: [
                    { userId: { $in: req.user.id } }
                ]
            })

            res.json(createResponse('Exercises fetched successfully', true, exercises))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static getExerciseById = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const exercise = await Exercise.findById(id).populate('records')
            if (!exercise) {
                res.status(404).json(createResponse('Exercise not found', false))
                return
            }

            if (exercise.userId.toString() !== req.user.id.toString()) {
                res.status(400).json(createResponse('Invalid action', false))
                return
            }

            res.json(createResponse('Exercise fetched successfully', true, exercise))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static updateExercise = async (req: Request, res: Response) => {
        const { id } = req.params
        const form = formidable({ multiples: false })

        try {
            const exercise = await Exercise.findById(id)
            if (!exercise) {
                res.status(404).json(createResponse('Exercise not found', false))
                return
            }

            if (exercise.userId.toString() !== req.user.id.toString()) {
                res.status(400).json(createResponse('Invalid action', false))
                return
            }

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

                exercise.exerciseName = exerciseName

                if (!files || !files.file?.[0]) {
                } else {
                    await deleteImage(exercise.exerciseImage)
                    const { imageUrl, success } = await uploadImage(files.file[0].filepath)
                    if (!success) {
                        return res.status(500).json(createResponse('There was an error while uploading the image', success))
                    }
                    exercise.exerciseImage = imageUrl
                }

                await exercise.save()

                await Routine.updateMany(
                    { exercises: exercise._id },
                    { $pull: { exercises: exercise._id } }
                )

                if (routineIds.length > 0) {
                    await Routine.updateMany(
                        { _id: { $in: routineIds } },
                        { $addToSet: { exercises: exercise._id } }
                    )
                }

                res.json(createResponse('Exercise updated successfully', true))
            })
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static deleteExercise = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const exercise = await Exercise.findById(id)
            if (!exercise) {
                res.status(404).json(createResponse('Exercise not found', false))
                return
            }

            if (exercise.userId.toString() !== req.user.id.toString()) {
                res.status(400).json(createResponse('Invalid action', false))
                return
            }

            await Promise.allSettled([
                deleteImage(exercise.exerciseImage),
                Routine.updateMany(
                    { exercises: exercise._id },
                    { $pull: { exercises: exercise._id } }
                ),
                exercise.deleteOne()
            ])

            res.json(createResponse('Exercise deleted successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }
}