import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import walletRouter from "./wallet";
import servicesRouter from "./services";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(walletRouter);
router.use(servicesRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(adminRouter);

export default router;
