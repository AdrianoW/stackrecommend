#!/usr/bin/python
from flask import Flask, request, json, jsonify, render_template
from flask.ext.restful import Resource, reqparse, Api
#from flask.ext.mail import Mail, Message
from models import models, pd
from decorators import async
import sendgrid
import config

# Set the path
#import os, sys
#sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

app = Flask(__name__)
app.config.from_object('config')
api = Api(app)
#mail = Mail(app)

app.debug = config.DEBUG
sg = sendgrid.SendGridClient(config.SEND_GRID_USER, config.SEND_GRID_PASS,
                             raise_errors=app.debug)


if app.debug is not True:
    import logging
    from logging.handlers import RotatingFileHandler
    file_handler = RotatingFileHandler('log/python.log',
        maxBytes=1024 * 1024 * 100, backupCount=20)
    file_handler.setLevel(logging.ERROR)
    app.logger.setLevel(logging.ERROR)
    app.logger.addHandler(file_handler)


class UserRecommender(Resource):
    """
    On a Put command get users tags and run against the model

    params:
        on body there should be a json, defined below.

    test:
        curl http://localhost:5000/simpleRecommender -X PUT
    """
    def __init__(self):
        '''
        Init the Simple simpleRecommender
        '''
        # define what we want as an input
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('tags',
                                type=str,
                                help='No tags given',
                                action='append',
                                required=True)
        super(UserRecommender, self).__init__()

    def post(self):
        '''
        Post function expecting a json with a list of tags and their points
        curl -i -H "Content-Type: application/json" -X POST -d
         "{"""python""":1, """c++""":3, """scikit-learn""":1}"
         http://localhost:5000/userRecommender
        :return:
        '''
        # get the tags of the user
        #import pdb; pdb.set_trace()
        args = dict(json.loads(request.data))

        # construct user vector and run the model
        cv = models.construct_client_vector(args)
        group = models.predict_client_group(cv, 'KMeansBatch')
        ret = models.get_group_users(group)

        #  with the clients list, fetch at least 30 posts
        #self.fetchUsersPosts(ret)

        return jsonify(clients_list=ret)


@app.after_request
def add_cors(resp):
    """ Ensure all responses have the CORS headers. This ensures any failures
        are also accessible by the client.
    """
    resp.headers['Access-Control-Allow-Credentials'] = 'true'
    resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS, GET'
    resp.headers['Access-Control-Allow-Headers'] = request.headers.get(
        'Access-Control-Request-Headers', 'Authorization' )
    # set low for debugging
    if app.debug:
        resp.headers['Access-Control-Max-Age'] = '1'
        resp.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin','*')
    else:
        resp.headers['Access-Control-Allow-Origin'] = config.CLIENT_SERVER_URL
    return resp


@app.route('/api/')
def index():
    return "Hello, World!"

class Contact(Resource):
    ''' Class to send email '''

    def __init__(self):
        # define what we want as an input
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name',
                                type=str,
                                help='No name field',
                                required=True, location='json')
        self.parser.add_argument('email',
                                type= str,
                                help='No email field',
                                required=True, location='json')
        self.parser.add_argument('message',
                                type=str,
                                help='No message field',
                                required=True, location='json')
        super(Contact, self).__init__()

    def post(self):
        ''' send the email with the post data '''
        # check if the params are there
        contact = self.parser.parse_args()
        if '@' not in contact['email']:
            return jsonify(error= 'no valid email')
        to = config.ADMINS[0].split('@')[0]
        html = render_template('contact_email.html', contact = contact, to=to)
        txt = render_template('contact_email.txt', contact = contact, to=to)
        self.send_email('Message from the website', config.MAIL_USERNAME,
                        config.ADMINS, txt, html, contact.email )

    @async
    def send_async_email(self, msg):
        try:
            status, retmsg = sg.send(msg)
            app.logger.info('sent email result {} . Msg {}'.format(status,retmsg))
        except:
            app.logger.error('Error sending email')

    def send_email(self, subject, sender, recipients, text_body, html_body,
                    reply_to):
        message = sendgrid.Mail()
        message.add_to(recipients)
        message.set_subject(subject)
        message.set_html(html_body)
        message.set_text(text_body)
        message.set_from(sender)
        message.set_replyto(reply_to)

        # send the message
        self.send_async_email(message)

class Tags(Resource):
    ''' Class that will return possible tags for the input '''

    def __init__(self):
        # define what we want as an input
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('query',
                                type=str,
                                help='argument tag is missing',
                                required=True)
        # load the tags, reshape to be a column of tag
        self.tags = pd.read_csv('Data/featuresList.csv')
        self.tags = self.tags.T
        self.tags.reset_index(inplace=True)
        self.tags.columns = ['tag']
        super(Tags, self).__init__()

    def get(self):
        ''' return the exact tag or a list of possible ones '''
        param = self.parser.parse_args()
        query_tag = param['query']

        # lowercase data for searching
        query_tag = query_tag.lower()
        # bring all the tags as the string comes
        if len(query_tag)==0:
            ret = self.tags['tag'].tolist()
        # elif len(query_tag)<=3:
        #     ret = self.tags[self.tags.tag==query_tag]['tag'].tolist()
        else:
            ret = self.tags[self.tags.tag.str.startswith(query_tag)]['tag'].tolist()

        return jsonify(data=ret)

api.add_resource(UserRecommender, '/api/userRecommender')
api.add_resource(Contact, '/api/contact')
api.add_resource(Tags, '/api/tags')

if __name__ == '__main__':
    app.run()
