import {Reminder} from "@clipboardjesus/models";

interface ReminderErrors {
  warn: boolean,
  error: boolean,
  minutesUntilWarning: number,
  minutesUntilError: number,
}

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
