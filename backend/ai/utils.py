import math
import nltk
import numpy as np
from nltk.stem.porter import PorterStemmer
from nltk.stem import WordNetLemmatizer


def bag_of_words(tokenized_string, words):

    # Perform stemming on each word.
    num_words = len(words)
    string_words = [stem(word) for word in tokenized_string]

    # Initialize the bag of words.
    bag = np.zeros(num_words, dtype=np.float32)

    # Populate the bag.
    for i, word in enumerate(words):
        if word in string_words: 
            bag[i] = 1

    return bag


def lemmatize(word):

    lemmatizer = WordNetLemmatizer()
    word = word.lower()
    word = lemmatizer.lemmatize(word, pos='v')
    return word


def stem(word):

    stemmer = PorterStemmer()
    return stemmer.stem(word.lower())


def tf_idf(xy, words):
    return


def tokenize(string):
    
    return nltk.word_tokenize(string)