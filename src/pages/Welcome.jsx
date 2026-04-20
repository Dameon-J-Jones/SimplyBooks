import { Link } from "react-router-dom";
import LongLogo from "../components/LongLogo";
import "./Welcome.css";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";




function Welcome(){
    

return (<>
<div className="page-container">
    <Tooltip id="tooltipA"/>
   <div className="welcome-header">
     <h1 className="welcome-h1">Welcome to </h1> <LongLogo/>
    </div> 
    
     <Link to="/login">
         <button className="login-button"
        data-tooltip-id="tooltipA"
        data-tooltip-content="Login To Your Account"
        data-tooltip-place="top"
         >Login</button>
     </Link>
</div>
</>);

}

export default Welcome;