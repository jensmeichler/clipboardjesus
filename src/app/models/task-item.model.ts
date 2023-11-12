/**
 * Represents an item of a task list.
 */
export class TaskItem {
  /** Whether the item's checkbox is checked. */
  checked = false;
  /** Whether the item is a subtask. */
  isSubTask = false;

  /**
   * Default constructor for task items.
   * @param value The text value of the item.
   */
  constructor(
    public value: string,
  ) {}
}
