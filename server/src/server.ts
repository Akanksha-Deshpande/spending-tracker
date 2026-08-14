import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./config/database";
import authRouter from "./routes/auth";
import categoryRouter from "./routes/categories";
import planRouter from "./routes/plans";
import lockRouter from "./routes/locks";
import actualRouter from "./routes/actuals";
import reportRouter from "./routes/reports";

const app = express();

const PORT = Number(process.env.PORT) || 5000;



app.get("/", (_req, res) => {
    res.json({
        message: "Spending Tracker API is running"
    });
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/plans", planRouter);
app.use("/api/locks", lockRouter);
app.use("/api/actuals", actualRouter);
app.use("/api/reports", reportRouter);

async function startServer() {
    await connectDatabase();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(
            `Server is running on port ${PORT}`
        );
    });
}

startServer().catch((error) => {
    console.error(
        "Error starting server:",
        error
    );

    process.exit(1);
});

