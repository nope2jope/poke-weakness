import express from "express";
import axios, { isCancel } from "axios";

const app = express();
const port = 3000;
const url = "https://pokeapi.co/api/v2/pokemon/";
const typeIcons = {
  bug : "assets/bug-type.png",
  dark : "assets/dark-type.png",
  dragon : "assets/dragon-type.png",
  electric : "assets/electric-type.png",
  fairy : "assets/fairy-type.png",
  fighting : "assets/fighting-type.png",
  fire : "assets/fire-type.png",
  flying : "assets/flying-type.png",
  ghost : "assets/ghost-type.png",
  grass : "assets/grass-type.png",
  ground : "assets/ground-type.png",
  ice : "assets/ice-type.png",
  normal : "assets/normal-type.png",
  poison : "assets/poison-type.png",
  psychic : "assets/psychic-type.png",
  rock : "assets/rock-type.png",
  steel : "assets/steel-type.png",
  water : "assets/water-type.png",
}

app.use(express.static("public"));
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
    const typeOne = result.types[0].type.name;
    const typeOneIcon = typeIcons[typeOne]
    if (result.types[1]) {
      var typeTwo = result.types[1].type.name;
      var typeTwoIcon = typeIcons[typeTwo];
    }
    else { 
      var typeTwo = "";
      var typeTwoIcon = "";
     };
    res.render("index.ejs", { data : { 
      pName : searchTerm,
      pSprite : pokeSprite,
      pTypes : { 
        pTypeOne : typeOne,
        pTypeTwo : typeTwo,
        pTypeOneIcon : typeOneIcon,
        pTypeTwoIcon : typeTwoIcon}
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
