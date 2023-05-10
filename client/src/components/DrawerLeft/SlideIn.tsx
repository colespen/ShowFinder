import "./DrawerLeft.scss";

interface SlideInProps {
  children: React.ReactNode;
  startAnimation: boolean;
}

const SlideIn = ({ children, startAnimation }: SlideInProps) => {
  const containerTransitionStyles = startAnimation
    ? { left: "0px", opacity: "75%" }
    : {};

  return (
    <div className="drawer-slide-in" style={containerTransitionStyles}>
      {children}
    </div>
  );
};

export default SlideIn;
