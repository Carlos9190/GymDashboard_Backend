import { Router } from "express"
import { body, param } from "express-validator"
import { RoutineController } from "../controllers/RoutineController"
import { handleInputErrors } from "../middleware/validation"
import { authenticate } from "../middleware/auth"
import { routineBelongsToUser, routineExists } from "../middleware/routine"

const router = Router()

router.use(authenticate)

router.post('/',
    body('routineName')
        .notEmpty().withMessage('Routine name is required'),
    body('routineDays')
        .notEmpty().withMessage('At least one routine day is required'),
    handleInputErrors,
    RoutineController.createRoutine
)

router.get('/',
    RoutineController.getAllRoutines
)

router.param('id', routineExists)
router.param('id', routineBelongsToUser)

router.get('/:id',
    RoutineController.getRoutineById
)

router.put('/:id',
    body('routineName')
        .notEmpty().withMessage('Routine name is required'),
    body('routineDays')
        .notEmpty().withMessage('At least one routine day is required'),
    handleInputErrors,
    RoutineController.updateRoutine
)

router.post('/:id/exercise',
    RoutineController.addExerciseToRoutine
)

router.patch('/:id/reorderExercises',
    RoutineController.reorderRoutineExercises
)

router.patch('/:id/exercise',
    RoutineController.removeExerciseFromRoutine
)

router.delete('/:id',
    RoutineController.deleteteRoutine
)


export default router