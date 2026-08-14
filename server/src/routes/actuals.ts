import {Router} from "express";
import mongoose from "mongoose";
import { Actual } from "../models/Actual";
import { Category } from "../models/Category";
import {authenticate} from "../middleware/authenticate";
import {Lock} from "../models/Lock";

const router = Router();

function isValidMonth(month: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

router.post("/", authenticate, async (req, res) => {
    try {
        const { categoryId, month, amount, note } = req.body;

        const userId = req.user!.userId;

        // Required fields
        if (!categoryId || !month || amount === undefined) {
            return res.status(400).json({
                message: "Category, month, and amount are required",
            });
        }

        // Validate category ID
        if (!mongoose.isValidObjectId(categoryId)) {
            return res.status(400).json({
                message: "Invalid category ID",
            });
        }

        // Validate month
        if (!isValidMonth(month)) {
            return res.status(400).json({
                message: "Month must be in YYYY-MM format",
            });
        }

        // Validate amount
        if (typeof amount !== "number" || amount < 0) {
            return res.status(400).json({
                message: "Amount must be a non-negative number",
            });
        }

        // Make sure the category belongs to this user
        const category = await Category.findOne({
            _id: categoryId,
            userId,
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        // Check whether the month is locked
        const lock = await Lock.findOne({
            userId,
            month,
        });

        if (lock) {
            return res.status(409).json({
                message: "This month's actuals are locked and cannot be modified",
            });
        }

        const actual = await Actual.create({
            userId,
            categoryId,
            month,
            amount,
            note,
        });

        return res.status(201).json({
            actual: {
                id: actual._id,
                categoryId: actual.categoryId,
                month: actual.month,
                amount: actual.amount,
                note: actual.note,
            },
        });
    } catch (error) {
        console.error("Error creating actual:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.get("/", authenticate, async (req, res) => {
    try {
        const userId = req.user!.userId;

        const actuals = await Actual.find({ userId })
            .sort({ month: 1, createdAt: 1 });

        return res.status(200).json({
            actuals: actuals.map((actual) => ({
                id: actual._id,
                categoryId: actual.categoryId,
                month: actual.month,
                amount: actual.amount,
                note: actual.note,
            })),
        });
    } catch (error) {
        console.error("Error fetching actuals:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.patch("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, note } = req.body;

        const userId = req.user!.userId;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid actual ID",
            });
        }

        if (amount === undefined && note === undefined) {
            return res.status(400).json({
                message: "Amount or note is required",
            });
        }

        if (
            amount !== undefined &&
            (typeof amount !== "number" || amount < 0)
        ) {
            return res.status(400).json({
                message: "Amount must be a non-negative number",
            });
        }

        const actual = await Actual.findOne({
            _id: id,
            userId,
        });

        if (!actual) {
            return res.status(404).json({
                message: "Actual not found",
            });
        }

        const lock = await Lock.findOne({
            userId,
            month: actual.month,
        });

        if (lock) {
            return res.status(409).json({
                message: "This month's actuals are locked and cannot be modified",
            });
        }

        if (amount !== undefined) {
            actual.amount = amount;
        }

        if (note !== undefined) {
            if (typeof note !== "string") {
                return res.status(400).json({
                    message: "Note must be a string",
                });
            }

            actual.note = note.trim();
        }

        await actual.save();

        return res.status(200).json({
            actual: {
                id: actual._id,
                categoryId: actual.categoryId,
                month: actual.month,
                amount: actual.amount,
                note: actual.note,
            },
        });
    } catch (error) {
        console.error("Error updating actual:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.delete("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        // Validate actual ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid actual ID",
            });
        }

        // Find actual belonging to authenticated user
        const actual = await Actual.findOne({
            _id: id,
            userId,
        });

        if (!actual) {
            return res.status(404).json({
                message: "Actual not found",
            });
        }

        // Check whether the month is locked
        const lock = await Lock.findOne({
            userId,
            month: actual.month,
        });

        if (lock) {
            return res.status(409).json({
                message:
                    "This month's actuals are locked and cannot be modified",
            });
        }

        await Actual.deleteOne({
            _id: actual._id,
        });

        return res.status(200).json({
            message: "Actual deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting actual:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;