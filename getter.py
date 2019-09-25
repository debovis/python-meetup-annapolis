import requests
from pattern import web
import pprint
from googleapiclient import discovery
from elasticsearch import Elasticsearch
import hashlib
from dateutil import parser
import collections
from textblob import TextBlob
from pattern import vector 
import time
import traceback, json

import spacy
nlp = spacy.load('en')


API_KEY = "AIzaSyBRkx-qv6vP9m5oAvZU-PDj6OqJuSGFQPU"
CX = '008718552203017823683:wbbhaz5fgu6'

boats = [
    "Aloha 30",
    "Alberg 30",
    "Alberg Odyssey 30",
    "Annie 30",
    "Bahama 30",
    "Bristol 29.9",
    "Cal 9.2",
    "Catalina 30",
    "C&C 30",
    "C&C 30 Redwing",
    "CS 30",
    "Grampian 30",
    "Hunter 29.5",
    "Hunter 30",
    "Hunter 30T",
    "Hunter 30-2",
    "Hunter 306",
    "J/30",
    "Kirby 30",
    "Leigh 30",
    "Mirage 30",
    "Mirage 30 SX",
    "Nonsuch 30",
    "O'Day 30",
    "Pearson 303",
    "S2 9.2",
    "Santana 30/30",
    "Seafarer 30",
    "Southern Cross 28"
]

es = Elasticsearch()
def get_insert():
    service = discovery.build("customsearch", "v1", developerKey=API_KEY)

    def get_items(boat, items, next_page_start):
        continues = True
        res = service.cse().list(**{
            "cx": CX,
            "q": boat,
            "start": next_page_start
        }).execute()

        items += res['items']
        if res['queries'].get('nextPage'):
            next_page_start = res['queries']['nextPage'][0]['startIndex']
        else:
            continues = False

        return items, next_page_start, continues

    for boat in boats:
        continues = True
        res = service.cse().list(**{
            "cx": CX,
            "q": boat
        }).execute()
        
        total_results = int(res['searchInformation']['totalResults'])
        items = res.pop('items')
        
        if res['queries'].get('nextPage'):
            next_page_start = res['queries']['nextPage'][0]['startIndex']
        
        while next_page_start < total_results and next_page_start < 100 and continues:
            items, next_page_start, continues = get_items(boat, items, next_page_start)

        for item in items:
            r = requests.get(item['link'])
            res = web.Element(r.text)
            pages = res.by_attr(**{
                "class": "vbmenu_control",
                "style": "font-weight:normal"
            })
            if pages:
                print(web.plaintext(pages[0].source))
            
            print(item['title'])
            print(item['link'])
            
            _id = hashlib.md5(item['link'].encode('utf-8')).hexdigest()

            post_dates_pre = res.by_attr(**{"itemprop": "dateCreated"})
            post_dates = []
            for post_date in post_dates_pre:
                if post_date.tag == 'span':
                    _date = web.plaintext(post_date.source)
                    parsed_date = None
                    try:
                        parsed_date = parser.parse(_date)
                    except:
                        print(_date)
                    post_dates.append(parsed_date)

            posts = res.by_attr(**{'itemprop': 'text' })
            text_blog = ""
            for post_idx, post in enumerate(posts):
                source = post.content
                # filter out quoted text
                divs = post.by_tag('div')
                for idx, div in enumerate(divs):
                    source = source.replace(div.source, '')
                source = web.plaintext(source)
                source = source.replace("BEGIN TEMPLATE: ad_showthread_firstpost_start\nEND TEMPLATE: ad_showthread_firstpost_start\nBEGIN TEMPLATE: bbcode_quote\n\nEND TEMPLATE: bbcode_quote ", '')
                source = source.replace("BEGIN TEMPLATE: ad_showthread_firstpost_start\nEND TEMPLATE: ad_showthread_firstpost_start\n\n", '')
                source = source.replace('[email protected]','')

                post_data = {
                    'body': {
                        'source': source,
                        'link': item['link'],
                        'position': post_idx,
                        'id': _id,
                        'post_date': post_dates[post_idx],
                        'boat': boat
                    },
                    "index": "posts",
                    'doc_type': 'posts'
                }
                res = es.index(**post_data)

