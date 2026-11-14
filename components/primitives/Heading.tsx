
type HeadingProps = {
  title: string;
};

export function Heading(props: HeadingProps) {
  return <h2>{props.title}</h2>;
}

