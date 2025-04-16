import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { createUser, updateUser } from "../../services";
import { userSchema, User } from "../../utils";
import styles from "./UserForm.module.css";

type UserFormProps = {
  isEditMode: boolean;
  user: User;
};

const UserForm: React.FC<UserFormProps> = ({ isEditMode, user}) => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset
  } = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: user
  });

  const onSubmit = async (user: User) => {
    try {
      if (isEditMode) {
        await updateUser(user.id, user);
      } else {
        await createUser(user);
      }
      reset(user);
      navigate("/users");
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  return (
    
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formHeader}>
        <h2>{isEditMode ? "Edit User" : "CreateUser"}</h2>
        <p>Fill in the information below</p>
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="userName">Username</label>
          <input 
            id="userName"
            {...register("userName")} 
            placeholder="Enter username"
            className={errors.userName ? styles.inputError : ""}
          />
          {errors.userName && (
            <span className={styles.errorMessage}>{errors.userName.message}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name</label>
          <input 
            id="name"
            {...register("name")} 
            placeholder="Enter full name"
            className={errors.name ? styles.inputError : ""}
          />
          {errors.name && (
            <span className={styles.errorMessage}>{errors.name.message}</span>
          )}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email"
            {...register("email")} 
            placeholder="Enter email address"
            className={errors.email ? styles.inputError : ""}
          />
          {errors.email && (
            <span className={styles.errorMessage}>{errors.email.message}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password"
            {...register("password")} 
            placeholder={isEditMode ? "••••••••" : "Enter password"}
            className={errors.password ? styles.inputError : ""}
          />
          {errors.password && (
            <span className={styles.errorMessage}>{errors.password.message}</span>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="contact">Contact Number</label>
        <input 
          id="contact"
          {...register("contact")} 
          placeholder="Enter contact number"
          className={errors.contact ? styles.inputError : ""}
        />
        {errors.contact && (
          <span className={styles.errorMessage}>{errors.contact.message}</span>
        )}
      </div>

      <fieldset className={styles.fieldset}>
        <legend>Address Information</legend>
        
        <div className={styles.formGroup}>
          <label htmlFor="addressLine1">Address Line</label>
          <input 
            id="addressLine1"
            {...register("address.line1")} 
            placeholder="Enter street address"
            className={errors.address?.line1 ? styles.inputError : ""}
          />
          {errors.address?.line1 && (
            <span className={styles.errorMessage}>{errors.address.line1.message}</span>
          )}
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="city">City</label>
            <input 
              id="city"
              {...register("address.city")} 
              placeholder="Enter city"
              className={errors.address?.city ? styles.inputError : ""}
            />
            {errors.address?.city && (
              <span className={styles.errorMessage}>{errors.address.city.message}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="state">State/Province</label>
            <input 
              id="state"
              {...register("address.state")} 
              placeholder="Enter state"
              className={errors.address?.state ? styles.inputError : ""}
            />
            {errors.address?.state && (
              <span className={styles.errorMessage}>{errors.address.state.message}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="zipcode">Zip/Postal Code</label>
            <input 
              id="zipcode"
              {...register("address.zipcode")} 
              placeholder="Enter zipcode"
              className={errors.address?.zipcode ? styles.inputError : ""}
            />
            {errors.address?.zipcode && (
              <span className={styles.errorMessage}>{errors.address.zipcode.message}</span>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Geo Location</legend>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="lat">Latitude</label>
            <input 
              id="lat"
              type="number" 
              step="0.000001"
              {...register("geoLocation.lat", { valueAsNumber: true })} 
              placeholder="Enter latitude"
              className={errors.geoLocation?.lat ? styles.inputError : ""}
            />
            {errors.geoLocation?.lat && (
              <span className={styles.errorMessage}>{errors.geoLocation.lat.message}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="long">Longitude</label>
            <input 
              id="long"
              type="number"
              step="0.000001"
              {...register("geoLocation.long", { valueAsNumber: true })} 
              placeholder="Enter longitude"
              className={errors.geoLocation?.long ? styles.inputError : ""}
            />
            {errors.geoLocation?.long && (
              <span className={styles.errorMessage}>{errors.geoLocation.long.message}</span>
            )}
          </div>
        </div>
      </fieldset>

      <div className={styles.formActions}>
        <button 
          type="button" 
          className={styles.cancelButton}
          onClick={() => navigate("/users")}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting || (!isDirty && isEditMode)}
        >
          {isSubmitting ? "Saving..." : isEditMode ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;