import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit
} from '@angular/core';
import {DraggableNote} from "@clipboardjesus/models";
import {takeUntil} from "rxjs";
import {DisposableComponent} from "@clipboardjesus/components";

/**
 * A component to connect notes
 * to be able to draw mind maps.
 */
@Component({
  selector: 'cb-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionComponent extends DisposableComponent implements OnInit {
  /** The item the connection is from. */
  @Input() from!: DraggableNote;
  /** The item the connection points to. */
  @Input() to!: DraggableNote;
  /** The event that fires when this component should be rendered again. */
  @Input() changed?: EventEmitter<void>;

  /**
   * Create a connection instance.
   */
  constructor(
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  /**
   * Validate the inputs and subscribe onto change events.
   */
  ngOnInit(): void {
    if (!this.from) {
      throw new Error('ConnectionComponent.from is necessary!');
    }
    if (!this.to) {
      throw new Error('ConnectionComponent.to is necessary!');
    }
    if (this.changed) {
      this.changed.pipe(takeUntil(this.destroy$)).subscribe(() =>
        this.cdr.markForCheck()
      );
    } else {
      console.warn(
        'ConnectionComponent.changed must be set in order to update the view correctly!'
      );
    }
  }
}
