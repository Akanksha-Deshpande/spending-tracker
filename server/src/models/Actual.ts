import mongoose, { Schema, Document } from 'mongoose';



export interface IActual extends Document {
    userId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
    month: string;
    amount: number;
    note?: string;
}

const actualSchema: Schema<IActual> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        month: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        note: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

actualSchema.index({ userId: 1, categoryId: 1, month: 1 });

export const Actual = mongoose.model<IActual>('Actual', actualSchema);