import {Note} from "./note.model";
import {TaskList} from "./task-list.model";
import {Image} from "./image.model";

export interface NotesJson {
  notes: Note[];
  taskLists: TaskList[];
  images: Image[];
}
