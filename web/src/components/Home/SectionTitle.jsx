export default function SectionTitle({ title, classes }) {
  return (
    <h1
      className={`md:text-[40px] text-[30px] font-bold uppercase ${
        classes && classes
      }`}
    >
      {title}
    </h1>
  );
}
