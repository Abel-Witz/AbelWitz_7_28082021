(async () => {

    
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


  /***************************/
 /* Initialize the database */
/***************************/
databaseConnection.query(
    `CREATE TABLE IF NOT EXISTS User (
        id INT UNSIGNED AUTO_INCREMENT,
        first_name VARCHAR(20) NOT NULL,
        last_name VARCHAR(20) NOT NULL,
        email VARCHAR(65) UNIQUE NOT NULL,
        password_hash BINARY(60) NOT NULL,
        profile_picture_url VARCHAR(100),
        PRIMARY KEY (id)
    )
    ENGINE=INNODB;
    
    CREATE TABLE IF NOT EXISTS Posts (
        id INT UNSIGNED AUTO_INCREMENT,
        title VARCHAR(300) NOT NULL,
        text TEXT,
        image_url VARCHAR(100),
        authorId INT UNSIGNED,
        PRIMARY KEY (id),
        CONSTRAINT fk_authorId
            FOREIGN KEY (authorId)
            REFERENCES User(id)
            ON DELETE SET NULL
    )
    ENGINE=INNODB;`,
    function (err, result) {
        if (err) {
            console.error(err);
            return;
        };
        
        databaseConnection.end(function(err) {
            if (err) {
                console.log(err);
                return;
            };

            console.log("Database successfully initialized");
        });
    }
);
})();