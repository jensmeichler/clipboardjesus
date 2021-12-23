import {Image} from "./image.model";
import {TaskList} from "./task-list.model";
import {Note} from "./note.model";

export interface Tab {
  label: string;
  notes: Note[];
  taskLists: TaskList[];
  images: Image[];
}
