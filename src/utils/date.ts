import { getDate, getMonth } from "date-fns";

const padDate = (date: number) => date.toString().padStart(2, "0");

export const getToday = () => {
  const now = new Date();
  const today = `${padDate(getMonth(now) + 1)}-${padDate(getDate(now))}`;
  return today;
};
