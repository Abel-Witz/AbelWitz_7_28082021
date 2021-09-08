(async () => {


  /*************************************/
 /* Get email from command line args */
/*************************************/
const email = process.argv[2];
if (!email) {
    console.error("Please provide the email of the future admin");
    return;
}
    
  /***************************/
 /* Get database connection */
/***************************/
let databaseConnection;
try {
    databaseConnection = await require("./util/database-connection")();
} catch(error) {
    console.error(error)
    return;
}


  /*************/
 /* Set admin */
/*************/
databaseConnection.query(
    `Update User set is_admin=TRUE WHERE email=?`, [email],
    function (err, result) {
        if (err) {
            console.error(err);
            return;
        };
        
        databaseConnection.end(function(err) {
            if (err) {
                console.error(err);
                return;
            };

            console.log("User set to admin");
        });
    }
);
})();