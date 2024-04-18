const http = require("http");
const fetch = require("fetch");
const fs = require("fs");

// var FetchStream = require("fetch").FetchStream;
const cors = require("cors");

// Chargement du moteur de rendu des pages
const express = require("express");

// Chargement du viewer à utiliser avec le moteur de rendu
// const hbs = require('hbs')
const hbs = require("express-hbs");

// Pour les stream
// var Stream = require("stream").Transform;

// Charge le fichier qui décrit les caméras
const cameras = require("./cameras");

const app = express();
const port = 8080;

var TRACE = true;

// Autorise tout le monde à faire des requêtes sur ce serveur local (et pas uniquement localhost)
// identique à app.use(cors()) mais plus explicite.
// En mettant le app.use ici, les règles CORS s'appliqueront à toutes les routes, sinon, il faut préciser cors()
// en deuxième paramètre de tous les app.get() concernés.
/* app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
); */

var admin = express(); // Une deuxième instance express()

/* download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
  console.log('done');
}); */

// logo google
const logoGoogle = "https://www.google.com/images/srpr/logo3w.png";

// Déclare au viewer que les pages sont écrites en hbs et fournit le chemin vers les script propres à ces pages.
app.engine(
  "hbs",
  hbs.express4({
    partialsDir: __dirname + "/views/partials",
  })
);
app.set("view engine", "hbs");          // Les pages sont en handlebars (hbs)
app.set("views", __dirname + "/views"); // Fournit le chemin des fichiers .hbs

// Définit des variables locales
app.locals.foo = "bar";
app.locals.title = "HomeServer";
app.locals.logoGoogle = logoGoogle;

// LES ROUTES ADMIN (/admin/xxxxx)
// ================================
// Crée un chemin qui sera un sous-chemin de /admin (voir ci-dessous)
admin.get("/", function (req, res) {
  console.log(admin.mountpath); // /admin
  res.send("Admin Homepage");
});
admin.get("/list", function (req, res) {
  console.log(admin.mountpath+"/list"); // /admin/list
  // Affiche directement dans la page
  res.send("Admin Homepage - List");
  // ou Affiche une page handlebars définie dans un fichier hbs.
  // res.render(__dirname + "/views/home.hbs", {
  //  // Quelques variables passées à la view home.hbs
  //  welcomeMessage: "Bienvenue sur ma page",
  // });
});

// Rattache le bloc de sous chemin à l'app principale
app.use("/admin", admin); // mount the sub app^



// Défini le répertoire des statics
app.use(express.static(__dirname + "/public"));
// Pour pouvoir intégrer directement les définitions depuis node_modules (bootstrap, bootstrap-icons, etc ...)
app.use("/node_modules", express.static(__dirname + "/node_modules"));

// Définition de quelques HELPER pour hbs (handlebars)
// ===================================================

