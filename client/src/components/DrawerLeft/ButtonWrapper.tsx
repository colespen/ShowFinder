import { ButtonWrapperProps } from "../../datatypes/props";

const ButtonWrapper = ({
  listButton,
  startAnimation,
  setStartAnimation,
}: ButtonWrapperProps) => {
  const openTransitionStyles = startAnimation
    ? { opacity: "0", paddingRight: "5px", paddingLeft: "7px" }
    : {};
  const closeTransitionStyles = !startAnimation ? { opacity: "0" } : {};
  const btnWrapperTransitionStyles = !startAnimation ? { left: "0px" } : {};
  const btnTransitionStyles = startAnimation ? { padding: "0" } : {};

  return (
    <div className="button-wrapper" style={btnWrapperTransitionStyles}>
      <button
        style={btnTransitionStyles}
        onClick={() => setStartAnimation(!startAnimation)}
      >
        {listButton ? (
          <img
            style={closeTransitionStyles}
            className="close-drawer-icon"
            src="./close-arrow.png"
            alt="events list close"
          ></img>
        ) : (
          <img
            style={openTransitionStyles}
            className="drawer-button-icon"
            src="./list-icon.png"
            alt="events list open"
          ></img>
        )}
      </button>
    </div>
  );
};

export default ButtonWrapper;
