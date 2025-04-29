import { User } from "../UserValidationSchema";

export const DEFAULT_USER_VALUES: User = {
    id: "",
    userName: "",
    name: "",
    email: "",
    password: "",
    contact: "",
  };

export const UserValidation = {
    name: "Name must be between 4 and 100 characters long.",
    email: "Email must be a valid email address and with maximum 100 chacaters.",
    password: "Password must be between 8 and 100 characters long.",
    contact: "Contact number must be a valid phone number.",
    addressLine1: "Address must be between 4 and 100 characters long.",
    city: "City must be between 2 and 100 characters long.",
    zipcode: "Zipcode must be between 4 and 10 characters long.",
}
