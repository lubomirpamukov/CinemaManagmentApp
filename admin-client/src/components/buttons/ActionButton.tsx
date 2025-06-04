import React from "react";
import "./ActionButton.css";


export type ActionButtonProps = {
  label: string; 
  id: string; 
  onClick?: (id: string) => void; 
  type?: "add" | "edit" | "delete"; 
  buttonType?: "button" | "submit" | "reset"; 
  style?: React.CSSProperties; 
  className?: string; 
};

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  id,
  type = "add",
  buttonType = "button",
  style,
  className = "",
}) => {
  return (
    <button
      className={`action-button ${type} ${className}`} 
      type={buttonType}
      onClick={() => onClick?.(id)}
      style={style} 
    >
      {label}
    </button>
  );
};

export default ActionButton;

