import {Image, Note, NoteList, TaskList} from "@clipboardjesus/models";

export class DisplayValue {
  static fromNote(item: Note): string {
    return item.header ?? item.content?.trim().substring(0, 20) ?? '';
  }

  static fromTaskList(item: TaskList): string {
    return item.header ?? item.items[0]?.value.trim().substring(0, 20) ?? '';
  }

  static fromNoteList(item: NoteList): string {
    return item.header ??item.notes[0]?.content?.trim().substring(0, 20) ?? '';
  }

  static fromImage(item: Image): string {
    return item.source.trim().substring(0, 20);
  }
}
