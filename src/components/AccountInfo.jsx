import useState from 'react'
import pfp from "../assets/pfp.jpg"
import './AccountInfo.css'

export default function AccountInfo(props){

    

    return(
        <>
        <div className="accountInfo">
            <img src={pfp}/>
            <h3>{props.username}</h3>
        </div>
        </>
    )
}



