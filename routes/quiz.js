const express = require("express")
const db = require("../config/database")
const {getUser,getQuiz,genQuiz, updateQuiz, dbGetFromTable} = require("../utils")
const router = express.Router();

router.get("/:username", async (req, res) => {
    const username = req.params.username;
    const [err, userObj] = await getUser(username);
        if(err){
            return res.status(500).json({
                "err": err.message
            })
        }else{
            if(userObj && userObj.length >= 1){
                const [error, quizObj] = await getQuiz(userObj[0].user_id);
                if(!quizObj | quizObj.length < 1){
                    console.log("sakht azmoon jadid"); 
                    const quiz = await genQuiz(userObj[0].user_id)
                    console.log("ok..."); 
                    return res.send(quiz[1])
                }
                else{
                    return res.send(quizObj)
                }

            }else{
                return res.status(404).json({
                    "err": "hamchin useri nadarim"
                })
            }
        }
})

router.post("/:username", async (req, res) => {
    const username = req.params.username;
    const answers = req.body
    const [err, userObj] = await getUser(username);
    if(err){
        return res.status(500).json({
            "err": err.message
        })
    }else {
        if(userObj && userObj.length >= 1){
            const result = await updateQuiz(res,userObj[0].user_id, answers)
            if(result) return res.send(result)
            return res.status(200).send("javabha ersal shod!")
        }
        else{
            return res.status(404).json({
            "err": "hamchin useri nadarim"
            }) 
        }
    }
})

router.get("/history/:username" , async(req, res) => {

    const username = req.params.username;
    const [err, userObj] = await getUser(username);
        if(err){
            return res.status(500).json({
                "err": err.message
            })
        }else{
            if(userObj && userObj.length >= 1){
                try{
                    
                    const result = await dbGetFromTable(`SELECT * FROM quiz_item INNER JOIN quiz ON quiz_item.quiz = quiz.quiz_id INNER JOIN question ON quiz_item.question = question.question_id WHERE user = ${userObj[0].user_id} `)
                    return res.send(result)
                }
                catch{
                    return res.send("nayomad")
                }
            }
            else{
                return res.status(404).json({
                "err": "hamchin useri nadarim"
                }) 
            }
        }
    })

module.exports = router;