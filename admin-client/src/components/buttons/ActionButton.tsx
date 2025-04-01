// filepath: /home/lubaka/Desktop/CinemaApp/CinemaManagmentApp/admin-client/src/components/common/ActionButton.tsx
import React from "react";
import "./ActionButton.css";

export interface ActionButtonProps {
  label: string; // Text to display on the button
  id: string; // Unique identifier for the button
  onClick: (id:string) => void; // Function to execute on button click
  type?: "add" | "edit" | "delete"; // Type of button for styling
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick,id ,type = "add" }) => {
  return (
    <button className={`action-button ${type}`} onClick={() =>onClick(id)}>
      {label}
    </button>
  );
};

export default ActionButton;