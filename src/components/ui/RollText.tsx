/** Two stacked copies of a label that roll vertically on hover/focus of the parent link or button. */
export default function RollText({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
