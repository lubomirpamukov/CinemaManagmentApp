import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { cinemaSchema } from "../../utils";
import SnackList from "./SnackList";
import styles from "./CinemaDetails.module.css";
import HallList from "../Hall/HallsList";
import ActionButton from "../buttons/ActionButton";
import { DEFAULT_CINEMA_VALUES } from "../../utils/constants";
import { updateCinema } from "../../services";

type CinemaDetailsProps = z.infer<typeof cinemaSchema>;

const CinemaDetails: React.FC<CinemaDetailsProps> = ({
  id,
  city,
  name,
  halls,
  snacks,
  imgURL,
}) => {
  //Initialize react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CinemaDetailsProps>({
    resolver: zodResolver(cinemaSchema),
    defaultValues: DEFAULT_CINEMA_VALUES,
  });
  const navigate = useNavigate();

  useEffect(() => {
    reset({
      id, // Include ID if required by schema
      name: name || "",
      city: city || "",
      imgURL: imgURL || "",
      halls: halls || [], 
      snacks: snacks || [],
    });
  }, [id, name, city, imgURL, halls, snacks, reset]);

  //handle form subimt
  const onSubmit = async (cinemaData: CinemaDetailsProps) => {
    try {
      await updateCinema(id, { ...cinemaData, halls, snacks });
      alert("Cinema updated successfully");
      navigate(`/cinemas`);
    } catch {
      console.log("Error updating cinema");
    }
  };

  return (
    <div className={styles.cinemaDetails}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <label htmlFor="city" className={styles.formData}>
          City
          <input
            type="text"
            id="city"
            placeholder="City"
            {...register("city")}
            className={styles.formInputField}
          />
          {errors.city && <p className={styles.error}>{errors.city.message}</p>}
        </label>
        <label htmlFor="cinema" className={styles.formData}>
          Cinema Name
          <input
            type="text"
            id="cinema"
            placeholder="Cinema Name"
            {...register("name")}
            className={styles.formInputField}
          />
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}
        </label>
        <label htmlFor="imgUrl" className={styles.formData}>
          Image URL
          <input
            type="text"
            id="imgUrl"
            placeholder="Image URL"
            {...register("imgURL")}
            className={styles.formInputField}
          />
          {errors.imgURL && (
            <p className={styles.error}>{errors.imgURL.message}</p>
          )}
        </label>

        <ActionButton
          label="Update Cinema"
          type="edit"
          id="update-cinema-button"
          buttonType="submit"
        />
      </form>
      <HallList cinemaId={id} hallIds={halls} />
      <SnackList cinemaId={id} snacks={snacks} />
    </div>
  );
};

export default CinemaDetails;

