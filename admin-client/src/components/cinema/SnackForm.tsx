import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Snack } from "./SnackList";
import { snackFormSchema } from "../../utils/SnackValidationsSchema";
import styles from "./SnackForm.module.css";

export type SnackFormProps = {
  snacks: Snack[];
  onSubmit: (updatedSnacks: Snack[]) => void;
};

type FormValues = z.infer<typeof snackFormSchema>;

const SnackForm: React.FC<SnackFormProps> = ({ snacks, onSubmit }) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { snacks },
    resolver: zodResolver(snackFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "snacks",
  });

  const navigate = useNavigate();
  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    onSubmit(data.snacks);
    navigate(`/cinemas`); // Redirect to the cinemas page after submission
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={styles.snackForm}
    >
      <h2>Edit Snacks</h2>
      {fields.map((field, index) => (
        <section key={field.id}>
          {/* Name field */}
          <label htmlFor={`snackName-${index}`} className={styles.formField}>
            Name:
            <input
              type="text"
              id={`snackName-${index}`}
              placeholder="Snack Name"
              {...register(`snacks.${index}.name` as const)}
            />
            {errors?.snacks?.[index]?.name && (
              <p className={styles.errors}>
                {errors.snacks[index].name?.message}
              </p>
            )}
          </label>

          {/* Price field */}
          <label htmlFor={`snackPrice-${index}`} className={styles.formField}>
            Price
            <input
              type="number"
              id={`snackPrice-${index}`}
              placeholder="Snack Price"
              step="0.01"
              {...register(`snacks.${index}.price` as const, {valueAsNumber: true})}
            />
            {errors.snacks?.[index]?.price && (
              <p className={styles.errors}>
                {errors.snacks[index].price?.message}
              </p>
            )}
          </label>

          {/* Description field */}
          <label htmlFor={`snackDesc-${index}`} className={styles.formField}>
            Description
            <input
              type="text"
              id={`snackDesc-${index}`}
              placeholder="Snack Description"
              {...register(`snacks.${index}.description` as const)}
            />
            {errors.snacks?.[index]?.description && (
              <p className={styles.errors}>
                {errors.snacks[index].description?.message}
              </p>
            )}
          </label>
          <button
            className={styles.buttonRemove}
            type="button"
            onClick={() => remove(index)}
          >
            Remove Snack
          </button>
        </section>
      ))}
      <button
        className={styles.buttonAdd}
        type="button"
        onClick={() => append({ id: "", name: "", price: 0, description: "" })}
      >
        Add Snack
      </button>
      
      <button type="submit" className={styles.buttonSubmit}>
        Submit
      </button>
    </form>
  );
};

export default SnackForm;
