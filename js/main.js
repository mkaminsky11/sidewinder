//set up codemirror
var editor = CodeMirror(document.getElementById("code"), {
	lineNumbers: true
});
var conn = null;
var path = [];
var _s = null;

var Client = require('ssh2').Client;
function connect(){
	conn = new Client();
	conn.on('ready', function() {
		document.getElementById("login_error").style.display = "none";
		conn.sftp(function(err, sftp) {
		    _s = sftp;
		    login();
		});
	}).on('error', function() {
		document.getElementById("login_error").innerHTML = "a login error occured. please check your information and connection.";
		document.getElementById("login_error").style.display = "block";
	}).connect({ //TODO: checking
	  host: document.getElementById("login_host").value,
	  port: 22, //TODO
	  username: document.getElementById("login_username").value,
	  password: document.getElementById("login_password").value
	});
}

function login(){
	get_tree(".");
	document.getElementById("login").style.display = "none";
	document.getElementById("editor").style.display = "block";
	editor.refresh();
	get_path();
}

function get_tree(path){
	_s.readdir(path, function(err, list) {
		//TODO: folders and files
	    list.sort(compare);
	    for(var i = 0; i < list.length; i++){
	    	var _path = path + "/" + list[i].filename;
	    	if(path === "/"){
	    		_path = "/" + list[i].filename;
	    	}
	    	document.getElementById("sidebar_root").innerHTML += "<li onclick='open_file(\""+_path+"\")'>" + list[i].filename + "</li>";
	    }
	});
}

function get_path(){
	exec("pwd", function(data){
		data = data.replace("/","");
		path = data.split("/");
		path = path.reverse();
		path.push("/");
		path = path.reverse();
		//path = "ewoijqpofijqwopeijfqwpoiiopqwopijweiwojwfoiewjoiwjeiowfjwofjewoifjwofiewjoeiwjoiewjoiewjoijoijiojoijiojaboewfjewfoijw".split(""); //TODO: a test
		document.getElementById("path").innerHTML = "";
		for(var i = 0; i < path.length; i++){
			var html = "<div>" + path[i] + "</div>";
			document.getElementById("path").innerHTML += html;
			if(i !== (path.length - 1)){
				document.getElementById("path").innerHTML += "<div><i class='zmdi zmdi-caret-right'></i></div>"
			}
		}
	});
}

function exec(command, _call){
	conn.exec(command, function(err, stream) {
    	stream.on('close', function(code, signal) {
    	}).on('data', function(data) {
    		_call(data + "");
    	}).stderr.on('data', function(data) {
    });
  });
}

function open_file(path){
	_s.readFile(path, {}, function(err, data){
		data += "";
		editor.setValue(data);
	});
}

function compare(a,b) {
  if (a.filename < b.filename)
    return -1;
  if (a.filename > b.filename)
    return 1;
  return 0;
}