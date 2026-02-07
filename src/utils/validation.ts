import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email" : "Please provide a valid email address",
            "any.required": "Email is required"
        }),
    
    password : Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters long",
            "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            "any.required": "Password is required"            
        }),

    name : Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.min": "Name must be at least 2 characters long",
            "string.max": "Name must be less than 50 characters",
            "any.required": "Name is required"       
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': "Password is required!"
        })
})