/**
 * The reference carousel's arrow: a horizontal shaft with a diagonal-cut tip,
 * not a chevron. Path taken verbatim from the captured markup; only the fill
 * is ours, via `currentColor`, so it inherits whichever token the control sets.
 *
 * `size` is expressed as a fraction of the control it sits in rather than a
 * copied pixel value — the reference's controls are a different diameter to
 * ours, and matching its literal width would leave the glyph the wrong visual
 * weight inside our circle.
 */
export function CarouselArrow({
  direction,
  className = "",
}: {
  direction: "prev" | "next";
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      className={`${className} ${direction === "prev" ? "-scale-x-100" : ""}`}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M17.045 9.25h-2.329l-3.64-4.096Q11.73 4.579 12.378 4zM4.663 10.768v1.738h12.586l-6.965 6.191q.578.65 1.152 1.303l7.291-6.482c.264-.236.447-.484.54-.756.096-.279.083-.54.026-.77a1.6 1.6 0 0 0-.48-.815c-.263-.236-.614-.383-1.043-.408H4.663"
        clipRule="evenodd"
      />
    </svg>
  );
}