// Un helper qui met en majuscule
hbs.registerHelper("Majuscule", (text) => {
  return text.toUpperCase();
});
// Un helper qui renvoie l'année courante
hbs.registerHelper("getCurrentYear", () => {
  return new Date().getFullYear();
});
hbs.registerHelper("equal", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// Ecouteur express sur la racine
app.get("/", (req, res) => {
  // res.send('Hello World!')
  res.render(__dirname + "/views/home.hbs", {
    // Quelques variables passées à la view home.hbs
    welcomeMessage: "Bienvenue sur ma page",
  });
});


// définie une fonction de chargement asynchrome
//
// in : l'id de la caméra
//
// out : une promise permettant de récupérer l'image
//
function download(id) {
    let oneCam = cameras.find((el) => el.id == id); // Trouve l'enregistrement correspondant à l'id dans l'array cameras[]

    return new Promise((resolve, reject) => {
   
        // Ici, on va reconstituer le stream morceau par morceau
        const chunks = [];

        // On crée un stream pour lire le fichier
        const reader = fs.createReadStream(__dirname + "/image.jpg"); // Pour tester, on lit une image sur disque
        // console.log(stream);
        
        reader.on('data', function (chunk) { 
            console.log(chunk.toString()); 
        }); 

        let imageBase64 = stream.toString("base64"); // COnvertit les données reçues en base64
        // Ajoute le data/url
        let jpgDataUrlPrefix = "data:image/jpeg;base64,";
        let imageDataUrl = jpgDataUrlPrefix + imageBase64;
        
        resolve({ image: imageDataUrl, lieu: "test", errmsg: "ok", idCam: oneCam.id });

        // const stream = fs.createReadStream(
        //     "http://"+oneCam.user+":"+oneCam.pass+"@"+oneCam.host+":"+oneCam.port+"/onvifsnapshot/media_service/snapshot?channel=1&subtype=0"
        // );
        

        // let url = "http://admin:MdpDahua30@192.168.0.182/onvifsnapshot/media_service/snapshot?channel=1&subtype=0"; // Pb car temps de réponse de la caméra trop long
        
        /*
        // Lecture d'une image sur le web
        let url = "http://www.google.com/images/srpr/logo3w.png"; // Ok avec cette url
        const request = http
        .get(url, (res) => {
            // let chunks = [];
            res.on("data", (data) => { // Quand on reçoit un segment du stream
                chunks.push(data);
            });
            res.on("end", () => { // Quand on arrive à la fin du stream
                let imageBase64 = Buffer.concat(chunks).toString("base64"); // COnvertit les données reçues en base64
                // Ajoute le data/url
                let jpgDataUrlPrefix = "data:image/jpeg;base64,";
                let imageDataUrl = jpgDataUrlPrefix + imageBase64;
                console.log("Image "+oneCam.id+" lue ok");
                // console.log(imageDataUrl); // La chaine qui peut être mise dans une balise <img>
                // Résolve la promise
                resolve({ image: imageDataUrl, lieu: "test", errmsg: "ok", idCam: oneCam.id });
            });
            res.on("error", (err) => { // Quand on a une erreur dans le stream reçu
                console.log("Erreur est survenue");
            });
        })
        // Gère les erreurs autres que celles lors de réception du fichier
        .on("error", (err) => {
            console.log("http.get error");
            console.log(err);
            reject({ image: null, lieu: oneCam.lieu, errmsg: "Error http.get", idCam: oneCam.id });
        });
        */


        // Quand la Promise ci-dessus est lancée, on déclenche un timer.
        // Si le Timer prend fin avant avant la promise, c'est probablement dû à un timeout de la cam
        // et on force la promise à Reject.
        // Si c'est la promise ci-dessus qui se termine avant le timer, alors la promise retourne un Resolve (ligne 150)
        // et la sortie de la fonction provoque normalement l'arrêt du timer (à vérifier en ajoutant un console.log() ).

        // Si pas de réponse sous 10 secondes, on reject la promise
        setTimeout(
        () =>
            reject({
                image: null,
                lieu: oneCam.lieu,
                errmsg:
                    "Timeout caméra " +
                    oneCam.lieu +
                    " (" +
                    oneCam.host +
                    ":" +
                    oneCam.port +
                    ")",
            }),
            10000
        );

    }); // fin bloc 'return'
}

app.get("/all", (req, resp) => {

    // Génération array des downloads à faire à partir du tableau des caméras

    let arCam = []; // arCam[] est un array qui contient l'ensemble des promises
    console.log(cameras);
    cameras.forEach((c) => {
        if (c.actif) {
            arCam.push( download(c.id) );
        }
    });

    Promise.allSettled( // Toutes les promises (une par caméra) dont on veut attendre la fin de l'exécution
        /* [
        download(154),
        download(184),
        download(182),
        ] */
        arCam // Fait la même chose que ci-dessus. 
    )
    .then( // Toutes les promises ont-elles reçus un résultat (resolve ou reject). Le .then() n'est effectué que lorsque tous les résultats des promises ont été reçu.
        (results) => { // Résolved //
            // Toutes les promesses sont arrivées (resolu ou rejetée)

            let tbImages = []; // Tableau qui va contenir les images reçues et qui sera transmis à la view allcam.hbs pour affichage.
            results.forEach((result) => {
                // Quand le résultat est 'fulfilled', les données sont dans result.value avec l'image
                // Quand le résultat est 'rejected', les données sont dans result.reason avec la raison du rejet
                // console.log(result);
                if (result.status == "fulfilled") { // Si c'est fulfilled (=image bien reçue), on stock l'image dans tbImages[]
                    // 'fulfilled' ou 'rejected'
                    // console.log("fulfilled");
                    tbImages.push({
                        erreur: 0,
                        image: result.value.image,
                        lieu: result.value.lieu,
                        errmsg: result.value.errmsg,
                        idCam: result.value.idCam,
                    });
                } else {
                    // console.log("erreur");
                    tbImages.push({
                        erreur: 1,
                        image: null,
                        lieu: result.reason.lieu,
                        errmsg: result.reason.errmsg,
                        idCam: result.reason.idCam,
                    });
                }
            }); // fin block 'foreach'

        resp.render(__dirname + "/views/allcam.hbs", {
          images: tbImages,
        });
      },
      (results) => { // rejected //
        // On ne fait rien car pas d'image reçu (à cause timeout ou erreur).
        // on pourrait mettre dans tbImages un image qui ferait comprendre que l'image caméra n'est pas disponible.
      }
    ) // fin block 'then'
    .catch((e) => {
        console.log(e);
        resp.render(__dirname + "/views/allcam.hbs", {
            image: null,
            lieu: "*aucun*",
            errmsg: "*erreur dans le then() de du Promise.all()",
            erreur: 1,
        });
    });
});


app.get("/display", (req, res) => {
    const request = http.get( "http://www.google.com/images/srpr/logo3w.png", (res) => {
        // let chunks = [];
        res.on("data", (data) => { // Quand on reçoit un segment du stream
            chunks.push(data);
        });
        res.on("end", () => { // Quand on arrive à la fin du stream
            let imageBase64 = Buffer.concat(chunks).toString("base64"); // COnvertit les données reçues en base64
            // Ajoute le data/url
            let jpgDataUrlPrefix = "data:image/jpeg;base64,";
            let imageDataUrl = jpgDataUrlPrefix + imageBase64;
            console.log("image lue ok");
            console.log(imageDataUrl);
            // Résolve la promise
            resolve({ image: imageDataUrl, lieu: "test", errmsg: "ok" });
        });
        res.on("error", (err) => { // Quand on a une erreur dans le stream reçu
            console.log("Erreur est survenue");
        });
    });

});

app.listen(port, (err) => {
  if (err) throw err.message;
  console.log(`Lancement serveur WEBCAM sur http://localhost:${port}`);
});