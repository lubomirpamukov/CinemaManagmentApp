import { useEffect } from "react";

type UserSearchComponentProps = {
  debouncedValue: string;
  setCurrentPage: (page: number) => void;
};

export const useSearch = ({
  debouncedValue,
  setCurrentPage,
}: UserSearchComponentProps) => {
  useEffect(() => {
    if (setCurrentPage) {
      setCurrentPage(1);
    }
  }, [debouncedValue, setCurrentPage]);
};
