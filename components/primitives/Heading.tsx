type HeadingProps = {
  title: string;
};

export function Heading({ title }: HeadingProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-inherit uppercase flex items-center gap-2.5">
        <span
          className="inline-block w-1.5 h-6 sm:h-7 bg-current opacity-70 rounded-full"
          aria-hidden="true"
        />
        <span>{title}</span>
      </h2>
    </div>
  );
}
