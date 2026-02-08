import logo from "../assets/devfest-logo.svg";

export default function TopBar({ children, withDay }) {
  return (
    <header className={`topbar ${withDay ? "withDay" : ""}`}>
      <div className="appTitle brandTitle">
        <img src={logo} alt="" className="brandLogo" />
      </div>
      {children}
    </header>
  );
}
