import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const endpointName = "https://pokeapi.co/api/v2/pokemon/";
const endpointType = "https://pokeapi.co/api/v2/type/"
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

async function checkType(u, n) {
  const response = await axios.get(u + n);
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
return { 
  pName : n,
  pSprite : pokeSprite,
  pTypes : { 
    pTypeOne : typeOne,
    pTypeTwo : typeTwo,
    pTypeOneIcon : typeOneIcon,
    pTypeTwoIcon : typeTwoIcon}
}};

async function checkTypeWeaknesses(u, t) {
  const response = await axios.get(u + t);
  const result = response.data;
  const noDamangeFrom = result.damage_relations.no_damage_from[0].name;
  const halfDamageFrom = result.damage_relations.half_damage_from;
  const doubleDamageFrom = result.damage_relations.double_damage_from;
  console.log(noDamangeFrom)
  console.log(halfDamageFrom)
  console.log(doubleDamageFrom)
}

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {    
    res.render("index.ejs");
});

app.post("/", async (req, res) => {
    const searchTerm = req.body.pokemonName.toLowerCase();
    try {
    var pokeData = await checkType(endpointName, searchTerm);
    await checkTypeWeaknesses(endpointType, pokeData.pTypes.pTypeOne)
    res.render("index.ejs", { data : pokeData});
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
