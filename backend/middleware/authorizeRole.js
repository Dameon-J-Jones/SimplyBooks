
export default function authorizeRole(...allowedRoles){ //that parses json or array
    return (
                (req,res,next) =>{
                if(!allowedRoles.includes(req.user.role)){
                    return res.status(401).json({error: "Access Denied"});
                }
                next();
            }
        );
}