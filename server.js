const express = require("express");

const app = express()

app.use(express.json())

const quizRouter = require("./routes/quiz")
app.use("/quiz",  quizRouter)

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server listen on ${PORT}`);
})