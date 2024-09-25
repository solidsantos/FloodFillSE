import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Criando o equivalente ao __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
