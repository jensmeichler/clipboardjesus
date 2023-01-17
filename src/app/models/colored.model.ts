/**
 * The interface for draggable items that can have a background color.
 */
export interface Colored {
  /** The color of the text. */
  foregroundColor: string;
  /** The color of the background. */
  backgroundColor: string;
  /** The color of the background gradient if specified. */
  backgroundColorGradient?: string;
}
