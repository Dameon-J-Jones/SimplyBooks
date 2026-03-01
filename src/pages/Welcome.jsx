import { Link } from "react-router-dom";
import LongLogo from "../components/longLogo";
import "./Welcome.css";




function Welcome(){
    

return (<>
<div className="page-container">
   <div className="welcome-header">
     <h1 className="welcome-h1">Welcome to </h1> <LongLogo/>
    </div> 
    
     <Link to="/login">
         <button className="login-button">Login</button>
     </Link>
</div>
</>);

}

export default Welcome;