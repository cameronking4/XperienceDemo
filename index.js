<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
<script nomodule src="https://unpkg.com/@google/model-viewer/dist/model-viewer-legacy.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.js"
  integrity="sha512-djAJLNukP3WdWmwP/Y05w99aCX6u1jInpshdwiUKbXcQ9y/8BpMtsPsVrVyUbmtEx7wbqFpBq4sGOnIFVScFQQ=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>
<script>

// XPERIENCE SHOPPING AVATAR DEMO SCREEN
// Developed by Cameron King (github.com/cameronking4)

//VARIABLES
var fileInput = document.getElementById('downloadBtn');
let XperienceID = localStorage.getItem('XperienceID');
let XperienceSuccess = localStorage.setItem('XperienceScanSuccess', false);
let XperienceAvatar;
//let objectURL;
var XPERIENCEAVATAR; //avatar scan link (expires)
var OBJfile; // converted GLB 2 OBJ file for measurement routine 
const input = document.getElementById('fileupload');
const link = document.getElementById('link');
var TAG; // ghost download tag
var GIBBLY; // final GLB file (Avatar source)
var BLOB; // temporary GLB file

const glbMType = "model/gltf-binary";
const zipMType = "application/zip";
const objMType = "application/object";

var objResulted = false;

var myOBJzip;
var myOBJFinal;

const PREFACE = "https://pure-castle-48918.herokuapp.com/"
var myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", "Bearer MnyJqyXV7Ooi3f6gAAejMbDwcfWOXxlG9ap0vc0botTvGfoJdT_saBaotdBuuumMdPhxqVqDn0TAN6vzwoPJFg");
var requestOptions = {
	method: 'GET',
	headers: myHeaders,
	redirect: 'follow'
};

//QUERY PARAMETERS
const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('XperienceID')) {
	XperienceID = urlParams.get('XperienceID');
}

// UTILITIES 

// ajax helper
function ajax(a, b, c) { // URL, callback, just a placeholder
	c = new XMLHttpRequest;
	c.open('GET', a);
	c.setRequestHeader("Accept", "application/json");
	c.setRequestHeader("Authorization", "Bearer MnyJqyXV7Ooi3f6gAAejMbDwcfWOXxlG9ap0vc0botTvGfoJdT_saBaotdBuuumMdPhxqVqDn0TAN6vzwoPJFg");
	c.onload = b;
	c.send();
}

//download file from URL & set filename
function downloadFile(url, fileName) {
  fetch(url, { method: 'get', mode: 'no-cors', referrerPolicy: 'no-referrer' })
    .then(res => res.blob())
    .then(res => {
      const aElement = document.createElement('a');
      aElement.setAttribute('download', fileName);
      const href = URL.createObjectURL(res);
      aElement.href = href;
      aElement.setAttribute('target', '_blank');
      aElement.click();
      URL.revokeObjectURL(href);
    });
};

// Check a file blob by downloading
function checkFile(fileBytes, name){
	 const href = URL.createObjectURL(fileBytes);
   downloadFile(href, name);
}


// Functions //

function fetchGLBblob(url) {
	fetch(url).then(res => res.blob()).then(file => {
  	//console.log(file);
		let tempUrl = URL.createObjectURL(file);
		const aTag = document.createElement("a");
		aTag.href = tempUrl;
		aTag.value = tempUrl;
		aTag.src = tempUrl;
		aTag.download = "XperienceAvatar.glb";
		document.body.appendChild(aTag);
		//console.log(tempUrl);
		BLOB = tempUrl;
    GIBBLY = new File([BLOB], "XperienceAvatarGenerated.glb", {type:"model/gltf-binary", lastModified:new Date().getTime()});
	  //aTag.click();
		TAG = aTag;
		URL.revokeObjectURL(tempUrl);
	}).catch(() => {
		console.log("Unable to download GLB blob");
	});
}

