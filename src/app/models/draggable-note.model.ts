export interface DraggableNote {
  id: string;
  posX: number;
  posY: number;
  posZ?: number;
  selected?: boolean;
  connectedTo?: string;
}
