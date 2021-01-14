import nltk
import numpy as np
from nltk.stem.porter import PorterStemmer


def bag_of_words(tokenized_string, words):
    num_words = len(words)
    string_words = [stem(word) for word in tokenized_string]
    bag = np.zeros(num_words, dtype=np.float32)

    for i, word in enumerate(words):
        if word in string_words: 
            bag[i] = 1

    return bag
    

def stem(word):
    stemmer = PorterStemmer()
    return stemmer.stem(word.lower())


def tokenize(string):
    return nltk.word_tokenize(string)