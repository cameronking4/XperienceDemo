document.getElementById('body').innerHTML += ' <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
<script nomodule src="https://unpkg.com/@google/model-viewer/dist/model-viewer-legacy.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.js" integrity="sha512-djAJLNukP3WdWmwP/Y05w99aCX6u1jInpshdwiUKbXcQ9y/8BpMtsPsVrVyUbmtEx7wbqFpBq4sGOnIFVScFQQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://www.gstatic.com/firebasejs/9.9.4/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.9.1/firebase.js"></script>
<script>
// XPERIENCE SHOPPING AVATAR DEMO SCREEN
// Developed by Cameron King (github.com/cameronking4)
var config = { apiKey: "AIzaSyDkVMB1m0DpAGIubJTpccff4ygaILhvPC4", authDomain: "xperience-webapp.firebaseapp.com", projectId: "xperience-webapp", storageBucket: "xperience-webapp.appspot.com", messagingSenderId: "522353425940", appId: "1:522353425940:web:a1325dc14e4e6485f67101"}; 
firebase.initializeApp(config);
var fileInput = document.getElementById('downloadBtn');
let XperienceID = localStorage.getItem('XperienceID');
let XperienceSuccess = localStorage.setItem('XperienceScanSuccess', false);
let XperienceAvatar;
var XPERIENCEAVATAR; //avatar scan link (expires)
var OBJfile; // converted GLB 2 OBJ file for measurement routine 
const input = document.getElementById('fileupload');
const link = document.getElementById('link');
var TAG; // ghost download tag
var GIBBLY; // final GLB file (Avatar source)
var BLOB; // temporary GLB file
var objResulted = false;
var myOBJzip; var myOBJFinal;
const PREFACE = "https://pure-castle-48918.herokuapp.com/"
var mStatus = document.getElementById('MeasurementStatus');
var mStatusButton = document.getElementById('MeasurementStatusBtn');
var statusText = document.getElementById('statusText');
var aBlob; var newZipEntry;
let measureRequest = '';
let fbOBJurl;
var measurements;

var myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", "Bearer MnyJqyXV7Ooi3f6gAAejMbDwcfWOXxlG9ap0vc0botTvGfoJdT_saBaotdBuuumMdPhxqVqDn0TAN6vzwoPJFg");
var requestOptions = {method: 'GET', headers: myHeaders, redirect: 'follow'};

//Query params
const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('XperienceID')) { XperienceID = urlParams.get('XperienceID');}

// ajax helper
function ajax(a, b, c) { // URL, callback, just a placeholder
	c = new XMLHttpRequest; c.open('GET', a); c.setRequestHeader("Accept", "application/json"); c.setRequestHeader("Authorization", "Bearer MnyJqyXV7Ooi3f6gAAejMbDwcfWOXxlG9ap0vc0botTvGfoJdT_saBaotdBuuumMdPhxqVqDn0TAN6vzwoPJFg"); c.onload = b; c.send();
}

// Functions //

function fetchFromURLandConvert(url) {
	fetch(url, { method: 'get'})
   .then(res => res.blob()).then(file => {
      var newFile = new File([file], "model_T.glb", {type: "model/gltf-binary", lastModified:new Date().getTime()});
      GIBBLY = newFile;
      var storageRef = firebase.storage().ref('glb/' + XperienceID + ".glb");
      var task = storageRef.put(GIBBLY);
      let fbGLB = storageRef.getDownloadURL().then(function(downloadURL) {
        localStorage.setItem('XperienceGLBurl', downloadURL);
        fileInput.href = downloadURL;
        return downloadURL;});
      task.on('state_changed', function progress(snapshot) {}, function error(err) {}, function complete(percentage) {}); 

      var newHeaders = new Headers();
      newHeaders.append("Referer", "https://fabconvert.com/convert/x/to/obj"); newHeaders.append("Accept-Encoding", "gzip, deflate, br"); newHeaders.append("Accept", "*/*");
      var formdata = new FormData();
      formdata.append("PageId", "1"); formdata.append("FromId", "22"); formdata.append("ToId", "6"); formdata.append("to:", "obj"); formdata.append("ImageFilename", "XperienceAvatar.glb"); formdata.append("Files", newFile);
      var requestOptions = { method: 'POST', headers: newHeaders, body: formdata };

   		 fetch("https://fabconvert.com/Home/ConvertFile", requestOptions)
        .then(res => res.text())
        .then(function (html) {
          objResulted = true;
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          HREF= doc.getElementById('targetFile'); HREF.click(); OBJfile = HREF.href;
          getZipFile(OBJfile,'XperienceOBJ', 'application/zip');
        })
        .catch(error => console.log('error', error));
      
    })
    .catch((ex) => {
      console.log("Unable to download GLB blob");
      console.log(ex);
    });
}

function getZipFile(url, name, type){
	 fetch(url, { method: 'get'})
   .then(res => res.blob()).then(file => {
    	var newFile = new File([file], name, {type: 'application/zip', lastModified:new Date().getTime()});
      myOBJzip = newFile;
      parseZipFile(myOBJzip);
      mStatus.innerHTML = "STATUS UPDATE: STARTED (GLB file successfully zipped to OBJ format)"
    })
    .catch((ex) => {console.log(ex);});
}

