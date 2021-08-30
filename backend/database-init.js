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
    
    CREATE TABLE IF NOT EXISTS Post (
        id INT UNSIGNED AUTO_INCREMENT,
        title VARCHAR(300) NOT NULL,
        text TEXT,
        image_url VARCHAR(100),
        authorId INT UNSIGNED,
        calculated_likes INT UNSIGNED NOT NULL DEFAULT 0,
        calculated_dislikes INT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        CONSTRAINT fk_authorId
            FOREIGN KEY (authorId)
            REFERENCES User(id)
            ON DELETE SET NULL
    )
    ENGINE=INNODB;

    CREATE TABLE IF NOT EXISTS \`Like\` (
        id INT UNSIGNED AUTO_INCREMENT,
        post_id INT UNSIGNED NOT NULL,
        author_id INT UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        UNIQUE(author_id, post_id),
        CONSTRAINT fk_like_post_id
            FOREIGN KEY (post_id)
            REFERENCES Post(id)
            ON DELETE CASCADE
    )
    ENGINE=INNODB;
    
    CREATE TABLE IF NOT EXISTS Dislike (
        id INT UNSIGNED AUTO_INCREMENT,
        post_id INT UNSIGNED NOT NULL,
        author_id INT UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        UNIQUE(author_id, post_id),
        CONSTRAINT fk_dislike_post_id
            FOREIGN KEY (post_id)
            REFERENCES Post(id)
            ON DELETE CASCADE
    )
    ENGINE=INNODB;

    DROP TRIGGER IF EXISTS before_delete_user;
    CREATE TRIGGER before_delete_user BEFORE DELETE
    ON User FOR EACH ROW
    BEGIN
        DECLARE v_like_dislike_id INT DEFAULT NULL;
        DECLARE v_post_id INT DEFAULT NULL;
        DECLARE v_loop_end BOOLEAN DEFAULT FALSE;

        DECLARE cur_likes CURSOR
            FOR SELECT id, post_id FROM \`Like\` WHERE author_id=OLD.id;

        DECLARE cur_dislikes CURSOR
            FOR SELECT id, post_id FROM Dislike WHERE author_id=OLD.id;

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_loop_end = TRUE;


        OPEN cur_likes;
    
        loop_cur_likes: LOOP
            FETCH cur_likes INTO v_like_dislike_id, v_post_id;
        
            IF v_loop_end = TRUE THEN
                LEAVE loop_cur_likes;
            END IF;

            DELETE FROM \`Like\` WHERE id=v_like_dislike_id;
            UPDATE Post SET calculated_likes=calculated_likes-1 WHERE id=v_post_id;
        END LOOP;


        SET v_like_dislike_id = NULL;
        SET v_post_id = NULL;
        SET v_loop_end = FALSE;

        OPEN cur_dislikes;
    
        loop_cur_dislikes: LOOP
            FETCH cur_dislikes INTO v_like_dislike_id, v_post_id;
        
            IF v_loop_end = TRUE THEN
                LEAVE loop_cur_dislikes;
            END IF;

            DELETE FROM Dislike WHERE id=v_like_dislike_id;
            UPDATE Post SET calculated_dislikes=calculated_dislikes-1 WHERE id=v_post_id;
        END LOOP;
    END;
    
    DROP PROCEDURE IF EXISTS like_post;
    CREATE PROCEDURE like_post(IN p_post_id INT UNSIGNED, IN p_author_id INT UNSIGNED)  
    BEGIN
        DECLARE v_dislike_id INT DEFAULT NULL;

        INSERT INTO \`Like\` VALUES (NULL, p_post_id, p_author_id);

        SELECT id INTO v_dislike_id FROM Dislike WHERE post_id=p_post_id AND author_id=p_author_id;

        IF (v_dislike_id IS NULL) THEN
            UPDATE Post SET calculated_likes=calculated_likes+1 WHERE id=p_post_id;
        ELSE
            DELETE FROM Dislike WHERE id=v_dislike_id;
            UPDATE Post SET calculated_likes=calculated_likes+1, calculated_dislikes=calculated_dislikes-1 WHERE id=p_post_id;
        END IF;
    END;

    DROP PROCEDURE IF EXISTS neutral_post;
    CREATE PROCEDURE neutral_post(IN p_post_id INT UNSIGNED, IN p_author_id INT UNSIGNED)  
    BEGIN
        DECLARE v_like_dislike_id INT DEFAULT NULL;

        SELECT id INTO v_like_dislike_id FROM \`Like\` WHERE post_id=p_post_id AND author_id=p_author_id;

        IF (v_like_dislike_id IS NOT NULL) THEN
            DELETE FROM \`Like\` WHERE id=v_like_dislike_id;
            UPDATE Post SET calculated_likes=calculated_likes-1 WHERE id=p_post_id;
        END IF;

        SET v_like_dislike_id = NULL;
        SELECT id INTO v_like_dislike_id FROM Dislike WHERE post_id=p_post_id AND author_id=p_author_id;

        IF (v_like_dislike_id IS NOT NULL) THEN
            DELETE FROM Dislike WHERE id=v_like_dislike_id;
            UPDATE Post SET calculated_dislikes=calculated_dislikes-1 WHERE id=p_post_id;
        END IF;
    END;

    DROP PROCEDURE IF EXISTS dislike_post;
    CREATE PROCEDURE dislike_post(IN p_post_id INT UNSIGNED, IN p_author_id INT UNSIGNED)  
    BEGIN
        DECLARE v_like_id INT DEFAULT NULL;

        INSERT INTO Dislike VALUES (NULL, p_post_id, p_author_id);

        SELECT id INTO v_like_id FROM \`Like\` WHERE post_id=p_post_id AND author_id=p_author_id;

        IF (v_like_id IS NULL) THEN
            UPDATE Post SET calculated_dislikes=calculated_dislikes+1 WHERE id=p_post_id;
        ELSE
            DELETE FROM \`Like\` WHERE id=v_like_id;
            UPDATE Post SET calculated_dislikes=calculated_dislikes+1, calculated_likes=calculated_likes-1 WHERE id=p_post_id;
        END IF;
    END;`,
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

            console.log("Database successfully initialized");
        });
    }
);
})();