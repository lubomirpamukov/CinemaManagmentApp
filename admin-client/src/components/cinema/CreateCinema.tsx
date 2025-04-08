import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import styles from "./CreateCinema.module.css";
import { createCinema } from "../../services/cinemaService";
import { v4 as uuidv4 } from "uuid";

import { cinemaSchema } from "../../utils/CinemaValidationsSchema";

  type CinemaFormValues = z.infer<typeof cinemaSchema>;

const CreateCinema: React.FC = () => {

    const {register, handleSubmit, formState: {errors}} = useForm<CinemaFormValues>({
        resolver: zodResolver(cinemaSchema),
        defaultValues: {
            id: uuidv4(),
            halls:[],
            snacks:[{
                id: "test-id",
                name: "Snickers",
                price: 2.99,
            }],
        }
    });

    const navigate = useNavigate();

    const onSubmit = async (data: CinemaFormValues) => {
        console.log("Cinema created successfully", data);
        await createCinema(data);
        navigate(`/cinemas/${data.id}/edit`);
    };


    return (
        <div className={styles.createCinemaContainer}>
            <h1>Create Cinema</h1>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                {/* Name field */}
                <label htmlFor="cinema-name" className={styles.formGroup}> Cinema Name:
                    <input
                    id="cinema-name"
                    placeholder="Cinema Name"
                    {...register("name")} 
                    type="text" 
                    />
                    {errors.name && <p className={styles.error}>{errors.name.message}</p>}
                </label>
                {/* City field */}
                <label htmlFor="cinema-city" className={styles.formGroup}> Cinema City
                    <input 
                    id="cinema-city"
                    placeholder="City"
                    {...register("city")}
                    type="text"
                     />
                     {errors.city && <p className={styles.error}>{errors.city.message}</p>}
                </label>

                <button type="submit" className={styles.submitButton}>
                    Create New Cinema
                </button>

            </form>
        </div>
    );
}
export default CreateCinema;