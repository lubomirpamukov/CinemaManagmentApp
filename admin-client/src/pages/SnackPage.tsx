import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import SnackForm from "../components/cinema/SnackForm";
import { Snack } from "../components/cinema/SnackList";
import { getCinemaById, updateCinema } from "../services/cinemaService";
import styles from "./SnackPage.module.css";

const SnackPage: React.FC = () => {
  const { cinemaId } = useParams<{ cinemaId: string }>();
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cinema and its snacks
  useEffect(() => {
    const fetchCinema = async () => {
      try {
        if (!cinemaId) throw new Error("Cinema ID is missing");
        const cinema = await getCinemaById(cinemaId);
        setSnacks(cinema.snacks || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCinema();
  }, [cinemaId]);

  // Handle form submission
  const handleSnackSubmit = async (updatedSnacks: Snack[]) => {
    try {
      if (!cinemaId) throw new Error("Cinema ID is missing");

      // Fetch the full cinema object
      const cinema = await getCinemaById(cinemaId);

      // Assign unique IDs to snacks without an ID
      const snacksWithIds = updatedSnacks.map((snack) => ({
        ...snack,
        id: snack.id || uuidv4(), // Assign a new ID if it doesn't exist
      }));

      // Update the snacks property
      const updatedCinema = {
        ...cinema,
        snacks: snacksWithIds, // Replace only the snacks property
      };

      // Use the updateCinema service to send the updated cinema object
      const updatedData = await updateCinema(cinemaId, updatedCinema);

      // Update the local state with the updated snacks
      setSnacks(updatedData.snacks);
      console.log("Snacks updated successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section className={styles.snackPage}>
      <h1>Edit Snacks</h1>
      <SnackForm snacks={snacks} onSubmit={handleSnackSubmit} />
    </section>
  );
};

export default SnackPage;
