const db = require("./config/database")

async function getUser(id){
    const result = [null, null]
    try{
        result[1] = await dbGetObject("SELECT * FROM user WHERE  username=?", id)
    }catch(err){
        result[0] = err
    }
    return result;
}


async function getQuiz(id){
    const result = [null, null]
    try{
        result[1] = await dbGetFromTable(`SELECT content, option1, option2, option3, option4 FROM quiz_item INNER JOIN quiz ON quiz_item.quiz = quiz.quiz_id INNER JOIN question ON quiz_item.question = question.question_id WHERE user = ${id} AND done = "0"`)
    }catch(err){
        result[0] = err
    }
    return result;
}

async function genQuiz(id){
    const result = [null, null]
    
    try{
        result[1] = await dbGetFromTable(`SELECT question_id, content, option1, option2, option3, option4 FROM question ORDER BY RANDOM() LIMIT 4`)
        await dbInsertInTable(`INSERT INTO quiz(user, done) VALUES(?, ?)`,[id, 0])
        quiz = await dbGetFromTable(`SELECT * FROM quiz ORDER BY quiz_id DESC LIMIT 1`)
        await dbBulkInsert(result[1], quiz[0].quiz_id)
    }catch(err){
        result[0] = err
    }
    return result;
}

async function updateQuiz(res,id, userAnswer){
    let result = ["azmoon nadari", null]
    let mark = 0
    let quiz_id = 0
    try{
        result[1] = await dbGetFromTable(`SELECT answer,quiz_item_id FROM quiz_item INNER JOIN quiz ON quiz_item.quiz = quiz.quiz_id INNER JOIN question ON quiz_item.question = question.question_id WHERE user = ${id} AND done = "0"`)
        if(result[1].length < 1)  {
            return result[0]
        }
        mark = await dbCheckAnswers(result[1], userAnswer)
        quiz_id = await dbGetFromTable(`SELECT quiz_id FROM quiz WHERE user = ${id} AND done = "0"`)
        await dbBulkUpdate(userAnswer, quiz_id[0],result[1])
        await dbInsertInTable(`UPDATE quiz SET mark = ?, done = ? WHERE user = ? AND done = ?`,[mark, 1, id, 0])
    }   
    catch{
        result[0] = "err"
        return result[0]
    }
}

async function dbCheckAnswers(realAnswer, userAnswer){
    return new Promise(function(resolve, reject){
        if(realAnswer.length != Object.keys(userAnswer).length){
             return reject("dobare befrest") 
        } 
        let mark = 0
        for(let i = 0; i < realAnswer.length ; i++){
            if(realAnswer[i].answer == userAnswer[`${i}`]){
                mark++
            }
        }
        resolve(mark)
    });
}

async function dbGetObject(query, param){
    return new Promise(function(resolve, reject){
        db.all(query, param, function(err,rows){
           if(err){return reject(err);}
           resolve(rows);
         });
    });
}

async function dbGetFromTable(query){
    return new Promise(function(resolve, reject){
        db.all(query, function(err,rows){
            if(err){
                return reject(err);}
            resolve(rows);
         });
        });
}


async function dbInsertInTable(query,values){
    return new Promise(function(resolve, reject){
        db.run(query, values)
        resolve()
    });
}

async function dbBulkInsert(rows,quiz_id){
    let stmt = db.prepare("INSERT INTO quiz_item(quiz, question) VALUES (?,?)");
        for(let row of rows) {
            stmt.run(quiz_id , row.question_id);
        }
        stmt.finalize();
}


async function dbBulkUpdate(userAnswers, quiz_id, quiz_item){
    for(let i = 0; i < Object.keys(userAnswers).length; i++) {
        db.run(`UPDATE quiz_item SET userAnswer = ? WHERE quiz = ? AND quiz_item_id = ?`,[userAnswers[`${i}`], quiz_id.quiz_id, quiz_item[i].quiz_item_id]);
    }
}

module.exports = {
    getUser,
    getQuiz,
    genQuiz,
    updateQuiz,
    dbGetFromTable
}