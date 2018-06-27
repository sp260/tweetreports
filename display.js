var content = document.getElementById("content")
var search = document.getElementById("q");
var maxPerPage = 10
var page

var dom_changing =  (result) => {
  var res = JSON.parse(result)["resultat"];
  globale = res
  page = 1

  changePage()

}

var prevBtn = document.getElementById("prevBtn");
prevBtn.addEventListener("click", ()=> {
  if (page > 1) {
    page--
    changePage()
  }
})

var nextBtn = document.getElementById("nextBtn");
nextBtn.addEventListener("click", ()=> {
  if (page < numPages()) {
    page++
    changePage()
  }
})

function changePage() {
  //Verifying and displaying the page number
  if (page < 1) page = 1;
  if (page > numPages()) page = numPages();
  document.getElementById("page").innerHTML = page;

  //Updating the page
  var tweets = "";
  if (globale.length > 0) {

    document.getElementById("pagination").style.display = "inline";
    totalHashtags = []
    for (var i = (page-1) * maxPerPage; i < page * maxPerPage; i++) {
      var ht = ""
      globale[i]["hashtags"].forEach( hashtag => {
        ht += "<b>#" + hashtag + "</b>";
      });


      tweets += "<div class='tweet-box'> \
                  <div class='box-logo'> \
                    <div class='tweet-logo'> \
                      <i class='fa fa-twitter fa-lg'></i> \
                    </div> \
                  </div> \
                  <div class='box-content'> \
                    <ul> \
                      <li><b>"+globale[i]["name"]+"</b> @"+globale[i]["username"]+" &bull; "+globale[i]["created_at"]+"</li> \
                      <li>"+globale[i]["text"]+"</li> \
                      <li>"+ ht +"</li> \
                    </ul> \
                  </div> \
                </div>"

      if (i == globale.length-1) break;
    }

    globale.forEach( tweet => {
      try {
        var cords = tweet['place'][0][0][0][0]
        draw(cords[1],cords[0])
      } catch (e) {
      }
    })

    document.getElementById("content").innerHTML = "<div class='glance'> \
                                                      <div class='glance-title'>At a glance</div> \
                                                      <div class='glance-content'  id='glance-content'> \
                                                       <u>" + globale.length + "</u> \
                                                         tweets were found for \
                                                       <u>" + search.value + "</u> \
                                                      </div> \
                                                    </div> \
                                                    <div class='tweets' id='tweets'>"+tweets+"</div>";


    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");

    if (page == 1) {
        prevBtn.style.visibility = "hidden";
    } else {
        prevBtn.style.visibility = "visible";
    }

    if (page == numPages()) {
        nextBtn.style.visibility = "hidden";
    } else {
        nextBtn.style.visibility = "visible";
    }

  } else {
    document.getElementById("tweets").innerHTML = "Please look for something else."
  }

}

function numPages() {
    if (globale){
      return Math.ceil(globale.length / maxPerPage);
    }
}

var dom_changing_for_stats =  (result) => {
  var res = JSON.parse(result)["resultat"];
  globale = res

  var htbody = ""
  res["hashtags"].forEach( hashtag => {
     htbody += "<tr><td style='padding:5px'>"+hashtag['row']+"</td><td style='width:200px'>"+hashtag['hashtag']+"</td><td>"+hashtag['number']+"</td></tr>";
  });
  var hashtags = "<table class='table half-width'> \
                    <thead class='thead'> \
                      <tr> \
                        <th>#</th> \
                        <th>Hashtag</th> \
                        <th>Number of posts</th> \
                      </tr> \
                    </thead> \
                    <tbody> \
                      "+ htbody +" \
                  </tbody></table>"

  var ctbody = ""
  res["countries"].forEach( country => {
     ctbody += "<tr><td style='padding:5px'>"+country['row']+"</td><td style='width:200px'>"+country['country']+"</td><td>"+country['number']+"</td></tr>";
  });
  var countries = "<table class='table half-width'> \
                      <thead class='thead'> \
                        <tr> \
                          <th>#</th> \
                          <th>Country</th> \
                          <th>Number of posts</th> \
                        </tr> \
                      </thead> \
                      <tbody> \
                        "+ ctbody +" \
                    </tbody></table>"

  var hlabels = ""
  var hitems = ""
  for (var k = 0; k < res["hashtags"].length; k++) {
    var item = "<li style='text-align:right;padding:5 1 20 0;height:0;width:"+res["hashtags"][k]["number"]/5+"px;bottom:"+k*30+"px;left:0'>"+res["hashtags"][k]["number"]+"</li>";
    hitems += item
    var bottom = new String(k * 30 + 25) + "px";
    hlabels += "<span style='position:absolute;bottom:"+bottom+";left:-155px;width:150px;text-align:right'>"
                + res["hashtags"][k]["hashtag"] + "</span>";
  }

  var hashtagsGraph = "<div class='graph half-width'> \
                        <div id='graph'> \
                          <ul>"+hitems+"</ul> \
                        </div> \
                        <div class='horizontal-axis'></div> \
                        <div class='vertical-axis'></div> \
                        <div id='labels' class='labels'>"+hlabels+"</div> \
                      </div>"

  var clabels = ""
  var citems = ""
  for (var k = 0; k < res["countries"].length; k++) {
    var item = "<li style='height:"+res["countries"][k]["number"]/5+"px;bottom:0;left:"+(k*50)+"px'>"+res["countries"][k]["number"]+"</li>";
    citems += item
    var left = new String(k * 50 + 10) + "px";
    clabels += "<span style='position:absolute;top:-16px;left:"+left+
            ";'>" + res["countries"][k]["country"] + "</span>";
  }

  var countriesGraph = "<div class='graph half-width'> \
                        <div id='graph'> \
                          <ul>"+citems+"</ul> \
                        </div> \
                        <div class='horizontal-axis'></div> \
                        <div class='vertical-axis'></div> \
                        <div id='labels' class='labels'>"+clabels+"</div> \
                      </div>"

  content.innerHTML = "<div className='tweets' id='tweets'></div> \
                      <h2>The most used hashtags</h2><div class='row-stats'>" + hashtags + hashtagsGraph + "</div> \
                      <h2>The most active countries</h2><div class='row-stats'> " + countries + countriesGraph + "</div>"
}

