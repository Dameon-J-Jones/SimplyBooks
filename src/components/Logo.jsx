import logo from "../assets/logo.png";

const Logo = ({ className }) => {
  return (
    <div className={className}>
      <img src={logo} alt="SimplyBooks logo" />
    </div>
  );
};

export default Logo;