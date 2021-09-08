(async () => {


  /*************************************/
 /* Get email from command line args */
/*************************************/
const email = process.argv[2];
if (!email) {
    console.error("Please provide the email of the admin");
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


  /***********************/
 /* Remove admin rights */
/***********************/
databaseConnection.query(
    `Update USER set is_admin=FALSE WHERE email=?`, [email],
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

            console.log("Removed admin rights");
        });
    }
);
})();