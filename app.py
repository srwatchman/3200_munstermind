from flask import Flask, jsonify, render_template, request
app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('munstermind.html')

@app.route('/checkguess', methods={'POST'})
def checkguess():
    print('in check guess')
    print(request.json)
    print(request.json['guess'][1])

    guess_list = request.json['guess']
    enigma_list = request.json['enigma']
    for guess_list_index, guess_list_word in enumerate(guess_list):
        if guess_list_word == enigma_list[guess_list_index]:
            enigma_list[guess_list_index] = "x"
            guess_list[guess_list_index] = "*"

    for guess_list_index, guess_list_word in enumerate(guess_list):
        for enigma_list_index, enigma_list_word in enumerate(enigma_list):
            if guess_list_word == enigma_list_word:
                enigma_list[enigma_list_index] = "x"
                guess_list[guess_list_index] = "~"
                break #needed for case: secret wwyy, guess yyww (w/o break u get ~~## instead of ~~~~)
    print("clue: ", guess_list)
    black_pegs = 0
    white_pegs = 0
    for char in guess_list:
        if char == "*":
            black_pegs = black_pegs + 1
        elif char == "~":
            white_pegs = white_pegs + 1
    hint = {'whitePegs':white_pegs, 'blackPegs':black_pegs}
    print(hint)
    return hint


@app.route('/tinker_json')
def bar():
    # see https://blog.miguelgrinberg.com/post/designing-a-restful-api-with-python-and-flask
    tasks = [
    {
        'id': 1,
        'title': u'Buy groceries',
        'description': u'Milk, Cheese, Pizza, Fruit, Tylenol',
        'done': False
    },
    {
        'id': 2,
        'title': u'Learn Python',
        'description': u'Need to find a good Python tutorial on the web',
        'done': False
    }
    ]
    return jsonify({'tasks': tasks})
