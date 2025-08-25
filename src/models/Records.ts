import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRecord extends Document {
    sets: number;
    reps: number;
    weight: number;
    exercise: Types.ObjectId;
}

export const RecordSchema: Schema = new Schema(
    {
        sets: {
            type: Number,
            required: true,
        },
        reps: {
            type: Number,
            required: true,
        },
        weight: {
            type: Number,
            required: true,
        },
        exercise: {
            type: Types.ObjectId,
            ref: "Exercise",
        },
    },
    { timestamps: true }
);

const Record = mongoose.model<IRecord>("Record", RecordSchema);
export default Record;
