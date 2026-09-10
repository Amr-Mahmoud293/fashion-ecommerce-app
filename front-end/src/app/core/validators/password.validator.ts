import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class PasswordValidator{
    static strongPassword():ValidatorFn{
        return (control:AbstractControl): ValidationErrors | null =>{
            const value = control.value;
            if(!value){
                return null;
            }
            const hasNumber = /[0-9]/.test(value);
            const hasUpper= /[A-Z]/.test(value);
            const hasLower = /[a-z]/.test(value);
            const hasSpecial = /[^a-zA-Z0-9]/.test(value);
            const isValidLength = value.length >= 8;
            const isValid = hasNumber && hasUpper && hasLower && hasSpecial && isValidLength;
            return !isValid ? {passwordStrength : true} : null
        }
    }

    static passwordRetype():ValidatorFn{
        return (control:AbstractControl): ValidationErrors | null =>{
            const value = control.value;
            if(!value){
                return null;
            }
            const password = control.parent?.get('password')?.value;
            if(value === password){
                return null;
            }
            return {passwordMismatch:true}
        }
    }
}