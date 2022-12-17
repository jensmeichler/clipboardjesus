import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {DraggableNote} from "@clipboardjesus/models";
import {Subject} from "rxjs";

@Component({
  selector: 'cb-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionComponent implements OnInit, OnDestroy {
  @Input() from!: DraggableNote;
  @Input() to!: DraggableNote;
  @Input() changed?: EventEmitter<void> | undefined;

  private destroy$ = new Subject<void>();

  constructor(private readonly cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if (!this.from) {
      throw new Error('ConnectionComponent.from is necessary!');
    }
    if (!this.to) {
      throw new Error('ConnectionComponent.to is necessary!');
    }
    if (this.changed) {
      this.changed.subscribe(() => this.cdr.markForCheck());
    } else {
      console.warn('ConnectionComponent.changed must be set in order to update the view!');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
