export default function TopBar({ title, children, withDay }) {
  return (
    <header className={`topbar ${withDay ? "withDay" : ""}`}>
      <div className="appTitle">{title}</div>
      {children}
    </header>
  );
}
