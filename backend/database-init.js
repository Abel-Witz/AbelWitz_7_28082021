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
        id BIGINT UNSIGNED AUTO_INCREMENT,
        first_name VARCHAR(20) NOT NULL,
        last_name VARCHAR(20) NOT NULL,
        email VARCHAR(65) UNIQUE NOT NULL,
        password_hash BINARY(60) NOT NULL,
        profile_picture_url VARCHAR(100),
        is_admin BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (id)
    )
    ENGINE=InnoDB;
    
    CREATE TABLE IF NOT EXISTS Post (
        id BIGINT UNSIGNED AUTO_INCREMENT,
        title VARCHAR(300) NOT NULL,
        text TEXT,
        image_url VARCHAR(100),
        author_id BIGINT UNSIGNED,
        date DATETIME NOT NULL,
        calculated_likes INT UNSIGNED NOT NULL DEFAULT 0,
        calculated_dislikes INT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        CONSTRAINT fk_author_id
            FOREIGN KEY (author_id)
            REFERENCES User(id)
            ON DELETE SET NULL
    )
    ENGINE=InnoDB;
    
    CREATE TABLE IF NOT EXISTS Post_Like (
        id BIGINT UNSIGNED AUTO_INCREMENT,
        post_id BIGINT UNSIGNED NOT NULL,
        author_id BIGINT UNSIGNED,
        PRIMARY KEY (id),
        UNIQUE(author_id, post_id),
        CONSTRAINT fk_like_post_id
            FOREIGN KEY (post_id)
            REFERENCES Post(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_post_like_author_id
            FOREIGN KEY (author_id)
            REFERENCES User(id)
            ON DELETE SET NULL
    )
    ENGINE=InnoDB;
    
    CREATE TABLE IF NOT EXISTS Post_Dislike (
        id BIGINT UNSIGNED AUTO_INCREMENT,
        post_id BIGINT UNSIGNED NOT NULL,
        author_id BIGINT UNSIGNED,
        PRIMARY KEY (id),
        UNIQUE(author_id, post_id),
        CONSTRAINT fk_dislike_post_id
            FOREIGN KEY (post_id)
            REFERENCES Post(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_post_dislike_author_id
            FOREIGN KEY (author_id)
            REFERENCES User(id)
            ON DELETE SET NULL
    )
    ENGINE=InnoDB;
    
    CREATE TABLE IF NOT EXISTS Comment (
        id BIGINT UNSIGNED AUTO_INCREMENT,
        text TEXT NOT NULL,
        post_id BIGINT UNSIGNED NOT NULL,
        author_id BIGINT UNSIGNED,
        \`date\` DATETIME NOT NULL,
        calculated_likes INT UNSIGNED NOT NULL DEFAULT 0,
        calculated_dislikes INT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        CONSTRAINT fk_comment_post_id
            FOREIGN KEY (post_id)
            REFERENCES Post(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_comment_author_id
            FOREIGN KEY (author_id)
            REFERENCES User(id)
            ON DELETE SET NULL
    )
    ENGINE=InnoDB;
    
    CREATE TABLE IF NOT EXISTS Comment_Like (
        id BIGINT UNSIGNED AUTO_INCREMENT,
        comment_id BIGINT UNSIGNED NOT NULL,
        author_id BIGINT UNSIGNED,
        PRIMARY KEY (id),
        UNIQUE(author_id, comment_id),
        CONSTRAINT fk_like_comment_id
            FOREIGN KEY (comment_id)
            REFERENCES Comment(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_comment_like_author_id
            FOREIGN KEY (author_id)
            REFERENCES User(id)
            ON DELETE SET NULL
    )
    ENGINE=InnoDB;
    
    CREATE TABLE IF NOT EXISTS Comment_Dislike (
        id BIGINT UNSIGNED AUTO_INCREMENT,
        comment_id BIGINT UNSIGNED NOT NULL,
        author_id BIGINT UNSIGNED,
        PRIMARY KEY (id),
        UNIQUE(author_id, comment_id),
        CONSTRAINT fk_dislike_comment_id
            FOREIGN KEY (comment_id)
            REFERENCES Comment(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_comment_dislike_author_id
            FOREIGN KEY (author_id)
            REFERENCES User(id)
            ON DELETE SET NULL
    )
    ENGINE=InnoDB;
    
    DROP TRIGGER IF EXISTS before_delete_user;
    CREATE TRIGGER before_delete_user BEFORE DELETE
    ON User FOR EACH ROW
    BEGIN
        DECLARE v_like_or_dislike_id BIGINT DEFAULT NULL;
        DECLARE v_post_or_comment_id BIGINT DEFAULT NULL;
        DECLARE v_loop_end BOOLEAN DEFAULT FALSE;
    
        DECLARE cur_post_likes CURSOR
            FOR SELECT id, post_id FROM Post_Like WHERE author_id=OLD.id;
    
        DECLARE cur_post_dislikes CURSOR
            FOR SELECT id, post_id FROM Post_Dislike WHERE author_id=OLD.id;
    
        DECLARE cur_comment_likes CURSOR
            FOR SELECT id, comment_id FROM Comment_Like WHERE author_id=OLD.id;
    
        DECLARE cur_comment_dislikes CURSOR
            FOR SELECT id, comment_id FROM Comment_Dislike WHERE author_id=OLD.id;
    
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_loop_end = TRUE;
    
    
        OPEN cur_post_likes;
    
        loop_cur_post_likes: LOOP
            FETCH cur_post_likes INTO v_like_or_dislike_id, v_post_or_comment_id;
        
            IF v_loop_end = TRUE THEN
                LEAVE loop_cur_post_likes;
            END IF;
    
            DELETE FROM Post_Like WHERE id=v_like_or_dislike_id;
            UPDATE Post SET calculated_likes=calculated_likes-1 WHERE id=v_post_or_comment_id;
        END LOOP;
    
    
        SET v_like_or_dislike_id = NULL;
        SET v_post_or_comment_id = NULL;
        SET v_loop_end = FALSE;
    
        OPEN cur_post_dislikes;
    
        loop_cur_post_dislikes: LOOP
            FETCH cur_post_dislikes INTO v_like_or_dislike_id, v_post_or_comment_id;
        
            IF v_loop_end = TRUE THEN
                LEAVE loop_cur_post_dislikes;
            END IF;
    
            DELETE FROM Post_Dislike WHERE id=v_like_or_dislike_id;
            UPDATE Post SET calculated_dislikes=calculated_dislikes-1 WHERE id=v_post_or_comment_id;
        END LOOP;
    
    
        SET v_like_or_dislike_id = NULL;
        SET v_post_or_comment_id = NULL;
        SET v_loop_end = FALSE;
    
        OPEN cur_comment_likes;
    
        loop_cur_comment_likes: LOOP
            FETCH cur_comment_likes INTO v_like_or_dislike_id, v_post_or_comment_id;
        
            IF v_loop_end = TRUE THEN
                LEAVE loop_cur_comment_likes;
            END IF;
    
            DELETE FROM Comment_Like WHERE id=v_like_or_dislike_id;
            UPDATE Comment SET calculated_likes=calculated_likes-1 WHERE id=v_post_or_comment_id;
        END LOOP;
    
    
        SET v_like_or_dislike_id = NULL;
        SET v_post_or_comment_id = NULL;
        SET v_loop_end = FALSE;
    
        OPEN cur_comment_dislikes;
    
        loop_cur_comment_dislikes: LOOP
            FETCH cur_comment_dislikes INTO v_like_or_dislike_id, v_post_or_comment_id;
        
            IF v_loop_end = TRUE THEN
                LEAVE loop_cur_comment_dislikes;
            END IF;
    
            DELETE FROM Comment_Dislike WHERE id=v_like_or_dislike_id;
            UPDATE Comment SET calculated_dislikes=calculated_dislikes-1 WHERE id=v_post_or_comment_id;
        END LOOP;
    END;
    
    DROP PROCEDURE IF EXISTS like_post;
    CREATE PROCEDURE like_post(IN p_post_id BIGINT UNSIGNED, IN p_author_id BIGINT UNSIGNED)  
    BEGIN
        DECLARE v_dislike_id BIGINT DEFAULT NULL;
    
        INSERT INTO Post_Like VALUES (NULL, p_post_id, p_author_id);
    
        SELECT id INTO v_dislike_id FROM Post_Dislike WHERE post_id=p_post_id AND author_id=p_author_id;
    
        IF (v_dislike_id IS NULL) THEN
            UPDATE Post SET calculated_likes=calculated_likes+1 WHERE id=p_post_id;
        ELSE
            DELETE FROM Post_Dislike WHERE id=v_dislike_id;
            UPDATE Post SET calculated_likes=calculated_likes+1, calculated_dislikes=calculated_dislikes-1 WHERE id=p_post_id;
        END IF;
    END;
    
    DROP PROCEDURE IF EXISTS neutral_post;
    CREATE PROCEDURE neutral_post(IN p_post_id BIGINT UNSIGNED, IN p_author_id BIGINT UNSIGNED)  
    BEGIN
        DECLARE v_like_or_dislike_id BIGINT DEFAULT NULL;
    
        SELECT id INTO v_like_or_dislike_id FROM Post_Like WHERE post_id=p_post_id AND author_id=p_author_id;
    
        IF (v_like_or_dislike_id IS NOT NULL) THEN
            DELETE FROM Post_Like WHERE id=v_like_or_dislike_id;
            UPDATE Post SET calculated_likes=calculated_likes-1 WHERE id=p_post_id;
        END IF;
    
        SET v_like_or_dislike_id = NULL;
        SELECT id INTO v_like_or_dislike_id FROM Post_Dislike WHERE post_id=p_post_id AND author_id=p_author_id;
    
        IF (v_like_or_dislike_id IS NOT NULL) THEN
            DELETE FROM Post_Dislike WHERE id=v_like_or_dislike_id;
            UPDATE Post SET calculated_dislikes=calculated_dislikes-1 WHERE id=p_post_id;
        END IF;
    END;
    
    DROP PROCEDURE IF EXISTS dislike_post;
    CREATE PROCEDURE dislike_post(IN p_post_id BIGINT UNSIGNED, IN p_author_id BIGINT UNSIGNED)  
    BEGIN
        DECLARE v_like_id BIGINT DEFAULT NULL;
    
        INSERT INTO Post_Dislike VALUES (NULL, p_post_id, p_author_id);
    
        SELECT id INTO v_like_id FROM Post_Like WHERE post_id=p_post_id AND author_id=p_author_id;
    
        IF (v_like_id IS NULL) THEN
            UPDATE Post SET calculated_dislikes=calculated_dislikes+1 WHERE id=p_post_id;
        ELSE
            DELETE FROM Post_Like WHERE id=v_like_id;
            UPDATE Post SET calculated_dislikes=calculated_dislikes+1, calculated_likes=calculated_likes-1 WHERE id=p_post_id;
        END IF;
    END;
    
    DROP PROCEDURE IF EXISTS like_comment;
    CREATE PROCEDURE like_comment(IN p_comment_id BIGINT UNSIGNED, IN p_author_id BIGINT UNSIGNED)  
    BEGIN
        DECLARE v_dislike_id BIGINT DEFAULT NULL;
    
        INSERT INTO Comment_Like VALUES (NULL, p_comment_id, p_author_id);
    
        SELECT id INTO v_dislike_id FROM Comment_Dislike WHERE comment_id=p_comment_id AND author_id=p_author_id;
    
        IF (v_dislike_id IS NULL) THEN
            UPDATE Comment SET calculated_likes=calculated_likes+1 WHERE id=p_comment_id;
        ELSE
            DELETE FROM Comment_Dislike WHERE id=v_dislike_id;
            UPDATE Comment SET calculated_likes=calculated_likes+1, calculated_dislikes=calculated_dislikes-1 WHERE id=p_comment_id;
        END IF;
    END;
    
    DROP PROCEDURE IF EXISTS neutral_comment;
    CREATE PROCEDURE neutral_comment(IN p_comment_id BIGINT UNSIGNED, IN p_author_id BIGINT UNSIGNED)  
    BEGIN
        DECLARE v_like_or_dislike_id BIGINT DEFAULT NULL;
    
        SELECT id INTO v_like_or_dislike_id FROM Comment_Like WHERE comment_id=p_comment_id AND author_id=p_author_id;
    
        IF (v_like_or_dislike_id IS NOT NULL) THEN
            DELETE FROM Comment_Like WHERE id=v_like_or_dislike_id;
            UPDATE Comment SET calculated_likes=calculated_likes-1 WHERE id=p_comment_id;
        END IF;
    
        SET v_like_or_dislike_id = NULL;
        SELECT id INTO v_like_or_dislike_id FROM Comment_Dislike WHERE comment_id=p_comment_id AND author_id=p_author_id;
    
        IF (v_like_or_dislike_id IS NOT NULL) THEN
            DELETE FROM Comment_Dislike WHERE id=v_like_or_dislike_id;
            UPDATE Comment SET calculated_dislikes=calculated_dislikes-1 WHERE id=p_comment_id;
        END IF;
    END;
    
    DROP PROCEDURE IF EXISTS dislike_comment;
    CREATE PROCEDURE dislike_comment(IN p_comment_id BIGINT UNSIGNED, IN p_author_id BIGINT UNSIGNED)
    BEGIN
        DECLARE v_like_id BIGINT DEFAULT NULL;
    
        INSERT INTO Comment_Dislike VALUES (NULL, p_comment_id, p_author_id);
    
        SELECT id INTO v_like_id FROM Comment_Like WHERE comment_id=p_comment_id AND author_id=p_author_id;
    
        IF (v_like_id IS NULL) THEN
            UPDATE Comment SET calculated_dislikes=calculated_dislikes+1 WHERE id=p_comment_id;
        ELSE
            DELETE FROM Comment_Like WHERE id=v_like_id;
            UPDATE Comment SET calculated_dislikes=calculated_dislikes+1, calculated_likes=calculated_likes-1 WHERE id=p_comment_id;
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