import {Image, Note, NoteList, TaskList} from "@clipboardjesus/models";

/**
 * This class contains static methods to get a short display value of a draggable item.
 * These should be used to identify the items (for example in a dropdown).
 */
export class DisplayValue {
  /**
   * Gets the display value of the note.
   * @returns The first 20 characters of the note's content.
   */
  static fromNote(item: Note): string {
    return item.header ?? item.content?.trim().substring(0, 20) ?? '';
  }

  /**
   * Gets the display value of the task list.
   * @returns The first 20 characters of the task list's content.
   */
  static fromTaskList(item: TaskList): string {
    return item.header ?? item.items[0]?.value.trim().substring(0, 20) ?? '';
  }

  /**
   * Gets the display value of the note list.
   * @returns The first 20 characters of the note list's content.
   */
  static fromNoteList(item: NoteList): string {
    return item.header ??item.notes[0]?.content?.trim().substring(0, 20) ?? '';
  }

  /**
   * Gets the display value of the image.
   * @returns The first 20 characters of the image's link.
   *   When the image is an uploaded image then it returns an emoji instead.
   */
  static fromImage(item: Image): string {
    return item.source?.trim().substring(0, 20) ?? '📷';
  }
}
