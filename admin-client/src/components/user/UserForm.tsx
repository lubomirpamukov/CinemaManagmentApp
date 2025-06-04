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

  const renderField = (key: string, value: any) => {
    if (key === "id") return;
    if (typeof value === "object" && value !== null) {
      return (
        <fieldset className={styles.fieldset} key={key}>
          <legend>{key}</legend>
          {Object.entries(value).map(([subKey, subValue]) =>
            renderField(`${key}.${subKey}`, subValue)
          )}
        </fieldset>
      );
    }

    return (
      <div className={styles.formGroup} key={key}>
        <label htmlFor={key}>{key}</label>
        <input
          id={key}
          {...register(key as keyof User)}
          placeholder={key}
          type={key === "password" ? "password" : "text"}
          className={errors[key as keyof User] ? styles.inputError : ""}
        />
        {errors[key as keyof User] && (
          <span className={styles.errorMessage}>
            {errors[key as keyof User]?.message}
          </span>
        )}
      </div>
    );
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formHeader}>
        <h2>{isEditMode ? "User information" : "Create User"}</h2>
        <p>Fill in the information below</p>
      </div>

      {Object.entries(user).map(([key, value]) => renderField(key, value))}
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
