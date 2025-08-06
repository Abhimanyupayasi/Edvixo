// src/index.js
import app from './app.js';
import { mongoDB} from './src/db/database.js'

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});