def get():
    res = es.search(index="posts", body={
        "query": {
            "match_all": {}
        },
        'size': 10000
    })

    # sid = res['_scroll_id']
    # scroll_size = len(res['hits']['hits'])

    things = {}
    boat_docs = {}
    c = collections.Counter()
    d = collections.Counter()
    for item in res['hits']['hits']:
        raw_doc = item['_source']['source']
        original_boat_name = item['_source']['boat']
        # for boat in boats:
        #     if raw_doc.find(boat) > -1:
        t = TextBlob(raw_doc)
        d = vector.Document(raw_doc, threshold=1, stopwords=False)

        things.setdefault(original_boat_name, collections.Counter())
        things[original_boat_name].update([i[1] for i in d.keywords(top=10)])

                # boat_docs.setdefault(original_boat_name, collections.Counter())
                # for i in t.ngrams(3):
                #     boat_docs[original_boat_name].update([' '.join(i)])


                # if t.sentiment.polarity > 0:
                #     print(t.sentiment)
                    # print(raw_doc)



                # doc = nlp(raw_doc)
                # for chunk in doc.noun_chunks:
                #     things.setdefault(original_boat_name, collections.Counter())
                #     things[original_boat_name].update(chunk)
                # for sent in doc.sents:
                #     print(TextBlob(str(sent)).sentiment.polarity, sent)
                    
                # print(raw_doc)
                # print('-'*40)

                # print(raw_doc)

    final = {}
    filterwords = ['boat', 'boats', 'sail', 'sailing', 'template']
    for boat_name, ist in things.items():
        print(boat_name)
        final.setdefault(boat_name, [])
        commons = ist.most_common()
        for i in commons:
            if i[0] not in filterwords and len(i[0]) > 1 and boat_name.lower().find(i[0]) == -1 and i[1] > 1 and not parse_int(i[0]):
                final[boat_name].append({
                    'word': i[0],
                    'count': i[1],
                })

    for name, common in final.items():
        post_data = {
            'body': {
                'keywords': common,
                'boat': name
            },
            "index": "boats",
            'doc_type': 'boat'
        }
        res = es.index(**post_data)

    # for boat_name, ist in boat_docs.items():
    #     print(boat_name)
    #     print(ist.most_common())

    # for boat_name, ist in boat_docs.items():
    #     m = vector.Model(documents=ist, weight=vector.TFIDF)
    #     print(m.cluster(method=vector.HIERARCHICAL, k=2))

def parse_int(_input):
    try:
        int(_input)
        return True
    except ValueError:
        return False

def get_craigslist():
    d = open('craigslist_locations.txt', 'r')
    results = {}
    try:
        for i in d.readlines():
            i = i.strip('\n')
            for boat in boats:
                r = requests.get(f'https://{i}.craigslist.org/search/boo', params={'auto_make_model': boat, 'boat_propulsion_type': 1})
                w = web.Element(r.content)
                rows = w.by_class('rows')
                for row in rows[0].by_tag('li'):
                    results.setdefault(boat, set())
                    href = row.by_tag('a')[0].attrs['href']
                    print(href)
                    results[boat].add(href)
                time.sleep(1)
    except:
        traceback.print_exc()
    pprint.pprint(results)
    formatted_result = {}
    for boat_name, postings in result.items():
        formatted_result[boat_name] = list(postings)
    json.dump(results, open('results.json', 'w'))
    d.close()

def get_craigslist_postings():
    postings = json.load(open('results.json', 'r'))

    # filter cross postings
    filtered = {}
    for boat_name, posts in postings.items():
        founds = []
        urls = []
        for post in posts:
            _hash = post.split('/')[-2]
            if _hash not in founds:
                founds.append(_hash)
                urls.append(post)
        filtered[boat_name] = urls


    for boat_name, posts in filtered.items():
        for post in posts:
            r = requests.get(post)
            w = web.Element(r.content)
            body = w.by_id('postingbody')
            content = body.content
            links = body.by_tag('a')
            if links:
                content = content.replace(links[0].content, '')
            c = w.by_class("print-qrcode-label")
            if c:
                content = content.replace(c[0].content, '')
            
            content = web.plaintext(content)

            formatted_attrs = {}
            attrs = w.by_class('attrgroup')[0].by_tag('span')
            for attr in attrs:
                values = web.plaintext(attr.content).split(': ')
                if len(values) == 2:
                    key = values[0].replace(' ', '_').replace('/','')
                    value = values[1]
                    formatted_attrs[key] = value
            price = web.plaintext(w.by_class('price')[0].content.replace('$',''))
            post_data = {
                'body': {
                    'source': content,
                    'link': post,
                    'attrs': formatted_attrs,
                    'boat': boat_name,
                    'price': price
                },
                "index": "listings",
                'doc_type': 'listing'
            }
            res = es.index(**post_data)

get()







