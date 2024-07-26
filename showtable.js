
  // Used to toggle the menu on small screens when clicking on the menu button
  function toggleFunction(){
    var header = document.getElementById("top");
    var mobileheader = document.getElementById("mobile-menu");
    var headerheight = header.clientHeight;

    var isClosed = header.clientHeight === 43;
    if (isClosed){
        header.style.height = "auto";
    }
    else{
        header.style.height = "43px";
    }

    var menuItems = document.querySelectorAll('#nav li a[href*="#"]');
    for (var i = 0; i<menuItems.length; i++){
        var menuItem = menuItems[i];

        menuItem.onclick = function(){
            header.style.height = "43px";
        }
    }
  }

  function redirecttoGithub(nameofproject){
        if (nameofproject === "crawl"){
            window.open("https://github.com/edithh81/crawlGraduationExamHG");
        }
        else if (nameofproject === "ship"){
            window.open("https://github.com/edithh81/CO2007_ComputerArchitecture_SEM231");
        }
        else{
            window.open("https://github.com/edithh81");
        }
    }