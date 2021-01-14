import nltk
import numpy as np
from nltk.stem.porter import PorterStemmer


def bag_of_words(tokenized_string, words):
    """
    Returns an array checking which words from a list are present in a string, using
    the bag-of-words approach.

    :tokenized_string: an array containing the tokenized version of the input string.
    :words: an array of word tokens.

    :example:
        tokenized_string = [ "this", "is", "a", "sentence" ]
        words = [ "this", "that", "a", "the", "thus" ]
        bag = [ 1, 0, 1, 0, 0 ]
    """

    # Perform stemming on each word.
    num_words = len(words)
    string_words = [stem(word) for word in tokenized_string]

    # Initialize the bag of words.
    bag = np.zeros(num_words, dtype=np.float32)

    for i, word in enumerate(words):
        if word in string_words: 
            bag[i] = 1

    return bag


def stem(word):
    """
    Determines the root of the word.

    :word: the word to be stemmed.
    """

    stemmer = PorterStemmer()
    return stemmer.stem(word.lower())


def tokenize(string):
    """
    Tokenizes a string into an array of words or punctuation marks.
    """
    
    return nltk.word_tokenize(string)