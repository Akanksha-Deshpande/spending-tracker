import { Router } from "express";
import { Plan } from "../models/Plan";
import { Category } from "../models/Category";
import { authenticate } from "../middleware/authenticate";
import { Lock } from "../models/Lock";
import mongoose from "mongoose";

const router = Router();

router.post("/", authenticate, async (req, res) => {
    try {
        const { categoryId, month, amount } = req.body;

        if (!categoryId || !month || amount === undefined) {
            return res.status(400).json({ message: "Category, month and amount are required" });
        }

        if (!mongoose.isValidObjectId(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
            return res.status(400).json({ message: "Month must be in YYYY-MM format" });
        }

        if (typeof amount !== "number" || amount < 0) {
            return res.status(400).json({ message: "Amount must be a non-negative number" });
        }

        const userId = req.user!.userId;

        const category = await Category.findOne({ _id: categoryId, userId });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const existingPlan = await Plan.findOne({ userId, categoryId, month });

        if (existingPlan) {
            return res.status(409).json({ message: "A plan for this category and month already exists" });
        }

        const plan = await Plan.create({
            userId,
            categoryId,
            month,
            amount
        });

        return res.status(201).json({
            plan: {
                id: plan._id,
                categoryId: plan.categoryId,
                month: plan.month,
                amount: plan.amount,
            }
        });
    }
    catch (error) {
        console.error("Error creating plan:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/", authenticate, async (req, res) => {
    try {
        const userId = req.user!.userId;

        const plans = await Plan.find({ userId }).populate<{ categoryId: { _id: mongoose.Types.ObjectId; name: string; }; }>("categoryId", "name").sort({ month: 1 });

        return res.status(200).json({
            plans: plans.map(plan => ({
                id: plan._id,
                categoryId: plan.categoryId._id,
                categoryName: plan.categoryId.name,
                month: plan.month,
                amount: plan.amount,
            }))
        });

    }
    catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

});

router.patch("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        const userId = req.user!.userId;

        // Validate plan ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid plan ID",
            });
        }

        // Validate amount
        if (amount === undefined) {
            return res.status(400).json({
                message: "Amount is required",
            });
        }

        if (typeof amount !== "number" || amount < 0) {
            return res.status(400).json({
                message: "Amount must be a non-negative number",
            });
        }

        // Find the plan belonging to the authenticated user
        const plan = await Plan.findOne({
            _id: id,
            userId,
        });

        if (!plan) {
            return res.status(404).json({
                message: "Plan not found",
            });
        }

        // Check whether the plan's month is locked
        const lock = await Lock.findOne({
            userId,
            month: plan.month,
        });

        if (lock) {
            return res.status(409).json({
                message: "This month's plan is locked and cannot be edited",
            });
        }

        plan.amount = amount;

        await plan.save();

        return res.status(200).json({
            plan: {
                id: plan._id,
                categoryId: plan.categoryId,
                month: plan.month,
                amount: plan.amount,
            },
        });
    } catch (error) {
        console.error("Error updating plan:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.delete("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid plan ID",
            });
        }

        const plan = await Plan.findOne({
            _id: id,
            userId,
        });

        if (!plan) {
            return res.status(404).json({
                message: "Plan not found",
            });
        }

        const lock = await Lock.findOne({
            userId,
            month: plan.month,
        });

        if (lock) {
            return res.status(409).json({
                message:
                    "This month's plan is locked and cannot be deleted",
            });
        }

        await Plan.deleteOne({
            _id: id,
            userId,
        });

        return res.status(200).json({
            message: "Plan deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting plan:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;