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

const vulnerabilityTemplate = {
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
    d: dbl, 
    h: hlf,
    i: imn};
};

function mergeObjects(objA, objB) {
  return {
    d : objA.d.concat(objB.d),
    h : objA.h.concat(objB.h),
    i : objA.i.concat(objB.i)
  };
};

function calculateVulnerability(template, data) {
  for (var key in template) {
    for (var a = 0; a < data.d.length; a++) {
        if (key === data.d[a]) {
            template[key] *= 2;
        }
    }
    for (var a = 0; a < data.h.length; a++) {
        if (key === data.h[a]) {
            template[key] *= .5;
        }
    }
    for (var a = 0; a < data.i.length; a++) {
        if (key === data.i[a]) {
            template[key] *= 0;
        }
    }
}
return template;
};

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {    
    res.render("index.ejs");
});

app.post("/", async (req, res) => {
    const searchTerm = req.body.pokemonName.toLowerCase();

    try {
    var pokeType = await checkType(endpointName, searchTerm);
    var typeWeakness = await checkTypeWeaknesses(endpointType, pokeType.pTypes.pTypeOne);

    if (pokeType.pTypes.pTypeTwo !== "") {
      var typeWeaknessB = await checkTypeWeaknesses(endpointType, pokeType.pTypes.pTypeTwo);
      typeWeakness = mergeObjects(typeWeakness, typeWeaknessB);
    };

    var pokeWeaknesses = calculateVulnerability(vulnerabilityTemplate, typeWeakness);

    res.render("index.ejs", { 
      typeData : pokeType,
      weaknessData : pokeWeaknesses
    });

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
