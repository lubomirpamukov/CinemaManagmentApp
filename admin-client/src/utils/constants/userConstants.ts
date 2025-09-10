import { TUser } from "../UserValidationSchema";

export const DEFAULT_USER_VALUES: TUser = {
  id: "",
  role: "user",
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
  adress: "Address line1 is required.",
  city: "City is required.",
  state: "State is required.",
  zipcode: "Zipcode is required.",
};
