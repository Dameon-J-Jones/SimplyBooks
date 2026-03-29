import longLogoImage from "../assets/LongLogo.png";

export default function LongLogo() {
  return (
    <div className="long-logo">
      <img
        src={longLogoImage}
        alt="SimplyBooks logo long"
        style={{ maxWidth: "500px", padding: "0px", "marginTop": "-20px" }}
      />
    </div>
  );
}