import "./ErrorAlert.css";

export function ErrorAlert({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="error-alert">
      <span className="error-alert__icon">!</span>
      <span className="error-alert__message">{message}</span>
      {onDismiss && (
        <button className="error-alert__close" onClick={onDismiss}>
          &times;
        </button>
      )}
    </div>
  );
}
