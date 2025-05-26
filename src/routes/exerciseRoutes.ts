import { Router } from "express"
import { param } from "express-validator"
import { ExerciseController } from "../controllers/ExerciseController"
import { handleInputErrors } from "../middleware/validation"
import { authenticate } from "../middleware/auth"

const router = Router()

router.use(authenticate)

router.post('/',
    ExerciseController.createExercise
)

router.get('/',
    ExerciseController.getAllExercises
)

router.get('/:id',
    param('id')
        .isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    ExerciseController.getExerciseById
)

router.put('/:id',
    param('id')
        .isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    ExerciseController.updateExercise
)

router.delete('/:id',
    param('id')
        .isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    ExerciseController.deleteExercise
)

export default router