import pool from "../db.js";
// edit user
export const editUser = async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const groupMap = {
      Accountant: 0,
      Manager: 1,
      Administrator: 2
    };

    const {
      firstName,
      lastName,
      username,
      email,
      address,
      city,
      state,
      zip,
      phone,
      dob,
      securityAnswer,
      userType
    } = req.body;

    const address_line1 = address;
    const address_line2 = `${city}, ${state}, ${zip}`;


    const query = `
        UPDATE "User"
        SET
        "Email" = $1,
        "Phone_Number" = $2,
        "address_line1" = $3,
        "address_line2" = $4,
        "date_of_birth" = $5,
        "GroupID" = $6,
        "status" = $7
        WHERE "UName" = $8
        RETURNING *;
    `;
   

    const values = [
        email,
        phone,
        address_line1,
        address_line2,
        dob,
        groupMap[userType],
        0,
        username,
        ];

    const result = await pool.query(query, values);
    res.status(200).json( {message: "User Update Succesful!"});
  } catch (err) {
    console.error("EDIT USER DB ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};