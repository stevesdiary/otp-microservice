import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationError } from '../utils/app-error.util';

/**
 * Generic validation middleware factory
 */
export function validateDto<T extends object>(dtoClass: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Transform plain object to class instance
      const dtoInstance = plainToClass(dtoClass, req.body);

      // Validate
      const errors: ClassValidatorError[] = await validate(dtoInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: error.constraints,
          value: error.value,
        }));

        throw new ValidationError('Validation failed', formattedErrors);
      }

      // Replace req.body with validated DTO instance
      req.body = dtoInstance;
      next();
    } catch (error) {
      next(error);
    }
  };
}
