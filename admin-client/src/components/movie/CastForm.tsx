import React from "react";
import { useFieldArray, Control, UseFormRegister } from "react-hook-form";

import styles from "./MovieForm.module.css";

export interface CastFormProps {
  control: Control<any>;
  register: UseFormRegister<any>;
}

const CastForm: React.FC<CastFormProps> = ({ control, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cast", //name of the field array
  });

  return (
    <div className={styles.formField}>
      <h3>Cast:</h3>
      {fields.map((field, index) => (
        <div key={field.id} className={styles.castMember}>
          {/* Render each cast member Name */}
          <label htmlFor={`cast-${index}-name`}>
            Actor Name
            <input
              type="text"
              id={`cast-${index}-name`}
              placeholder="Name"
              {...register(`cast.${index}.name`)}
            />
          </label>
          {/* Render each cast member Role */}
          <label htmlFor={`cast-${index}-role`}>
            Role
            <input
              type="text"
              id={`cast-${index}-role`}
              placeholder="Role"
              {...register(`cast.${index}.role`)}
            />
          </label>

          <button
            className={`${styles.castButton} ${styles.remove}`}
            type="button"
            onClick={() => remove(index)}
          >
            Remove
          </button>
        </div>
      ))}
      {/* Add cast member button */}
      <button
        className={styles.castButton}
        type="button"
        onClick={() => append({ name: "", role: "" })}
      >
        Add Cast Member
      </button>
    </div>
  );
};

export default CastForm;
