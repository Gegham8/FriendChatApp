import { IsEmail, IsNotEmpty } from "class-validator";

export class ExistingUserDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsEmail({}, { message : "Enter a correct email address"})
    email : string;

    @IsNotEmpty({ message: 'Password is required' })
    password : string;
}