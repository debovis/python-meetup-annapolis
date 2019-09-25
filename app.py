import flask
import json
import os
import sys
from elasticsearch import Elasticsearch


tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
app = flask.Flask(__name__, template_folder=tmpl_dir, static_folder=static_dir,static_url_path='')

app.config.from_pyfile("config.cfg")

es = Elasticsearch()

@app.route('/listings', methods=['GET'])
def get_listings():
    res = es.search(**{
        'index': "listings",
        'body': {
            "query": {
                "match_all": {}
            },
                'size': 10000
            }
    })
    return flask.jsonify({
        'response': res['hits']['hits']
    })

@app.route('/boats', methods=['GET'])
def get_boats():
    res = es.search(**{
        'index': "boats",
        'body': {
            "query": {
                "match_all": {}
            },
                'size': 10000
            }
    })
    return flask.jsonify({
        'response': res['hits']['hits']
    })


@app.route('/')
def index():
    return flask.make_response(flask.render_template('index.html'))


if __name__ == "__main__":
    app.run(host="0.0.0.0")