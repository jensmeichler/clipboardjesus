import {Note} from "./note.model";
import {TaskList} from "./task-list.model";
import {Image} from "./image.model";
import {NoteList} from "./note-list.model";

export interface Tab {
  index: number,
  label?: string;
  color: string;
  url?: string;
  notes?: Note[];
  noteLists?: NoteList[];
  taskLists?: TaskList[];
  images?: Image[];
}
