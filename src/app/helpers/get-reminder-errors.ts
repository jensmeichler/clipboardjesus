import {Reminder} from "@clipboardjesus/models";

/**
 * Result object which includes warnings and errors produced by the reminder.
 */
interface ReminderErrors {
  /** Whether the reminder is nearly overdue. */
  warn: boolean,
  /** Whether the reminder is overdue. */
  error: boolean,
  /** The remaining time until the reminder is nearly overdue. */
  minutesUntilWarning: number,
  /** The remaining time until the reminder is overdue. */
  minutesUntilError: number,
}

/**
 * Get information about the reminder errors and warnings.
 * @returns An error object if the reminder is overdue or nearly overdue.
 *  The result will be null when reminder is not overdue or nearly overdue.
 */
export function getReminderErrors(reminder: Reminder): ReminderErrors | null {
  const now = new Date();
  let then: Date;

  if (reminder.date && reminder.time) {
    then = new Date(`${reminder.date}T${reminder.time}:00`);
  } else if (reminder.date) {
    then = new Date(`${reminder.date}T${now.getHours()}:${now.getMinutes()}:00`);
  } else if (reminder.time) {
    then = new Date(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}T${reminder.time}:00`);
  } else {
    return null;
  }

  const minutesUntilError = (then!.getTime() - now.getTime()) / 1000 / 60;
  const minutesUntilWarning = minutesUntilError - (reminder.before ?? 0);

  return {
    error: minutesUntilError <= 0,
    warn: minutesUntilWarning <= 0,
    minutesUntilError,
    minutesUntilWarning,
  };
}
