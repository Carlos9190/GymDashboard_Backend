import { Router } from "express";
import { body } from "express-validator";
import { RoutineController } from "../controllers/RoutineController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { routineBelongsToUser, routineExists } from "../middleware/routine";
import Routine from "../models/Routine";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    body("routineName").notEmpty().withMessage("Routine name is required"),
    body("routineDays")
        .optional({ checkFalsy: true })
        .custom(async (routineDays, { req }) => {
            const userId = req.user.id;
            if (!Array.isArray(routineDays) || routineDays.length === 0)
                return true;

            const existingRoutines = await Routine.find({ userId });
            const occupiedDays = new Set<string>();
            for (const routine of existingRoutines) {
                routine.routineDays.forEach((day) => occupiedDays.add(day));
            }

            const conflictDays = routineDays.filter((day) =>
                occupiedDays.has(day)
            );
            if (conflictDays.length > 0) {
                throw new Error(
                    `The following days are already assigned: ${conflictDays.join(", ")}`
                );
            }

            return true;
        }),
    handleInputErrors,
    RoutineController.createRoutine
);

router.get("/", RoutineController.getAllRoutines);

router.get("/current-day", RoutineController.getCurrentDayRoutine);

router.param("id", routineExists);
router.param("id", routineBelongsToUser);

router.get("/:id", RoutineController.getRoutineById);

router.put(
    "/:id",
    body("routineName").notEmpty().withMessage("Routine name is required"),
    body("routineDays")
        .optional({ checkFalsy: true })
        .custom(async (routineDays, { req }) => {
            const userId = req.user.id;
            const routineId = req.params.id;

            if (!Array.isArray(routineDays) || routineDays.length === 0)
                return true;

            const existingRoutines = await Routine.find({
                userId,
                _id: { $ne: routineId },
            });

            const occupiedDays = new Set<string>();
            for (const routine of existingRoutines) {
                routine.routineDays.forEach((day) => occupiedDays.add(day));
            }

            const conflictDays = routineDays.filter((day) =>
                occupiedDays.has(day)
            );
            if (conflictDays.length > 0) {
                throw new Error(
                    `The following days are already assigned: ${conflictDays.join(", ")}`
                );
            }

            return true;
        }),
    handleInputErrors,
    RoutineController.updateRoutine
);

router.post("/:id/exercise", RoutineController.addExerciseToRoutine);

router.patch(
    "/:id/reorderExercises",
    RoutineController.reorderRoutineExercises
);

router.patch("/:id/exercise", RoutineController.removeExerciseFromRoutine);

router.delete("/:id", RoutineController.deleteteRoutine);

export default router;
