import mongoose, { Schema, Document, Types, PopulatedDoc } from "mongoose"
import { IUser } from "./User"

export interface IExercise extends Document {
    exerciseName: string
    exerciseImage: string
    userId: PopulatedDoc<IUser & Document>
}

const excerciseSchema: Schema = new Schema({
    exerciseName: {
        type: String,
        required: true,
        trim: true
    },
    exerciseImage: {
        type: String,
        default: ''
    },
    userId: {
        type: Types.ObjectId,
        ref: 'User'
    }
})

const Exercise = mongoose.model<IExercise>('Exercise', excerciseSchema)
export default Exercise