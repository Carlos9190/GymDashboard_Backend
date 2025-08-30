import mongoose, { Schema, Document, Types, PopulatedDoc } from "mongoose";
import { IUser } from "./User";
import Record, { IRecord } from "./Records";

export interface IExercise extends Document {
    exerciseName: string;
    exerciseImage: string;
    userId: PopulatedDoc<IUser & Document>;
    records: PopulatedDoc<IRecord & Document>[];
}

const ExcerciseSchema: Schema = new Schema({
    exerciseName: {
        type: String,
        required: true,
        trim: true,
    },
    exerciseImage: {
        type: String,
        default: "",
    },
    userId: {
        type: Types.ObjectId,
        ref: "User",
    },
    records: [
        {
            type: Types.ObjectId,
            ref: "Record",
        },
    ],
});

// Middleware
ExcerciseSchema.pre("deleteOne", { document: true }, async function () {
    const exerciseId = this._id;
    if (!exerciseId) return;
    await Record.deleteMany({ exercise: exerciseId });
});

const Exercise = mongoose.model<IExercise>("Exercise", ExcerciseSchema);
export default Exercise;
