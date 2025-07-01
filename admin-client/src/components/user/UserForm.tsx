import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { createUser, updateUser } from "../../services";
import { userSchema, TUser } from "../../utils";
import styles from "./UserForm.module.css";

type UserFormProps = {
  isEditMode: boolean;
  user: TUser;
};

const UserForm: React.FC<UserFormProps> = ({ isEditMode, user }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: user,
  });

  const onSubmit = async (user: TUser) => {
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
        <h2>{isEditMode ? "User information" : "Create User"}</h2>
        <p>Fill in the information below</p>
      </div>

      {/* Name */}
      <div className={styles.formGroup}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          {...register("name")}
          placeholder="Name"
          className={errors.name ? styles.inputError : ""}
        />
        {errors.name && (
          <span className={styles.errorMessage}>{errors.name.message}</span>
        )}
      </div>

      {/* Email */}
      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          {...register("email")}
          placeholder="Email"
          className={errors.email ? styles.inputError : ""}
        />
        {errors.email && (
          <span className={styles.errorMessage}>{errors.email.message}</span>
        )}
      </div>

      {/* Password */}
      {!isEditMode && (
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register("password")}
            placeholder="Password"
            className={errors.password ? styles.inputError : ""}
          />
          {errors.password && (
            <span className={styles.errorMessage}>{errors.password.message}</span>
          )}
        </div>
      )}

      {/* Contact */}
      <div className={styles.formGroup}>
        <label htmlFor="contact">Contact</label>
        <input
          id="contact"
          {...register("contact")}
          placeholder="Contact"
          className={errors.contact ? styles.inputError : ""}
        />
        {errors.contact && (
          <span className={styles.errorMessage}>{errors.contact.message}</span>
        )}
      </div>

      {/* Address Fields */}
      <fieldset className={styles.fieldset}>
        <legend>Address</legend>
        <div className={styles.formGroup}>
          <label htmlFor="address.line1">Line 1</label>
          <input
            id="adress.line1"
            {...register("address.line1")}
            placeholder="Address line 1"
            className={errors.address?.line1 ? styles.inputError : ""}
          />
          {errors.address?.line1 && (
            <span className={styles.errorMessage}>{errors.address.line1.message}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="adress.city">City</label>
          <input
            id="adress.city"
            {...register("address.city")}
            placeholder="City"
            className={errors.address?.city ? styles.inputError : ""}
          />
          {errors.address?.city && (
            <span className={styles.errorMessage}>{errors.address.city.message}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="adress.state">State</label>
          <input
            id="adress.state"
            {...register("address.state")}
            placeholder="State"
            className={errors.address?.state ? styles.inputError : ""}
          />
          {errors.address?.state && (
            <span className={styles.errorMessage}>{errors.address.state.message}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="adress.zipcode">Zipcode</label>
          <input
            id="adress.zipcode"
            {...register("address.zipcode")}
            placeholder="Zipcode"
            className={errors.address?.zipcode ? styles.inputError : ""}
          />
          {errors.address?.zipcode && (
            <span className={styles.errorMessage}>{errors.address.zipcode.message}</span>
          )}
        </div>
      </fieldset>

      <h1>To do: rendering users reservations component here</h1>
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
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update User"
            : "Create User"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;