import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { cinemaSchema } from "../../utils";
import SnackList from "./SnackList";
import styles from "./CinemaDetails.module.css";
import HallList from "../Hall/HallsList";
import ActionButton from "../buttons/ActionButton";
import { DEFAULT_CINEMA_VALUES } from "../../utils/constants";
import { updateCinema } from "../../services";
import { useCinemaById } from "../../hooks/useCinemaById";
import { useHallDetails } from "../../hooks/useHallDetails";
import Spinner from "../Spinner";

type CinemaFormSchemaType = z.infer<typeof cinemaSchema>;

const CinemaDetails: React.FC = () => {
  const { cinemaId } = useParams<{ cinemaId: string }>();
  const navigate = useNavigate();

  // Fetch cinema data
  const {
    cinema,
    loading: cinemaLoading,
    error: cinemaError,
  } = useCinemaById(cinemaId!);

  // Fetch halls for this cinema
  const { hallsDetails, loading: hallsLoading } = useHallDetails(cinema?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CinemaFormSchemaType>({
    resolver: zodResolver(cinemaSchema),
    defaultValues: DEFAULT_CINEMA_VALUES,
  });

  useEffect(() => {
    if (cinema) {
      reset({
        id: cinema.id,
        name: cinema.name || "",
        city: cinema.city || "",
        imgURL: cinema.imgURL || "",
        halls: cinema.halls || [], // These are hall IDs
        snacks: cinema.snacks || [],
      });
    }
  }, [cinema, reset]);

  const onSubmit = async (cinemaData: CinemaFormSchemaType) => {
    if (!cinema?.id) {
      console.error("Cannot update cinema without an ID.");
      return;
    }
    try {
      // Use cinema.halls and cinema.snacks to ensure we're using the original data
      await updateCinema(cinema.id, {
        ...cinemaData,
        halls: cinema.halls,
        snacks: cinema.snacks,
      });
      alert("Cinema updated successfully");
      navigate(`/cinemas`);
    } catch (error) {
      console.error("Error updating cinema:", error);
    }
  };

  if (cinemaLoading || hallsLoading) {
    return <Spinner />;
  }

  if (cinemaError || !cinema) {
    return (
      <p className={styles.error}>
        Error loading cinema: {cinemaError || "Cinema not found."}
      </p>
    );
  }

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

      <HallList cinema={cinema} halls={hallsDetails} />

      <SnackList cinemaId={cinema.id || ""} snacks={cinema.snacks || []} />
    </div>
  );
};

export default CinemaDetails;
