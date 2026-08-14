import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { Plan } from "../models/Plan";
import { Actual } from "../models/Actual";
import { Category } from "../models/Category";

const router = Router();

function isValidMonth(month: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

function getMonthsInRange(
    from: string,
    to: string
): string[] {
    const months: string[] = [];

    const [fromYear, fromMonth] =
        from.split("-").map(Number);

    const [toYear, toMonth] =
        to.split("-").map(Number);

    let year = fromYear;
    let month = fromMonth;

    while (
        year < toYear ||
        (year === toYear && month <= toMonth)
    ) {
        months.push(
            `${year}-${String(month).padStart(2, "0")}`
        );

        month++;

        if (month === 13) {
            month = 1;
            year++;
        }
    }

    return months;
}

/*
 * =========================
 * Range Report
 * =========================
 *
 * GET /reports?from=2026-01&to=2026-03
 *
 * Missing actuals are treated as 0.
 * Plan = 0 => variancePercentage = null.
 */

router.get("/", authenticate, async (req, res) => {
    try {
        const from =
            typeof req.query.from === "string"
                ? req.query.from
                : "";

        const to =
            typeof req.query.to === "string"
                ? req.query.to
                : "";

        if (!isValidMonth(from)) {
            return res.status(400).json({
                message:
                    "From month must be in YYYY-MM format",
            });
        }

        if (!isValidMonth(to)) {
            return res.status(400).json({
                message:
                    "To month must be in YYYY-MM format",
            });
        }

        if (from > to) {
            return res.status(400).json({
                message:
                    "From month cannot be after To month",
            });
        }

        const userId = req.user!.userId;

        const months =
            getMonthsInRange(from, to);

        /*
         * Fetch all data for the selected range.
         */

        const plans = await Plan.find({
            userId,
            month: {
                $gte: from,
                $lte: to,
            },
        })
            .select("categoryId month amount")
            .lean();

        const actuals = await Actual.find({
            userId,
            month: {
                $gte: from,
                $lte: to,
            },
        })
            .select("categoryId month amount")
            .lean();

        const categories = await Category.find({
            userId,
        })
            .select("name")
            .lean();

        /*
         * Category name lookup.
         */

        const categoryNameMap =
            new Map<string, string>();

        for (const category of categories) {
            categoryNameMap.set(
                category._id.toString(),
                category.name
            );
        }

        /*
         * Key:
         *
         * categoryId + month
         *
         * This allows multiple plan/actual records
         * for the same category and month to be
         * aggregated together.
         */

        const categoryMonthMap =
            new Map<
                string,
                {
                    categoryId: string;
                    month: string;
                    planned: number;
                    actual: number;
                }
            >();

        function getKey(
            categoryId: string,
            month: string
        ) {
            return `${categoryId}_${month}`;
        }

        /*
         * Add plans.
         */

        for (const plan of plans) {
            const categoryId =
                plan.categoryId.toString();

            const key = getKey(
                categoryId,
                plan.month
            );

            const existing =
                categoryMonthMap.get(key);

            if (existing) {
                existing.planned += plan.amount;
            } else {
                categoryMonthMap.set(key, {
                    categoryId,
                    month: plan.month,
                    planned: plan.amount,
                    actual: 0,
                });
            }
        }

        /*
         * Add actuals.
         */

        for (const actual of actuals) {
            const categoryId =
                actual.categoryId.toString();

            const key = getKey(
                categoryId,
                actual.month
            );

            const existing =
                categoryMonthMap.get(key);

            if (existing) {
                existing.actual += actual.amount;
            } else {
                categoryMonthMap.set(key, {
                    categoryId,
                    month: actual.month,
                    planned: 0,
                    actual: actual.amount,
                });
            }
        }

        /*
         * Build category × month rows.
         *
         * Missing actuals become 0.
         */

        const reportRows = Array.from(
            categoryMonthMap.values()
        )
            .map((values) => {
                const variance =
                    values.actual -
                    values.planned;

                const variancePercentage =
                    values.planned === 0
                        ? null
                        : Number(
                              (
                                  (variance /
                                      values.planned) *
                                  100
                              ).toFixed(2)
                          );

                return {
                    categoryId:
                        values.categoryId,

                    category:
                        categoryNameMap.get(
                            values.categoryId
                        ) ?? "UNKNOWN",

                    month: values.month,

                    planned:
                        values.planned,

                    actual:
                        values.actual,

                    variance,

                    variancePercentage,
                };
            })
            .sort((a, b) => {
                if (
                    a.month !==
                    b.month
                ) {
                    return b.month.localeCompare(
                        a.month
                    );
                }

                return a.category.localeCompare(
                    b.category
                );
            });

        /*
         * Summary.
         */

        const totalPlanned =
            reportRows.reduce(
                (sum, row) =>
                    sum + row.planned,
                0
            );

        const totalActual =
            reportRows.reduce(
                (sum, row) =>
                    sum + row.actual,
                0
            );

        const totalVariance =
            totalActual -
            totalPlanned;

        const totalVariancePercentage =
            totalPlanned === 0
                ? null
                : Number(
                      (
                          (totalVariance /
                              totalPlanned) *
                          100
                      ).toFixed(2)
                  );

        /*
         * Monthly totals for chart.
         *
         * Every month in the selected range is
         * included, even if there is no data.
         */

        const monthlyMap =
            new Map<
                string,
                {
                    planned: number;
                    actual: number;
                }
            >();

        for (const month of months) {
            monthlyMap.set(month, {
                planned: 0,
                actual: 0,
            });
        }

        for (const row of reportRows) {
            const existing =
                monthlyMap.get(
                    row.month
                );

            if (existing) {
                existing.planned +=
                    row.planned;

                existing.actual +=
                    row.actual;
            }
        }

        const monthly =
            months.map((month) => {
                const values =
                    monthlyMap.get(
                        month
                    )!;

                const variance =
                    values.actual -
                    values.planned;

                return {
                    month,
                    planned:
                        values.planned,
                    actual:
                        values.actual,
                    variance,
                };
            });

        return res.status(200).json({
            from,
            to,

            summary: {
                planned:
                    totalPlanned,

                actual:
                    totalActual,

                variance:
                    totalVariance,

                variancePercentage:
                    totalVariancePercentage,
            },

            monthly,

            rows: reportRows,
        });
    } catch (error) {
        console.error(
            "Error generating range report:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error",
        });
    }
});

