import "./LoadingSpinner.css";

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="spinner" style={{ width: size, height: size }} />
  );
}
