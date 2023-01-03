import "./Loading.scss";
import "./styles.scss";

export default function Loading() {
  return (
    <div>
      <h1 className="title-wait" id="loading-dots">
        <span className="dot1">.</span>
        <span className="dot2">.</span>
        <span className="dot3">.</span>
      </h1>
    </div>
  );
};