import {Router} from "express";
import {Category} from "../models/Category";
import {authenticate} from "../middleware/authenticate";
import { Plan } from "../models/Plan";
import { Actual } from "../models/Actual";
import mongoose from "mongoose";

const router = Router();

// Create a new category
router.post("/", authenticate, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ message: "Category name is required" });
        }

        const userId = req.user?.userId;
        const normalizedCategoryName = name.trim().toUpperCase();

        const existingCategory = await Category.findOne({ userId, name: normalizedCategoryName });

        if(existingCategory){
            return res.status(409).json({ message: "Category with this name already exists" });
        }

        const category = await Category.create({
            userId,
            name: normalizedCategoryName
        })

        return res.status(201).json({ category: {
            id: category._id,
            name: category.name,
        } });
    }
    catch(error){
        console.error("Error creating category:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/", authenticate, async (req, res) => {
    try {
        const userId = req.user!.userId;

        const categories = await Category.find({ userId })
            .sort({ name: 1 });

        return res.status(200).json({
            categories: categories.map((category) => ({
                id: category._id,
                name: category.name,
            })),
        });
    } catch (error) {
        console.error("Error fetching categories:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.delete("/:id", authenticate, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const categoryId = req.params.id;

        if (!mongoose.isValidObjectId(categoryId)) {
            return res.status(400).json({
                message: "Invalid category ID",
            });
        }

        const category = await Category.findOne({
            _id: categoryId,
            userId,
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        const existingPlan = await Plan.findOne({
            userId,
            categoryId,
        });

        if (existingPlan) {
            return res.status(409).json({
                message:
                    "Category is being used by a plan and cannot be deleted",
            });
        }

        const existingActual = await Actual.findOne({
            userId,
            categoryId,
        });

        if (existingActual) {
            return res.status(409).json({
                message:
                    "Category is being used by an actual and cannot be deleted",
            });
        }

        await Category.deleteOne({
            _id: categoryId,
            userId,
        });

        return res.status(200).json({
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting category:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.patch("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const userId = req.user!.userId;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid category ID",
            });
        }

        if (
            !name ||
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            return res.status(400).json({
                message: "Category name is required",
            });
        }

        const normalizedName = name.trim().toUpperCase();

        const category = await Category.findOne({
            _id: id,
            userId,
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }

        const existingCategory = await Category.findOne({
            userId,
            name: normalizedName,
            _id: { $ne: id },
        });

        if (existingCategory) {
            return res.status(409).json({
                message:
                    "Category with this name already exists",
            });
        }

        category.name = normalizedName;

        await category.save();

        return res.status(200).json({
            category: {
                id: category._id,
                name: category.name,
            },
        });
    } catch (error) {
        console.error(
            "Error updating category:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;