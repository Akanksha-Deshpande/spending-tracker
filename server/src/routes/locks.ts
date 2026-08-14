import { Router } from "express";
import { Lock } from "../models/Lock";
import { authenticate } from "../middleware/authenticate";
import { PeriodEvent } from "../models/PeriodEvent";

function isValidMonth(month: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

const router = Router();

router.post("/:month", authenticate, async (req, res) => {
    try {
        const month = req.params.month as string;


        if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
            return res.status(400).json({ message: "Month must be in YYYY-MM format" });
        }

        const userId = req.user!.userId;

        const existingLock = await Lock.findOne({ userId, month });

        if (existingLock) {
            return res.status(409).json({ message: "A lock for this month already exists" });
        }

        const lock = await Lock.create({
            userId,
            month
        });

        await PeriodEvent.create({
            userId,
            month,
            action: "LOCKED",
        });

        return res.status(201).json({
            lock: {
                id: lock._id,
                month: lock.month,
            }
        });


    } catch (error) {
        console.error("Error creating lock:", error);
        return res.status(500).json({ message: "Internal server error" });
    }


});

router.get("/", authenticate, async (req, res) => {
    try {
        const userId = req.user!.userId;

        const locks = await Lock.find({ userId })
            .sort({ month: 1 });

        return res.status(200).json({
            locks: locks.map((lock) => ({
                id: lock._id,
                month: lock.month,
            })),
        });
    } catch (error) {
        console.error("Error fetching locks:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/:month/unlock", authenticate, async (req, res) => {
    try {
        const month = Array.isArray(req.params.month)
            ? req.params.month[0]
            : req.params.month;

        const userId = req.user!.userId;
        const { note } = req.body;

        if (!month || !isValidMonth(month)) {
            return res.status(400).json({
                message: "Month must be in YYYY-MM format",
            });
        }

        if (!note || typeof note !== "string" || !note.trim()) {
            return res.status(400).json({
                message: "A reason is required to unlock a month",
            });
        }

        const lock = await Lock.findOne({
            userId,
            month,
        });

        if (!lock) {
            return res.status(404).json({
                message: "This month is not locked",
            });
        }

        await Lock.deleteOne({
            _id: lock._id,
        });

        await PeriodEvent.create({
            userId,
            month,
            action: "UNLOCKED",
            note: note.trim(),
        });

        return res.status(200).json({
            message: "Month unlocked successfully",
        });
    } catch (error) {
        console.error("Error unlocking month:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;