import { Router } from "express"
import { body, param } from "express-validator"
import { RoutineController } from "../controllers/RoutineController"
import { handleInputErrors } from "../middleware/validation"
import { authenticate } from "../middleware/auth"

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

router.get('/:id',
    param('id')
        .isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    RoutineController.getRoutineById
)

router.put('/:id',
    param('id')
        .isMongoId().withMessage('Invalid ID'),
    body('routineName')
        .notEmpty().withMessage('Routine name is required'),
    body('routineDays')
        .notEmpty().withMessage('At least one routine day is required'),
    handleInputErrors,
    RoutineController.updateRoutine
)

router.delete('/:id',
    param('id')
        .isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    RoutineController.deleteteRoutine
)

export default router