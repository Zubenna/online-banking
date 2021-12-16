const app = require("./app");
app.listen(process.env.PORT || 8080, () => {
    console.log(`app is listening on port ${process.env.PORT}`)
})