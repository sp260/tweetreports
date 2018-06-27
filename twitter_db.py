#!/usr/bin/env python3


from pyspark.sql import SparkSession
import config
import json


class Execution_requetes:

    def __init__(self):

        self.job_id = 0
        self.stats_res = None
        self.charts_res = None
        print("constructeur d'execution appelé, je dois initialiser la base spark ici (hdfs sensé etre lancé)")

        self.spark = SparkSession.builder \
                                .appName(config.SPARK_APP_NAME) \
                                .config("spark.ui.showConsoleProgress","false") \
                                .master("local").getOrCreate()

        self.spark.sparkContext.setLogLevel("ERROR")

        self.df = self.spark.read.json("hdfs://localhost:9000/input/tweets.json")

    def importer_fichier(self,fichier_json):
        print("je suis sensé importer un fichier json dans la base spark")

    def requete(self,keyword,dico, type,key_job_id):
        print("je suis sensé traiter une requete")

        if(type == "simple"):
            if keyword[:1] == '#':
                dico[key_job_id] =  self.query_hashtag(self.df,keyword)
            elif keyword[:1] == '@':
                dico[key_job_id] =  self.query_username(self.df,keyword)
            else:
                dico[key_job_id] =  self.query_keyword(self.df,keyword)
            self.job_id +=1
        elif(type == "stats"):
            if (self.stats_res == None):
                dico[key_job_id] = json.dumps({"resultat" : {
                                            "hashtags" : self.hashtag_stats(self.df),
                                            "countries" : self.country_stats(self.df)
                                        }})
                self.stats_res =  dico[key_job_id]
            else:
                dico[key_job_id] = self.stats_res
        elif(type == "charts"):
            if (self.charts_res == None):
                dico[key_job_id] = json.dumps({"resultat" : {
                                            "posts" : self.post_charts(self.df),
                                            "users" : self.user_charts(self.df),
                                            "sources" : self.source_charts(self.df)
                                        }})
                self.charts_res =  dico[key_job_id]
            else:
                dico[key_job_id] = self.charts_res
        return



    def reponse(self,job_id):
        print("je suis censé retourner un objet avec un status et les resultats eventuels")
        return "blah blah"
    def supprimer_base(self):
        print("je suis censé supprimer la base de données")

    def query_hashtag(self,df,hashtag):
        def search(x):
            for i in x['entities']['hashtags']:
                if i['text'] == hashtag[1:]: return True;
            return False;
        rdd_filtered = df.rdd.filter(search)
        return self.rdd_to_json(rdd_filtered)

    def query_username(self,df,username):
        rdd_filtered = df.rdd.filter(lambda x: x['user']['screen_name'] == username[1:])
        return self.rdd_to_json(rdd_filtered)

    def query_keyword(self,df,keyword):
        return self.rdd_to_json(df.rdd.filter(lambda x: keyword in x['text']))

    def rdd_to_json(self,rdd):
        l = []
        for i in rdd.collect():
            d = {}
            d['name'] = i['user']['name']
            d['username'] = i['user']['screen_name']
            d['created_at'] = i['created_at']
            d['text'] = i['text']
            d['hashtags'] = [ j['text'] for j in i['entities']['hashtags'] ]
            d['place'] = i['place']
            l.append(d)
        return json.dumps({"resultat" : l})

    def hashtag_stats(self,df):
        def hashtags(x):
            return [ i['text'] for i in x['entities']['hashtags'] ]
        def switch(x):
            (a,b) = x
            return (b,a)
        rdd_listed = df.rdd.flatMap(hashtags)
        rdd_mapped = rdd_listed.map(lambda word: (word.lower(), 1))
        rdd_reduced = rdd_mapped.reduceByKey(lambda x,y: x+y)
        rdd_res = rdd_reduced.map(switch).sortByKey(False)
        l = []
        for i, e in enumerate(rdd_res.collect()):
            d = {}
            d['row'] = i+1
            d['number'] = e[0]
            d['hashtag'] = e[1]
            l.append(d)
            if i == 9: break
        return l

    def country_stats(self,df):
        def switch(x):
            (a,b) = x
            return (b,a)
        rdd_filtered = df.rdd.filter(lambda x : x['place'] != None)
        rdd_mapped = rdd_filtered.map(lambda x: (x['place'][1], 1))
        rdd_reduced = rdd_mapped.reduceByKey(lambda x,y: x+y).map(switch).sortByKey(False)
        l = []
        for i, c in enumerate(rdd_reduced.collect()):
            d = {}
            d['row'] = i+1
            d['number'] = c[0]
            d['country'] = c[1]
            l.append(d)
            if i == 9: break
        return l

    #number of tweets per person
    def user_charts(self,df):
        def switch(x):
            (a,b) = x
            return (b,1)
        rdd_res = df.rdd.map(lambda x: (x['user']['screen_name'], 1)) \
                        .reduceByKey(lambda x,y: x+y) \
                        .map(switch).reduceByKey(lambda x,y: x+y).sortByKey(True)
        l = []
        for c in rdd_res.collect():
            d = {}
            d['number'] = c[0]
            d['users'] = c[1]
            l.append(d)
        return l

    def post_charts(self,df):
        rdd_res = df.rdd.map(lambda x : x['created_at'].split(" ")) \
                     .map(lambda date : (date[3].split(":")[1], 1)) \
                     .reduceByKey(lambda a,b : a+b).sortByKey(True)
        l = []
        for c in rdd_res.collect():
            d = {}
            d['minute'] = c[0]
            d['number'] = c[1]
            l.append(d)
        return l

    def source_charts(self,df):
        def switch(x):
            (a,b) = x
            return (b,a)
        rdd_mapped = df.rdd.map(lambda x: (x['source'], 1))
        rdd_reduced = rdd_mapped.reduceByKey(lambda x,y: x+y).map(switch).sortByKey(False)
        l = []
        s = 0
        for i, c in enumerate(rdd_reduced.collect()):
            if i > 2:
                s += c[0]
            else:
                l.append({"number": c[0],"source": c[1][c[1].find('>')+1:c[1][1:].find('<')+1]})
        l.append({"number": s,"source": "other"})
        return l

    def get_job_id(self):
        result = self.job_id
        self.job_id +=1
        return result
