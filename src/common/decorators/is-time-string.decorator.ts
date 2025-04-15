import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsTimeString(validationOptions?: ValidationOptions) {
    return function (target: Object, propertyName: string) {
        registerDecorator({
            name: 'isTimeString',
            target: target.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') return false;
                    
                    // Regular expression to match HH:MM:SS format
                    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
                    return timeRegex.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid time string in the format HH:MM:SS`;
                }
            }
        });
    };
}
