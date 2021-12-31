import {Note} from "./note.model";
import {TaskList} from "./task-list.model";
import {Image} from "./image.model";

export interface Tab {
  index: number,
  label?: string;
  color: string;
  notes: Note[];
  taskLists: TaskList[];
  images: Image[];
}
