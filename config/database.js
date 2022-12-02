const sqlite3 = require('sqlite3').verbose()

const DBFILENAME = "db.sqlite"

const db = new sqlite3.Database(DBFILENAME, (err) => {
    if(err){
        console.log(err.message);
        throw "failed database connection"
    }else{
        console.log("start config db...");
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS user(
                    user_id INTEGER PRIMARY KEY,
                    username TEXT NOT NULL UNIQUE
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS question(
                    question_id INTEGER PRIMARY KEY,
                    content TEXT,
                    option1 TEXT,
                    option2  TEXT,
                    option3 TEXT,
                    option4 TEXT,
                    answer INTEGER NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS quiz(
                quiz_id INTEGER PRIMARY KEY,
                user INTEGER NOT NULL,
                done TEXT NOT NULL,
                mark INTEGER ,
                FOREIGN KEY (user)
                    REFERENCES user(user_id)
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS quiz_item(
                quiz_item_id INTEGER PRIMARY KEY,
                quiz INTEGER NOT NULL,
                question INTEGER NOT NULL,
                userAnswer TEXT,
                FOREIGN KEY (quiz)
                    REFERENCES quiz(quiz_id)
                FOREIGN KEY (question)
                    REFERENCES question(question_id)
            )`);
        })
        console.log("finish config db...");
    }
})

module.exports = db;

