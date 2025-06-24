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
            const records = await Record.find({ exercise: req.exercise.id }).populate('exercise')
            res.json(createResponse('Exercise records fetched successfully', true, records))
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
            // TODO: Check why the record reference is not being deleted from exercise model in the db
            req.exercise.records = req.exercise.records.filter(record => record.toString() !== req.record.id.toString())
            await Promise.allSettled([req.record.deleteOne(), req.exercise.save()])
            res.json(createResponse('Exercise record deleted successfully', true))
        } catch (error) {
            res.status(500).json(createResponse('There was an error', false))
        }
    }
}