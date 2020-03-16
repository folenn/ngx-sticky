import {
  AfterContentInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { ResizeSensor } from 'css-element-queries';

@Directive({
  selector: '[appSticky]'
})
export class StickyDirective implements OnChanges, AfterContentInit, OnDestroy {
  @Input() offset = 15;
  @Input() pinningPossible = false;
  isPinned = false;
  isStick = false;

  resizeSubscription: ResizeSensor;
  elementResizeSubscription: ResizeSensor;
  element: HTMLElement;
  elementHeight: number;
  parentElement: HTMLElement;
  parentElementHeight: number;
  parentElementOffsetTop: number;
  currentScrollPosition: number;
  duration: number;

  constructor(private el: ElementRef) {
  }

  ngAfterContentInit() {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    const { pinningPossible: { currentValue: isPossible } = {currentValue: false} } = changes;

    if (!isPossible && this.isPinned) {
      this.unPinElement();
    }
  }

  ngOnDestroy() {
    this.resizeSubscription.detach();
    this.elementResizeSubscription.detach();
  }

  private init() {
    this.element = this.el.nativeElement;
    this.parentElement = this.element.parentElement;
    this.elementHeight = this.element.offsetHeight;
    this.parentElementHeight = this.parentElement.offsetHeight;
    this.parentElementOffsetTop = this.parentElement.offsetTop - this.offset;
    this.duration = this.parentElementHeight - this.elementHeight;

    this.resizeSubscription = new ResizeSensor(this.parentElement, () => this.updateScene());
    this.elementResizeSubscription = new ResizeSensor(this.element, () => this.updateScene());
  }

  private updateScene() {
    if (this.element && this.parentElement) {
      this.elementHeight = this.element.offsetHeight;
      this.parentElementHeight = this.parentElement.offsetHeight;
      this.parentElementOffsetTop = this.parentElement.offsetTop - this.offset;
      this.duration = this.parentElementHeight - this.elementHeight;
      this.onScroll();
    }
  }

  private pinElement() {
    if (!this.isPinned) {
      this.parentElement.style.height = this.parentElementHeight + 'px';
      this.element.style.position = 'fixed';
      this.element.style.top = this.offset + 'px';
      this.element.style.maxWidth = this.parentElement.offsetWidth + 'px';
      this.isPinned = true;
    }
  }

  private unPinElement() {
    if (this.isPinned) {
      this.parentElement.style.height = 'auto';
      this.element.style.alignSelf = 'flex-start';
      this.element.style.position = 'relative';
      this.element.style.maxWidth = '100%';
      this.element.style.top = 'auto';
      this.isPinned = false;
      this.isStick = false;
    }
  }

  @HostListener('window:scroll', ['$event'])
  private onScroll() {
    this.currentScrollPosition = window.scrollY;

    const pinCondition = (this.currentScrollPosition > this.parentElementOffsetTop)
      && !(this.currentScrollPosition > (this.parentElementOffsetTop + this.duration));
    const unPinCondition = (this.currentScrollPosition > (this.parentElementOffsetTop + this.duration))
      || (this.currentScrollPosition < this.parentElementOffsetTop);
    const stickCondition = this.currentScrollPosition > (this.parentElementOffsetTop + this.duration);

    if (pinCondition) {
      this.pinElement();
    } else if (unPinCondition) {
      this.unPinElement();
    }

    if (stickCondition) {
      this.stickToBottom();
    }
  }

  private stickToBottom() {
    if (!this.isStick) {
      this.element.style.position = 'relative';
      this.element.style.alignSelf = 'flex-end';
      this.isStick = true;
    }
  }
}
