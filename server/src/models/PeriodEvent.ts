import mongoose, {Document, Schema} from "mongoose";

export type PeriodEventAction = "LOCKED" | "UNLOCKED";

export interface IPeriodEvent extends Document {
    userId: mongoose.Types.ObjectId;
    month: string;
    action: PeriodEventAction;
    note: string;
}

const periodEventSchema: Schema<IPeriodEvent> = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        month: { type: String, required: true },
        action: { type: String, enum: ["LOCKED", "UNLOCKED"], required: true },
        note: { type: String, required: false },
    },
    { timestamps: true }
);

periodEventSchema.index({ userId: 1, month: 1, createdAt: -1 });

export const PeriodEvent = mongoose.model<IPeriodEvent>("PeriodEvent", periodEventSchema);