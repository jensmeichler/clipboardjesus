import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {htmlRegex} from "@clipboardjesus/const";
import {Colored, DraggableNote, Note} from "@clipboardjesus/models";
import {ClipboardService, DataService, HashyService} from "@clipboardjesus/services";
import {DraggableComponent, EditNoteDialogComponent} from "@clipboardjesus/components";
import {getMarkdownRenderer} from "@clipboardjesus/functions";
import {marked} from 'marked';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'cb-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteComponent extends DraggableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() note!: Note;
  @Input() changed?: EventEmitter<void>;

  @ViewChild('code')
  codeElement?: ElementRef;

  parsedMarkdown?: SafeHtml;

  overdue = false;
  nearlyOverdue = false;

  timers: NodeJS.Timeout[] = [];

  constructor(
    private readonly clipboard: ClipboardService,
    private readonly hashy: HashyService,
    private readonly dialog: MatDialog,
    public readonly dataService: DataService,
    private readonly cdr: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer,
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.note) {
      throw new Error('NoteComponent.note is necessary!');
    }

    this.updateMarkdown();
    if (this.note.code !== false
      && this.note.content
      && htmlRegex.test(this.note.content)) {
      this.note.code = true;
    }

    this.cdr.markForCheck();
  }

  /**
   * Marks the note when a reminder is overdue.
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    const note = changes['note']?.currentValue as Note | undefined;
    const reminder = note?.reminder;
    if (!reminder) {
      return;
    }

    this.disposeTimers();

    const now = new Date();
    let then: Date;

    if (reminder.date && reminder.time) {
      then = new Date(`${reminder.date}T${reminder.time}:00`);
    } else if (reminder.date) {
      then = new Date(`${reminder.date}T${now.getHours()}:${now.getMinutes()}:00`);
    } else if (reminder.time) {
      then = new Date(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}T${reminder.time}:00`);
    } else {
      this.note.reminder = undefined;
      return;
    }

    const minutesUntilOverdue = (then!.getTime() - now.getTime()) / 1000 / 60;
    const minutesUntilReminder = minutesUntilOverdue - (reminder.before ?? 0);

    this.nearlyOverdue = minutesUntilReminder <= 0;
    this.overdue = minutesUntilOverdue <= 0;

    const setOverdue = () => {
      this.dataService.setError(this.note.id);
      this.overdue = true;
      this.cdr.markForCheck();
    }
    if (this.overdue) {
      setOverdue();
    } else {
      this.timers.push(
        setTimeout(
          () => setOverdue(),
          minutesUntilOverdue * 60 * 1000
        )
      );
    }

    const setNearlyOverdue = () => {
      this.dataService.setWarning(this.note.id);
      this.nearlyOverdue = true;
      this.cdr.markForCheck();
    }
    if (this.nearlyOverdue) {
      setNearlyOverdue();
    } else {
      this.timers.push(
        setTimeout(
          () => setNearlyOverdue(),
          minutesUntilReminder * 60 * 1000
        )
      );
    }
  }

  private disposeTimers(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  private updateMarkdown(): void {
    const renderer = getMarkdownRenderer();
    this.parsedMarkdown = this.sanitizer.bypassSecurityTrustHtml(
      marked.parse(this.note.content ?? '', {renderer})
    );

    this.cdr.markForCheck();
  }

  select(): void {
    this.note.selected = !this.note.selected;
    this.changed?.emit();
  }

  onMouseUp(event: MouseEvent): void {
    if (this.mouseDown && this.canInteract) {
      switch (event.button) {
        case 0:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            this.select();
          } else {
            this.copy();
          }
          break;
        case 1:
          this.delete(event);
          break;
        case 2:
          break;
      }

      event.stopPropagation();
    }

    this.mouseDown = false;
  }

  copy(): void {
    if (this.note.content && !this.rippleDisabled && this.canInteract) {
      this.clipboard.set(this.note.content).then(() =>
        this.hashy.show('COPIED_TO_CLIPBOARD', 600)
      );
    }
  }

  edit(event: MouseEvent, stopPropagation?: boolean): void {
    if (this.canInteract) {
      const note = {...this.note};
      this.dialog.open(EditNoteDialogComponent, {
        width: 'var(--width-edit-dialog)',
        data: note,
        disableClose: true,
      }).afterClosed().subscribe((editedNote: Note) => {
        if (editedNote) {
          this.dataService.deleteNote(this.note, true);
          this.dataService.addNote(editedNote);
          this.cdr.markForCheck();
        }
      });
      this.rippleDisabled = false;
      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }

  delete(event: MouseEvent): void {
    if (this.canInteract) {
      this.dataService.deleteNote(this.note);
      event.stopPropagation();
    }
  }

  toggleCodeView(event: MouseEvent, stopPropagation?: boolean): void {
    if (this.canInteract) {
      this.note.code = !this.note.code;
      this.rippleDisabled = false;
      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }

  moveToTab(index: number): void {
    this.dataService.moveNoteToTab(index, this.note);
    this.cdr.markForCheck();
  }

  copyColorFrom(item: Colored): void {
    this.note.backgroundColor = item.backgroundColor;
    this.note.backgroundColorGradient = item.backgroundColorGradient;
    this.note.foregroundColor = item.foregroundColor;
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  connectTo(item: DraggableNote | undefined): void {
    if (item === undefined) {
      this.dataService.disconnectAll(this.note);
    } else {
      this.dataService.connect(this.note, item);
    }
    this.changed?.emit();
    this.dataService.cacheData();
  }

  ngOnDestroy(): void {
    this.disposeTimers();
  }
}
