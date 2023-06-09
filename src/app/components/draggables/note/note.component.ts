import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {marked} from 'marked';
import {htmlRegex, getMarkdownRenderer} from "@clipboardjesus/helpers";
import {Colored, DraggableNote, Note} from "@clipboardjesus/models";
import {ClipboardService, DataService, HashyService} from "@clipboardjesus/services";
import {DraggableComponent, EditNoteDialogComponent} from "@clipboardjesus/components";
import {getReminderErrors, DisplayValue} from "@clipboardjesus/helpers";

@Component({
  selector: 'cb-note[note]',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteComponent extends DraggableComponent implements OnInit, OnChanges, OnDestroy {
  /** The note itself. */
  @Input() note!: Note;
  /** The event that fires when this component should be rendered again. */
  @Input() changed?: EventEmitter<void>;

  /** The parsed markdown content. */
  parsedMarkdown?: SafeHtml;

  /** Whether the reminder is overdue. */
  overdue = false;
  /** Whether the reminder is nearly overdue. */
  nearlyOverdue = false;

  /** The timeout IDs for the reminder timers. */
  timers: NodeJS.Timeout[] = [];

  /** Static methods to create the display value to use in the markup. */
  DisplayValue = DisplayValue;

  /**
   * Creates a new note.
   */
  constructor(
    /** Reference to the clipboard service. */
    private readonly clipboard: ClipboardService,
    /** Reference to the hashy service. */
    private readonly hashy: HashyService,
    /** Reference to the material dialog. */
    private readonly dialog: MatDialog,
    /** Reference to the data service. */
    public readonly dataService: DataService,
    /** Reference to the change detector. */
    private readonly cdr: ChangeDetectorRef,
    /** Reference to the dom sanitizer. */
    private readonly sanitizer: DomSanitizer,
  ) {
    super();
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
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
   */
  ngOnChanges(changes: SimpleChanges): void {
    const note = changes['note']?.currentValue as Note | undefined;
    const reminder = note?.reminder;
    if (!reminder) {
      return;
    }

    this.disposeTimers();

    const errorObj = getReminderErrors(reminder);

    if (!errorObj) {
      this.note.reminder = undefined;
      return;
    }

    this.nearlyOverdue = errorObj.warn;
    this.overdue = errorObj.error;

    const maxTimeOutValue = 2147483648;
    const errorTimeoutValue = errorObj.minutesUntilError * 60 * 1000;
    const warningTimeoutValue = errorObj.minutesUntilWarning * 60 * 1000;

    const setOverdue = () => {
      this.dataService.setError(this.note.id);
      this.overdue = true;
      this.cdr.markForCheck();
    }
    if (this.overdue) {
      setOverdue();
    } else if (maxTimeOutValue > errorTimeoutValue) {
      this.timers.push(
        setTimeout(
          () => setOverdue(),
          errorTimeoutValue
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
    } else if (maxTimeOutValue > warningTimeoutValue) {
      this.timers.push(
        setTimeout(
          () => setNearlyOverdue(),
          warningTimeoutValue
        )
      );
    }
  }

  /**
   * Disposes the timers.
   * @private
   */
  private disposeTimers(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  /**
   * Updates and sanitizes the markdown from the note's content.
   * @private
   */
  private updateMarkdown(): void {
    const renderer = getMarkdownRenderer();
    this.parsedMarkdown = this.sanitizer.bypassSecurityTrustHtml(
      marked.parse(this.note.content ?? '', {renderer})
    );

    this.cdr.markForCheck();
  }

  /**
   * Selects or deselects the note.
   */
  select(): void {
    this.note.selected = !this.note.selected;
    this.changed?.emit();
  }

  /**
   * Handles the click onto the note.
   * @param event
   */
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

  /**
   * Copies the note's content to the clipboard.
   */
  copy(): void {
    if (this.note.content && !this.rippleDisabled && this.canInteract) {
      this.clipboard.set(this.note.content).then(() =>
        this.hashy.show('COPIED_TO_CLIPBOARD', 600)
      );
    }
  }

  /**
   * Opens the edit dialog.
   * @param event
   * @param stopPropagation
   */
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

  /**
   * Deletes the note.
   */
  delete(event: MouseEvent): void {
    if (this.canInteract) {
      this.dataService.deleteNote(this.note);
      event.stopPropagation();
    }
  }

  /**
   * Activates or deactivates code highlighting of the note content.
   * @param event
   * @param stopPropagation
   */
  toggleCodeView(event: MouseEvent, stopPropagation?: boolean): void {
    if (this.canInteract) {
      this.note.code = !this.note.code;
      this.rippleDisabled = false;
      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }

  /**
   * Moves the note to the given tab.
   */
  moveToTab(index: number): void {
    this.dataService.moveNoteToTab(index, this.note);
    this.cdr.markForCheck();
  }

  /**
   * Copies the color from the given item.
   */
  copyColorFrom(item: Colored): void {
    this.note.backgroundColor = item.backgroundColor;
    this.note.backgroundColorGradient = item.backgroundColorGradient;
    this.note.foregroundColor = item.foregroundColor;
    this.cdr.markForCheck();
    this.dataService.cacheData();
  }

  /**
   * Connects the component to other components.
   * Used to draw mind maps for example.
   */
  connectTo(item: DraggableNote | undefined): void {
    if (item === undefined) {
      this.dataService.disconnectAll(this.note);
    } else {
      this.dataService.connect(this.note, item);
    }
    this.changed?.emit();
    this.dataService.cacheData();
  }

  /**
   * Disposes the timers disposing the component.
   */
  ngOnDestroy(): void {
    this.disposeTimers();
  }
}
