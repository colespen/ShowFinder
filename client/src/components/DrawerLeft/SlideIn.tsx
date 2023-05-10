import "./DrawerLeft.scss";

const SlideIn = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="drawer-slide-in">
        {children}
    </div>
  );
};

export default SlideIn;
