    //globals
    var numberInRow = 0;
    var enigma = [];
    var colorArray = ['black', 'blue', 'brown', 'green', 'orange', 'red', 'white', 'yellow'];
    var colorCircleArray = ['blackCircle', 'blueCircle', 'brownCircle', 'greenCircle', 'orangeCircle', 'redCircle', 'whiteCircle', 'yellowCircle'];
    var letterArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    var remainingCombos = [];


    //this function returns the mystery (e.g. the enigma or secretcode)
    function createMystery() {
      var arrVar = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      var newArr = [];
      var top = 7;
      while (newArr.length < 4) {
        var mathRandomVar = Math.floor(Math.random() * (1 + top - 0)) + 0;
        var elementVar = arrVar.splice(mathRandomVar, 1);
        newArr.push(elementVar[0]);
        top = top - 1;
      }
      return newArr;
    };

    //this function returns a hint from a remote server.  it is not used
    //except to illustrate how the json package goes back and forth
    //the function that is used is below.  its called checkGuessRemote
    function dev(guessRemote, enigmaRemote, row) {
      var reqObj = new Object();
      reqObj.guess = guessRemote;
      reqObj.enigma = enigmaRemote;
      console.log("This is the object that is being sent to the server (BEFORE its converted to JSON):", reqObj )
      console.log("This is the object that is being sent to the server (AFTER  its converted to JSON):", JSON.stringify(reqObj) )
      console.log("This is it's type:", typeof(JSON.stringify(reqObj)) )
      fetch('/checkguess', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*'
          },
          body: JSON.stringify(reqObj),
          //credentials: "same-origin"
          credentials: "include"
        })
        .then((response) => {
          return response.json();
        })
        .then((resp) => {
          console.log("This is the object that is being returned from the server (after it has been converted from JSON three lines up)", resp)
          hint = JSON.parse(JSON.stringify(resp));
        })
        .catch((err) => {
          // Code called when an error occurs during the request
          alert('Error: ' + err.message);
        });

    }


    //this function returns a hint from a remote server in
    function checkGuessRemote(guessRemote, enigmaRemote, row) {
      var reqObj = new Object();
      reqObj.guess = guessRemote;
      reqObj.enigma = enigmaRemote;

      fetch('/checkguess', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*'
          },
          body: JSON.stringify(reqObj),
          //credentials: "same-origin"
          credentials: "include"
        })
        .then((response) => {
          return response.json();
        })
        .then((resp) => {
          console.log(resp);
          var hint = resp;
          addPegs(hint.whitePegs, hint.blackPegs, row + 1);
        })
        .catch((err) => {
          // Code called when an error occurs during the request
          alert('Error: ' + err.message);
        });

    }


    //used for development
    function debug(arr) {
      document.write("<br><br>--------------------------<br><br>")
      for (var i = 0; i < arr.length; i++) {
        document.write(arr[i] + ', ');
      };
    }

    function allowDrop(ev) {
      ev.preventDefault();
    }

    function drag(ev) {
      ev.dataTransfer.setData("Text", ev.target.id);
    }

    function drop(ev) {
      ev.preventDefault();
      var data = ev.dataTransfer.getData("Text");
      if (ev.target.id == 'colorSelector') {
        ev.target.appendChild(document.getElementById(data));
        numberInRow = numberInRow - 1;
        if (numberInRow < 4) {
          document.getElementById('checkGuess').disabled = true;
        }
      } else if (ev.target.innerHTML == '') {
        //prevents circle from being dropped on top of another circle
        ev.target.appendChild(document.getElementById(data));
        numberInRow = numberInRow + 1;
        if (numberInRow == 4) {
          document.getElementById('checkGuess').disabled = false;
        }
      }
      //ev.target.removeAttribute('ondragover');
    }

    function populateRows() {
      for (var y = 0; y < 10; y++) {
        var divvar = document.createElement('div');
        divvar.setAttribute('class', 'guess');
        divvar.setAttribute('id', y);
        document.getElementById('mastermindBoard').appendChild(divvar);

        for (var i = 0; i < 4; i++) {
          var colVar = document.createElement('div');
          colVar.setAttribute('class', 'dropDiv');
          colVar.setAttribute('ondrop', 'drop(event)')
          colVar.setAttribute('id', y + '_' + i);
          divvar.appendChild(colVar);
        };
        var pegVar = document.createElement('div');
        pegVar.setAttribute('id', y + '_' + 'peg');
        pegVar.setAttribute('class', 'pegDiv');
        divvar.appendChild(pegVar);
      };
    }

    //this function goes up the rows and takes out the draggable in any rows where there are already dots
    //it then finds the first row that doesnt have any dots and allows the drop event
    //it also returns the row with the answer
    function guessFinished() {
      for (var y = 10 - 1; y >= 0; y--) {
        for (var i = 4 - 1; i >= 0; i--) {
          var ref = y + '_' + i;
          var innerHTMLVar = document.getElementById(ref).innerHTML;
          if (innerHTMLVar == '') {
            // populateColorSelector(y);
            for (var z = 0; z <= 3; z++) {
              ref = y + '_' + z;
              document.getElementById(ref).setAttribute('ondragover', 'allowDrop(event)');
              var lowerY = y + 1;
              var previousRef = lowerY + '_' + z;
              if (y < 9) {
                document.getElementById(previousRef).firstChild.removeAttribute('draggable');
              }
            };
            return y;
          } else {
            document.getElementById(ref).removeAttribute('ondragover');
          }
        };
      };

    }

    function populateColorSelector(row) {
      document.getElementById('colorSelector').innerHTML = '';

      for (var i = 0; i < colorArray.length; i++) {
        var divvar = document.createElement('div');
        var classNameCircle = colorArray[i] + 'Circle';
        divvar.setAttribute('class', classNameCircle);
        var idVar = 'colorSelect' + i + '_' + row;
        divvar.setAttribute('id', idVar);
        divvar.setAttribute('draggable', 'true');
        divvar.setAttribute('ondragstart', 'drag(event)')
        document.getElementById('colorSelector').appendChild(divvar);

        var anchor = document.createElement('a');
        divvar.appendChild(anchor);

        document.getElementById('checkGuess').disabled = 'true';
        numberInRow = 0;
      };
    }

    function init() {
      enigma = createMystery();
      populateRows();
      var row = guessFinished();
      populateColorSelector(row);
      document.getElementById('hint').style.display = 'none';
    }

    function checkUsersAnswer() {
      var row = guessFinished();
      populateColorSelector(row);
      var guess = extractAnswer(row);
      //Using local hint algo:
      //var hint = checkGuess(guess,enigma);
      //Using remote hint algo:
      var guessRemote = [];
      var enigmaRemote = [];
      for (var i = 0; i < guess.length; i++) {
        var index = letterArray.indexOf(guess[i])
        guessRemote.push(colorArray[index])
        index = letterArray.indexOf(enigma[i])
        enigmaRemote.push(colorArray[index])
      }
      checkGuessRemote(guessRemote, enigmaRemote, row)
    }

    function addPegs(whitePegs, blackPegs, row) {
      var rowPegRef = row + '_' + 'peg';
      for (var i = 0; i < whitePegs; i++) {
        var whiteVar = document.createElement('div');
        whiteVar.setAttribute('class', 'whitePeg');
        document.getElementById(rowPegRef).appendChild(whiteVar);
      };
      for (var i = 0; i < blackPegs; i++) {
        var blackVar = document.createElement('div');
        blackVar.setAttribute('class', 'blackPeg');
        document.getElementById(rowPegRef).appendChild(blackVar);
      };

    }

    function extractAnswer(row) {
      var answerArray = [];
      for (var i = 0; i < 4; i++) {
        var colorClassName = document.getElementById(row + 1).children[i].firstChild.className;
        var pos = colorCircleArray.indexOf(colorClassName);
        answerArray.push(letterArray[pos]);
      };
      return answerArray;

    }

    function revealEnigma() {
      if (document.getElementById('enigmaCheckBox').checked == true) {
        for (var i = 0; i < enigma.length; i++) {
          var pos = letterArray.indexOf(enigma[i])
          var divvar = document.createElement('div');
          divvar.setAttribute('class', colorCircleArray[pos]);
          document.getElementById('enigma').appendChild(divvar);
        };
      } else {
        document.getElementById('enigma').innerHTML = "";
      }


    }


    function hint() {
      if (document.getElementById('hintCheckBox').checked == true) {
        document.getElementById('hint').style.display = 'block'
      } else {
        document.getElementById('hint').style.display = 'none';
      }
    }
