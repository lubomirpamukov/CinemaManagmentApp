import React from "react";
import { FallbackProps } from "react-error-boundary";
import styles from "./ErrorFallback.module.css";

const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary
}) => {
  return (
    <div role="alert" className={styles.errorContainer}>
      <h2 className={styles.errorTitle}>Something went wrong</h2>
      <p className={styles.errorMessage}>{error.message}</p>
      <pre className={styles.errorStack}>{error.stack}</pre>
    </div>
  );
};

export default ErrorFallback;
