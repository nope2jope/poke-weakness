import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const endpointName = "https://pokeapi.co/api/v2/pokemon/";
const endpointType = "https://pokeapi.co/api/v2/type/";

const vulnerabilityTemplate = {
  bug: 1,
  dark: 1,
  dragon: 1,
  electric: 1,
  fairy: 1,
  fighting: 1,
  fire: 1,
  flying: 1,
  ghost: 1,
  grass: 1,
  ground: 1,
  ice: 1,
  normal: 1,
  poison: 1,
  psychic: 1,
  rock: 1,
  steel: 1,
  water: 1,
}
const multiplierTemplate = [
  {"4": false},
  {"2": false},
  {"1": false},
  {".5": false},
  {".25": false},
  {"0": false},
]

function resetTemplates() {
  for (let key in vulnerabilityTemplate) {
    vulnerabilityTemplate[key] = 1;
  };
  for (let o in multiplierTemplate) {
    for (let key in multiplierTemplate[o])
    multiplierTemplate[o][key] = false;
  };
};

async function checkType(u, n) {
  const response = await axios.get(u + n);
  const result = response.data;
  const pokeSprite = result.sprites.front_default;
  const typeOne = result.types[0].type.name;
  if (result.types[1]) {
    var typeTwo = result.types[1].type.name;
  }
  else {
    var typeTwo = "";
  };
  return {
    pName: n,
    pSprite: pokeSprite,
    pTypes: {
      pTypeOne: typeOne,
      pTypeTwo: typeTwo,
    }
  }
};

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
    i: imn
  };
};

function mergeObjects(objA, objB) {
  return {
    d: objA.d.concat(objB.d),
    h: objA.h.concat(objB.h),
    i: objA.i.concat(objB.i)
  };
};

function calculateVulnerability(template, data) {
  const t = template;
  for (var key in t) {
    for (var a = 0; a < data.d.length; a++) {
      if (key === data.d[a]) {
        t[key] *= 2;
      }
    }
    for (var a = 0; a < data.h.length; a++) {
      if (key === data.h[a]) {
        t[key] *= .5;
      }
    }
    for (var a = 0; a < data.i.length; a++) {
      if (key === data.i[a]) {
        t[key] *= 0;
      }
    }
  }
  return t;
};

function checkMultipliers(t, d) {
  const template = t;
  for (let key in d) {
    switch (d[key]) {
      case 4:
        template[0]["4"] = true;
        break;
      case 2: 
        template[1]["2"] = true;
        break;
      case 1:
        template[2]["1"] = true;
        break;
      case .5:
        template[3][".5"] = true;
        break;
      case .25: 
        template[4][".25"] = true;
        break;
      case 0:
        template[5]["0"] = true;
        break;
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
    resetTemplates();
    const pokeType = await checkType(endpointName, searchTerm);
    var typeWeakness = await checkTypeWeaknesses(endpointType, pokeType.pTypes.pTypeOne);

    if (pokeType.pTypes.pTypeTwo !== "") {
      var typeWeaknessB = await checkTypeWeaknesses(endpointType, pokeType.pTypes.pTypeTwo);
      typeWeakness = mergeObjects(typeWeakness, typeWeaknessB);
    };

    const pokeWeaknesses = calculateVulnerability(vulnerabilityTemplate, typeWeakness);
    const pokeMultipliers = checkMultipliers(multiplierTemplate, pokeWeaknesses);

    res.render("index.ejs", {
      typeData: pokeType,
      weaknessData: pokeWeaknesses,
      multiplierData: pokeMultipliers,
    });

  } catch (error) {
    console.error("Failed to make request:", error.message); 
    res.render("index.ejs", {
      errorMessage: error.message,
      errorStatus: error.response.status
    });
  }
});

app.listen(port, () => {
  console.log(`Application is listening on ${port}`)
});
