import nltk
import numpy as np
from nltk.stem.porter import PorterStemmer


def stem(word):
    stemmer = PorterStemmer()
    return stemmer.stem(word.lower())


def tokenize(string):
    return nltk.word_tokenize(string)