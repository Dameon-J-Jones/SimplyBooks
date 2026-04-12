import { useNavigate } from "react-router-dom";
import pfp from "../assets/pfp.jpg";
import "./AccountInfo.css";

export default function AccountInfo(props) {
  const navigate = useNavigate();

  return (
    <div className="accountInfo">
      <img
        src={pfp}
        alt="profile"
        onClick={() => navigate("/login")}
        style={{ cursor: "pointer" }}
        data-tooltip-id="tooltipA"
        data-tooltip-content="Go to home page"
      />
      <h3>{props.username}</h3>
    </div>
  );
}