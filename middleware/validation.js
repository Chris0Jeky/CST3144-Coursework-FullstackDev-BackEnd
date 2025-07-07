const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg).join(', ');
        return next(new AppError(errorMessages, 400));
    }
    next();
};

// Lesson validation rules
const lessonValidationRules = {
    updateLesson: [
        param('id').isMongoId().withMessage('Invalid lesson ID'),
        body('spaces').optional().isInt({ min: 0 }).withMessage('Spaces must be a non-negative integer'),
        body('space').optional().isInt({ min: 0 }).withMessage('Space must be a non-negative integer'),
        body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('topic').optional().isString().trim().notEmpty().withMessage('Topic cannot be empty'),
        body('location').optional().isString().trim().notEmpty().withMessage('Location cannot be empty')
    ],
    
    getLessons: [
        query('search').optional().isString().trim(),
        query('sortBy').optional().isIn(['topic', 'location', 'price', 'spaces']).withMessage('Invalid sort field'),
        query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
        query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
        query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
        query('minSpaces').optional().isInt({ min: 0 }).withMessage('Min spaces must be non-negative')
    ]
};

// Order validation rules
const orderValidationRules = {
    createOrder: [
        body('name').isString().trim().notEmpty().withMessage('Name is required')
            .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters and spaces'),
        body('phone').isString().trim().notEmpty().withMessage('Phone is required')
            .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone format'),
        body('lessons').isArray({ min: 1 }).withMessage('At least one lesson is required'),
        body('lessons.*.lessonId').isMongoId().withMessage('Invalid lesson ID'),
        body('lessons.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ]
};

module.exports = {
    validate,
    lessonValidationRules,
    orderValidationRules
};