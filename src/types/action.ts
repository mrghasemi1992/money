/**
 * What a Server Action called from a form returns: success (with `Data` when the action hands
 * something back, such as a new temporary password), or one translated sentence to show the
 * user, with the form field it belongs to when there is one. Unexpected failures throw.
 */
export type ActionResult<
  Field extends string = never,
  Data extends object = object,
> = ({ ok: true } & Data) | { ok: false; error: string; field?: Field };
