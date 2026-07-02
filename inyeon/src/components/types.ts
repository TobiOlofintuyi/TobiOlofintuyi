/* The render-values bag produced by logic.renderVals(). It mirrors a
 * dynamically-typed prototype, so the view layer intentionally treats it as an
 * open record and reads fields by the same names the design template used. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Vals = Record<string, any>
