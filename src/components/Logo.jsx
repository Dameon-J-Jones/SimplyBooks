import logo from "../assets/logo.png";

const Logo = ({ className }) => {
  return (
    <div
      className={className}
      style={{ margin: 0, "margin-bottom": "-20px" }}
    >
      <img src={logo} alt="SimplyBooks logo" />
    </div>
  );
};

export default Logo;