function parseZipFile(zipFile) {
  JSZip.loadAsync(zipFile).then(
    function(zip) {
		 const fileParsePromises = [];
     zip.forEach(function(relativePath, zipEntry) {
        console.log(' -> Parsing ' + zipEntry.name + ' ...');
        fileParsePromises.push(
          zipEntry.async('string').then(function(data) {
            aBlob = data; newZipEntry = zipEntry;           
            return { name: zipEntry.name, textData: data, zipEntry: zipEntry};}));
      });
      Promise.all(fileParsePromises).then(processDecompressedFiles);
    },
    function(error) { console.error('An error occurred processing the zip file.', error);
    });
}

function processDecompressedFiles(decompressedFiles) {
		var binaryData = [];
    binaryData.push(aBlob);
    myOBJzip = window.URL.createObjectURL(new Blob(binaryData, {type: "application/object"}))
 	  var newFile = new File(binaryData, 'XperienceAvarar.obj', {type: 'application/object', lastModified:new Date().getTime()});
    myOBJFinal = newFile;
    var storageRef = firebase.storage().ref('obj/' + XperienceID + ".obj");
		var task = storageRef.put(myOBJFinal);
    task.on('state_changed', 
        function progress() {}, function error(err) {}, function complete() {}
    ); 
    fbOBJurl = storageRef.getDownloadURL().then(function(downloadURL) {localStorage.setItem('XperienceOBJurl', downloadURL);});
    console.log('Final OBJ returned');
    mStatus.innerHTML = "STATUS UPDATE: LOADED (OBJ format loaded, now processing...)"
}

async function getMeasureRequest(objURL) {
	var myHeaders = new Headers();
  myHeaders.append("Origin", "https://photo-to-3d.3dmeasureup.com");
  myHeaders.append("x-api-key", "NnDJOObcpItYZQPySFKJURBeZEmNvqjZCRSvlPhYV");
  myHeaders.append("Content-Type", "application/json");
  console.log(fbOBJurl);
  var raw = JSON.stringify({ "type": "all", "fileurl": fbOBJurl, "auto_align": true, "filesource": "url", "filetype": "obj", "output": "json"});

  const request = await fetch(PREFACE +"https://api.3dmu.prototechsolutions.com/prod/models/measure", { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow'})
    .then(res => res.json()) 
  	.then(data => {
    	measureRequest = data.requestId;
      console.log('MEASURE REQUEST ', measureRequest);
      mStatus.innerHTML = "STATUS UPDATE: THE MAGIC IS HAPPENING! (Analyzing OBJ file....)"
    })
    .catch(error => console.log('error', error));
  this.request = request;

 	function calculate() {
 	 fetch(PREFACE +"https://api.3dmu.prototechsolutions.com/prod/models/metrics?requestId=" + measureRequest, {method: 'GET', headers: myHeaders, redirect: 'follow'})
    .then(res => res.json()) 
  	.then(data => {
      if(data.statusCode == "200"){
        measurements = data.body.result;
        localStorage.setItem('xMeasurements', measurements);
        console.log('MEASUREMENTS CALCULATED', measurements);
        statusText.innerHTML = 'Your measurements have been calculated!';
        mStatus.style.display = 'none'; mStatusButton.style.display = 'flex'; mStatusButton.href = '/measurements';
      }
      else{ setTimeout(calculate, 3000); }
    })
    .catch(error => console.log('error', error));
  }
  setTimeout(calculate, 1000);
}

function refresh() {
	//Poll for avatar results, if exists, break cycle & display assets
  let vData = localStorage.getItem('XperienceGLBurl');
  let xMeasure = localStorage.getItem('xMeasurements');
  if( vData != null || xMeasure == true) {
  	modelViewer.src = PREFACE + vData;
    statusText.innerHTML = 'Your measurements have been calculated!';
    mStatus.style.display = 'none'; mStatusButton.style.display = 'flex';
    mStatusButton.href = '/measurements'; fileInput.href = vData;
    console.log(xMeasure);
  }
  else {
    if (XPERIENCEAVATAR != null || XperienceSuccess == true) {
      let modelViewer = document.getElementById("modelViewer");
      modelViewer.src = PREFACE + XPERIENCEAVATAR;
      fetchFromURLandConvert(PREFACE + XPERIENCEAVATAR);
      fbOBJurl = localStorage.getItem("XperienceOBJurl");
      getMeasureRequest(fbOBJurl);
    } else { //poll
      ajax(PREFACE + "https://api.developer.in3d.io/scans/" + XperienceID + "/result?type=glb",
       function(e) {
        var data = JSON.parse(this.response);
        XPERIENCEAVATAR = data.url;
      });
      setTimeout(refresh, 1000);
    }
    XperienceSuccess = localStorage.setItem('XperienceScanSuccess', true);
    fileInput.href = XPERIENCEAVATAR;
    fileInput.download = "MyXperienceAvatar.glb";
    }
}
setTimeout(refresh, 1000);
document.getElementById("shareLink").addEventListener("click", navigator.clipboard.writeText(window.location).then(() => {alert('Xperience Avatar link copied!')}, () => {/*failed*/}));
</script> '
