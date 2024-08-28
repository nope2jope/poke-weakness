import express from "express";
import axios from "axios";


const app = express();
const port = 3000;
const url = "https://pokeapi.co/api/v2/pokemon/";
var obj;
var data;

app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {    
    res.render("index.ejs");
});

app.post("/", async (req, res) => {
    const searchTerm = req.body.pokemonName.toLowerCase();
    try {
    const response = await axios.get(url + searchTerm);
    const result = response.data;
    const pokeSprite = result.sprites.front_default;
    console.log(pokeSprite);
    const typeOne = result.types[0].type.name;
    var typeTwo = "";
    if (result.types[1]) {
      typeTwo = result.types[1].type.name;
    };
    res.render("index.ejs", { data : { 
      pName : searchTerm,
      pSprite : pokeSprite,
      pTypes : { 
        pTypeOne : typeOne,
        pTypeTwo : typeTwo}
    }});
    } catch (error) {
      console.error("Failed to make request:", error.message);
      res.render("index.ejs", {
        error: error.message,
      });
    }
});

app.listen(port, () => {
    console.log(`Application is listening on ${port}`)
});
