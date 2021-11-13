from flask import Flask, jsonify, render_template, request
app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('munstermind.html')

@app.route('/checkguess', methods={'POST'})
def checkguess():
    print('in check guess')
    print(request.json) #print out the json object to the console
    print(request.json['guess']) #print out the guess to the console
    print(request.json['enigma']) #print out the enigma to the console
    guess_list = request.json['guess']
    enigma_list = request.json['enigma']

    #Hey student: your code here!!!!
    hint = [
     {
        'whitePegs': 0,
    },
    {
        'whitePegs': 1,
    },
    {
        'whitePegs': 2,
    },
    {
        'whitePegs': 3,
    },
    {
        'blackPegs': 4,
    }
    ]
    
    x = 0
    
    for i, list in enumerate(enigma_list):
        if guess_list[i] in list:
            x = x + 1
        

    #hint = {'whitePegs':0, 'blackPegs':0} #create the hint as a dict
    print("the hint:", hint[x]) #print out the hint to the console
    return jsonify(hint[x]) #return the dict as a json

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
