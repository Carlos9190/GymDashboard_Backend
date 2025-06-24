import type { Request, Response } from "express"
import { createResponse } from "../utils/response"
import Record from "../models/Records"

export class RecordController {
    static createExerciseRecord = async (req: Request, res: Response) => {
        try {
            const record = new Record(req.body)
            record.exercise = req.exercise.id
            req.exercise.records.push(record.id)
            await Promise.allSettled([record.save(), req.exercise.save()])
            res.json(createResponse('Exercise record created successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static getExerciseRecords = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string)
            const limit = 5
            const skip = (page - 1) * limit

            const [records, total] = await Promise.all([
                Record.find({ exercise: req.exercise.id })
                    .populate('exercise')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Record.countDocuments({ exercise: req.exercise.id })
            ])

            const totalPages = Math.ceil(total / limit)

            res.json(
                createResponse('Exercise records fetched successfully', true, {
                    records,
                    page,
                    totalPages
                })
            )
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }


    static getExerciseRecordById = async (req: Request, res: Response) => {
        try {
            res.json(createResponse('Exercise record fetched successfully', true, req.record))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static updateExerciseRecord = async (req: Request, res: Response) => {
        try {
            req.record.sets = req.body.sets
            req.record.reps = req.body.reps
            req.record.weight = req.body.weight
            await req.record.save()
            res.json(createResponse('Exercise record updated successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }

    static deleteExerciseRecord = async (req: Request, res: Response) => {
        try {
            req.exercise.records = req.exercise.records.filter(record => record._id.toString() !== req.record._id.toString())
            await Promise.allSettled([req.record.deleteOne(), req.exercise.save()])
            res.json(createResponse('Exercise record deleted successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }
}