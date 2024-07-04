const express=require('express');
const  mongoose =require("mongoose");
const dotenv =require('dotenv');
const cors = require('cors');

const categorieRouter =require("./routes/categorie.route") ;
const scategorieRouter =require("./routes/scategorie.route");
const articleRouter =require("./routes/article.route");
const userRouter =require("./routes/user.route");




// Configuration CORS
const corsOptions = {
    origin: 'https://your-angular-frontend-url.vercel.app',  // Remplacez par l'URL de votre frontend Angular sur Vercel
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));

  
dotenv.config()
const app = express();
const paymentRouter =require("./routes/payment.route.js");
//Les cors 
app.use(cors('/api/payment', paymentRouter))

//BodyParser Middleware
app.use(express.json()); 

mongoose.set("strictQuery", false);

// Connexion à la base données
mongoose.connect(process.env.DATABASE,{
 useNewUrlParser: true,
 useUnifiedTopology: true
 })
 .then(() => {console.log("Connexion à la base de données réussie");
}).catch(err => {
 console.log('Impossible de se connecter à la base de données', err);
 process.exit();
});

app.get("/",(req,res)=>{
res.send("bonjour");
});

//les routes


app.use('/api/categories', categorieRouter);

app.use('/api/scategories', scategorieRouter);

app.use('/api/articles', articleRouter);

app.use('/api/users', userRouter);



app.listen(process.env.PORT, () => {
 console.log(`Server is listening on port ${process.env.PORT}`); });

module.exports = app;
