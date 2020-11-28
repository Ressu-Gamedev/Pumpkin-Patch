let express = require('express');

let app = express();

app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));
app.use('/script', express.static('script'));


app.get('/', (req, res) => {
    res.render('index');
});

app.listen(8080);