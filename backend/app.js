(async () => {
      /******************************/
     /* Load environment variables */
    /******************************/
    const requiredEnvironmentVariables = ["BACKEND_HOST", "BACKEND_PORT", "JWT_SECRET", "MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE", "FRONTEND_ADDRESS"];
    const config = require("dotenv").config();

    if ( config.error ) {
        console.error(config.error);
    };

    if ( config && config.parsed ) {
        for (const i of requiredEnvironmentVariables) {
            if ( process.env[i] === undefined ) {
                console.error(Error(`Can't start app because ${i} environment variable was not defined in .env file`));
                return;
            };
        };
    };


      /***************************/
     /* Get database connection */
    /***************************/
    try {
        await require("./util/database-connection")();
        console.log(`Connected to MYSQL "${process.env.MYSQL_DATABASE}" db as "${process.env.MYSQL_USER}" at ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT | 3306}`);
    } catch(error) {
        console.error(error)
        return;
    }


      /*************/
     /* Start app */
    /*************/
    const express = require("express");
    app = express();
    const path = require("path");
    const userRouter = require("./routes/user");
    const postRouter = require("./routes/post");
    const commentRouter = require("./routes/comment");

    // CORS
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_ADDRESS);
        res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.setHeader("Access-Control-Allow-Methods", "PATCH, PUT, DELETE")
        next();
    })

    app.use("/image-uploads", express.static(path.join(__dirname, "image-uploads")));

    app.use(express.json());
    app.use("/api/user", userRouter);
    app.use("/api/post", postRouter);
    app.use("/api/comment", commentRouter);

    const server = app.listen(process.env.BACKEND_PORT, process.env.BACKEND_HOST, () => {
        const host = server.address().address;
        const port = server.address().port;
        app.set("host", host);
        app.set("port", port);
        console.log(`Listening at http://${host}:${port}`);
    });
})();