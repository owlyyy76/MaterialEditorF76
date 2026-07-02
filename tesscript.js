// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
	hash = hashes[i].split('=');
	vars.push(hash[0]);
	vars[hash[0]] = hash[1];
    }
    return vars;
}

function addCell(row, html) {
	var cell = document.createElement("TD");
	cell.innerHTML = html;
	row.appendChild(cell);
}

function DevLog(s)
{
//	console.log(s);
}

var currentPort = "8080";

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function GetIPFromGlobals()
{
	var ip = getURLParameter('ip');
	if (ip == undefined || ip == null || ip == "null" || ip == "") {
		ip = "127.0.0.1";
	}
	return ip;
}


function httpHeader()
{
	var ip = GetIPFromGlobals();
	return "http://"+ip+":"+currentPort+"/";
}

function SetEditorPort()
{
    currentPort = "8081";
}

function SetGamePort()
{
    currentPort = "8080";
}