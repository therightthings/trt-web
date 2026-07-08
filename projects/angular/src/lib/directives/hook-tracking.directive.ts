import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  inject,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';

enum NG_HOOK {
  DO_CHECK = 'DO_CHECK',
  INIT = 'INIT',
  CHANGES = 'CHANGES',
  AFTER_VIEW_INIT = 'AFTER_VIEW_INIT',
  AFTER_VIEW_CHECKED = 'AFTER_VIEW_CHECKED',
  AFTER_CONTENT_CHECKED = 'AFTER_CONTENT_CHECKED',
  AFTER_CONTENT_INIT = 'AFTER_CONTENT_INIT',
  DESTROY = 'DESTROY',
}

@Directive()
export class HooksTracking
  implements
    OnChanges,
    OnInit,
    AfterViewInit,
    AfterContentInit,
    AfterContentChecked,
    AfterViewChecked,
    DoCheck,
    OnDestroy
{
  protected readonly elementRef = inject(ElementRef);
  protected readonly trackingState = {
    firstRender: true,
    name: 'Hook Tracking',
    renderCount: 0,
  };
  private readonly colors: {
    hooks: {
      [key in NG_HOOK]: string;
    };
    name: string;
    rerender: string;
  } = {
    hooks: {
      DESTROY: ['color: red', 'text-shadow: 2px 2px black'].join('; '),
      INIT: ['color: yellow', 'text-shadow: 2px 2px black'].join('; '),
      AFTER_VIEW_INIT: ['color: blue', 'text-shadow: 2px 2px black'].join('; '),
      DO_CHECK: ['color: orange', 'text-shadow: 2px 2px black'].join('; '),
      CHANGES: ['color: pink', 'text-shadow: 2px 2px black'].join('; '),
      AFTER_VIEW_CHECKED: ['color: red', 'text-shadow: 2px 2px black'].join('; '),
      AFTER_CONTENT_CHECKED: ['color: red', 'text-shadow: 2px 2px black'].join('; '),
      AFTER_CONTENT_INIT: ['color: red', 'text-shadow: 2px 2px black'].join('; '),
    } as Record<NG_HOOK, string>,
    name: ['color: white'].join('; '),
    rerender: ['color: green'].join('; '),
  };

  private renderInfo() {
    return this.trackingState.firstRender
      ? 'first render'
      : `rerender x${this.trackingState.renderCount}`;
  }

  protected logHooksInfo(hookName: NG_HOOK) {
    console.log(
      `%c>>> ${hookName}: %c${this.trackingState.name} %c[${this.renderInfo()}]`,
      this.colors.hooks[hookName],
      this.colors.name,
      this.colors.rerender,
    );
  }

  constructor() {
    this.trackingState.renderCount++;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.trackingState.renderCount++;
    console.log(`${JSON.stringify(changes, null, 2)}`);
    this.logHooksInfo(NG_HOOK.CHANGES);
  }

  ngOnInit() {
    console.time(`>>> Render_Time: ${this.trackingState.name}`);
    this.logHooksInfo(NG_HOOK.INIT);
  }

  ngDoCheck() {
    this.trackingState.renderCount++;
    this.logHooksInfo(NG_HOOK.DO_CHECK);
  }

  ngAfterContentInit() {
    this.logHooksInfo(NG_HOOK.AFTER_CONTENT_INIT);
  }

  ngAfterViewInit() {
    const el = this.elementRef.nativeElement;
    const data = {
      coordinate: el?.getBoundingClientRect(),
      localName: el?.localName,
      nodeName: el?.nodeName,
      ownerDocument: {
        lastModified: el?.ownerDocument?.lastModified,
        readyState: el?.ownerDocument?.readyState,
        referrer: el?.ownerDocument?.referrer,
      },
    };
    console.timeEnd(`>>> Render_Time: ${this.trackingState.name}`);
    console.log(`>>> ${this.trackingState.name} info: ${JSON.stringify(data, null, 2)}`);
    this.logHooksInfo(NG_HOOK.AFTER_VIEW_INIT);
    this.trackingState.firstRender = false;
  }

  ngAfterContentChecked() {
    this.logHooksInfo(NG_HOOK.AFTER_CONTENT_CHECKED);
  }

  ngAfterViewChecked() {
    this.logHooksInfo(NG_HOOK.AFTER_VIEW_CHECKED);
  }

  ngOnDestroy() {
    this.logHooksInfo(NG_HOOK.DESTROY);
  }
}
