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


    //this function returns a hint from a remote server in
    function checkGuessRemote(guessRemote, enigmaRemote) {
      alert(guessRemote)
      var reqObj = new Object();
      reqObj.guess = JSON.stringify(guessRemote);
      reqObj.enigma = JSON.stringify(enigmaRemote);

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
          alert(JSON.stringify(resp));
        })
        .catch((err) => {
          // Code called when an error occurs during the request
          alert('Error: ' + err.message);
        });

    }

    //this function returns a hint (the number of white and black pegs)
    //NOTE: if a user has, say, two right colors and one correctly placed color the function will
    //return 2 white and 2 black. This is different than in Mastermind where 1 white and 1 black would
    //be shown
    //it takes the guess array and the mystery array (e.g. the sequence of colored pegs one is trying to divine)
    function checkGuess(guess, mystery) {
      var hint = {
        whitePegs: 0,
        blackPegs: 0
      }

      for (var y = 0; y < guess.length; y++) {
        for (var z = 0; z < mystery.length; z++) {
          if (guess[y] == mystery[z]) {
            hint.whitePegs = hint.whitePegs + 1;
            if (y == z) {
              hint.blackPegs = hint.blackPegs + 1;
            }
          }
        };

      };
      return hint;
    }

    //arrVar: the array of objects to create permutations from (in Mastermind this is typically 8 colored spheres)
    //permutationParam: the permutation. on the initial call to this function it should just be an empty string
    //permutationLength: the length of the permutation string one is trying to build. it can be up to arrVar.length
    //but typically it's just four.
    //permuteCollection: the collection of permutations
    function permute(arrVar, permutation, permutationLength, permuteCollection) {
      for (var i = 0; i < arrVar.length; i++) {
        //these next two lines pop off the last element in the permutation. this is needed because of the loop.
        //if one didn't, after say the perm of abc one would get abcd instead of the intended abd
        if (i > 0) {
          permutation = permutation.substring(0, permutation.length - 1);
        }
        permutation = permutation + arrVar[i];
        if (permutation.length == 8) {
          var permuteTruncated = permutation.substring(0, permutationLength)
          if (permuteCollection.indexOf(permuteTruncated) == -1) {
            permuteCollection.push(permuteTruncated);
          }
        }

        var newArrVar = arrVar.slice(0);
        newArrVar.splice(i, 1);

        permute(newArrVar, permutation, permutationLength, permuteCollection);

      };
      return permuteCollection;
    }

    //this returns the remaining possible permutations as an array
    //it requires:
    //remainingCombos: the collection returned by this same function or by the permute function above
    //guess: the user's guess passed as an array of length 4
    //whitepegs: the number of whitepegs returned from a call to the checkGuess function
    //blackpegs: the number of black pegs returned from a call to the checkGuess function

    function remainingChoices(remainingCombos, guess, whitePegs, blackPegs) {

      var newCombo = [];

      for (var i = 0; i < remainingCombos.length; i++) {
        var match = 0;
        for (var y = 0; y < guess.length; y++) {
          for (var z = 0; z < remainingCombos[i].length; z++) {
            if (guess[y] == remainingCombos[i].substring(z, z + 1)) {
              match = match + 1;
            }
          };

        };
        if (match == whitePegs) {
          var blackMatch = 0;
          for (var y = 0; y < guess.length; y++) {
            if (guess[y] == remainingCombos[i].substring(y, y + 1)) {
              blackMatch = blackMatch + 1;
            }
          };
          if (blackMatch == blackPegs) {
            newCombo.push(remainingCombos[i]);
          }


        }
      };
      return newCombo;
    }

    //this returns a random permute (which can be used as a guess) from the remaining permute collection
    function randomChoiceGenerator(arr) {
      var randomVar = Math.floor(Math.random() * (1 + arr.length - 0)) + 0;
      if (randomVar > 0) {
        randomVar = randomVar - 1;
      }

      return randomVar
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
      remainingCombos = permute(letterArray, '', 4, []);
      displayRemainingCombos(remainingCombos);
      document.getElementById('hint').style.display = 'none';
    }

    function checkUsersAnswer() {
      var row = guessFinished();
      populateColorSelector(row);
      var guess = extractAnswer(row);
      //old way
      //var hint = checkGuess(guess,enigma);
      //jsonway
      var guessRemote = [];
      var enigmaRemote = [];
      for (var i = 0; i < guess.length; i++) {
        var index = letterArray.indexOf(guess[i])
        guessRemote.push(colorArray[index])
        index = letterArray.indexOf(enigma[i])
        enigmaRemote.push(colorArray[index])
      }
      var hint = checkGuessRemote(guessRemote, enigmaRemote)
      alert(guessRemote)
      alert(enigmaRemote)
      addPegs(hint.whitePegs, hint.blackPegs, row + 1);
      remainingCombos = generateRemainingCombos(remainingCombos, guess, hint.whitePegs, hint.blackPegs);
    }

    function addPegs(whitePegs, blackPegs, row) {
      var whitePegs = whitePegs - blackPegs;
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

    function generateRemainingCombos(remainingCombos, guess, whitePegs, blackPegs) {
      if (remainingCombos.length == 0) {
        remainingCombos = permute(letterArray, '', 4, []);
      }
      remainingCombos = remainingChoices(remainingCombos, guess, whitePegs, blackPegs);
      displayRemainingCombos(remainingCombos);
      return remainingCombos;

    }

    function displayRemainingCombos(remainingCombos) {
      document.getElementById('remainingComboNumber').innerHTML = '(' + remainingCombos.length + ')';
      document.getElementById('remainingCombos').innerHTML = ' ';
      for (var i = 0; i < remainingCombos.length; i++) {
        for (var z = 0; z < remainingCombos[i].length; z++) {
          var pos = letterArray.indexOf(remainingCombos[i][z])
          var divvar = document.createElement('div');
          divvar.setAttribute('class', colorCircleArray[pos]);
          document.getElementById('remainingCombos').appendChild(divvar);
        };
        var brvar = document.createElement('br');
        document.getElementById('remainingCombos').appendChild(brvar);
      };
    }

    function hint() {
      if (document.getElementById('hintCheckBox').checked == true) {
        document.getElementById('hint').style.display = 'block'
      } else {
        document.getElementById('hint').style.display = 'none';
      }
    }
