import { Router } from "express"
import { body, param } from "express-validator"
import { ExerciseController } from "../controllers/ExerciseController"
import { handleInputErrors } from "../middleware/validation"
import { authenticate } from "../middleware/auth"
import { RecordController } from "../controllers/RecordController"
import { exerciseExists } from "../middleware/exercise"
import { recordBelongsToProject, recordExists } from "../middleware/record"

const router = Router()

router.use(authenticate)

router.post('/',
    ExerciseController.createExercise
)

router.get('/',
    ExerciseController.getAllExercises
)

router.param('id', param('id').isMongoId().withMessage('Invalid ID'))
router.param('id', handleInputErrors)

router.get('/:id',
    ExerciseController.getExerciseById
)

router.put('/:id',
    ExerciseController.updateExercise
)

router.delete('/:id',
    ExerciseController.deleteExercise
)

// Routes for records
router.param('exerciseId', exerciseExists)

router.post('/:exerciseId/records',
    body('sets')
        .notEmpty().withMessage('Number of sets is required')
        .isInt({ min: 1 }).withMessage('Sets must be at least 1'),

    body('reps')
        .notEmpty().withMessage('Number of reps is required')
        .isInt({ min: 1 }).withMessage('Reps must be at least 1'),

    body('weight')
        .notEmpty().withMessage('Weight is required')
        .isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0'),
    handleInputErrors,
    RecordController.createExerciseRecord
)

router.get('/:exerciseId/records',
    handleInputErrors,
    RecordController.getExerciseRecords
)

router.param('recordId', recordExists)
router.param('recordId', recordBelongsToProject)

router.get('/:exerciseId/records/:recordId',
    handleInputErrors,
    RecordController.getExerciseRecordById
)

router.put('/:exerciseId/records/:recordId',
    body('sets')
        .notEmpty().withMessage('Please provide the number of sets.')
        .isInt({ min: 1 }).withMessage('Sets must be at least 1.'),

    body('reps')
        .notEmpty().withMessage('Please provide the number of reps.')
        .isInt({ min: 1 }).withMessage('Reps must be at least 1.'),

    body('weight')
        .notEmpty().withMessage('Please provide the weight.')
        .isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0.'),
    handleInputErrors,
    RecordController.updateExerciseRecord
)

router.delete('/:exerciseId/records/:recordId',
    handleInputErrors,
    RecordController.deleteExerciseRecord
)

export default router