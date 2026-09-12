import express from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware.js";
import ExpressError from "./utils/ExpressError.js";
import cooperativeRouter from "./routes/cooperative.routes.js";
import workerRouter from "./routes/worker.routes.js";
import customerRouter from "./routes/customer.routes.js";
import serviceRouter from "./routes/service.routes.js";
import serviceRequestRouter from "./routes/serviceRequest.routes.js";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.use("/cooperative", cooperativeRouter);
app.use("/worker", workerRouter);
app.use("/customer", customerRouter);
app.use("/service", serviceRouter);
app.use("/api/service-requests", serviceRequestRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/error", (_req, _res) => {
  throw new ExpressError("ERROR", 500);
});

app.use(errorMiddleware);

export { app };
