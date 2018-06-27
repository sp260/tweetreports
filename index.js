var globale

var query = (keyword) => new Promise(function (success, failure) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function (ev) {
   if (xhr.status == 200 && xhr.readyState == 4) {
     success(xhr.responseText)
   }
   else if(xhr.readyState == 4 && xhr.status != 200)
     failure(xhr.responseText)
  });
  xhr.open("GET", "http://localhost:9010/requete?q="+encodeURIComponent(keyword)+"\&t=simple", true);
  xhr.send();
  loading();
})

var stats_query = (keyword) => new Promise(function (success, failure) {
   var xhr = new XMLHttpRequest();
   xhr.addEventListener("readystatechange", function (ev) {
    if (xhr.status == 200 && xhr.readyState == 4) {
      success(xhr.responseText)
    }
    else if(xhr.readyState == 4 && xhr.status != 200)
      failure(xhr.responseText)
   });
   xhr.open("GET", "http://localhost:9010/requete?q=\"\"\&t=stats", true);
   xhr.send();
   loading();
})

var charts_query = (keyword) => new Promise(function (success, failure) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function (ev) {
     if (xhr.status == 200 && xhr.readyState == 4) {
       success(xhr.responseText)
     }
     else if(xhr.readyState == 4 && xhr.status != 200)
       failure(xhr.responseText)
    });
    xhr.open("GET", "http://localhost:9010/requete?q=\"\"\&t=charts", true);
    xhr.send();
    loading();
})

var affichage = (job_id) => new Promise(function (success, failure) {
   var xhr = new XMLHttpRequest();
   xhr.addEventListener("readystatechange", function (ev) {
    if (xhr.status == 200 && xhr.readyState == 4) {
      success(xhr.responseText)
    }
    else if(xhr.readyState == 4 && xhr.status != 200)
      failure(xhr.responseText)
   });
   xhr.open("GET", "http://localhost:9010/resultat?q="+JSON.parse(job_id).job_id, true);
   xhr.send();
})

var searchButton = document.getElementById("submit");
searchButton.addEventListener("click", () => {
  if (check_input(search.value)) {
    var step1 = query(search.value)
    step1.then(affichage).then(dom_changing)
  }
})

var statsButton = document.getElementById("stats");
statsButton.addEventListener("click", ()=> {
  var step1 = stats_query(search.value)
  step1.then(affichage).then(dom_changing_for_stats)
})

var chartsButton = document.getElementById("charts");
chartsButton.addEventListener("click", ()=> {
  var step1 = charts_query(search.value)
  step1.then(affichage).then(dom_changing_for_charts)
})

function check_input(w) {
  if (w.length > 1 && w != "#" && w != "@") {
    return true
  } else {
    tweets.innerHTML = "<font color='red'>Please insert a correct word!</font><br/>" + tweets.innerHTML
    return false
  }
}

function degree_to_rad(long, lat){
  return {x : Math.PI*long/180 , y : Math.PI*lat/180 }
}

function rad_to_basics(x , y){
  return {x : x , y : 5/4*Math.log(Math.tan(Math.PI/4 + 2*y/5))}
}

function basics_to_map(x , y , a ,b){
  return {x: a*x/Math.PI/2 , y : b*y/(5/4*Math.log(Math.tan(Math.PI/4 + 2*Math.PI/2/5)))/2}
}

function degrees_to_map(x,y,a,b){
  var tmp1 = degree_to_rad(x,y)
  var tmp2 = rad_to_basics(tmp1.x,tmp1.y)
  return  basics_to_map(tmp2.x,tmp2.y,a,b)
}
