/**
 * What a Server Action called from a form returns: success, or one translated sentence to show
 * the user, with the form field it belongs to when there is one. Unexpected failures throw.
 */
export type ActionResult<Field extends string = never> =
  { ok: true } | { ok: false; error: string; field?: Field };
