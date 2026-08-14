import mongoose, {Schema, Document} from "mongoose";

export interface ICategory extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
}

const categorySchema: Schema<ICategory> = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true, trim: true },
}, {
    timestamps: true,
})

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>("Category", categorySchema);