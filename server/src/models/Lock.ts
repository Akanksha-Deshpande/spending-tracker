import mongoose, {Document, Schema} from "mongoose";

export interface ILock extends Document {
    userId: mongoose.Types.ObjectId;
    month: string;
    
}

const lockSchema: Schema<ILock> = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    month: { type: String, required: true },
}, {
    timestamps: true,
});

lockSchema.index({ userId: 1, month: 1 }, { unique: true });

export const Lock = mongoose.model<ILock>("Lock", lockSchema);