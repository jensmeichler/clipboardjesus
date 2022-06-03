import {Note, TaskList, Image, NoteList} from "@clipboardjesus/models";

export interface Tab {
  index: number,
  label?: string;
  color: string;
  notes?: Note[];
  noteLists?: NoteList[];
  taskLists?: TaskList[];
  images?: Image[];
}