var dom_changing_for_charts =  (result) => {
  var res = JSON.parse(result)["resultat"];
  globale = res
  content.innerHTML = "<div class='half-width'> \
                        <canvas id='doughnut-chart' width='800' height='450'></canvas> \
                      </div>\
                      <div class='half-width'> \
                        <canvas id='pie-chart' width='800' height='450'></canvas> \
                      </div> \
                      <div> \
                        <canvas id='bar-chart' width='800' height='450'></canvas> \
                      </div>";
  numbers = []
  users = []
  res["users"].forEach( i => {
    numbers.push(i["number"])
    users.push(i["users"])
  })

  new Chart(document.getElementById("doughnut-chart"), {
      type: 'doughnut',
      data: {
        labels: numbers,
        datasets: [
          {
            label: "Users",
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850", "#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: users
          }
        ]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Number of tweets per user per hour'
        }
      }
  });

  nbrs = []
  sources = []
  res["sources"].forEach( i => {
    nbrs.push(i["number"])
    sources.push(i["source"])
  })

  new Chart(document.getElementById("pie-chart"), {
      type: 'pie',
      data: {
        labels: sources,
        datasets: [
          {
            label: "Users",
            backgroundColor: ["#8e5ea2","#3cba9f","#e8c3b9","#c45850", "#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: nbrs
          }
        ]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Top sources'
        }
      }
  });

  nbs = []
  minutes = []
  sum = 0
  res["posts"].forEach( i => {
    nbs.push(i["number"])
    minutes.push(i["minute"])
    sum += i["number"]
  })

  new Chart(document.getElementById("bar-chart"), {
      type: 'bar',
      data: {
        labels: minutes,
        datasets: [
          {
            label: "Users",
            backgroundColor: "#004963",
            data: nbs
          }
        ]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Number of tweets per minute (moy = '+new String(sum/60)+')'
        }
      }
  });
}


function loading() {
  try {
    var load = document.getElementById("load").innerHTML;

  } catch(e) {
    document.getElementById("pagination").style.display = "none";
    document.getElementById("content").innerHTML = "<div style='width:100%' id='load'> \
                                                      Loading... \
                                                      <div class='bird'> \
                                                        <i class='fa fa-twitter fa-lg'></i> \
                                                      </div> \
                                                    </div>"
                                                    + document.getElementById("content").innerHTML;
  }
}

function draw(y,x) {
  var map = document.getElementById("map")
  var icon = document.createElement("i")
  var b = map.clientHeight
  var a = map.clientWidth
  var point = degrees_to_map(x,y,a,b)
  icon.className = "fa fa-map-marker fa-lg"
  point.y = -point.y + b/2
  point.x = point.x + a/2

  //calculer le decalage par rapport à l'origine de la map
  var centre_svg = {y:-5.981997, x:11.591195}
  var point_central = degrees_to_map(centre_svg.x,centre_svg.y,a,b)

  point.x = (point.x - point_central.x) % a
  point.y = (point.y + point_central.y) % b

  icon.style.left = point.x+"px"
  icon.style.top = point.y+"px"
  icon.style.position = "absolute"
  map.appendChild(icon)
}
