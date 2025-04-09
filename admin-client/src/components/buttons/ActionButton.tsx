import React from "react";
import "./ActionButton.css";

/**
 * A reusable button component for performing actions such as adding, editing, or deleting items.
 *
 * @param {string} label - The text to display on the button.
 * @param {string} id - A unique identifier for the button, useful for identifying the action.
 * @param {(id: string) => void} [onClick] - A function to execute when the button is clicked. The `id` is passed as an argument.
 * @param {"add" | "edit" | "delete"} [type="add"] - The type of action the button represents. Used for styling purposes.
 * @param {"button" | "submit" | "reset"} [buttonType="button"] - The HTML `type` attribute for the button. Determines its behavior in forms.
 * @param {React.CSSProperties} [style] - Inline styles to apply to the button.
 *
 * @example
 * <ActionButton
 *   label="Edit"
 *   id="edit-button"
 *   type="edit"
 *   style={{ backgroundColor: "blue", color: "white" }}
 *   onClick={(id) => console.log(`Editing: ${id}`)}
 * />
 */
export type ActionButtonProps = {
  label: string; // Text to display on the button
  id: string; // Unique identifier for the button
  onClick?: (id: string) => void; // Optional function to execute on button click
  type?: "add" | "edit" | "delete"; // Type of button for styling
  buttonType?: "button" | "submit" | "reset"; // Type of button element
  style?: React.CSSProperties; // Inline styles for the button
};

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  id,
  type = "add",
  buttonType = "button",
  style, // Accept the style prop
}) => {
  return (
    <button
      className={`action-button ${type}`}
      type={buttonType}
      onClick={() => onClick?.(id)}
      style={style} // Apply the inline styles
    >
      {label}
    </button>
  );
};

export default ActionButton;
  
