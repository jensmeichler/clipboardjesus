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

@Component({
  selector: 'cb-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionComponent extends DisposableComponent implements OnInit {
  @Input() from!: DraggableNote;
  @Input() to!: DraggableNote;
  @Input() changed?: EventEmitter<void>;

  constructor(private readonly cdr: ChangeDetectorRef) {
    super();
  }

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
      console.warn('ConnectionComponent.changed must be set in order to update the view!');
    }
  }
}
