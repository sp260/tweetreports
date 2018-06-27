#!/bin/bash
export PYSPARK_PYTHON=python3

export PYSPARK_DRIVER_PYTHON=python3

hdfs namenode -format

start-dfs.sh

hdfs dfs -mkdir -p /input/twitter/

hdfs dfs -put /home/mota/Bureau/finalLangdyn/tweets.json /input/twitter/20170129.json
