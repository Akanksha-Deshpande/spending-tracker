import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
    userId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
    month: string;
    amount: number;
}

const planSchema: Schema<IPlan> = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    categoryId: { type: mongoose.Types.ObjectId, required: true, ref: 'Category' },
    month: { type: String, required: true },
    amount: { type: Number, required: true },
}, {
    timestamps: true,
});

planSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true });

export const Plan = mongoose.model<IPlan>('Plan', planSchema);