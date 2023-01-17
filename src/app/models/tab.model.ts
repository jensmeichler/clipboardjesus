import {Note} from "./note.model";
import {TaskList} from "./task-list.model";
import {Image} from "./image.model";
import {NoteList} from "./note-list.model";

/**
 * Represents a tab.
 */
export interface Tab {
  /** The index of the tab (starting with 0) */
  index: number,
  /** The label of the tab. */
  label?: string;
  /** The color of the tab. */
  color: string;
  /** The background image url of the tab. */
  url?: string;
  /** The notes of the tab. */
  notes?: Note[];
  /** The note lists of the tab. */
  noteLists?: NoteList[];
  /** The task lists of the tab. */
  taskLists?: TaskList[];
  /** The images of the tab. */
  images?: Image[];
}
