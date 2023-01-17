import {DraggableNoteBase} from "./draggable-note-base.model";

/**
 * Represents an image or another link.
 */
export class Image extends DraggableNoteBase {
  /**
   * Default constructor for images.
   * @param id Will be generated automatically when {@link null} is provided.
   * @param posX How far from the left border of the tab the item is positioned.
   * @param posY How far from the top border of the tab the item is positioned.
   * @param source The source link of the image. Can be {@link null} when stored locally.
   * @param header The header of the image.
   */
  constructor(
    id: string | null,
    posX: number,
    posY: number,
    /** The source link of the image. Can be {@link null} when stored locally. */
    public source: string | null,
    /** The header of the image. */
    public header?: string
  ) {
    super(id, posX, posY);
  }
}
