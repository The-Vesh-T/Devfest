export default function PhoneFrame({ children }) {
  return (
    <div className="phone">
      <div className="notch" aria-hidden="true" />
      {children}
    </div>
  );
}
