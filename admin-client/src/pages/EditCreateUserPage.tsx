import { useParams } from "react-router-dom";

import { useUserById } from "../hooks";
import Spinner from "../components/Spinner";
import styles from "./EditCreateUserPage.module.css";
import UserForm from "../components/user/UserForm";

const EditCreateUserPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = Boolean(userId);
  const { user, loading, error } = useUserById(userId);


  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>{error}</div>;
  }
  
  return <UserForm isEditMode={isEditMode} user={user} />;
};

export default EditCreateUserPage;
