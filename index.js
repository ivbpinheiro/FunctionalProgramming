//Importações
const console = require("console");
const csv = require("csv-parser")
const fs = require("fs")
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin, //or fileStream 
  output: process.stdout
});

async function readInput() {
  const it = rl[Symbol.asyncIterator]();
  const csv_ = await it.next();
  return csv_
}

function start() {
  return readInput();

}

// Main
(async() => {
  console.log("Digite o nome do arquivo CSV para ser lido:");
  const csv_ = await start();
  const results = []
  fs.createReadStream(csv_.value).pipe(csv({}))
    .on("data", (data) => results.push(data)) 
    .on("end", () => {
      doAnalysis(results)
    })

})();



//Respostas do exercício
function doAnalysis(jsonData){
  const countryGroup = groupByCategory(jsonData, obj =>  obj.Country_Region);
  
  analyze1(countryGroup)
    
  analyze2(countryGroup)
    
  analyze3(countryGroup)
    
  analyze4(countryGroup)
    
  analyze5(countryGroup)
}

//Os três países com os maiores valores de "Confirmed". Os nomes devem estar em ordem alfabética.
function analyze1(countryGroup){   
  const list = {"OfCountries": []};
  list.OfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .sort((a,b) => b.TotalOfConfirmeds - a.TotalOfConfirmeds)
    .slice(0, 3)
    .map(object => ({ 'Pais': object.Country,'TotalConfirmado': object.TotalOfConfirmeds}))
    .sort(function(a,b) {
      if(a.Pais < b.Pais) return -1;
      if(a.Pais > b.Pais) return 1;
      return 0;
  });
  console.log("Os três países com mais casos de Covid-19 confirmados são:");  
  console.log(list.OfCountries);  
}

//Dentre os dez países com maiores valores de "Active", a soma dos "Deaths" dos cinco países com menores valres de "Confirmed".
function analyze2(countryGroup){
  const list = {"OfCountries": []};
  const sum = {"OfDeaths": 0};  
  list.OfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .sort((a,b) => b.TotalActive - a.TotalActive)
    .slice(0, 10)
    .map(object => ({ 'Pais': object.Country, 'TotaldeConfirmados': object.TotalOfConfirmeds, 'TotalCasosAtivos': object.TotalActive, 'TotalMortes': object.TotalOfDeaths}))
    .sort((a,b) => a.TotalOfConfirmeds - b.TotalOfConfirmeds)
    .slice(0, 5)
  sum.OfDeaths = list.OfCountries.reduce((a, b) => a + b.TotaldeConfirmados, 0);
  console.log("");
  console.log("Dentre os dez países com os maiores valores de casos de Covid-19 ativos,"); 
  console.log("a soma das mortes dos que apresentam os menores valores de casos confirmados é: " + sum.OfDeaths);
}

//O maior valor de "Deaths" entre os países do hemisfério sul.
function analyze3(countryGroup){
  const list = {"OfCountries": []};
  list.OfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .map(object => ({'Pais': object.Country, 'TotaldeConfirmados': object.TotalOfConfirmeds, 'TotalCasosAtivos': object.TotalActive, 'Totalmortes': object.TotalOfDeaths, 'Latitudetotal': object.LatGlobal}))    
    .filter((object) => object.Latitudetotal < 0)
    .sort((a,b) => b.Totalmortes - a.Totalmortes)
    .slice(0, 1)
    console.log("");    
    console.log("Dentre os países do hemisfério sul, o que mais teve casos de morte por Covid-19 é:");
    console.log(list.OfCountries);

}

//O maior valor de "Deaths" entre os países do hemisfério norte.
function analyze4(countryGroup){
  const list = {"OfCountries": []};
  list.OfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .map(object => ({'Pais': object.Country, 'TotaldeConfirmados': object.TotalOfConfirmeds, 'TotalCasosAtivos': object.TotalActive, 'Totalmortes': object.TotalOfDeaths, 'Latitudetotal': object.LatGlobal}))    
    .filter((object) => object.Latitudetotal >= 0)
    .sort((a,b) => b.Totalmortes - a.Totalmortes)
    .slice(0, 1)
    console.log("");    
    console.log("Dentre os países do hemisfério norte, o que mais teve casos de morte por Covid-19 é:");
    console.log(list.OfCountries);
}

//A soma de "Active" de todos os países em que "Confirmed" é maior o igual que 1.000.000.
function analyze5(countryGroup){
  const list = {"OfCountries": []};
  const sum = {"Active": 0};
  list.OfCountries = dataGroupingWithCustomMetrics(countryGroup)
    .map(object => ({'Pais': object.Country, 'TotaldeConfirmados': object.TotalOfConfirmeds, 'TotalCasosAtivos': object.TotalActive, 'Totalmortes': object.TotalOfDeaths, 'Latitudetotal': object.LatGlobal}))
    .filter((object) => object.TotaldeConfirmados >= 1000000);
  sum.Active = list.OfCountries.reduce((a, b) => a + b.TotalCasosAtivos, 0);
  console.log("");
  console.log("Dentre os países com 1.000.000 ou mais de casos de Covid-19 confirmados, a soma de casos ativos desses países é: " + sum.Active);
}


//Funções para usar como parametro para as chamadas funcionais
function dataGroupingWithCustomMetrics(countryGroup){
  const sumOfMetrics = {
    "somaConfirmed": 0,
    "somaActive": 0,
    "somaDeth": 0,
    "somaLat": 0,
    "listOfCountries": []
  };  
  Object.entries(countryGroup).forEach(function(country){
    country[1].forEach(function(region){    
      sumOfMetrics.somaConfirmed = sumOfMetrics.somaConfirmed + parseInt(region['Confirmed']);      
      sumOfMetrics.somaActive = sumOfMetrics.somaActive + parseInt(region['Active']);      
      sumOfMetrics.somaDeth = sumOfMetrics.somaDeth + parseInt(region['Deaths']);
      sumOfMetrics.somaLat = sumOfMetrics.somaLat + Math.floor(region['Lat']);      
    });
    const tempData = Object.assign({'Country': country[0], 'States': country[1], 'TotalOfConfirmeds': sumOfMetrics.somaConfirmed, 'TotalActive': sumOfMetrics.somaActive, 'TotalOfDeaths': sumOfMetrics.somaDeth, 'LatGlobal': sumOfMetrics.somaLat});    
    sumOfMetrics.listOfCountries.push(tempData);   
    sumOfMetrics.somaConfirmed = 0;
    sumOfMetrics.somaActive = 0;
    sumOfMetrics.somaDeth = 0;
    sumOfMetrics.somaLat = 0;
  }); 
  return sumOfMetrics.listOfCountries; 
}

function groupByCategory(list, keyGetter) {
  const groupB = list.reduce((group, item) => {
    const key = keyGetter(item);
    group[key] = group[key] || [];
    group[key].push(item);
    return group;
  }, {});
  return groupB;
}