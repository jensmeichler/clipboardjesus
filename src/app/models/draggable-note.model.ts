/**
 * The base interface for draggable items.
 */
export interface DraggableNote {
  /** The unique identifier of the item. */
  id: string;
  /** How far from the left border of the tab the item is positioned. */
  posX: number;
  /** How far from the top border of the tab the item is positioned. */
  posY: number;
  /** Ordering information. */
  posZ?: number;
  /** Whether the item is selected by the user. */
  selected?: boolean;
  /** The ids of the connected items. When item has no connections, the parameter is undefined. */
  connectedTo?: string[];
}
