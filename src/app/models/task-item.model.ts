export class TaskItem {
  value: string;
  checked = false;
  isSubTask = false;

  constructor(value: string) {
    this.value = value;
  }
}
