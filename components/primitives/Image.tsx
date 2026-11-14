
type ImageProps = {
  url: string;
  alt: string;
};

export function Image({ url, alt }: ImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      style={{
        width: "100%",
        height: "180px",
        objectFit: "cover",
        borderRadius: "6px"
      }}
    />
  );
}
