/**
 * The interface for reminders which can be attached to draggable items.
 */
export interface Reminder {
  /** The overdue date od the reminder. */
  date?: string;
  /** The overdue time of the reminder. */
  time?: string;
  /** The time in minutes before the timer should remind the user. */
  before?: number;
}
