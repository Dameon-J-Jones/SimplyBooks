import LongLogo from "../components/longLogo";
import "./CreateAccount.css";

export default function CreateAccount(){

    
    
    
    
    return(<>
    <div className="logo"><LongLogo/></div>
    
    <div className="create-account-container">
        <div className="buttons-container">
            <select>
                <option value="Accountant">Accountant</option>
                <option value="Manager">Accountant</option>
                <option value="Administrator">Accountant</option>
            </select>
        </div>
    </div>
    
    </>)
}