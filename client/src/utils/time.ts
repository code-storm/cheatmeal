// Helpers for working with the "HH:mm" scheduledTime strings the backend
// returns, and for grouping tasks into friendly time-of-day sections.

export type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night";

/** Parse "HH:mm" into total minutes since midnight. */
export function parseTimeToMinutes(time: string): number {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number.parseInt(hoursStr, 10) || 0;
  const minutes = Number.parseInt(minutesStr, 10) || 0;
  return hours * 60 + minutes;
}

/** "HH:mm" -> "6:00 AM" */
export function formatTime(time: string): string {
  const totalMinutes = parseTimeToMinutes(time);
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function timeOfDayFor(time: string): TimeOfDay {
  const minutes = parseTimeToMinutes(time);
  if (minutes < 11 * 60) return "Morning";
  if (minutes < 16 * 60) return "Afternoon";
  if (minutes < 20 * 60) return "Evening";
  return "Night";
}

export const TIME_OF_DAY_ORDER: TimeOfDay[] = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
];

/** "YYYY-MM-DD" -> "Tuesday, 15 October" */
export function formatFriendlyDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "YYYY-MM-DD" -> "15 Oct" */
export function formatShortDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

/** "YYYY-MM-DD" + delta days -> "YYYY-MM-DD" (local-date arithmetic). */
export function shiftDateIso(isoDate: string, deltaDays: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + deltaDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
