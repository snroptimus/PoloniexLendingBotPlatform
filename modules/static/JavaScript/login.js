var loginName;
var loginPass;

var regName;
var regPass;
var regPassAgain;
var regEmail;

var confHash;

var Register = React.createClass({
  usernameChange: function(e) {
    regName = e.target.value;
  },
  passwordChange: function(e) {
    regPass = e.target.value;
  },
  confirmChange: function(e) {
    regPassAgain = e.target.value;
    if (regPass != regPassAgain){
      onCheckPass(false);
    }else{
      onCheckPass(true);
    }
  },
  emailChange: function(e) {
    regEmail = e.target.value;
    onCheckMail(regEmail);
  },
  render: function() {
    return (
        <div id="regParent">
        <input id="id_regname" type="text" placeholder="name" onChange={this.usernameChange} onBlur={onCheckName}/>
        <input id="id_regpass" type="password" placeholder="password"  onChange={this.passwordChange}/>
        <input id="id_regconf" type="password" placeholder="confirm password"  onChange={this.confirmChange}/>
        <input id="id_regmail" type="text" placeholder="email address"  onChange={this.emailChange}/>
        <button onClick={onRegister}>register</button>
        <p className="message">Already registered? <a href="#">Sign In</a></p>
        </div>
    );
  }
});

var Login = React.createClass({
  usernameChange: function(e) {
    loginName = e.target.value;
  },
  passwordChange: function(e) {
    loginPass = e.target.value;
  },
  render: function() {
    return (
        <div>        
        <input type="text" placeholder="username" onChange={this.usernameChange}/>
        <input type="password" placeholder="password" onChange={this.passwordChange}/>
        <button onClick={onLogin}>login</button>
        <p className="message">Not registered? <a href="#">Create an account</a></p>
        </div>
    );
  }
});

var Verify = React.createClass({
  hashChange: function(e) {
    confHash = e.target.value;
  },
  render: function() {
    return (
        <div>        
        <i className="fa fa-envelope fa-logo" aria-hidden="true"></i>
        <h1>Verify your email address</h1>
        <p className="thanks">Please check your email to verify your account. Thank you.</p>
        <input type="number" placeholder="Enter your code" onChange={this.hashChange}/>
        <button onClick={onVerify}>Verify</button>
        </div>
    );
  }
});

ReactDOM.render(
  <Register/>,
  document.getElementById('register')
);
ReactDOM.render(
  <Login/>,
  document.getElementById('login')
);
ReactDOM.render(
  <Verify/>,
  document.getElementById('verify')
);
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function onLogin(){
  var csrftoken = getCookie('csrftoken');

  // console.log("user : " + loginName);
  // console.log("pass : " + loginPass);
  // console.log("cookie : " + csrftoken);

  if ((loginName == undefined) || (loginPass == undefined) || (loginName == '') || (loginPass == '')){
    $('.alert').css('display', 'block');
  }
  else{
    $.ajax({
      type : 'POST',
      url : 'login',
      data:{
        name : loginName,
        pass : loginPass,
        csrfmiddlewaretoken : csrftoken,
      },
      success : function(data){
        if (data == "home"){
          $('.alert').css('display', 'none');
          document.cookie = 'login=true;';
          document.cookie = 'username=' + loginName;
          window.location = "/home";
        }
        else if (data == "failed"){
          $('.alert').css('display', 'block');
        }        
      },
      error : function(data){
        console.log(data);
      }
    });
  }  
}
function onRegister(){
  var csrftoken = getCookie('csrftoken');

  // console.log("user : " + regName);
  // console.log("pass : " + regPass);
  // console.log("conf : " + regPassAgain);
  // console.log("mail : " + regEmail);
  // console.log("cookie : " + csrftoken);
  var ret = validateEmail(regEmail);

  if ((ret == false) || (regName == undefined) || (regPass == undefined) || (regPassAgain == undefined) || (regEmail == undefined) || 
    (regName == '') || (regPass == '') || (regPassAgain == '') || (regEmail == '') || (regPass != regPassAgain)){
    $('.alert').css('display', 'block');
  }
  else{
    $.ajax({
      type : 'POST',
      url : '/register',
      data:{
        name : regName,
        pass : regPass,
        email : regEmail,
        csrfmiddlewaretoken : csrftoken,
      },
      success : function(data){
        $('.alert').css('display', 'none');
        console.log(data);
        if (data == "wait"){
//          $("#loginform").css('display', 'none');
//          $("#verifyform").css('display', 'block');
            document.cookie = 'login=true;';
            document.cookie = 'username=' + regName;
            window.location = "/home";
        }
        else{
        }
      },
      error : function(data){
        console.log(data);
      }
    });
  }
}
function onCheckName(){
  var csrftoken = getCookie('csrftoken');
  
  $.ajax({
      type : 'POST',
      url : '/chksamename',
      data:{
        name : regName,
        csrfmiddlewaretoken : csrftoken,
      },
      success : function(data){
        console.log(data);
        if (data == "success"){
          $("#id_regname").css("color", 'black');
        }else{
          $("#id_regname").css("color", 'red');
        }
      },
      error : function(data){
        console.log(data);
      }
    });
}
function onVerify(){
  var csrftoken = getCookie('csrftoken');

  if ((regName == undefined) || (regPass == undefined) || (regEmail == undefined) || (confHash == undefined) ||
    (regName == '') || (regPass == '') || (regEmail == '') || (confHash == '')){
      console.log("error - start");
  }
  else{
    $.ajax({
      type : 'POST',
      url : '/confirm',
      data:{
        name : regName,
        pass : regPass,
        email : regEmail,
        hash : confHash,
        csrfmiddlewaretoken : csrftoken,
      },
      success : function(data){
        console.log(data);
        if (data == "success"){
          window.location = "/home"
        }
        else{
        }
      },
      error : function(data){
        console.log(data);
      }
    });
  }
}
function onCheckPass(param){
  if (param == true){
    $("#id_regconf").css("color", "black");
  }else{
    $("#id_regconf").css("color", "red");
  }
}
function onCheckMail(param){
  if (validateEmail(param) == true){
    $("#id_regmail").css("color", "black");
  }else{
    $("#id_regmail").css("color", "red");
  }
}
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
$('.message a').click(function(){
    $('.anim').animate({height: "toggle", opacity: "toggle"}, "slow");
    $('.alert').css('display', 'none');
});