const express = require('express');
const path = require('path');

// Criando o equivalente ao __dirname
//const __dirname = path.resolve();

// Inicializando o aplicativo Express
const app = express();

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurando o EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rota principal
app.get('/', (req, res) => {
    res.render('index');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
