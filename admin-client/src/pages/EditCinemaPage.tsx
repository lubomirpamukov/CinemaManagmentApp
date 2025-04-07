import { useParams } from "react-router-dom";
import CinemaCard from "../components/cinema/CinemaCard";
import { useCinema } from "../hooks/useCinemaById";

const EditCinemaPage: React.FC = () => {
  const { cinemaId } = useParams<{ cinemaId: string }>();
  const { cinema, loading, error } = useCinema(cinemaId!);

  if (loading) {
    return <div>Loading cinema...</div>;
  }

  if (error) {
    return <p className="error">Error: {error}</p>;
  }

  if (!cinema) {
    return <p>No cinema found.</p>;
  }

  return (
    <CinemaCard {...cinema} />
  );
}

export default EditCinemaPage;