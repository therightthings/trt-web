import { Directive, input } from '@angular/core';

export type GenericContext<TContext extends { $implicit: unknown }> = TContext;

/**
 * Attach a typed context signature to an `ng-template`.
 *
 * This directive does not render anything by itself. It only helps Angular
 * infer the types of `let-` variables declared on the template.
 */
@Directive({
  selector: 'ng-template[typedTemplate]',
})
export class TypedTemplateDirective<TContext extends { $implicit: unknown }> {
  readonly typedTemplate = input.required<TContext>();

  static ngTemplateContextGuard<TContext extends { $implicit: unknown }>(
    _directive: TypedTemplateDirective<TContext>,
    _: unknown,
  ): _ is GenericContext<TContext> {
    return true;
  }
}
