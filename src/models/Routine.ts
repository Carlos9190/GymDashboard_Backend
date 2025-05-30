import mongoose, { Schema, Document, Types, PopulatedDoc } from "mongoose"
import { IUser } from "./User"

export interface IRoutine extends Document {
    routineName: string
    routineDays: string[]
    userId: PopulatedDoc<IUser & Document>
    exercises?: Types.ObjectId[]
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
        type: [Types.ObjectId],
        ref: 'Exercise',
        default: []
    }
})

const Routine = mongoose.model<IRoutine>('Routine', routineSchema)
export default Routine