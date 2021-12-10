import {Note} from "./note.model";
import {TaskList} from "./task-list.model";

export interface NotesJson {
  notes: Note[];
  taskLists: TaskList[];
}
