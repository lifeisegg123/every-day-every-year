import { getDate, getMonth } from "date-fns";

export const getToday = () => {
  const now = new Date();
  const today = `${getMonth(now) + 1}-${getDate(now)}`.padStart(5, "0");
  return today;
};
