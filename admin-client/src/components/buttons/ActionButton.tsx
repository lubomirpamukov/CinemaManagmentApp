import React from "react";
import "./ActionButton.css";

/**
 * A reusable button component for performing actions such as adding, editing, or deleting items.
 *
 * @param {string} label - The text to display on the button.
 * @param {string} id - A unique identifier for the button, useful for identifying the action.
 * @param {(id: string) => void} onClick - A function to execute when the button is clicked. The `id` is passed as an argument.
 * @param {"add" | "edit" | "delete"} [type="add"] - The type of action the button represents. Used for styling purposes.
 * @param {"button" | "submit" | "reset"} [buttonType="button"] - The HTML `type` attribute for the button. Determines its behavior in forms.
 *
 * @example
 * // Basic usage
 * <ActionButton
 *   label="Add Item"
 *   id="add-item-button"
 *   onClick={(id) => console.log(`Button clicked: ${id}`)}
 *   type="add"
 * />
 *
 * @example
 * // Prevent form submission
 * <ActionButton
 *   label="Add Snack"
 *   id="add-snack-button"
 *   onClick={(id) => console.log(`Adding snack: ${id}`)}
 *   type="add"
 *   buttonType="button"
 * />
 *
 * @example
 * // Submit a form
 * <ActionButton
 *   label="Submit Form"
 *   id="submit-form-button"
 *   onClick={(id) => console.log(`Submitting form: ${id}`)}
 *   type="edit"
 *   buttonType="submit"
 * />
 */
export type ActionButtonProps = {
  label: string; // Text to display on the button
  id: string; // Unique identifier for the button
  onClick?: (id: string) => void; // Function to execute on button click
  type?: "add" | "edit" | "delete"; // Type of button for styling
  buttonType?: "button" | "submit" | "reset"; // Type of button element
};

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  id,
  type = "add",
  buttonType = "button", // Default to "button" to prevent form submission
}) => {
  return (
    <button
      className={`action-button ${type}`}
      type={buttonType} // Pass the button type
      onClick={() => onClick?.(id)}
    >
      {label}
    </button>
  );
};

export default ActionButton;
