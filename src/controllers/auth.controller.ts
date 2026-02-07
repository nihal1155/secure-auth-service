import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../utils/validation';
import { registerUser, loginUser } from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        
        if(error) {
            console.log("Schema Validation Error :: ", error);
            return res.status(400).json({
                error: "Validation Failed",
                message: error.details.map((d) => d.message)
            });
        }

        console.log("Validation successful :: ", value);

        const user = await registerUser(value);
        
        console.log("User registered successfully in controller ::", user);
        res.status(201).json({
            message : "User registered successfully !",
            user : {
                user: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.created_at
            }
        })
    } catch (error: any) {
        console.log("Error occured in controller :: ", error);
        if(error.message == "User with this email already exists") {
            return res.status(409).json({message: error.message});
        }
        next(error);
    }
}

export const login = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        //Validation of request body

        const {error, value} = loginSchema.validate(req.body);

        if(error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(d => d.message)
            });           
        }

        const result = await loginUser(value);

        res.status(200).json({
            message: "Login Succesful",
            user : result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        })

    } catch (error: any) {
        if (error.message === 'Invalid credentials' || error.message === "Invalid Password") {
            console.log(error.message);
            return res.status(401).json({ error: "Invalid credentials" });
        }
        next(error);
    }
}