function fetchFromURLandConvert(url) {
  
	fetch(url, { method: 'get'})	
   .then(res => res.blob()).then(file => {
    //BLOB = file;
    var newFile = new File([file], "model_T.glb", {type: "model/gltf-binary", lastModified:new Date().getTime()});
    localStorage.setItem('XperienceAvatarGLB', newFile);
    console.log(newFile);
    //blobURl = URL.createObjectURL(file);
   	//BLOB = BLOB.slice(0, BLOB.size, 'model/gltf-binary');
    //console.log(BLOB);
    var newHeaders = new Headers();
    newHeaders.append("Referer", "https://fabconvert.com/convert/x/to/obj");
    newHeaders.append("Accept-Encoding", "gzip, deflate, br");
    newHeaders.append("Accept", "*/*");

    var formdata = new FormData();
    formdata.append("PageId", "1");
    formdata.append("FromId", "22");
    formdata.append("ToId", "6");
    formdata.append("to:", "obj");
    formdata.append("ImageFilename", "XperienceAvatar.glb");
    formdata.append("Files", newFile);

    var requestOptions = {
      method: 'POST', headers: newHeaders, body: formdata
    };

    fetch("https://fabconvert.com/Home/ConvertFile", requestOptions)
      .then(res => res.text())
      .then(function (html) {
      	objResulted = true;
        var parser = new DOMParser();
				var doc = parser.parseFromString(html, 'text/html');
        //console.log(html);
        HREF= doc.getElementById('targetFile');
        HREF.click();
        OBJfile = HREF.href;
        console.log(OBJfile);
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
	console.log("getting zip file from url: " + url);
	fetch(url, { method: 'get'})
   .then(res => res.blob()).then(file => {
    	var newFile = new File([file], name, {type: type, lastModified:new Date().getTime()});
      parseZipFile(newFile);
    })
    .catch((ex) => {
      console.log("Unable to extract OBJ from Zip file");
      console.log(ex);
    });
}

function parseZipFile(zipFile) {
  console.log('Parsing zip file ' + zipFile.name + ' ...');
  // read the zip file
  JSZip.loadAsync(zipFile).then(
    function(zip) {
      // get a promise for decoding each file in the zip
      const fileParsePromises = [];
      // note zip does not have a .map function, so we push manually into the array
      zip.forEach(function(relativePath, zipEntry) {
        console.log(' -> Parsing ' + zipEntry.name + ' ...');
        // parse the file contents as a string
        fileParsePromises.push(
          zipEntry.async('string').then(function(data) {
            console.log(' -> Finished parsing ' + zipEntry.name);
            return {
              name: zipEntry.name,
              textData: data,
              zipEntry: zipEntry,
            };
          })
        );
      });
      // when all files have been parsed run the processing step with
      // the text content of the files.
      Promise.all(fileParsePromises).then(processDecompressedFiles);
    },
    function(error) {
      console.error('An error occurred processing the zip file.', error);
    }
  );
}

function processDecompressedFiles(decompressedFiles) {
  console.log('Got decompressed files', decompressedFiles);
  var newFile = new File([decompressedFiles[0].zipEntry], decompressedFiles[0].name, {type: 'application/object', lastModified:new Date().getTime()});
  myOBJFinal = newFile;
  localStorage.setItem('XperienceAvatarOBJ', newFile);
  console.log('Final OBJ returned');
}

function getZipFile(url, name, type){
	console.log("getting zip file from url: " + url);
	fetch(url, { method: 'get'})
   .then(res => res.blob()).then(file => {
    	var newFile = new File([file], name, {type: type, lastModified:new Date().getTime()});
      parseZipFile(newFile);
    })
    .catch((ex) => {
      console.log("Unable to extract OBJ from Zip file");
      console.log(ex);
    });
}

function refresh() {
	//Poll for avatar results, if exists, break cycle & display assets
	if (XPERIENCEAVATAR != null || XperienceSuccess == true) {
		let modelViewer = document.getElementById("modelViewer");
		modelViewer.src = PREFACE + XPERIENCEAVATAR;
    fetchFromURLandConvert(PREFACE + XPERIENCEAVATAR);
    //convertToOBJ(GIBBLY);
	} else { //poll
		ajax(PREFACE + "https://api.developer.in3d.io/scans/" + XperienceID + "/result?type=glb",
		 function(e) {
			//console.log(this.response);
			var data = JSON.parse(this.response);
			XPERIENCEAVATAR = data.url;
			console.log("XPERIENCE AVATAR DOWNLOAD LINK: ", XPERIENCEAVATAR);
		});
		setTimeout(refresh, 1000);
	}
	XperienceSuccess = true;
  localStorage.setItem('XperienceScanSuccess', true);
  localStorage.setItem('XperienceAvatarLink', XPERIENCEAVATAR);
	fileInput.href = XPERIENCEAVATAR;
	fileInput.download = "MyXperienceAvatar.glb";
}


// LFG!!

setTimeout(refresh, 3000);

</script>