/*
 * =========================
 * Monthly Report
 * =========================
*/

router.get(
    "/:month",
    authenticate,
    async (req, res) => {
        try {
            const month =
                req.params.month as string;

            if (
                !month ||
                !isValidMonth(month)
            ) {
                return res.status(400).json({
                    message:
                        "Month must be in YYYY-MM format",
                });
            }

            const userId =
                req.user!.userId;

            const plans =
                await Plan.find({
                    userId,
                    month,
                })
                    .select(
                        "categoryId amount"
                    )
                    .lean();

            const actuals =
                await Actual.find({
                    userId,
                    month,
                })
                    .select(
                        "categoryId amount"
                    )
                    .lean();

            const categories =
                await Category.find({
                    userId,
                })
                    .select("name")
                    .lean();

            const categoryNameMap =
                new Map<
                    string,
                    string
                >();

            for (const category of categories) {
                categoryNameMap.set(
                    category._id.toString(),
                    category.name
                );
            }

            const categoryMap =
                new Map<
                    string,
                    {
                        planned: number;
                        actual: number;
                    }
                >();

            for (const plan of plans) {
                const categoryId =
                    plan.categoryId.toString();

                const existing =
                    categoryMap.get(
                        categoryId
                    );

                if (existing) {
                    existing.planned +=
                        plan.amount;
                } else {
                    categoryMap.set(
                        categoryId,
                        {
                            planned:
                                plan.amount,
                            actual: 0,
                        }
                    );
                }
            }

            for (const actual of actuals) {
                const categoryId =
                    actual.categoryId.toString();

                const existing =
                    categoryMap.get(
                        categoryId
                    );

                if (existing) {
                    existing.actual +=
                        actual.amount;
                } else {
                    categoryMap.set(
                        categoryId,
                        {
                            planned: 0,
                            actual:
                                actual.amount,
                        }
                    );
                }
            }

            const reportCategories =
                Array.from(
                    categoryMap.entries()
                ).map(
                    ([
                        categoryId,
                        values,
                    ]) => {
                        const variance =
                            values.actual -
                            values.planned;

                        const variancePercentage =
                            values.planned ===
                            0
                                ? null
                                : Number(
                                      (
                                          (variance /
                                              values.planned) *
                                          100
                                      ).toFixed(
                                          2
                                      )
                                  );

                        return {
                            categoryId,
                            category:
                                categoryNameMap.get(
                                    categoryId
                                ) ??
                                "UNKNOWN",
                            planned:
                                values.planned,
                            actual:
                                values.actual,
                            variance,
                            variancePercentage,
                        };
                    }
                );

            const totalPlanned =
                reportCategories.reduce(
                    (sum, category) =>
                        sum +
                        category.planned,
                    0
                );

            const totalActual =
                reportCategories.reduce(
                    (sum, category) =>
                        sum +
                        category.actual,
                    0
                );

            const totalVariance =
                totalActual -
                totalPlanned;

            const totalVariancePercentage =
                totalPlanned === 0
                    ? null
                    : Number(
                          (
                              (totalVariance /
                                  totalPlanned) *
                              100
                          ).toFixed(2)
                      );

            return res.status(200).json({
                month,

                summary: {
                    planned:
                        totalPlanned,
                    actual:
                        totalActual,
                    variance:
                        totalVariance,
                    variancePercentage:
                        totalVariancePercentage,
                },

                categories:
                    reportCategories,
            });
        } catch (error) {
            console.error(
                "Error generating report:",
                error
            );

            return res.status(500).json({
                message:
                    "Internal server error",
            });
        }
    }
);

export default router;