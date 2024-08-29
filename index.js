import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const endpointName = "https://pokeapi.co/api/v2/pokemon/";
const endpointType = "https://pokeapi.co/api/v2/type/";

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

const typeVulnerabilities = {
  bug : 1,
  dark : 1,
  dragon : 1,
  electric : 1,
  fairy : 1,
  fighting : 1,
  fire : 1,
  flying : 1,
  ghost : 1,
  grass : 1,
  ground : 1,
  ice : 1,
  normal : 1,
  poison : 1,
  psychic : 1,
  rock : 1,
  steel : 1,
  water : 1,
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
  var dbl = [];
  var hlf = [];
  var imn = [];

  const response = await axios.get(u + t);
  const result = response.data;

  result.damage_relations.double_damage_from.forEach(type => {
    dbl.push(type.name)
  })
  result.damage_relations.half_damage_from.forEach(type => {
    hlf.push(type.name)
  })
  result.damage_relations.no_damage_from.forEach(type => {
    imn.push(type.name)
  })

  return {
    double: dbl, 
    half: hlf,
    immune: imn};
};

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {    
    res.render("index.ejs");
});

app.post("/", async (req, res) => {
    const searchTerm = req.body.pokemonName.toLowerCase();
    try {
    var pokeData = await checkType(endpointName, searchTerm);
    var pokeWeaknessA = await checkTypeWeaknesses(endpointType, pokeData.pTypes.pTypeOne);
    if (pokeData.pTypes.pTypeTwo !== "") {
      var pokeWeaknessB = await checkTypeWeaknesses(endpointType, pokeData.pTypes.pTypeTwo)
    }
    console.log(`${pokeData.pTypes.pTypeOne} is weak to`)
    console.log(pokeWeaknessA);
    console.log(`${pokeData.pTypes.pTypeTwo} is weak to`)
    console.log(pokeWeaknessB);
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
