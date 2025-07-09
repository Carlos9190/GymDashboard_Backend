import mongoose, { Schema, Document, Types, PopulatedDoc } from "mongoose"
import { IUser } from "./User"
import { IExercise } from "./Exercise"

export interface IRoutine extends Document {
    routineName: string
    routineDays: string[]
    userId: PopulatedDoc<IUser & Document>
    exercises?: {
        exercise: PopulatedDoc<IExercise & Document>
        order: number
    }[]
}

const routineSchema: Schema = new Schema({
    routineName: {
        type: String,
        required: true,
        trim: true
    },
    routineDays: {
        type: Array<string>(),
        default: []
    },
    userId: {
        type: Types.ObjectId,
        ref: 'User'
    },
    exercises: {
        type: [
            {
                exercise: {
                    type: Types.ObjectId,
                    ref: 'Exercise'
                },
                order: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
})

const Routine = mongoose.model<IRoutine>('Routine', routineSchema)
export default Routine